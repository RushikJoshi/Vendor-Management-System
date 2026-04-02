const AuditService = require("./AuditService");

class EligibilityService {
    /**
     * core scoring engine
     * @param {Object} application - The vendor application object
     * @param {Object} category - The category object with criteria
     */
    static async calculateScore(application, category) {
        const appData = application.data || {};

        const getValue = (key, labelHint) => {
            const dataMap = appData instanceof Map ? Object.fromEntries(appData) : appData;

            // Strategy 1: Direct key match
            if (dataMap[key]) return dataMap[key];

            // Strategy 2: Fuzzy search by label hint in form template
            if (labelHint && application.formTemplate?.sections) {
                for (let section of application.formTemplate.sections) {
                    for (let field of section.fields) {
                        const label = (field.label || "").toLowerCase();
                        if (label.includes(labelHint.toLowerCase())) {
                            const val = dataMap[field.fieldId] || dataMap[field.name];
                            if (val) return val;
                        }
                    }
                }
            }
            return 0;
        };

        if (!category || !category.criteria) {
            // Baseline score if no category defined
            return {
                score: 50,
                status: "PARTIALLY_ELIGIBLE",
                risk: "Medium",
                breakdown: { turnover: 50, experience: 50, certification: 50, documents: 50 }
            };
        }

        const criteria = category.criteria;

        // 1. Turnover Scoring
        const turnoverStr = String(getValue('annualTurnover', 'turnover') || '0').replace(/[^0-9.]/g, '');
        const turnover = Number(turnoverStr);
        let turnoverScore = 0;
        if (turnover >= criteria.preferredTurnover && criteria.preferredTurnover > 0) {
            turnoverScore = 100;
        } else if (turnover >= criteria.minimumTurnover) {
            turnoverScore = 50;
        } else {
            turnoverScore = 0;
        }

        // 2. Experience Scoring
        const experience = Number(getValue('yearsInBusiness', 'experience') || 0);
        let experienceScore = 0;
        if (experience >= criteria.minimumExperienceYears + 5) {
            experienceScore = 100;
        } else if (experience >= criteria.minimumExperienceYears) {
            experienceScore = 70;
        } else {
            experienceScore = 0;
        }

        // 3. Certification Scoring
        let certScore = 100;
        if (criteria.requiredCertificates && criteria.requiredCertificates.length > 0) {
            let foundCerts = 0;
            criteria.requiredCertificates.forEach(cert => {
                const val = getValue(cert, cert);
                if (val === true || val === 'true' || val === 'YES' || val === 'on') {
                    foundCerts++;
                }
            });
            certScore = Math.round((foundCerts / criteria.requiredCertificates.length) * 100);
        }

        // 4. Document Completeness
        let docScore = 100;
        if (criteria.mandatoryDocuments && criteria.mandatoryDocuments.length > 0) {
            let uploadedDocs = 0;
            criteria.mandatoryDocuments.forEach(docName => {
                const exists = application.documents.some(d => d.fieldName === docName || d.name === docName);
                if (exists) uploadedDocs++;
            });
            docScore = Math.round((uploadedDocs / criteria.mandatoryDocuments.length) * 100);
        }

        // 5. Final Calculation (Weights: 30%, 25%, 20%, 25%)
        const finalScore = Math.round(
            (0.30 * turnoverScore) +
            (0.25 * experienceScore) +
            (0.20 * certScore) +
            (0.25 * docScore)
        );

        // 6. Risk & Status Logic
        let status = "NOT_ELIGIBLE";
        let risk = "High";

        if (finalScore >= criteria.riskThresholdLow) {
            status = "ELIGIBLE";
            risk = "Low";
        } else if (finalScore >= criteria.riskThresholdMedium) {
            status = "PARTIALLY_ELIGIBLE";
            risk = "Medium";
        }

        const financialRisk = Math.round(100 - turnoverScore);
        const complianceRisk = Math.round(100 - ((certScore + docScore) / 2));
        const operationalRisk = Math.round(100 - experienceScore);
        const overallRiskScore = Math.round((financialRisk + complianceRisk + operationalRisk) / 3);

        const breakdown = {
            turnover: turnoverScore,
            experience: experienceScore,
            certification: certScore,
            documents: docScore,
            financialRisk,
            complianceRisk,
            operationalRisk,
            overallRiskScore
        };

        // Update application
        const previousScore = application.eligibilityScore;
        application.eligibilityScore = finalScore;
        application.riskMetrics = { financialRisk, complianceRisk, operationalRisk, overallRiskScore };
        application.eligibilityStatus = status;
        application.riskLevel = risk;
        application.scoreBreakdown = breakdown;

        await application.save();

        // Audit Log using centralized service
        await AuditService.log({
            actionType: "ELIGIBILITY_RECALCULATED",
            entityType: "Application",
            entityId: application._id,
            beforeData: { score: previousScore },
            afterData: {
                score: finalScore,
                status: status,
                risk: risk,
                breakdown: breakdown
            }
        });

        return {
            score: finalScore,
            status,
            risk,
            breakdown
        };
    }
}

module.exports = EligibilityService;
