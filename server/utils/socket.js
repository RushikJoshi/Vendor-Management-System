const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
let io;

const init = (server) => {
    io = socketIO(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "*",
            methods: ["GET", "POST"]
        }
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, "");
        if (!token) return next(new Error("Authentication required"));

        try {
            socket.user = jwt.verify(token, process.env.JWT_SECRET);
            return next();
        } catch {
            return next(new Error("Invalid socket token"));
        }
    });

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        socket.on("join", (userId) => {
            const authenticatedUserId = String(socket.user?.id || "");
            if (userId && String(userId) !== authenticatedUserId) {
                return;
            }
            if (authenticatedUserId) {
                socket.join(authenticatedUserId);
                console.log(`User ${authenticatedUserId} joined their notification room.`);
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

/**
 * Emit a notification to a specific user
 * @param {string} userId - ID of the user to notify
 * @param {object} notification - Notification data
 */
const emitNotification = (userId, notification) => {
    if (io) {
        io.to(userId.toString()).emit("new_notification", notification);
    }
};

/**
 * Emit a notification to multiple users (e.g. all admins)
 * @param {Array} userIds - List of user IDs
 * @param {object} notification - Notification data
 */
const emitToUsers = (userIds, notification) => {
    if (io && Array.isArray(userIds)) {
        userIds.forEach(userId => {
            io.to(userId.toString()).emit("new_notification", notification);
        });
    }
};

module.exports = {
    init,
    getIO,
    emitNotification,
    emitToUsers
};
