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

// Requirement Master Service
builder.Services.AddScoped<IRequirementMstService, RequirementMstService>();

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
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors();
app.UseAuthentication();
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
        context.Database.ExecuteSqlRaw(@"
            CREATE TABLE IF NOT EXISTS requirement_mst (
                id TEXT PRIMARY KEY,
                code TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                description TEXT,
                category TEXT NOT NULL DEFAULT 'Medical',
                is_active INTEGER NOT NULL DEFAULT 1,
                sort_order INTEGER NOT NULL DEFAULT 100,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )");

        // Add new columns to evaluations table if they don't exist (for existing DBs created before these columns were added)
        var dbLogger = app.Logger;
        try { context.Database.ExecuteSqlRaw("ALTER TABLE evaluations ADD COLUMN letter_flags TEXT DEFAULT '[]'"); }
        catch (Exception ex) { dbLogger.LogDebug("ALTER TABLE evaluations letter_flags: {Msg} (expected if column exists)", ex.Message); }
        try { context.Database.ExecuteSqlRaw("ALTER TABLE evaluations ADD COLUMN follow_up_codes TEXT DEFAULT '[]'"); }
        catch (Exception ex) { dbLogger.LogDebug("ALTER TABLE evaluations follow_up_codes: {Msg} (expected if column exists)", ex.Message); }
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

    // Seed requirement master data (idempotent)
    if (!context.RequirementMsts.Any())
    {
        var now = DateTime.UtcNow.ToString("o");
        context.RequirementMsts.AddRange(
            new InsuranceSTP.Models.RequirementMst { Code = "MPN", Name = "Physical Medical Examination Report", Description = "Comprehensive physical medical examination report required from an approved medical examiner.", Category = "Medical", SortOrder = 10, CreatedAt = now, UpdatedAt = now },
            new InsuranceSTP.Models.RequirementMst { Code = "MCE", Name = "CBC & ESR Blood Tests", Description = "Complete Blood Count (CBC) and Erythrocyte Sedimentation Rate (ESR) laboratory tests.", Category = "Medical", SortOrder = 20, CreatedAt = now, UpdatedAt = now },
            new InsuranceSTP.Models.RequirementMst { Code = "TGQ", Name = "Transgender Questionnaire", Description = "Supplementary questionnaire for gender affirmation, required for RUW referral.", Category = "Questionnaire", SortOrder = 30, CreatedAt = now, UpdatedAt = now },
            new InsuranceSTP.Models.RequirementMst { Code = "ECG", Name = "Electrocardiogram", Description = "Resting 12-lead ECG report from an approved cardiac diagnostics centre.", Category = "Medical", SortOrder = 40, CreatedAt = now, UpdatedAt = now },
            new InsuranceSTP.Models.RequirementMst { Code = "HBA1C", Name = "HbA1c Test", Description = "Glycated haemoglobin test to assess average blood glucose over 3 months.", Category = "Medical", SortOrder = 50, CreatedAt = now, UpdatedAt = now },
            new InsuranceSTP.Models.RequirementMst { Code = "LFT", Name = "Liver Function Test", Description = "Liver function panel including ALT, AST, bilirubin, and albumin levels.", Category = "Medical", SortOrder = 60, CreatedAt = now, UpdatedAt = now },
            new InsuranceSTP.Models.RequirementMst { Code = "FinQ", Name = "Financial Questionnaire", Description = "Detailed financial background questionnaire for high sum-assured proposals.", Category = "Financial", SortOrder = 70, CreatedAt = now, UpdatedAt = now },
            new InsuranceSTP.Models.RequirementMst { Code = "OcQ", Name = "Occupational Questionnaire", Description = "Questionnaire detailing occupational hazards and duties for high-risk occupations.", Category = "Questionnaire", SortOrder = 80, CreatedAt = now, UpdatedAt = now }
        );
        await context.SaveChangesAsync();
    }
}

// Run on port 8001
//app.Run("http://0.0.0.0:8001");
app.Run();
