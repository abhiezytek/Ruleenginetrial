using InsuranceSTP.Models;
using InsuranceSTP.Data;
using System.Text.Json;

namespace InsuranceSTP.Services;

public static class RuleTemplateSeeder
{
    // Helper to build action JSON including letter_flag so it's preserved in rules created from templates
    private static string BuildAction(string decision, string reasonCode, string reasonMessage,
        bool isHardStop = false, string? letterFlag = null)
    {
        var obj = new
        {
            decision,
            reason_code = reasonCode,
            reason_message = reasonMessage,
            is_hard_stop = isHardStop,
            letter_flag = letterFlag
        };
        return JsonSerializer.Serialize(obj);
    }

    public static List<RuleTemplate> GetSTPTemplates()
    {
        var allProducts = "[\"term_life\",\"term_pure\",\"term_returns\",\"endowment\",\"ulip\",\"health\"]";
        var lifeProducts = "[\"term_life\",\"term_pure\",\"term_returns\"]";
        var allLifeEndowment = "[\"term_life\",\"term_pure\",\"term_returns\",\"endowment\",\"ulip\"]";
        var healthProducts = "[\"health\"]";

        return new List<RuleTemplate>
        {
            // ──────────────────────────────────────────────────────────────────────
            // STP001 – Gender (LA Gender must be Male or Female)
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP001",
                Name = "Gender Check - Transgender",
                Description = "STP001: Gender must be Male (M) or Female (F). Any other value triggers RUW.",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "applicant_gender", @operator = "not_in", value = new[] { "M", "F" } }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "TGQ", "Transgender - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                FollowUpCode = "TGQ",
                Priority = 10,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP003 – Annual Income Zero for earning life
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP003",
                Name = "Annual Income Zero for Earning Life",
                Description = "STP003: Annual income cannot be 0 for earning life (non-student, non-housewife)",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new {
                            logical_operator = "AND",
                            conditions = new object[] {
                                new { field = "occupation_code", @operator = "not_equals", value = "student" },
                                new { field = "occupation_code", @operator = "not_equals", value = "housewife" }
                            },
                            is_negated = false
                        },
                        new { field = "applicant_income", @operator = "equals", value = 0 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "INC001", "Annual income 0 for earning life - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 15,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP004 – Avocation
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP004",
                Name = "Adventurous Activities Check",
                Description = "STP004: Applicants engaged in adventurous activities require RUW",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "is_adventurous", @operator = "equals", value = true }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "AVO001", "Avocation engagement - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 20,
                ProductsJson = lifeProducts
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP005A – Life Product BMI > 30 (Physical MER required)
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP005A",
                Name = "Life Product - High BMI Check (>30)",
                Description = "STP005A: Life Product with BMI > 30 and Age >= 12 requires Physical MER",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "product_category", @operator = "equals", value = "life" },
                        new { field = "bmi", @operator = "greater_than", value = 30 },
                        new { field = "applicant_age", @operator = "greater_than_or_equal", value = 12 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "MPN", "High BMI (>30) - Physical MER required", letterFlag: "L"),
                LetterFlag = "L",
                FollowUpCode = "MPN",
                Priority = 25,
                ProductsJson = lifeProducts
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP005B – Health Product BMI > 29
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP005B",
                Name = "Health Product - High BMI Check (>29)",
                Description = "STP005B: Health Product with BMI > 29 and Age >= 12 requires Physical MER",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "product_category", @operator = "equals", value = "health" },
                        new { field = "bmi", @operator = "greater_than", value = 29 },
                        new { field = "applicant_age", @operator = "greater_than_or_equal", value = 12 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "MPN", "High BMI (>29) for health product - Physical MER required", letterFlag: "L"),
                LetterFlag = "L",
                FollowUpCode = "MPN",
                Priority = 25,
                ProductsJson = healthProducts
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP005C – Life Product Low BMI < 18 → MPN
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP005C",
                Name = "Life Product - Low BMI Check (<18) - MPN",
                Description = "STP005C: Life Product with BMI < 18 and Age >= 12 requires Physical MER",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "product_category", @operator = "equals", value = "life" },
                        new { field = "bmi", @operator = "less_than", value = 18 },
                        new { field = "applicant_age", @operator = "greater_than_or_equal", value = 12 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "MPN", "Low BMI (<18) - Physical MER required", letterFlag: "L"),
                LetterFlag = "L",
                FollowUpCode = "MPN",
                Priority = 25,
                ProductsJson = lifeProducts
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP005D – Life Product Low BMI < 18 → MCE (same condition, extra requirement)
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP005D",
                Name = "Life Product - Low BMI Check (<18) - MCE",
                Description = "STP005D: Life Product with BMI < 18 and Age >= 12 also requires CBC & ESR",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "product_category", @operator = "equals", value = "life" },
                        new { field = "bmi", @operator = "less_than", value = 18 },
                        new { field = "applicant_age", @operator = "greater_than_or_equal", value = 12 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "MCE", "Low BMI (<18) - CBC & ESR required", letterFlag: "L"),
                LetterFlag = "L",
                FollowUpCode = "MCE",
                Priority = 25,
                ProductsJson = lifeProducts
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP005E – Health Product BMI < 19 → MPN
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP005E",
                Name = "Health Product - Low BMI Check (<19) - MPN",
                Description = "STP005E: Health Product with BMI < 19 and Age >= 12 requires Physical MER",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "product_category", @operator = "equals", value = "health" },
                        new { field = "bmi", @operator = "less_than", value = 19 },
                        new { field = "applicant_age", @operator = "greater_than_or_equal", value = 12 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "MPN", "Low BMI (<19) for health product - Physical MER required", letterFlag: "L"),
                LetterFlag = "L",
                FollowUpCode = "MPN",
                Priority = 25,
                ProductsJson = healthProducts
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP005F – Health Product BMI < 19 → MCE (same condition, second requirement)
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP005F",
                Name = "Health Product - Low BMI Check (<19) - MCE",
                Description = "STP005F: Health Product with BMI < 19 and Age >= 12 also requires CBC & ESR",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "product_category", @operator = "equals", value = "health" },
                        new { field = "bmi", @operator = "less_than", value = 19 },
                        new { field = "applicant_age", @operator = "greater_than_or_equal", value = 12 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "MCE", "Low BMI (<19) for health product - CBC & ESR required", letterFlag: "L"),
                LetterFlag = "L",
                FollowUpCode = "MCE",
                Priority = 25,
                ProductsJson = healthProducts
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP005G – Height < 146 cm at adult age (> 18)
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP005G",
                Name = "Height Below 146 cm at Adult Age",
                Description = "STP005G: Height < 146 cm at age > 18 requires RUW",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "applicant_age", @operator = "greater_than", value = 18 },
                        new { field = "height", @operator = "less_than", value = 146 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "BLD001", "Height < 146 cm at adult age - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 26,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP005H – Height > 190 cm
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP005H",
                Name = "Height Above 190 cm",
                Description = "STP005H: Height > 190 cm requires RUW",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "height", @operator = "greater_than", value = 190 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "BLD002", "Height > 190 cm - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 26,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP005I – Minor build not in range (age < 12)
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP005I",
                Name = "Minor Build Not in Acceptable Range",
                Description = "STP005I: Age < 12 and height/weight not within acceptable range requires RUW",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "applicant_age", @operator = "less_than", value = 12 },
                        new { field = "minor_build_in_range", @operator = "equals", value = false }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "BLD003", "Minor life build not in acceptable range - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 27,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP006 – Education below SSC at age > 18
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP006",
                Name = "Education Below SSC at Adult Age",
                Description = "STP006: Age > 18 with qualification below SSC (Q05, Q06) requires RUW",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "applicant_age", @operator = "greater_than", value = 18 },
                        new { field = "qualification", @operator = "in", value = new[] { "Q05", "Q06" } }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "EDU001", "Age >18 and education below SSC - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 30,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP007 – FGLI previous policy in negative status
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP007",
                Name = "FGLI Previous Policy in Negative Status",
                Description = "STP007: Previous FGLI policy status in negative list requires RUW",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "fgli_has_negative_status", @operator = "equals", value = true }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "POL001", "Previous policy in negative status - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 35,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP008A – Physical/Amex mode + Smoker → QSQ
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP008A",
                Name = "Physical/Amex Mode - Smoker Questionnaire",
                Description = "STP008A: Physical or Amex mode with smoker requires smoker questionnaire",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "is_physical_or_amex_mode", @operator = "equals", value = true },
                        new { field = "is_smoker", @operator = "equals", value = true }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "QSQ", "Smoker questionnaire required (Physical/Amex mode)", letterFlag: "L"),
                LetterFlag = "L",
                FollowUpCode = "QSQ",
                Priority = 5,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP008B – Physical/Amex mode + Alcoholic → QAL
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP008B",
                Name = "Physical/Amex Mode - Alcohol Questionnaire",
                Description = "STP008B: Physical or Amex mode with alcohol consumption requires alcohol questionnaire",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "is_physical_or_amex_mode", @operator = "equals", value = true },
                        new { field = "is_alcoholic", @operator = "equals", value = true }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "QAL", "Alcohol questionnaire required (Physical/Amex mode)", letterFlag: "L"),
                LetterFlag = "L",
                FollowUpCode = "QAL",
                Priority = 5,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP008C – Online mode + Tobacco quantity > 10
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP008C",
                Name = "Online Mode - High Tobacco Consumption",
                Description = "STP008C: Online mode with tobacco > 10 units/day requires RUW",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "is_online_mode", @operator = "equals", value = true },
                        new { field = "tobacco_quantity", @operator = "greater_than", value = 10 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "HAB001", "Tobacco consumption beyond STP limits (online mode) - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 5,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP008D – Online mode + Single liquor type + quantities exceed limits
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP008D",
                Name = "Online Mode - Single Liquor Type Exceeds Limits",
                Description = "STP008D: Online mode, single liquor type, quantities exceed STP limits",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "is_online_mode", @operator = "equals", value = true },
                        new { field = "liquor_type", @operator = "equals", value = 1 },
                        new {
                            logical_operator = "OR",
                            conditions = new object[] {
                                new { field = "hard_liquor_quantity", @operator = "greater_than", value = 700 },
                                new { field = "beer_quantity", @operator = "greater_than", value = 2 },
                                new { field = "wine_quantity", @operator = "greater_than", value = 8 }
                            },
                            is_negated = false
                        }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "HAB002", "Alcohol consumption beyond STP limits (online mode) - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 5,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP008E – Narcotics/Drugs (hard stop)
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP008E",
                Name = "Narcotics/Drugs Consumption",
                Description = "STP008E: Narcotics/Drugs consumption requires RUW",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "is_narcotic", @operator = "equals", value = true }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "NAR001", "Narcotics/Drugs consumption - RUW required", isHardStop: true, letterFlag: "O"),
                LetterFlag = "O",
                Priority = 5,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP008F – Online mode + Multiple liquor types
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP008F",
                Name = "Online Mode - Multiple Liquor Types",
                Description = "STP008F: Online mode with more than one type of alcohol requires RUW",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "is_online_mode", @operator = "equals", value = true },
                        new { field = "liquor_type", @operator = "greater_than", value = 1 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "HAB003", "Multiple alcohol types beyond STP limits (online mode) - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 5,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP009 – Health history (any positive health question)
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP009",
                Name = "Negative Health History",
                Description = "STP009: Any positive health question response requires RUW",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "has_medical_history", @operator = "equals", value = true }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "HLT001", "Negative health history - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 40,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP010 – IIB Match (matrix-based decision via derived iib_pass field)
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP010",
                Name = "IIB Negative Match",
                Description = "STP010: IIB status + IsNegative combination results in STP fail (matrix lookup)",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "iib_pass", @operator = "equals", value = false }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "IIB001", "Negative match in IIB - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 45,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP011 – IIB Score >= 700 for new LA
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP011",
                Name = "High IIB Score for New LA",
                Description = "STP011: IIB score >= 700 for new life assured requires RUW",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "iib_score", @operator = "greater_than_or_equal", value = 700 },
                        new { field = "is_la_new_to_iib", @operator = "equals", value = true }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "IIB002", "New LA with IIB score >= 700 - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 45,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP012A – LA != Proposer, individual policy, close family relation
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP012A",
                Name = "LA-Proposer Mismatch - Individual Close Family",
                Description = "STP012A: LA != Proposer in individual policy with close family relation",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "is_la_proposer", @operator = "equals", value = false },
                        new { field = "is_proposer_corporate", @operator = "equals", value = false },
                        new { field = "la_proposer_relation", @operator = "in",
                            value = new[] { "husband", "wife", "son", "daughter", "grandfather",
                                           "grandson", "granddaughter", "grandmother" } }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "REL001", "LA != Proposer in individual policy - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 50,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP012C – LA != Proposer, corporate proposer, nominee relation blank
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP012C",
                Name = "LA-Proposer Mismatch - Corporate, Blank Nominee",
                Description = "STP012C: LA != Proposer, corporate proposer, nominee relation blank",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "is_la_proposer", @operator = "equals", value = false },
                        new { field = "is_proposer_corporate", @operator = "equals", value = true },
                        new { field = "nominee_relation", @operator = "not_exists", value = (object?)null }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "REL002", "Corporate proposer with blank nominee relation - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 50,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP012D – LA != Proposer, individual, father/mother relation, FSAR > 10L, age > 18
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP012D",
                Name = "LA-Proposer Mismatch - Parent Relation, High FSAR",
                Description = "STP012D: LA != Proposer, parent relation, FSAR > 10,00,000 and age > 18",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "is_la_proposer", @operator = "equals", value = false },
                        new { field = "is_proposer_corporate", @operator = "equals", value = false },
                        new { field = "la_proposer_relation", @operator = "in", value = new[] { "father", "mother" } },
                        new { field = "fsar", @operator = "greater_than", value = 1000000 },
                        new { field = "applicant_age", @operator = "greater_than", value = 18 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "REL003", "Parent-LA relation with high FSAR at adult age - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 50,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP013 – Loss/gain of weight
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP013",
                Name = "Loss or Gain of Weight",
                Description = "STP013: Weight change reported requires Physical MER",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "has_weight_changed", @operator = "equals", value = true }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "MPN", "Weight change reported - Physical MER required", letterFlag: "O"),
                LetterFlag = "O",
                FollowUpCode = "MPN",
                Priority = 28,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP014 – Nominee relation not acceptable
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP014",
                Name = "Non-Acceptable Nominee Relationship",
                Description = "STP014: Nominee relation must be from acceptable list",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "nominee_relation", @operator = "not_in",
                            value = new[] { "husband", "wife", "son", "daughter", "father", "mother",
                                           "grandfather", "grandson", "granddaughter", "grandmother" } }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "NOM001", "Not acceptable nominee relationship - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 55,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP015A – Student occupation → JSM (education proof)
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP015A",
                Name = "Student Occupation - Education Proof",
                Description = "STP015A: Student occupation requires education proof",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "occupation_code", @operator = "equals", value = "student" }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "JSM", "Student occupation - Education proof required", letterFlag: "L"),
                LetterFlag = "L",
                FollowUpCode = "JSM",
                Priority = 60,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP015B – Armed forces / Police → Q2M
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP015B",
                Name = "Armed Forces/Police Occupation",
                Description = "STP015B: Armed forces or police occupation requires armed forces questionnaire",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "occupation_code", @operator = "in", value = new[] { "armed_forces", "police" } }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "Q2M", "Armed forces/police occupation - Armed forces questionnaire required", letterFlag: "L"),
                LetterFlag = "L",
                FollowUpCode = "Q2M",
                Priority = 60,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP015C – Hazardous occupation
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP015C",
                Name = "Hazardous Occupation",
                Description = "STP015C: Hazardous occupation requires RUW",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "is_occupation_hazardous", @operator = "equals", value = true }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "OCC001", "Hazardous occupation - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 60,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP016A – Product not savings/investment
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP016A",
                Name = "Product Not Savings or Investment",
                Description = "STP016A: Product category is not savings or investment",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "product_category", @operator = "not_in", value = new[] { "savings", "investment" } }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "PRD001", "Product category is not savings/investment - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 65,
                ProductsJson = allProducts
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP016B – Savings/investment with term rider
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP016B",
                Name = "Term Rider on Savings/Investment Product",
                Description = "STP016B: Savings/investment product with term rider attached",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "product_category", @operator = "in", value = new[] { "savings", "investment" } },
                        new { field = "has_term_rider", @operator = "equals", value = true }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "PRD002", "Term rider opted on savings/investment product - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 65,
                ProductsJson = allProducts
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP017 – Negative pincode + low risk category
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP017",
                Name = "Negative Pincode Check",
                Description = "STP017: Negative pincode with low risk category requires RUW",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "is_negative_pincode", @operator = "equals", value = true },
                        new { field = "risk_category", @operator = "equals", value = "low" }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "LOC001", "Negative pincode detected - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 70,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP018M – Age 51-55 + FSAR > 20L
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP018M",
                Name = "Age 51-55 with High Sum Assured (>20L)",
                Description = "STP018M: Age between 51-55 and FSAR > 20,00,000 requires RUW",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "applicant_age", @operator = "between", value = 51, value2 = 55 },
                        new { field = "fsar", @operator = "greater_than", value = 2000000 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "AGE001", "Age >50 & SA >20L - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 61,
                ProductsJson = lifeProducts
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP018N – Age > 55
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP018N",
                Name = "Age Above 55",
                Description = "STP018N: Age > 55 requires RUW",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "applicant_age", @operator = "greater_than", value = 55 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "AGE002", "Age > 55 - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 61,
                ProductsJson = lifeProducts
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP019E – High AML Category (hard stop)
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP019E",
                Name = "High AML Category",
                Description = "STP019E: High AML category requires RUW (hard stop)",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "aml_category", @operator = "equals", value = "high" }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "AML001", "AML high category - RUW required", isHardStop: true, letterFlag: "O"),
                LetterFlag = "O",
                Priority = 3,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP019F – APE > 50% of proposer income → IPR
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP019F",
                Name = "APE Exceeds 50% of Proposer Income",
                Description = "STP019F: APE > 50% of proposer annual income requires income proof",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "ape_to_proposer_income_ratio", @operator = "greater_than", value = 0.5 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "IPR", "APE >50% of proposer income - Income proof required", letterFlag: "L"),
                LetterFlag = "L",
                FollowUpCode = "IPR",
                Priority = 75,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP020A – Age 18-40: FSAR > 25x income
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP020A",
                Name = "Financial Viability - Age 18-40 (FSAR > 25x Income)",
                Description = "STP020A: Age 18-40 with FSAR > 25 times annual income requires income proof",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "applicant_age", @operator = "between", value = 18, value2 = 40 },
                        new { field = "fsar_to_income_ratio", @operator = "greater_than", value = 25 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "FIN001", "FSAR > 25x income (age 18-40) - Income proof for financial viability", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 80,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP020B – Age 41-45: FSAR > 20x income
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP020B",
                Name = "Financial Viability - Age 41-45 (FSAR > 20x Income)",
                Description = "STP020B: Age 41-45 with FSAR > 20 times annual income requires income proof",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "applicant_age", @operator = "between", value = 41, value2 = 45 },
                        new { field = "fsar_to_income_ratio", @operator = "greater_than", value = 20 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "FIN001", "FSAR > 20x income (age 41-45) - Income proof for financial viability", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 80,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP020C – Age 46-50: FSAR > 15x income
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP020C",
                Name = "Financial Viability - Age 46-50 (FSAR > 15x Income)",
                Description = "STP020C: Age 46-50 with FSAR > 15 times annual income requires income proof",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "applicant_age", @operator = "between", value = 46, value2 = 50 },
                        new { field = "fsar_to_income_ratio", @operator = "greater_than", value = 15 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "FIN001", "FSAR > 15x income (age 46-50) - Income proof for financial viability", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 80,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP020D – Age 51-55: FSAR > 10x income
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP020D",
                Name = "Financial Viability - Age 51-55 (FSAR > 10x Income)",
                Description = "STP020D: Age 51-55 with FSAR > 10 times annual income requires income proof",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "applicant_age", @operator = "between", value = 51, value2 = 55 },
                        new { field = "fsar_to_income_ratio", @operator = "greater_than", value = 10 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "FIN001", "FSAR > 10x income (age 51-55) - Income proof for financial viability", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 80,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP023A/B/C/D/E – Product-specific maturity age and APE rules
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP023A",
                Name = "Product E97 - Maturity Age > 75 with APE > 10L",
                Description = "STP023A: Product E97, maturity age > 75 and APE > 10,00,000 requires RUW",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "product_code", @operator = "equals", value = "E97" },
                        new { field = "maturity_age", @operator = "greater_than", value = 75 },
                        new { field = "ape", @operator = "greater_than", value = 1000000 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "PRD003", "Product E97: maturity age beyond RI support - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 85,
                ProductsJson = allLifeEndowment
            },
            new RuleTemplate
            {
                TemplateId = "STP023B",
                Name = "Product E98 - Maturity Age > 75 with APE > 5L",
                Description = "STP023B: Product E98, maturity age > 75 and APE > 5,00,000 requires RUW",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "product_code", @operator = "equals", value = "E98" },
                        new { field = "maturity_age", @operator = "greater_than", value = 75 },
                        new { field = "ape", @operator = "greater_than", value = 500000 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "PRD003", "Product E98: maturity age beyond RI support - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 85,
                ProductsJson = allLifeEndowment
            },
            new RuleTemplate
            {
                TemplateId = "STP023C",
                Name = "Product E83 - Maturity Age > 75 with APE > 2L",
                Description = "STP023C: Product E83, maturity age > 75 and APE > 2,00,000 requires RUW",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "product_code", @operator = "equals", value = "E83" },
                        new { field = "maturity_age", @operator = "greater_than", value = 75 },
                        new { field = "ape", @operator = "greater_than", value = 200000 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "PRD003", "Product E83: maturity age beyond RI support - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 85,
                ProductsJson = allLifeEndowment
            },
            new RuleTemplate
            {
                TemplateId = "STP023D",
                Name = "Product E91/E92 - Maturity Age > 75, APE > 20L, PPT = 6",
                Description = "STP023D: Products E91/E92, maturity age > 75, APE > 20L, PPT = 6 years",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "product_code", @operator = "in", value = new[] { "E91", "E92" } },
                        new { field = "maturity_age", @operator = "greater_than", value = 75 },
                        new { field = "ape", @operator = "greater_than", value = 2000000 },
                        new { field = "premium_payment_term", @operator = "equals", value = 6 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "PRD003", "Product E91/E92 (PPT=6): maturity age beyond RI support - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 85,
                ProductsJson = allLifeEndowment
            },
            new RuleTemplate
            {
                TemplateId = "STP023E",
                Name = "Product E91/E92 - Maturity Age > 75, APE > 20L, PPT != 6",
                Description = "STP023E: Products E91/E92, maturity age > 75, APE > 20L, PPT != 6 years",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "product_code", @operator = "in", value = new[] { "E91", "E92" } },
                        new { field = "maturity_age", @operator = "greater_than", value = 75 },
                        new { field = "ape", @operator = "greater_than", value = 2000000 },
                        new { field = "premium_payment_term", @operator = "not_equals", value = 6 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "PRD003", "Product E91/E92 (PPT!=6): maturity age beyond RI support - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 85,
                ProductsJson = allLifeEndowment
            },
            new RuleTemplate
            {
                TemplateId = "STP023F",
                Name = "ULIP U52 - DB Multiple > 15",
                Description = "STP023F: Product U52 with DB multiple > 15 requires RUW",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "product_code", @operator = "equals", value = "U52" },
                        new { field = "db_multiple", @operator = "greater_than", value = 15 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "PRD004", "DB multiple > 15 for U52 - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 85,
                ProductsJson = "[\"ulip\"]"
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP024 – Residential status rules (B/C/D/E/F/G/H/I)
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP024B",
                Name = "NRI/PIO/OCI Standard Country - Exit Entry Details",
                Description = "STP024B: NRI/PIO/OCI from standard country requires exit/entry details",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "nationality", @operator = "in", value = new[] { "NRI", "PIO", "OCI" } },
                        new { field = "residential_country", @operator = "equals", value = "Standard" }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "NCM", "NRI/PIO/OCI - Exit/Entry details required", letterFlag: "L"),
                LetterFlag = "L",
                FollowUpCode = "NCM",
                Priority = 90,
                ProductsJson = allLifeEndowment
            },
            new RuleTemplate
            {
                TemplateId = "STP024C",
                Name = "NRI/PIO/OCI Standard Country - PIO Proof",
                Description = "STP024C: NRI/PIO/OCI from standard country requires PIO proof",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "nationality", @operator = "in", value = new[] { "NRI", "PIO", "OCI" } },
                        new { field = "residential_country", @operator = "equals", value = "Standard" }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "NDN", "NRI/PIO/OCI - Proof of PIO required", letterFlag: "L"),
                LetterFlag = "L",
                FollowUpCode = "NDN",
                Priority = 90,
                ProductsJson = allLifeEndowment
            },
            new RuleTemplate
            {
                TemplateId = "STP024D",
                Name = "NRI/PIO/OCI Standard Country - NRI Questionnaire",
                Description = "STP024D: NRI/PIO/OCI from standard country requires NRI questionnaire",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "nationality", @operator = "in", value = new[] { "NRI", "PIO", "OCI" } },
                        new { field = "residential_country", @operator = "equals", value = "Standard" }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "QNR", "NRI/PIO/OCI - NRI questionnaire required", letterFlag: "L"),
                LetterFlag = "L",
                FollowUpCode = "QNR",
                Priority = 90,
                ProductsJson = allLifeEndowment
            },
            new RuleTemplate
            {
                TemplateId = "STP024E",
                Name = "NRI/PIO/OCI Standard Country - Income Proof",
                Description = "STP024E: NRI/PIO/OCI from standard country requires income proof",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "nationality", @operator = "in", value = new[] { "NRI", "PIO", "OCI" } },
                        new { field = "residential_country", @operator = "equals", value = "Standard" }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "IPR", "NRI/PIO/OCI - Income proof required", letterFlag: "L"),
                LetterFlag = "L",
                FollowUpCode = "IPR",
                Priority = 90,
                ProductsJson = allLifeEndowment
            },
            new RuleTemplate
            {
                TemplateId = "STP024F",
                Name = "NRI/PIO/OCI from Substandard Country",
                Description = "STP024F: NRI/PIO/OCI from substandard country requires RUW",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "nationality", @operator = "in", value = new[] { "NRI", "PIO", "OCI" } },
                        new { field = "residential_country", @operator = "not_equals", value = "Standard" }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "RES001", "NRI/PIO/OCI from substandard country - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 90,
                ProductsJson = allLifeEndowment
            },
            new RuleTemplate
            {
                TemplateId = "STP024G",
                Name = "Foreign National",
                Description = "STP024G: Foreign national requires RUW",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "nationality", @operator = "equals", value = "FN" }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "RES002", "Foreign national - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 90,
                ProductsJson = allLifeEndowment
            },
            new RuleTemplate
            {
                TemplateId = "STP024H",
                Name = "Residential Country India but Works Abroad",
                Description = "STP024H: Residing in India but business country is not India",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "residential_country", @operator = "equals", value = "India" },
                        new { field = "business_country", @operator = "not_equals", value = "India" }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "RES003", "Mismatch in residential status and location of work - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 90,
                ProductsJson = allLifeEndowment
            },
            new RuleTemplate
            {
                TemplateId = "STP024I",
                Name = "NRI but Working in India",
                Description = "STP024I: NRI with business country as India requires RUW",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "nationality", @operator = "equals", value = "NRI" },
                        new { field = "business_country", @operator = "equals", value = "India" }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "RES004", "NRI working in India - mismatch in residential status - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 90,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP025A – High risk category
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP025A",
                Name = "High Risk Category",
                Description = "STP025A: High risk category requires RUW",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "risk_category", @operator = "equals", value = "high" }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "RSK001", "High risk case - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 95,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP028 – Family history (age < 60, 2+ family members)
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP028",
                Name = "Negative Family Medical History",
                Description = "STP028: Age < 60 with 2 or more family members with negative medical history",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "applicant_age", @operator = "less_than", value = 60 },
                        new { field = "family_medical_history_2_or_more", @operator = "equals", value = true }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "FAM001", "Negative family history (2+ members) - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 100,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP029A – Female, Occ class 3/4, marital status widow
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP029A",
                Name = "Female Widow with Petty Occupation Class",
                Description = "STP029A: Female, occupation class 3 or 4, marital status widow requires RUW",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "applicant_gender", @operator = "equals", value = "F" },
                        new { field = "occupation_class", @operator = "in", value = new[] { "class_3", "class_4" } },
                        new { field = "marital_status", @operator = "equals", value = "W" }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "FEM001", "Female widow with petty occupation - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 105,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP029B – Female widow with low education
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP029B",
                Name = "Uneducated Widow",
                Description = "STP029B: Female widow with education below certain level requires RUW",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "applicant_gender", @operator = "equals", value = "F" },
                        new { field = "marital_status", @operator = "equals", value = "W" },
                        new { field = "qualification", @operator = "in", value = new[] { "Q13", "Q03", "Q04", "Q05", "Q06" } }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "FEM002", "Uneducated widow - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 105,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP029E – Female class 4 occupation with FSAR > 2L
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP029E",
                Name = "Female Class 4 Occupation with High FSAR",
                Description = "STP029E: Female, class 4 occupation, FSAR > 2,00,000 requires RUW",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "applicant_gender", @operator = "equals", value = "F" },
                        new { field = "occupation_class", @operator = "equals", value = "class_4" },
                        new { field = "fsar", @operator = "greater_than", value = 200000 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "FEM003", "Female class 4 occupation with FSAR > 2L - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 105,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP031A – Criminal records
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP031A",
                Name = "Criminal Records Check",
                Description = "STP031A: Criminally convicted applicants require RUW (hard stop)",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "is_criminally_convicted", @operator = "equals", value = true }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "CRM001", "Criminal records - RUW required", isHardStop: true, letterFlag: "O"),
                LetterFlag = "O",
                Priority = 2,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP031B – PEP (Politically Exposed Person)
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP031B",
                Name = "Politically Exposed Person (PEP)",
                Description = "STP031B: Politically exposed person requires RUW",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "is_pep", @operator = "equals", value = true }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "PEP001", "Politically exposed person - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 2,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP031C – OFAC/Sanctions List
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP031C",
                Name = "OFAC/Sanctions List Check",
                Description = "STP031C: Applicants on OFAC/sanctions list require RUW (hard stop)",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "is_ofac", @operator = "equals", value = true }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "OFAC001", "Part of sanctions list - RUW required", isHardStop: true, letterFlag: "O"),
                LetterFlag = "O",
                Priority = 1,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP032 – Pregnancy rules (A/B/C/D)
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP032A",
                Name = "Pregnancy - Early Stage (<= 16 weeks) - Physical MER",
                Description = "STP032A: Female pregnant up to 16 weeks requires Physical MER",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "applicant_gender", @operator = "equals", value = "F" },
                        new { field = "is_pregnant", @operator = "equals", value = true },
                        new { field = "pregnancy_weeks", @operator = "less_than_or_equal", value = 16 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "MPN", "Pregnancy (<=16 weeks) - Physical MER required", letterFlag: "L"),
                LetterFlag = "L",
                FollowUpCode = "MPN",
                Priority = 110,
                ProductsJson = allLifeEndowment
            },
            new RuleTemplate
            {
                TemplateId = "STP032B",
                Name = "Pregnancy - Early Stage (<= 16 weeks) - CBC & ESR",
                Description = "STP032B: Female pregnant up to 16 weeks also requires CBC & ESR",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "applicant_gender", @operator = "equals", value = "F" },
                        new { field = "is_pregnant", @operator = "equals", value = true },
                        new { field = "pregnancy_weeks", @operator = "less_than_or_equal", value = 16 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "MCE", "Pregnancy (<=16 weeks) - CBC & ESR required", letterFlag: "L"),
                LetterFlag = "L",
                FollowUpCode = "MCE",
                Priority = 110,
                ProductsJson = allLifeEndowment
            },
            new RuleTemplate
            {
                TemplateId = "STP032C",
                Name = "Pregnancy - Early Stage (<= 16 weeks) - Gynaecologist Report",
                Description = "STP032C: Female pregnant up to 16 weeks also requires gynaecologist report",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "applicant_gender", @operator = "equals", value = "F" },
                        new { field = "is_pregnant", @operator = "equals", value = true },
                        new { field = "pregnancy_weeks", @operator = "less_than_or_equal", value = 16 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "WGN", "Pregnancy (<=16 weeks) - Gynaecologist report required", letterFlag: "L"),
                LetterFlag = "L",
                FollowUpCode = "WGN",
                Priority = 110,
                ProductsJson = allLifeEndowment
            },
            new RuleTemplate
            {
                TemplateId = "STP032D",
                Name = "Pregnancy - Advanced Stage (> 16 weeks)",
                Description = "STP032D: Female pregnant beyond 16 weeks requires RUW (advanced pregnancy)",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "applicant_gender", @operator = "equals", value = "F" },
                        new { field = "is_pregnant", @operator = "equals", value = true },
                        new { field = "pregnancy_weeks", @operator = "greater_than", value = 16 }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "PRG001", "Advanced pregnancy (>16 weeks) - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 110,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP033A – Random medical (policy divisible by 200)
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP033A",
                Name = "Random Medical Case (Policy # divisible by 200)",
                Description = "STP033A: Policy number divisible by 200 and no medical already generated",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "is_random_medical_case", @operator = "equals", value = true }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "MPN", "Random medical case selected - Physical MER required", letterFlag: "L"),
                LetterFlag = "L",
                FollowUpCode = "MPN",
                Priority = 115,
                ProductsJson = allLifeEndowment
            },

            // ──────────────────────────────────────────────────────────────────────
            // STP034 – Type of contract: HUF (A/B/C), MWP (D), EE (E-N), Keyman (O-Y)
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate { TemplateId = "STP034A", Name = "HUF - HUF Addendum", Description = "STP034A: HUF special class requires HUF addendum", Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new { logical_operator = "AND", conditions = new object[] { new { field = "special_class", @operator = "equals", value = "HUF" } }, is_negated = false }),
                ActionJson = BuildAction("FAIL", "QHM", "HUF contract - HUF addendum required", letterFlag: "L"), LetterFlag = "L", FollowUpCode = "QHM", Priority = 120, ProductsJson = allLifeEndowment },
            new RuleTemplate { TemplateId = "STP034B", Name = "HUF - PAN Card", Description = "STP034B: HUF special class requires PAN card", Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new { logical_operator = "AND", conditions = new object[] { new { field = "special_class", @operator = "equals", value = "HUF" } }, is_negated = false }),
                ActionJson = BuildAction("FAIL", "KNM", "HUF contract - PAN card required", letterFlag: "L"), LetterFlag = "L", FollowUpCode = "KNM", Priority = 120, ProductsJson = allLifeEndowment },
            new RuleTemplate { TemplateId = "STP034C", Name = "HUF - HUF Income Proof", Description = "STP034C: HUF special class requires HUF income proof", Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new { logical_operator = "AND", conditions = new object[] { new { field = "special_class", @operator = "equals", value = "HUF" } }, is_negated = false }),
                ActionJson = BuildAction("FAIL", "KNM1", "HUF contract - HUF income proof required", letterFlag: "L"), LetterFlag = "L", FollowUpCode = "KNM1", Priority = 120, ProductsJson = allLifeEndowment },
            new RuleTemplate { TemplateId = "STP034D", Name = "MWP - MWP Addendum", Description = "STP034D: MWP special class requires MWP addendum", Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new { logical_operator = "AND", conditions = new object[] { new { field = "special_class", @operator = "equals", value = "MWP" } }, is_negated = false }),
                ActionJson = BuildAction("FAIL", "MWP", "MWP contract - MWP addendum required", letterFlag: "L"), LetterFlag = "L", FollowUpCode = "MWP", Priority = 120, ProductsJson = allLifeEndowment },
            new RuleTemplate { TemplateId = "STP034E", Name = "EE - PAN Card", Description = "STP034E: Employer-Employee requires PAN card", Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new { logical_operator = "AND", conditions = new object[] { new { field = "special_class", @operator = "equals", value = "employer_employee" } }, is_negated = false }),
                ActionJson = BuildAction("FAIL", "KNM", "EE contract - PAN card required", letterFlag: "L"), LetterFlag = "L", FollowUpCode = "KNM", Priority = 120, ProductsJson = allLifeEndowment },
            new RuleTemplate { TemplateId = "STP034F", Name = "EE - Address Proof", Description = "STP034F: Employer-Employee requires address proof", Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new { logical_operator = "AND", conditions = new object[] { new { field = "special_class", @operator = "equals", value = "employer_employee" } }, is_negated = false }),
                ActionJson = BuildAction("FAIL", "KGM", "EE contract - Address proof required", letterFlag: "L"), LetterFlag = "L", FollowUpCode = "KGM", Priority = 120, ProductsJson = allLifeEndowment },
            new RuleTemplate { TemplateId = "STP034G", Name = "EE - COI MOA AOA", Description = "STP034G: Employer-Employee requires COI, MOA and AOA", Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new { logical_operator = "AND", conditions = new object[] { new { field = "special_class", @operator = "equals", value = "employer_employee" } }, is_negated = false }),
                ActionJson = BuildAction("FAIL", "KGM1", "EE contract - COI, MOA and AOA required", letterFlag: "L"), LetterFlag = "L", FollowUpCode = "KGM1", Priority = 120, ProductsJson = allLifeEndowment },
            new RuleTemplate { TemplateId = "STP034H", Name = "EE - Audited Financials", Description = "STP034H: Employer-Employee requires audited P&L and balance sheet", Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new { logical_operator = "AND", conditions = new object[] { new { field = "special_class", @operator = "equals", value = "employer_employee" } }, is_negated = false }),
                ActionJson = BuildAction("FAIL", "KGM2", "EE contract - Audited P&L and balance sheet (3 years) required", letterFlag: "L"), LetterFlag = "L", FollowUpCode = "KGM2", Priority = 120, ProductsJson = allLifeEndowment },
            new RuleTemplate { TemplateId = "STP034I", Name = "EE - EE Annexure", Description = "STP034I: Employer-Employee requires EE annexure", Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new { logical_operator = "AND", conditions = new object[] { new { field = "special_class", @operator = "equals", value = "employer_employee" } }, is_negated = false }),
                ActionJson = BuildAction("FAIL", "QEM", "EE contract - EE annexure required", letterFlag: "L"), LetterFlag = "L", FollowUpCode = "QEM", Priority = 120, ProductsJson = allLifeEndowment },
            new RuleTemplate { TemplateId = "STP034J", Name = "EE - ITR and COI", Description = "STP034J: Employer-Employee requires latest 3 years ITR and COI", Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new { logical_operator = "AND", conditions = new object[] { new { field = "special_class", @operator = "equals", value = "employer_employee" } }, is_negated = false }),
                ActionJson = BuildAction("FAIL", "QE1", "EE contract - Latest 3 years ITR and COI required", letterFlag: "L"), LetterFlag = "L", FollowUpCode = "QE1", Priority = 120, ProductsJson = allLifeEndowment },
            new RuleTemplate { TemplateId = "STP034K", Name = "EE - Deed of Assignment", Description = "STP034K: Employer-Employee requires deed of assignment", Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new { logical_operator = "AND", conditions = new object[] { new { field = "special_class", @operator = "equals", value = "employer_employee" } }, is_negated = false }),
                ActionJson = BuildAction("FAIL", "EDA", "EE contract - Deed of assignment required", letterFlag: "L"), LetterFlag = "L", FollowUpCode = "EDA", Priority = 120, ProductsJson = allLifeEndowment },
            new RuleTemplate { TemplateId = "STP034L", Name = "EE - Proof of Employment", Description = "STP034L: Employer-Employee requires proof of employment", Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new { logical_operator = "AND", conditions = new object[] { new { field = "special_class", @operator = "equals", value = "employer_employee" } }, is_negated = false }),
                ActionJson = BuildAction("FAIL", "EDA1", "EE contract - Proof of employment required", letterFlag: "L"), LetterFlag = "L", FollowUpCode = "EDA1", Priority = 120, ProductsJson = allLifeEndowment },
            new RuleTemplate { TemplateId = "STP034M", Name = "EE - EE Annexure I, II and A", Description = "STP034M: Employer-Employee requires duly filled EE Annexure-I, II & A", Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new { logical_operator = "AND", conditions = new object[] { new { field = "special_class", @operator = "equals", value = "employer_employee" } }, is_negated = false }),
                ActionJson = BuildAction("FAIL", "EDA2", "EE contract - EE Annexure-I, II & A required", letterFlag: "L"), LetterFlag = "L", FollowUpCode = "EDA2", Priority = 120, ProductsJson = allLifeEndowment },
            new RuleTemplate { TemplateId = "STP034N", Name = "EE - Cover Details", Description = "STP034N: Employer-Employee requires details of existing and applied life cover", Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new { logical_operator = "AND", conditions = new object[] { new { field = "special_class", @operator = "equals", value = "employer_employee" } }, is_negated = false }),
                ActionJson = BuildAction("FAIL", "PID", "EE contract - Details of existing/applied life cover required", letterFlag: "L"), LetterFlag = "L", FollowUpCode = "PID", Priority = 120, ProductsJson = allLifeEndowment },
            new RuleTemplate { TemplateId = "STP034O", Name = "Keyman - PAN Card", Description = "STP034O: Keyman insurance requires PAN card", Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new { logical_operator = "AND", conditions = new object[] { new { field = "special_class", @operator = "equals", value = "keyman" } }, is_negated = false }),
                ActionJson = BuildAction("FAIL", "KNM", "Keyman insurance - PAN card required", letterFlag: "L"), LetterFlag = "L", FollowUpCode = "KNM", Priority = 125, ProductsJson = allLifeEndowment },
            new RuleTemplate { TemplateId = "STP034P", Name = "Keyman - Address Proof", Description = "STP034P: Keyman insurance requires address proof", Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new { logical_operator = "AND", conditions = new object[] { new { field = "special_class", @operator = "equals", value = "keyman" } }, is_negated = false }),
                ActionJson = BuildAction("FAIL", "KGM", "Keyman insurance - Address proof required", letterFlag: "L"), LetterFlag = "L", FollowUpCode = "KGM", Priority = 125, ProductsJson = allLifeEndowment },
            new RuleTemplate { TemplateId = "STP034Q", Name = "Keyman - COI MOA AOA", Description = "STP034Q: Keyman insurance requires COI, MOA and AOA", Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new { logical_operator = "AND", conditions = new object[] { new { field = "special_class", @operator = "equals", value = "keyman" } }, is_negated = false }),
                ActionJson = BuildAction("FAIL", "KGM1", "Keyman insurance - COI, MOA and AOA required", letterFlag: "L"), LetterFlag = "L", FollowUpCode = "KGM1", Priority = 125, ProductsJson = allLifeEndowment },
            new RuleTemplate { TemplateId = "STP034R", Name = "Keyman - Audited Financials", Description = "STP034R: Keyman insurance requires audited P&L and balance sheet", Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new { logical_operator = "AND", conditions = new object[] { new { field = "special_class", @operator = "equals", value = "keyman" } }, is_negated = false }),
                ActionJson = BuildAction("FAIL", "KGM2", "Keyman insurance - Audited P&L and balance sheet (3 years) required", letterFlag: "L"), LetterFlag = "L", FollowUpCode = "KGM2", Priority = 125, ProductsJson = allLifeEndowment },
            new RuleTemplate { TemplateId = "STP034S", Name = "Keyman - EE Annexure", Description = "STP034S: Keyman insurance requires EE annexure", Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new { logical_operator = "AND", conditions = new object[] { new { field = "special_class", @operator = "equals", value = "keyman" } }, is_negated = false }),
                ActionJson = BuildAction("FAIL", "QEM", "Keyman insurance - EE annexure required", letterFlag: "L"), LetterFlag = "L", FollowUpCode = "QEM", Priority = 125, ProductsJson = allLifeEndowment },
            new RuleTemplate { TemplateId = "STP034T", Name = "Keyman - ITR and COI", Description = "STP034T: Keyman insurance requires latest 3 years ITR and COI", Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new { logical_operator = "AND", conditions = new object[] { new { field = "special_class", @operator = "equals", value = "keyman" } }, is_negated = false }),
                ActionJson = BuildAction("FAIL", "QE1", "Keyman insurance - Latest 3 years ITR and COI required", letterFlag: "L"), LetterFlag = "L", FollowUpCode = "QE1", Priority = 125, ProductsJson = allLifeEndowment },
            new RuleTemplate { TemplateId = "STP034U", Name = "Keyman - Deed of Assignment", Description = "STP034U: Keyman insurance requires deed of assignment", Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new { logical_operator = "AND", conditions = new object[] { new { field = "special_class", @operator = "equals", value = "keyman" } }, is_negated = false }),
                ActionJson = BuildAction("FAIL", "EDA", "Keyman insurance - Deed of assignment required", letterFlag: "L"), LetterFlag = "L", FollowUpCode = "EDA", Priority = 125, ProductsJson = allLifeEndowment },
            new RuleTemplate { TemplateId = "STP034V", Name = "Keyman - Proof of Employment", Description = "STP034V: Keyman insurance requires proof of employment", Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new { logical_operator = "AND", conditions = new object[] { new { field = "special_class", @operator = "equals", value = "keyman" } }, is_negated = false }),
                ActionJson = BuildAction("FAIL", "EDA1", "Keyman insurance - Proof of employment required", letterFlag: "L"), LetterFlag = "L", FollowUpCode = "EDA1", Priority = 125, ProductsJson = allLifeEndowment },
            new RuleTemplate { TemplateId = "STP034W", Name = "Keyman - EE Annexure I, II and A", Description = "STP034W: Keyman insurance requires duly filled EE Annexure-I, II & A", Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new { logical_operator = "AND", conditions = new object[] { new { field = "special_class", @operator = "equals", value = "keyman" } }, is_negated = false }),
                ActionJson = BuildAction("FAIL", "EDA2", "Keyman insurance - EE Annexure-I, II & A required", letterFlag: "L"), LetterFlag = "L", FollowUpCode = "EDA2", Priority = 125, ProductsJson = allLifeEndowment },
            new RuleTemplate { TemplateId = "STP034X", Name = "Keyman - Keyman Questionnaire", Description = "STP034X: Keyman insurance requires keyman questionnaire", Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new { logical_operator = "AND", conditions = new object[] { new { field = "special_class", @operator = "equals", value = "keyman" } }, is_negated = false }),
                ActionJson = BuildAction("FAIL", "QKN", "Keyman insurance - Keyman questionnaire required", letterFlag: "L"), LetterFlag = "L", FollowUpCode = "QKN", Priority = 125, ProductsJson = allLifeEndowment },
            new RuleTemplate { TemplateId = "STP034Y", Name = "Keyman - Cover Details", Description = "STP034Y: Keyman insurance requires details of existing and applied life cover", Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new { logical_operator = "AND", conditions = new object[] { new { field = "special_class", @operator = "equals", value = "keyman" } }, is_negated = false }),
                ActionJson = BuildAction("FAIL", "PID", "Keyman insurance - Details of existing/applied life cover required", letterFlag: "L"), LetterFlag = "L", FollowUpCode = "PID", Priority = 125, ProductsJson = allLifeEndowment },

            // ──────────────────────────────────────────────────────────────────────
            // STP035 – Medical case (is_medical_generated = true)
            // ──────────────────────────────────────────────────────────────────────
            new RuleTemplate
            {
                TemplateId = "STP035",
                Name = "Medical Case Generated",
                Description = "STP035: Medical case already generated requires RUW",
                Category = "stp_decision",
                ConditionGroupJson = JsonSerializer.Serialize(new {
                    logical_operator = "AND",
                    conditions = new object[] {
                        new { field = "is_medical_generated", @operator = "equals", value = true }
                    },
                    is_negated = false
                }),
                ActionJson = BuildAction("FAIL", "MED001", "Medical case generated - RUW required", letterFlag: "O"),
                LetterFlag = "O",
                Priority = 130,
                ProductsJson = allLifeEndowment
            },
        };
    }

    /// <summary>
    /// Seeds templates idempotently - adds only templates that don't yet exist by TemplateId.
    /// </summary>
    public static void SeedTemplates(AppDbContext context)
    {
        var existingIds = context.RuleTemplates
            .Select(t => t.TemplateId)
            .ToHashSet();

        var templates = GetSTPTemplates();
        var newTemplates = templates
            .Where(t => !existingIds.Contains(t.TemplateId))
            .ToList();

        if (newTemplates.Count > 0)
        {
            context.RuleTemplates.AddRange(newTemplates);
            context.SaveChanges();
        }
    }

    /// <summary>
    /// Creates rules from all active templates (idempotent by rule name).
    /// Called on startup so STP templates are immediately available for evaluation.
    /// </summary>
    public static void SeedRulesFromTemplates(AppDbContext context)
    {
        var templates = context.RuleTemplates.Where(t => t.IsActive).ToList();

        var existingRuleNames = context.Rules
            .Select(r => r.Name)
            .ToHashSet();

        var newRules = templates
            .Where(t => !existingRuleNames.Contains(t.Name))
            .Select(t => new Rule
            {
                Name = t.Name,
                Description = t.Description,
                Category = t.Category,
                StageId = null,
                ConditionGroupJson = t.ConditionGroupJson,
                ActionJson = t.ActionJson,
                Priority = t.Priority,
                IsEnabled = true,
                ProductsJson = t.ProductsJson
            })
            .ToList();

        if (newRules.Count > 0)
        {
            context.Rules.AddRange(newRules);
            context.SaveChanges();
        }
    }

    public static void SeedDefaultAdmin(AppDbContext context, IAuthService authService)
    {
        if (!context.Users.Any(u => u.Username == "admin"))
        {
            var admin = new User
            {
                Username = "admin",
                Email = "admin@ruleengine.com",
                PasswordHash = authService.HashPassword("admin123"),
                FullName = "System Administrator",
                Role = UserRoles.Admin,
                IsActive = true
            };
            context.Users.Add(admin);
            context.SaveChanges();
        }
    }
}
