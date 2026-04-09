using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InsuranceSTP.Models
{
    [Table("lookup_histories")]
    // Defining Indexes at the Class Level
    [Index(nameof(LookupId), Name = "IX_lookup_histories_lookup_id")]
    [Index(nameof(OverallDecision), Name = "IX_lookup_histories_overall_decision")]
    [Index(nameof(EvaluatedAt), Name = "IX_lookup_histories_evaluated_at")]
    [Index(nameof(LookupType), Name = "IX_lookup_histories_lookup_type")]
    public class LookupHistory
    {
        [Key]
        [StringLength(36)]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [StringLength(100)]
        public string LookupId { get; set; }

        [Required]
        [StringLength(20)]
        public string LookupType { get; set; } = "proposal";

        [Required]
        [StringLength(10)]
        public string OverallDecision { get; set; } = "PASS";

        [Column(TypeName = "ntext")]
        public string ProposalData { get; set; }

        [Column(TypeName = "ntext")]
        public string RuleResults { get; set; }

        [Column(TypeName = "ntext")]
        public string ReasonMessages { get; set; }

        [Required]
        [StringLength(50)]
        public string EvaluatedAt { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
    }
}
