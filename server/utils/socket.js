const socketIO = require("socket.io");
let io;

const init = (server) => {
    io = socketIO(server, {
        cors: {
            origin: "*", // Adjust in production
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        socket.on("join", (userId) => {
            if (userId) {
                socket.join(userId);
                console.log(`User ${userId} joined their notification room.`);
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
