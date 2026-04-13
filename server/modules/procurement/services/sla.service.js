const ProcurementSLA = require("../models/ProcurementSLA");
const procurementEvents = require("../events/procurement.events");

class ProcurementSLAService {
  static async upsertSLA({ tenantId, entityType, entityId, stage, dueAt, assignedToRole = "" }) {
    if (!dueAt) return null;
    return ProcurementSLA.findOneAndUpdate(
      { tenantId, entityType, entityId, stage },
      {
        tenantId,
        entityType,
        entityId,
        stage,
        dueAt,
        assignedToRole,
        status: "active",
        breachedAt: null,
        escalatedAt: null,
      },
      { upsert: true, new: true, runValidators: true }
    );
  }

  static async markMet({ tenantId, entityType, entityId, stage }) {
    return ProcurementSLA.findOneAndUpdate(
      { tenantId, entityType, entityId, stage, status: { $in: ["active", "breached", "escalated"] } },
      { status: "met" },
      { new: true }
    );
  }

  static async checkAndEscalateOverdue() {
    const now = new Date();
    const overdue = await ProcurementSLA.find({
      status: { $in: ["active", "breached"] },
      dueAt: { $lt: now },
    }).limit(200);

    for (const record of overdue) {
      const shouldEscalate = record.escalationLevel >= 1;
      const nextStatus = shouldEscalate ? "escalated" : "breached";
      const update = {
        status: nextStatus,
        breachedAt: record.breachedAt || now,
        escalationLevel: record.escalationLevel + 1,
      };
      if (shouldEscalate) update.escalatedAt = now;

      await ProcurementSLA.findByIdAndUpdate(record._id, update);

      procurementEvents.emit("procurement.action", {
        tenantId: record.tenantId,
        actorRole: "system",
        actionType: shouldEscalate ? "SLA_ESCALATED" : "SLA_BREACHED",
        entityType: record.entityType,
        entityId: record.entityId,
        metadata: { stage: record.stage, dueAt: record.dueAt, escalationLevel: record.escalationLevel + 1 },
      });
    }

    return overdue.length;
  }
}

module.exports = ProcurementSLAService;
