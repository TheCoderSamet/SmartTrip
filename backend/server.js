const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

require("dotenv").config();

const connectDB = require("./src/config/db");
const swaggerSpec = require("./src/config/swagger");

const {
  connectQueue,
} = require("./src/services/queueService");

const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const groupRoutes = require("./src/routes/groupRoutes");
const tripRoutes = require("./src/routes/tripRoutes");
const placeRoutes = require("./src/routes/placeRoutes");
const routeRoutes = require("./src/routes/routeRoutes");

const app = express();

connectDB();
connectQueue();

app.use(cors());
app.use(express.json());


// Swagger API Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);


// Application Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api", tripRoutes);
app.use("/api", placeRoutes);
app.use("/api", routeRoutes);


const PORT = process.env.PORT || 3000;


app.get("/", (req, res) => {
  res.status(200).json({
    message: "SmartTrip API is running",
  });
});


app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "SmartTrip API",
  });
});


app.listen(PORT, () => {
  console.log(`SmartTrip server running on port ${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});