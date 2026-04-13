const cron = require("node-cron");
const ProcurementSLAService = require("../services/sla.service");
const logger = require("../../../utils/logger");

let started = false;

const startProcurementCron = () => {
  if (started) return;
  started = true;

  cron.schedule("*/15 * * * *", async () => {
    try {
      const count = await ProcurementSLAService.checkAndEscalateOverdue();
      if (count > 0) {
        logger.info(`[ProcurementCron] Processed ${count} overdue SLA records.`);
      }
    } catch (error) {
      logger.error(`[ProcurementCron] SLA escalation failed: ${error.message}`);
    }
  });
};

module.exports = { startProcurementCron };
