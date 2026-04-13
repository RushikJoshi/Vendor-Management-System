const EventEmitter = require("events");
const AuditService = require("../../../services/AuditService");

const procurementEvents = new EventEmitter();

procurementEvents.on("procurement.action", async (payload) => {
  const {
    req,
    tenantId,
    actorId,
    actorRole,
    actionType,
    entityType,
    entityId,
    beforeData,
    afterData,
    metadata = {},
  } = payload;

  await AuditService.log({
    req: req || { user: { _id: actorId, role: actorRole } },
    userId: actorId,
    userRole: actorRole,
    actionType,
    entityType,
    entityId,
    beforeData,
    afterData,
    metadata,
  });

  void tenantId;
});

module.exports = procurementEvents;
