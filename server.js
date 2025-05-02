require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cron = require("node-cron");
const { checkUpcomingEvents } = require("./services/calendarService");

// Import routes
const userRoutes = require("./routes/userRoutes");

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);

// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/users", userRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// Schedule cron job to check for upcoming events every 5 minutes
cron.schedule("0 */7 * * *", async () => {
    console.log("Running cron job to check for upcoming events");
    try {
        await checkUpcomingEvents();
        console.log("Finished checking upcoming events");
    } catch (error) {
        console.error("Error in cron job:", error);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
