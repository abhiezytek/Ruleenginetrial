using Microsoft.EntityFrameworkCore;
using InsuranceSTP.Models;

namespace InsuranceSTP.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Rule> Rules { get; set; }
    public DbSet<RuleStage> RuleStages { get; set; }
    public DbSet<RiskBand> RiskBands { get; set; }
    public DbSet<Scorecard> Scorecards { get; set; }
    public DbSet<Grid> Grids { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Evaluation> Evaluations { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<RuleTemplate> RuleTemplates { get; set; }
    public DbSet<ProductRuleMapping> ProductRuleMappings { get; set; }
    public DbSet<ProductMedicalTrigger> ProductMedicalTriggers { get; set; }
    public DbSet<GridMapping> GridMappings { get; set; }
    public DbSet<ScorecardMapping> ScorecardMappings { get; set; }
    public DbSet<Proposal> Proposals { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);


        // ==================== RULES TABLE ====================
        modelBuilder.Entity<Rule>().ToTable("rules");
        modelBuilder.Entity<Rule>().Property(r => r.Id).HasColumnName("id");
        modelBuilder.Entity<Rule>().Property(r => r.Name).HasColumnName("name");
        modelBuilder.Entity<Rule>().Property(r => r.Description).HasColumnName("description");
        modelBuilder.Entity<Rule>().Property(r => r.Category).HasColumnName("category");
        modelBuilder.Entity<Rule>().Property(r => r.StageId).HasColumnName("stage_id");
        modelBuilder.Entity<Rule>().Property(r => r.ConditionGroupJson).HasColumnName("condition_group");
        modelBuilder.Entity<Rule>().Property(r => r.ActionJson).HasColumnName("action");
        modelBuilder.Entity<Rule>().Property(r => r.Priority).HasColumnName("priority");
        modelBuilder.Entity<Rule>().Property(r => r.IsEnabled).HasColumnName("is_enabled");
        modelBuilder.Entity<Rule>().Property(r => r.EffectiveFrom).HasColumnName("effective_from");
        modelBuilder.Entity<Rule>().Property(r => r.EffectiveTo).HasColumnName("effective_to");
        modelBuilder.Entity<Rule>().Property(r => r.ProductsJson).HasColumnName("products");
        modelBuilder.Entity<Rule>().Property(r => r.CaseTypesJson).HasColumnName("case_types");
        modelBuilder.Entity<Rule>().Property(r => r.Version).HasColumnName("version");
        modelBuilder.Entity<Rule>().Property(r => r.CreatedAt).HasColumnName("created_at");
        modelBuilder.Entity<Rule>().Property(r => r.UpdatedAt).HasColumnName("updated_at");
        modelBuilder.Entity<Rule>().HasIndex(r => r.Category);
        modelBuilder.Entity<Rule>().HasIndex(r => r.Priority);
        modelBuilder.Entity<Rule>().HasIndex(r => r.StageId);

        // ==================== RULE_STAGES TABLE ====================
        modelBuilder.Entity<RuleStage>().ToTable("rule_stages");
        modelBuilder.Entity<RuleStage>().Property(s => s.Id).HasColumnName("id");
        modelBuilder.Entity<RuleStage>().Property(s => s.Name).HasColumnName("name");
        modelBuilder.Entity<RuleStage>().Property(s => s.Description).HasColumnName("description");
        modelBuilder.Entity<RuleStage>().Property(s => s.ExecutionOrder).HasColumnName("execution_order");
        modelBuilder.Entity<RuleStage>().Property(s => s.StopOnFail).HasColumnName("stop_on_fail");
        modelBuilder.Entity<RuleStage>().Property(s => s.Color).HasColumnName("color");
        modelBuilder.Entity<RuleStage>().Property(s => s.IsEnabled).HasColumnName("is_enabled");
        modelBuilder.Entity<RuleStage>().Property(s => s.CreatedAt).HasColumnName("created_at");
        modelBuilder.Entity<RuleStage>().Property(s => s.UpdatedAt).HasColumnName("updated_at");
        modelBuilder.Entity<RuleStage>().HasIndex(s => s.ExecutionOrder);

        // ==================== RISK_BANDS TABLE ====================
        modelBuilder.Entity<RiskBand>().ToTable("risk_bands");
        modelBuilder.Entity<RiskBand>().Property(r => r.Id).HasColumnName("id");
        modelBuilder.Entity<RiskBand>().Property(r => r.Name).HasColumnName("name");
        modelBuilder.Entity<RiskBand>().Property(r => r.Description).HasColumnName("description");
        modelBuilder.Entity<RiskBand>().Property(r => r.Category).HasColumnName("category");
        modelBuilder.Entity<RiskBand>().Property(r => r.ConditionJson).HasColumnName("condition");
        modelBuilder.Entity<RiskBand>().Property(r => r.LoadingPercentage).HasColumnName("loading_percentage");
        modelBuilder.Entity<RiskBand>().Property(r => r.RiskScore).HasColumnName("risk_score");
        modelBuilder.Entity<RiskBand>().Property(r => r.ProductsJson).HasColumnName("products");
        modelBuilder.Entity<RiskBand>().Property(r => r.Priority).HasColumnName("priority");
        modelBuilder.Entity<RiskBand>().Property(r => r.IsEnabled).HasColumnName("is_enabled");
        modelBuilder.Entity<RiskBand>().Property(r => r.CreatedAt).HasColumnName("created_at");
        modelBuilder.Entity<RiskBand>().Property(r => r.UpdatedAt).HasColumnName("updated_at");
        modelBuilder.Entity<RiskBand>().HasIndex(r => r.Category);
        modelBuilder.Entity<RiskBand>().HasIndex(r => r.Priority);

        // ==================== SCORECARDS TABLE ====================
        modelBuilder.Entity<Scorecard>().ToTable("scorecards");
        modelBuilder.Entity<Scorecard>().Property(s => s.Id).HasColumnName("id");
        modelBuilder.Entity<Scorecard>().Property(s => s.Name).HasColumnName("name");
        modelBuilder.Entity<Scorecard>().Property(s => s.Description).HasColumnName("description");
        modelBuilder.Entity<Scorecard>().Property(s => s.Product).HasColumnName("product");
        modelBuilder.Entity<Scorecard>().Property(s => s.ParametersJson).HasColumnName("parameters");
        modelBuilder.Entity<Scorecard>().Property(s => s.ThresholdDirectAccept).HasColumnName("threshold_direct_accept");
        modelBuilder.Entity<Scorecard>().Property(s => s.ThresholdNormal).HasColumnName("threshold_normal");
        modelBuilder.Entity<Scorecard>().Property(s => s.ThresholdRefer).HasColumnName("threshold_refer");
        modelBuilder.Entity<Scorecard>().Property(s => s.IsEnabled).HasColumnName("is_enabled");
        modelBuilder.Entity<Scorecard>().Property(s => s.CreatedAt).HasColumnName("created_at");
        modelBuilder.Entity<Scorecard>().Property(s => s.UpdatedAt).HasColumnName("updated_at");
        modelBuilder.Entity<Scorecard>().HasIndex(s => s.Product);

        // ==================== GRIDS TABLE ====================
        modelBuilder.Entity<Grid>().ToTable("grids");
        modelBuilder.Entity<Grid>().Property(g => g.Id).HasColumnName("id");
        modelBuilder.Entity<Grid>().Property(g => g.Name).HasColumnName("name");
        modelBuilder.Entity<Grid>().Property(g => g.Description).HasColumnName("description");
        modelBuilder.Entity<Grid>().Property(g => g.GridType).HasColumnName("grid_type");
        modelBuilder.Entity<Grid>().Property(g => g.RowField).HasColumnName("row_field");
        modelBuilder.Entity<Grid>().Property(g => g.ColField).HasColumnName("col_field");
        modelBuilder.Entity<Grid>().Property(g => g.RowLabelsJson).HasColumnName("row_labels");
        modelBuilder.Entity<Grid>().Property(g => g.ColLabelsJson).HasColumnName("col_labels");
        modelBuilder.Entity<Grid>().Property(g => g.CellsJson).HasColumnName("cells");
        modelBuilder.Entity<Grid>().Property(g => g.ProductsJson).HasColumnName("products");
        modelBuilder.Entity<Grid>().Property(g => g.IsEnabled).HasColumnName("is_enabled");
        modelBuilder.Entity<Grid>().Property(g => g.CreatedAt).HasColumnName("created_at");
        modelBuilder.Entity<Grid>().Property(g => g.UpdatedAt).HasColumnName("updated_at");
        modelBuilder.Entity<Grid>().HasIndex(g => g.GridType);

        // ==================== PRODUCTS TABLE ====================
        modelBuilder.Entity<Product>().ToTable("products");
        modelBuilder.Entity<Product>().Property(p => p.Id).HasColumnName("id");
        modelBuilder.Entity<Product>().Property(p => p.Code).HasColumnName("code");
        modelBuilder.Entity<Product>().Property(p => p.Name).HasColumnName("name");
        modelBuilder.Entity<Product>().Property(p => p.ProductType).HasColumnName("product_type");
        modelBuilder.Entity<Product>().Property(p => p.Description).HasColumnName("description");
        modelBuilder.Entity<Product>().Property(p => p.ParentProductId).HasColumnName("parent_product_id");
        modelBuilder.Entity<Product>().Property(p => p.MinAge).HasColumnName("min_age");
        modelBuilder.Entity<Product>().Property(p => p.MaxAge).HasColumnName("max_age");
        modelBuilder.Entity<Product>().Property(p => p.MinSumAssured).HasColumnName("min_sum_assured");
        modelBuilder.Entity<Product>().Property(p => p.MaxSumAssured).HasColumnName("max_sum_assured");
        modelBuilder.Entity<Product>().Property(p => p.MinPremium).HasColumnName("min_premium");
        modelBuilder.Entity<Product>().Property(p => p.HasMaturityBenefit).HasColumnName("has_maturity_benefit");
        modelBuilder.Entity<Product>().Property(p => p.IsEnabled).HasColumnName("is_enabled");
        modelBuilder.Entity<Product>().Property(p => p.CreatedAt).HasColumnName("created_at");
        modelBuilder.Entity<Product>().HasIndex(p => p.Code).IsUnique();

        // ==================== EVALUATIONS TABLE ====================
        modelBuilder.Entity<Evaluation>().ToTable("evaluations");
        modelBuilder.Entity<Evaluation>().Property(e => e.Id).HasColumnName("id");
        modelBuilder.Entity<Evaluation>().Property(e => e.ProposalId).HasColumnName("proposal_id");
        modelBuilder.Entity<Evaluation>().Property(e => e.StpDecision).HasColumnName("stp_decision");
        modelBuilder.Entity<Evaluation>().Property(e => e.CaseTypeValue).HasColumnName("case_type");
        modelBuilder.Entity<Evaluation>().Property(e => e.CaseTypeLabel).HasColumnName("case_type_label");
        modelBuilder.Entity<Evaluation>().Property(e => e.ReasonFlag).HasColumnName("reason_flag");
        modelBuilder.Entity<Evaluation>().Property(e => e.ScorecardValue).HasColumnName("scorecard_value");
        modelBuilder.Entity<Evaluation>().Property(e => e.TriggeredRulesJson).HasColumnName("triggered_rules");
        modelBuilder.Entity<Evaluation>().Property(e => e.ValidationErrorsJson).HasColumnName("validation_errors");
        modelBuilder.Entity<Evaluation>().Property(e => e.ReasonCodesJson).HasColumnName("reason_codes");
        modelBuilder.Entity<Evaluation>().Property(e => e.ReasonMessagesJson).HasColumnName("reason_messages");
        modelBuilder.Entity<Evaluation>().Property(e => e.RuleTraceJson).HasColumnName("rule_trace");
        modelBuilder.Entity<Evaluation>().Property(e => e.LetterFlagsJson).HasColumnName("letter_flags");
        modelBuilder.Entity<Evaluation>().Property(e => e.FollowUpCodesJson).HasColumnName("follow_up_codes");
        modelBuilder.Entity<Evaluation>().Property(e => e.EvaluationTimeMs).HasColumnName("evaluation_time_ms");
        modelBuilder.Entity<Evaluation>().Property(e => e.EvaluatedAt).HasColumnName("evaluated_at");
        modelBuilder.Entity<Evaluation>().HasIndex(e => e.StpDecision);

        // ==================== AUDIT_LOGS TABLE ====================
        modelBuilder.Entity<AuditLog>().ToTable("audit_logs");
        modelBuilder.Entity<AuditLog>().Property(a => a.Id).HasColumnName("id");
        modelBuilder.Entity<AuditLog>().Property(a => a.Action).HasColumnName("action");
        modelBuilder.Entity<AuditLog>().Property(a => a.EntityType).HasColumnName("entity_type");
        modelBuilder.Entity<AuditLog>().Property(a => a.EntityId).HasColumnName("entity_id");
        modelBuilder.Entity<AuditLog>().Property(a => a.EntityName).HasColumnName("entity_name");
        modelBuilder.Entity<AuditLog>().Property(a => a.ChangesJson).HasColumnName("changes");
        modelBuilder.Entity<AuditLog>().Property(a => a.PerformedBy).HasColumnName("performed_by");
        modelBuilder.Entity<AuditLog>().Property(a => a.PerformedAt).HasColumnName("performed_at");
        modelBuilder.Entity<AuditLog>().HasIndex(a => a.EntityType);


        // ==================== USERS TABLE (snake_case for new tables) ====================
        modelBuilder.Entity<User>().ToTable("users");
        modelBuilder.Entity<User>().Property(u => u.Id).HasColumnName("id");
        modelBuilder.Entity<User>().Property(u => u.Username).HasColumnName("username");
        modelBuilder.Entity<User>().Property(u => u.Email).HasColumnName("email");
        modelBuilder.Entity<User>().Property(u => u.PasswordHash).HasColumnName("password_hash");
        modelBuilder.Entity<User>().Property(u => u.FullName).HasColumnName("full_name");
        modelBuilder.Entity<User>().Property(u => u.Role).HasColumnName("role");
        modelBuilder.Entity<User>().Property(u => u.IsActive).HasColumnName("is_active");
        modelBuilder.Entity<User>().Property(u => u.CreatedAt).HasColumnName("created_at");
        modelBuilder.Entity<User>().Property(u => u.UpdatedAt).HasColumnName("updated_at");
        modelBuilder.Entity<User>().Property(u => u.LastLogin).HasColumnName("last_login");
        modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique();
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

        // ==================== RULE_TEMPLATES TABLE (snake_case for new tables) ====================
        modelBuilder.Entity<RuleTemplate>().ToTable("rule_templates");
        modelBuilder.Entity<RuleTemplate>().Property(t => t.Id).HasColumnName("id");
        modelBuilder.Entity<RuleTemplate>().Property(t => t.TemplateId).HasColumnName("template_id");
        modelBuilder.Entity<RuleTemplate>().Property(t => t.Name).HasColumnName("name");
        modelBuilder.Entity<RuleTemplate>().Property(t => t.Description).HasColumnName("description");
        modelBuilder.Entity<RuleTemplate>().Property(t => t.Category).HasColumnName("category");
        modelBuilder.Entity<RuleTemplate>().Property(t => t.ConditionGroupJson).HasColumnName("condition_group");
        modelBuilder.Entity<RuleTemplate>().Property(t => t.ActionJson).HasColumnName("action");
        modelBuilder.Entity<RuleTemplate>().Property(t => t.LetterFlag).HasColumnName("letter_flag");
        modelBuilder.Entity<RuleTemplate>().Property(t => t.FollowUpCode).HasColumnName("follow_up_code");
        modelBuilder.Entity<RuleTemplate>().Property(t => t.Priority).HasColumnName("priority");
        modelBuilder.Entity<RuleTemplate>().Property(t => t.ProductsJson).HasColumnName("products");
        modelBuilder.Entity<RuleTemplate>().Property(t => t.IsActive).HasColumnName("is_active");
        modelBuilder.Entity<RuleTemplate>().Property(t => t.CreatedAt).HasColumnName("created_at");
        modelBuilder.Entity<RuleTemplate>().HasIndex(t => t.TemplateId).IsUnique();


        // ProductRuleMappings
        modelBuilder.Entity<ProductRuleMapping>().ToTable("product_rule_mappings");
        modelBuilder.Entity<ProductRuleMapping>().HasKey(m => m.Id);
        modelBuilder.Entity<ProductRuleMapping>().Property(m => m.ProductId).HasColumnName("product_id").IsRequired();
        modelBuilder.Entity<ProductRuleMapping>().Property(m => m.RuleId).HasColumnName("rule_id").IsRequired();
        modelBuilder.Entity<ProductRuleMapping>().Property(m => m.CreatedAt).HasColumnName("created_at");
        modelBuilder.Entity<ProductRuleMapping>().HasIndex(m => new { m.ProductId, m.RuleId }).IsUnique();

        // ProductMedicalTriggers
        modelBuilder.Entity<ProductMedicalTrigger>().ToTable("product_medical_triggers");
        modelBuilder.Entity<ProductMedicalTrigger>().HasKey(m => m.Id);
        modelBuilder.Entity<ProductMedicalTrigger>().Property(m => m.ProductId).HasColumnName("product_id").IsRequired();
        modelBuilder.Entity<ProductMedicalTrigger>().Property(m => m.Field).HasColumnName("field").IsRequired();
        modelBuilder.Entity<ProductMedicalTrigger>().Property(m => m.Operator).HasColumnName("operator").IsRequired();
        modelBuilder.Entity<ProductMedicalTrigger>().Property(m => m.Value).HasColumnName("value");
        modelBuilder.Entity<ProductMedicalTrigger>().Property(m => m.ValueMax).HasColumnName("value_max");
        modelBuilder.Entity<ProductMedicalTrigger>().Property(m => m.Logic).HasColumnName("logic");
        modelBuilder.Entity<ProductMedicalTrigger>().Property(m => m.IsEnabled).HasColumnName("is_enabled");
        modelBuilder.Entity<ProductMedicalTrigger>().Property(m => m.Notes).HasColumnName("notes");
        modelBuilder.Entity<ProductMedicalTrigger>().Property(m => m.RequiredTests).HasColumnName("required_tests");
        modelBuilder.Entity<ProductMedicalTrigger>().Property(m => m.CreatedAt).HasColumnName("created_at");
        modelBuilder.Entity<ProductMedicalTrigger>().HasIndex(m => new { m.ProductId, m.Field, m.Operator });

        // GridMappings
        modelBuilder.Entity<GridMapping>().ToTable("grid_mappings");
        modelBuilder.Entity<GridMapping>().HasKey(m => m.Id);
        modelBuilder.Entity<GridMapping>().Property(m => m.ProductId).HasColumnName("product_id").IsRequired();
        modelBuilder.Entity<GridMapping>().Property(m => m.GridId).HasColumnName("grid_id").IsRequired();
        modelBuilder.Entity<GridMapping>().Property(m => m.CreatedAt).HasColumnName("created_at");
        modelBuilder.Entity<GridMapping>().HasIndex(m => new { m.ProductId, m.GridId }).IsUnique();

        // ScorecardMappings
        modelBuilder.Entity<ScorecardMapping>().ToTable("scorecard_mappings");
        modelBuilder.Entity<ScorecardMapping>().HasKey(m => m.Id);
        modelBuilder.Entity<ScorecardMapping>().Property(m => m.ProductId).HasColumnName("product_id").IsRequired();
        modelBuilder.Entity<ScorecardMapping>().Property(m => m.ScorecardId).HasColumnName("scorecard_id").IsRequired();
        modelBuilder.Entity<ScorecardMapping>().Property(m => m.CreatedAt).HasColumnName("created_at");
        modelBuilder.Entity<ScorecardMapping>().HasIndex(m => new { m.ProductId, m.ScorecardId }).IsUnique();

        // ==================== PROPOSALS TABLE ====================
        // NOTE: Proposal.cs already has [Table("proposals")] and [Index] attributes;
        // here we only add explicit snake_case column-name overrides.
        modelBuilder.Entity<Proposal>().Property(p => p.Id).HasColumnName("id");
        modelBuilder.Entity<Proposal>().Property(p => p.ProposalNumber).HasColumnName("proposal_number");
        modelBuilder.Entity<Proposal>().Property(p => p.PolicyNumber).HasColumnName("policy_number");
        modelBuilder.Entity<Proposal>().Property(p => p.ProductCode).HasColumnName("product_code");
        modelBuilder.Entity<Proposal>().Property(p => p.ProductType).HasColumnName("product_type");
        modelBuilder.Entity<Proposal>().Property(p => p.ProductCategory).HasColumnName("product_category");
        modelBuilder.Entity<Proposal>().Property(p => p.PaymentMode).HasColumnName("payment_mode");
        modelBuilder.Entity<Proposal>().Property(p => p.ModeOfPurchase).HasColumnName("mode_of_purchase");
        modelBuilder.Entity<Proposal>().Property(p => p.PolicyTerm).HasColumnName("policy_term");
        modelBuilder.Entity<Proposal>().Property(p => p.PremiumPaymentTerm).HasColumnName("premium_payment_term");
        modelBuilder.Entity<Proposal>().Property(p => p.ApplicantAge).HasColumnName("applicant_age");
        modelBuilder.Entity<Proposal>().Property(p => p.ApplicantGender).HasColumnName("applicant_gender");
        modelBuilder.Entity<Proposal>().Property(p => p.ApplicantIncome).HasColumnName("applicant_income");
        modelBuilder.Entity<Proposal>().Property(p => p.ProposerIncome).HasColumnName("proposer_income");
        modelBuilder.Entity<Proposal>().Property(p => p.SumAssured).HasColumnName("sum_assured");
        modelBuilder.Entity<Proposal>().Property(p => p.Premium).HasColumnName("premium");
        modelBuilder.Entity<Proposal>().Property(p => p.ExistingCoverage).HasColumnName("existing_coverage");
        modelBuilder.Entity<Proposal>().Property(p => p.Height).HasColumnName("height");
        modelBuilder.Entity<Proposal>().Property(p => p.Weight).HasColumnName("weight");
        modelBuilder.Entity<Proposal>().Property(p => p.Bmi).HasColumnName("bmi");
        modelBuilder.Entity<Proposal>().Property(p => p.IsSmoker).HasColumnName("is_smoker");
        modelBuilder.Entity<Proposal>().Property(p => p.CigarettesPerDay).HasColumnName("cigarettes_per_day");
        modelBuilder.Entity<Proposal>().Property(p => p.SmokingYears).HasColumnName("smoking_years");
        modelBuilder.Entity<Proposal>().Property(p => p.IsAlcoholic).HasColumnName("is_alcoholic");
        modelBuilder.Entity<Proposal>().Property(p => p.AlcoholType).HasColumnName("alcohol_type");
        modelBuilder.Entity<Proposal>().Property(p => p.AlcoholQuantity).HasColumnName("alcohol_quantity");
        modelBuilder.Entity<Proposal>().Property(p => p.HasMedicalHistory).HasColumnName("has_medical_history");
        modelBuilder.Entity<Proposal>().Property(p => p.AilmentType).HasColumnName("ailment_type");
        modelBuilder.Entity<Proposal>().Property(p => p.AilmentDetails).HasColumnName("ailment_details");
        modelBuilder.Entity<Proposal>().Property(p => p.AilmentDurationYears).HasColumnName("ailment_duration_years");
        modelBuilder.Entity<Proposal>().Property(p => p.IsAilmentOngoing).HasColumnName("is_ailment_ongoing");
        modelBuilder.Entity<Proposal>().Property(p => p.IsAdventurous).HasColumnName("is_adventurous");
        modelBuilder.Entity<Proposal>().Property(p => p.OccupationCode).HasColumnName("occupation_code");
        modelBuilder.Entity<Proposal>().Property(p => p.OccupationClass).HasColumnName("occupation_class");
        modelBuilder.Entity<Proposal>().Property(p => p.OccupationRisk).HasColumnName("occupation_risk");
        modelBuilder.Entity<Proposal>().Property(p => p.IsOccupationHazardous).HasColumnName("is_occupation_hazardous");
        modelBuilder.Entity<Proposal>().Property(p => p.AgentCode).HasColumnName("agent_code");
        modelBuilder.Entity<Proposal>().Property(p => p.AgentTier).HasColumnName("agent_tier");
        modelBuilder.Entity<Proposal>().Property(p => p.Pincode).HasColumnName("pincode");
        modelBuilder.Entity<Proposal>().Property(p => p.IsNegativePincode).HasColumnName("is_negative_pincode");
        modelBuilder.Entity<Proposal>().Property(p => p.AmlCategory).HasColumnName("aml_category");
        modelBuilder.Entity<Proposal>().Property(p => p.RiskCategory).HasColumnName("risk_category");
        modelBuilder.Entity<Proposal>().Property(p => p.IsPep).HasColumnName("is_pep");
        modelBuilder.Entity<Proposal>().Property(p => p.IsCriminallyConvicted).HasColumnName("is_criminally_convicted");
        modelBuilder.Entity<Proposal>().Property(p => p.IsOfac).HasColumnName("is_ofac");
        modelBuilder.Entity<Proposal>().Property(p => p.IibStatus).HasColumnName("iib_status");
        modelBuilder.Entity<Proposal>().Property(p => p.IibScore).HasColumnName("iib_score");
        modelBuilder.Entity<Proposal>().Property(p => p.IibIsNegative).HasColumnName("iib_is_negative");
        modelBuilder.Entity<Proposal>().Property(p => p.Nationality).HasColumnName("nationality");
        modelBuilder.Entity<Proposal>().Property(p => p.MaritalStatus).HasColumnName("marital_status");
        modelBuilder.Entity<Proposal>().Property(p => p.Qualification).HasColumnName("qualification");
        modelBuilder.Entity<Proposal>().Property(p => p.SpecialClass).HasColumnName("special_class");
        modelBuilder.Entity<Proposal>().Property(p => p.ResidentialCountry).HasColumnName("residential_country");
        modelBuilder.Entity<Proposal>().Property(p => p.BusinessCountry).HasColumnName("business_country");
        modelBuilder.Entity<Proposal>().Property(p => p.IsPregnant).HasColumnName("is_pregnant");
        modelBuilder.Entity<Proposal>().Property(p => p.PregnancyWeeks).HasColumnName("pregnancy_weeks");
        modelBuilder.Entity<Proposal>().Property(p => p.FamilyMedicalHistory).HasColumnName("family_medical_history");
        modelBuilder.Entity<Proposal>().Property(p => p.IsLaProposer).HasColumnName("is_la_proposer");
        modelBuilder.Entity<Proposal>().Property(p => p.IsProposerCorporate).HasColumnName("is_proposer_corporate");
        modelBuilder.Entity<Proposal>().Property(p => p.LaProposerRelation).HasColumnName("la_proposer_relation");
        modelBuilder.Entity<Proposal>().Property(p => p.NomineeRelation).HasColumnName("nominee_relation");
        modelBuilder.Entity<Proposal>().Property(p => p.IsMedicalGenerated).HasColumnName("is_medical_generated");
        modelBuilder.Entity<Proposal>().Property(p => p.IsNarcotic).HasColumnName("is_narcotic");
        modelBuilder.Entity<Proposal>().Property(p => p.HardLiquorQuantity).HasColumnName("hard_liquor_quantity");
        modelBuilder.Entity<Proposal>().Property(p => p.BeerQuantity).HasColumnName("beer_quantity");
        modelBuilder.Entity<Proposal>().Property(p => p.WineQuantity).HasColumnName("wine_quantity");
        modelBuilder.Entity<Proposal>().Property(p => p.TobaccoQuantity).HasColumnName("tobacco_quantity");
        modelBuilder.Entity<Proposal>().Property(p => p.LiquorType).HasColumnName("liquor_type");
        modelBuilder.Entity<Proposal>().Property(p => p.IibIsNewToIib).HasColumnName("iib_is_new_to_iib");
        modelBuilder.Entity<Proposal>().Property(p => p.FgliPolicyStatuses).HasColumnName("fgli_policy_statuses");
        modelBuilder.Entity<Proposal>().Property(p => p.CreatedAt).HasColumnName("created_at");
        modelBuilder.Entity<Proposal>().Property(p => p.UpdatedAt).HasColumnName("updated_at");

        // ==================== EXISTING TABLES (PascalCase to match existing DB) ====================

    }
}