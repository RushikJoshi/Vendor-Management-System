/**
 * Evaluates vendor data against category eligibility rules
 * @param {Object} data - Vendor registration data
 * @param {Array} rules - Category eligibility rules
 * @returns {Object} { score, status, details }
 */
exports.evaluateEligibility = (data, rules) => {
    if (!rules || rules.length === 0) {
        return { score: 100, status: "ELIGIBLE", details: [] };
    }

    let passedMandatory = true;
    let totalRules = rules.length;
    let passedRules = 0;
    const details = [];

    rules.forEach((rule) => {
        const { ruleName, ruleKey, operator, value, isMandatory } = rule;
        const vendorValue = data[ruleKey];
        let passed = false;

        if (vendorValue !== undefined) {
            switch (operator) {
                case "greater_than":
                    passed = Number(vendorValue) >= Number(value);
                    break;
                case "less_than":
                    passed = Number(vendorValue) <= Number(value);
                    break;
                case "equals":
                    passed = String(vendorValue) === String(value);
                    break;
                case "contains":
                    passed = String(vendorValue)
                        .toLowerCase()
                        .includes(String(value).toLowerCase());
                    break;
                default:
                    passed = false;
            }
        }

        if (passed) {
            passedRules++;
        } else if (isMandatory) {
            passedMandatory = false;
        }

        details.push({
            ruleName,
            passed,
            isMandatory,
        });
    });

    const score = Math.round((passedRules / totalRules) * 100);
    let status = "ELIGIBLE";

    if (!passedMandatory) {
        status = "NOT_ELIGIBLE";
    } else if (score < 100) {
        status = "PARTIALLY_ELIGIBLE";
    }

    return { score, status, details };
};
