const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");
const { apiLimiter, sanitizeRequest } = require("./middleware/securityMiddleware");
const configs = require("./config/env");
const logger = require("./utils/logger");
const connectDB = require("./config/db");
const AppError = require("./utils/AppError");
const globalErrorHandler = require("./middlewares/error.middleware");
const JobProcessor = require("./jobs/JobProcessor");
const { successResponse } = require("./utils/responseHandler");
const FormSeeder = require("./services/FormSeeder");
const http = require("http");
const path = require("path");
const socketUtil = require("./utils/socket");

// Ensure all models are registered
require("./models/Permission");
require("./models/Role");
require("./models/Admin");
require("./models/User");
require("./models/vendor.model");
// require("./models/Vendor"); // Commented out to avoid conflict
require("./models/Category");
require("./models/FormTemplate");
require("./models/Form");
require("./models/TreeForm");
require("./models/VendorApplication");
require("./models/Submission");
require("./models/TreeSubmission");
require("./models/AuditLog");
require("./models/Document");
require("./models/Notification");
require("./models/Message");
require("./models/Contract");
require("./models/activityLog.model");
require("./models/Company");
require("./models/Department");
require("./models/RFQ");
require("./models/Quotation");
require("./models/PurchaseOrder");
require("./models/Payment");
require("./models/Rating");

const app = express();

// 1) Database Connection
connectDB();

// 2) Security & Optimization Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(sanitizeRequest);
// app.use(xss());
app.use(compression());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 3) Request Logging
if (configs.NODE_ENV === "development") {
    app.use(require("morgan")("dev"));
} else {
    app.use((req, res, next) => {
        logger.http(`${req.method} ${req.url}`);
        next();
    });
}

// 4) Health Check
app.get("/health", (req, res) => {
    return successResponse(res, "System Healthy", {
        status: "UP",
        uptime: process.uptime(),
        timestamp: new Date(),
        memoryUsage: process.memoryUsage(),
    });
});

// 5) API Rate Limiting
app.use("/api", apiLimiter);

// 6) API Versioning & Routes
const API_V1 = "/api/v1";

app.use(`${API_V1}/auth`, require("./routes/authRoutes"));
app.use(`${API_V1}/vendors`, require("./routes/vendor.routes"));
app.use(`${API_V1}/admin`, require("./routes/adminRoutes"));
app.use(`${API_V1}/forms`, require("./routes/formRoutes"));
app.use(`${API_V1}/applications`, require("./routes/applicationRoutes"));
app.use(`${API_V1}/categories`, require("./routes/categoryRoutes"));
app.use(`${API_V1}/invitations`, require("./routes/invitationRoutes"));
app.use(`${API_V1}/notifications`, require("./routes/notificationRoutes"));
app.use(`${API_V1}/slm`, require("./routes/slmRoutes"));
app.use(`${API_V1}/contracts`, require("./routes/contractRoutes"));
app.use(`${API_V1}/dashboard`, require("./routes/dashboard.routes"));
app.use(`${API_V1}/activity-logs`, require("./routes/activityLog.routes"));
app.use(`${API_V1}/category`, require("./routes/aiRoutes"));
app.use(`${API_V1}/rfqs`, require("./routes/rfqRoutes"));
app.use(`${API_V1}/quotations`, require("./routes/quotationRoutes"));
app.use(`${API_V1}/departments`, require("./routes/departmentRoutes"));
app.use(`${API_V1}/purchase-orders`, require("./routes/poRoutes"));
app.use(`${API_V1}/users`, require("./routes/userManagement.routes"));
app.use(`${API_V1}/roles`, require("./routes/role.routes"));
app.use(`${API_V1}/submissions`, require("./routes/submissionRoutes"));
app.use(`${API_V1}/form`, require("./routes/treeFormRoutes"));
app.use(`${API_V1}/submission`, require("./routes/treeSubmissionRoutes"));

// Backward compatibility & frontend aliases
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/vendors", require("./routes/vendor.routes"));
app.use("/api/vendor", require("./routes/vendor.routes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/forms", require("./routes/formRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/invitations", require("./routes/invitationRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/slm", require("./routes/slmRoutes"));
app.use("/api/contracts", require("./routes/contractRoutes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));
app.use("/api/activity-logs", require("./routes/activityLog.routes"));
app.use("/api/category", require("./routes/aiRoutes"));
app.use("/api/rfqs", require("./routes/rfqRoutes"));
app.use("/api/quotations", require("./routes/quotationRoutes"));
app.use("/api/departments", require("./routes/departmentRoutes"));
app.use("/api/purchase-orders", require("./routes/poRoutes"));
app.use("/api/users", require("./routes/userManagement.routes"));
app.use("/api/roles", require("./routes/role.routes"));
app.use("/api/submissions", require("./routes/submissionRoutes"));
app.use("/api/form", require("./routes/treeFormRoutes"));
app.use("/api/submission", require("./routes/treeSubmissionRoutes"));

// 7) Handle Undefined Routes
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 8) Global Error Handling Middleware
app.use(globalErrorHandler);

// 9) Start Server
const PORT = configs.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
socketUtil.init(server);

server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        logger.error(`Port ${PORT} is already in use. Stop the existing process or use a different PORT.`);
        process.exit(1);
    }

    logger.error(`Server startup failed: ${err.message}`);
    process.exit(1);
});

console.log("Attempting to start server on port:", PORT);
server.listen(PORT, () => {
    logger.info(`Server running in ${configs.NODE_ENV} mode on port ${PORT}`);

    // Initialize Bull Job Processor
    JobProcessor.init();

    // Seed pre-configured forms
    FormSeeder.seedMasterForm();
});
