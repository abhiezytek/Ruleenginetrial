using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InsuranceSTP.Models
{
    [Table("proposals")]
    // Defining the Indexes
    [Index(nameof(ProposalNumber), IsUnique = true, Name = "IX_proposals_proposal_number")]
    [Index(nameof(PolicyNumber), Name = "IX_proposals_policy_number")]
    [Index(nameof(ProductType), Name = "IX_proposals_product_type")]
    [Index(nameof(CreatedAt), Name = "IX_proposals_created_at")]
    public class Proposal
    {
        [Key]
        [StringLength(36)]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [StringLength(100)]
        public string ProposalNumber { get; set; }

        public long? PolicyNumber { get; set; }

        [Required]
        [StringLength(50)]
        public string ProductCode { get; set; }

        [Required]
        [StringLength(50)]
        public string ProductType { get; set; } = "term_pure";

        [Required]
        [StringLength(50)]
        public string ProductCategory { get; set; } = "life";

        [StringLength(50)]
        public string PaymentMode { get; set; }

        [StringLength(50)]
        public string ModeOfPurchase { get; set; }

        public int PolicyTerm { get; set; } = 0;

        public int PremiumPaymentTerm { get; set; } = 0;

        public int ApplicantAge { get; set; } = 0;

        [Required]
        [StringLength(5)]
        public string ApplicantGender { get; set; } = "M";

        public double ApplicantIncome { get; set; } = 0;

        public double ProposerIncome { get; set; } = 0;

        public double SumAssured { get; set; } = 0;

        public double Premium { get; set; } = 0;

        public double ExistingCoverage { get; set; } = 0;

        public double? Height { get; set; }

        public double? Weight { get; set; }

        public double? Bmi { get; set; }

        public bool IsSmoker { get; set; } = false;

        public int? CigarettesPerDay { get; set; }

        public int? SmokingYears { get; set; }

        public bool IsAlcoholic { get; set; } = false;

        [StringLength(50)]
        public string AlcoholType { get; set; }

        public int? AlcoholQuantity { get; set; }

        public bool HasMedicalHistory { get; set; } = false;

        [StringLength(100)]
        public string AilmentType { get; set; }

        public string AilmentDetails { get; set; } // NVARCHAR(MAX) maps to string

        public int? AilmentDurationYears { get; set; }

        public bool? IsAilmentOngoing { get; set; }

        public bool IsAdventurous { get; set; } = false;

        [StringLength(50)]
        public string OccupationCode { get; set; }

        [StringLength(50)]
        public string OccupationClass { get; set; }

        [StringLength(50)]
        public string OccupationRisk { get; set; }

        public bool IsOccupationHazardous { get; set; } = false;

        [StringLength(50)]
        public string AgentCode { get; set; }

        [StringLength(50)]
        public string AgentTier { get; set; }

        [StringLength(10)]
        public string Pincode { get; set; }

        public bool IsNegativePincode { get; set; } = false;

        [StringLength(20)]
        public string AmlCategory { get; set; }

        [StringLength(20)]
        public string RiskCategory { get; set; }

        public bool IsPep { get; set; } = false;

        public bool IsCriminallyConvicted { get; set; } = false;

        public bool IsOfac { get; set; } = false;

        [StringLength(50)]
        public string IibStatus { get; set; }

        public int? IibScore { get; set; }

        public bool? IibIsNegative { get; set; }

        [StringLength(50)]
        public string Nationality { get; set; }

        [StringLength(20)]
        public string MaritalStatus { get; set; }

        [StringLength(50)]
        public string Qualification { get; set; }

        [StringLength(50)]
        public string SpecialClass { get; set; }

        [StringLength(50)]
        public string ResidentialCountry { get; set; }

        [StringLength(50)]
        public string BusinessCountry { get; set; }

        public bool IsPregnant { get; set; } = false;

        public int? PregnancyWeeks { get; set; }

        public bool FamilyMedicalHistory { get; set; } = false;

        public bool IsLaProposer { get; set; } = true;

        public bool IsProposerCorporate { get; set; } = false;

        [StringLength(50)]
        public string LaProposerRelation { get; set; }

        [StringLength(50)]
        public string NomineeRelation { get; set; }

        public bool IsMedicalGenerated { get; set; } = false;

        public bool IsNarcotic { get; set; } = false;

        public double? HardLiquorQuantity { get; set; }

        public double? BeerQuantity { get; set; }

        public double? WineQuantity { get; set; }

        public int? TobaccoQuantity { get; set; }

        public int? LiquorType { get; set; }

        public bool? IibIsNewToIib { get; set; }

        [Column(TypeName = "ntext")]
        public string FgliPolicyStatuses { get; set; }

        [Required]
        [StringLength(50)]
        public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");

        [Required]
        [StringLength(50)]
        public string UpdatedAt { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
    }
}

namespace InsuranceSTP.DTOS
{
    public class Contract
    {
        [Required]
        public string ContractId { get; set; }
        [Required]
        public string ProductCode { get; set; }
        public string? ProductVersion { get; set; }
        public string? RegulatorCode { get; set; }
    }
}
