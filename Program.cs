using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using InsuranceSTP.Data;
using InsuranceSTP.Services;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: 'Bearer {token}'",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Database - use the Python backend's database at /app/backend/insurance_stp.db
var dbPath = "/app/backend/insurance_stp.db";
// Fallback to current directory if the path doesn't exist (for local development)
if (!File.Exists(dbPath))
{
    dbPath = Path.Combine(Directory.GetCurrentDirectory(), "insurance_stp.db");
}
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

// Auth Service
builder.Services.AddScoped<IAuthService, AuthService>();

// Rule Engine
builder.Services.AddSingleton<RuleEngine>();

// JWT Authentication
var jwtSecretKey = builder.Configuration["Jwt:SecretKey"] ?? "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "InsuranceSTP";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "InsuranceSTP";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey)),
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// CORS
//builder.Services.AddCors(options =>
//{
//    options.AddDefaultPolicy(policy =>
//    {
//        policy.WithOrigins("http://criterion.ezytekapis.com")
//       // policy.AllowAnyOrigin()
//              .AllowAnyMethod()
//              .AllowAnyHeader();
//    });
//});
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            //policy.WithOrigins("http://criterion.ezytekapis.com")
            policy.AllowAnyOrigin()
                 .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowFrontend");
//app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Ensure database is created and seed data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();

    // This will create all tables including users and rule_templates
    context.Database.EnsureCreated();

    // Run raw SQL to ensure tables exist (for existing databases)
    try
    {
        context.Database.ExecuteSqlRaw(@"
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                full_name TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'viewer',
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                last_login TEXT
            )");

        context.Database.ExecuteSqlRaw(@"
            CREATE TABLE IF NOT EXISTS rule_templates (
                id TEXT PRIMARY KEY,
                template_id TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                description TEXT,
                category TEXT NOT NULL DEFAULT 'stp_decision',
                condition_group TEXT NOT NULL DEFAULT '{{}}',
                action TEXT NOT NULL DEFAULT '{{}}',
                letter_flag TEXT,
                follow_up_code TEXT,
                priority INTEGER NOT NULL DEFAULT 100,
                products TEXT NOT NULL DEFAULT '[]',
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL
            )");
        context.Database.ExecuteSqlRaw(@"
            CREATE TABLE IF NOT EXISTS audit_logs (
                id TEXT PRIMARY KEY,
                action TEXT NOT NULL,
                entity_type TEXT NOT NULL,
                entity_id TEXT,
                entity_name TEXT NULL,
                changes TEXT NULL DEFAULT '{{}}',
                performed_by TEXT NOT NULL,
                performed_at TEXT               
            )");

        // Add new columns to evaluations table if they don't exist (for existing DBs created before these columns were added)
        var dbLogger = app.Logger;
        try { context.Database.ExecuteSqlRaw("ALTER TABLE evaluations ADD COLUMN letter_flags TEXT DEFAULT '[]'"); }
        catch (Exception ex) { dbLogger.LogDebug("ALTER TABLE evaluations letter_flags: {Msg} (expected if column exists)", ex.Message); }
        try { context.Database.ExecuteSqlRaw("ALTER TABLE evaluations ADD COLUMN follow_up_codes TEXT DEFAULT '[]'"); }
        catch (Exception ex) { dbLogger.LogDebug("ALTER TABLE evaluations follow_up_codes: {Msg} (expected if column exists)", ex.Message); }

        context.Database.ExecuteSqlRaw(@"
            CREATE TABLE IF NOT EXISTS proposals (
                id TEXT PRIMARY KEY,
                proposal_number TEXT NOT NULL DEFAULT '',
                policy_number INTEGER,
                product_code TEXT NOT NULL DEFAULT '',
                product_type TEXT NOT NULL DEFAULT 'term_pure',
                product_category TEXT NOT NULL DEFAULT 'life',
                payment_mode TEXT,
                mode_of_purchase TEXT,
                policy_term INTEGER NOT NULL DEFAULT 0,
                premium_payment_term INTEGER NOT NULL DEFAULT 0,
                applicant_age INTEGER NOT NULL DEFAULT 0,
                applicant_gender TEXT NOT NULL DEFAULT 'M',
                applicant_income REAL NOT NULL DEFAULT 0,
                proposer_income REAL NOT NULL DEFAULT 0,
                sum_assured REAL NOT NULL DEFAULT 0,
                premium REAL NOT NULL DEFAULT 0,
                existing_coverage REAL NOT NULL DEFAULT 0,
                height REAL,
                weight REAL,
                bmi REAL,
                is_smoker INTEGER NOT NULL DEFAULT 0,
                cigarettes_per_day INTEGER,
                smoking_years INTEGER,
                is_alcoholic INTEGER NOT NULL DEFAULT 0,
                alcohol_type TEXT,
                alcohol_quantity INTEGER,
                has_medical_history INTEGER NOT NULL DEFAULT 0,
                ailment_type TEXT,
                ailment_details TEXT,
                ailment_duration_years INTEGER,
                is_ailment_ongoing INTEGER,
                is_adventurous INTEGER NOT NULL DEFAULT 0,
                occupation_code TEXT,
                occupation_class TEXT,
                occupation_risk TEXT,
                is_occupation_hazardous INTEGER NOT NULL DEFAULT 0,
                agent_code TEXT,
                agent_tier TEXT,
                pincode TEXT,
                is_negative_pincode INTEGER NOT NULL DEFAULT 0,
                aml_category TEXT,
                risk_category TEXT,
                is_pep INTEGER NOT NULL DEFAULT 0,
                is_criminally_convicted INTEGER NOT NULL DEFAULT 0,
                is_ofac INTEGER NOT NULL DEFAULT 0,
                iib_status TEXT,
                iib_score INTEGER,
                iib_is_negative INTEGER,
                nationality TEXT,
                marital_status TEXT,
                qualification TEXT,
                special_class TEXT,
                residential_country TEXT,
                business_country TEXT,
                is_pregnant INTEGER NOT NULL DEFAULT 0,
                pregnancy_weeks INTEGER,
                family_medical_history INTEGER NOT NULL DEFAULT 0,
                is_la_proposer INTEGER NOT NULL DEFAULT 1,
                is_proposer_corporate INTEGER NOT NULL DEFAULT 0,
                la_proposer_relation TEXT,
                nominee_relation TEXT,
                is_medical_generated INTEGER NOT NULL DEFAULT 0,
                is_narcotic INTEGER NOT NULL DEFAULT 0,
                hard_liquor_quantity REAL,
                beer_quantity REAL,
                wine_quantity REAL,
                tobacco_quantity INTEGER,
                liquor_type INTEGER,
                iib_is_new_to_iib INTEGER,
                fgli_policy_statuses TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Migration note: {ex.Message}");
    }

    // Seed default admin user
    RuleTemplateSeeder.SeedDefaultAdmin(context, authService);

    // Seed rule templates
    RuleTemplateSeeder.SeedTemplates(context);

    // Create rules from templates (idempotent - only adds new rules)
    RuleTemplateSeeder.SeedRulesFromTemplates(context);
}

// Run on port 8001
//app.Run("http://0.0.0.0:8001");
app.Run();
