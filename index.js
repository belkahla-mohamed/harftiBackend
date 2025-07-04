const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http"); // Required for Socket.io
const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/payment");
const postRoutes = require("./routes/postEmployee");
const reservationRoutes = require("./routes/reservationRoutes");

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Change to your frontend URL
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/Harfti")
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Socket.io Connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("newPost", (data) => {
    io.emit("updatePosts", data); // Broadcast the new post to all clients
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Attach io to req.app for routes to access it
app.set("socketio", io);

// Route Middleware
app.use("/auth", authRoutes);
app.use("/", serviceRoutes);
app.use("/payment", paymentRoutes);
app.use("/services", employeeRoutes);
app.use("/user", userRoutes);
app.use("/post", postRoutes);
app.use("/reservations", reservationRoutes);

// Serve Static Uploads
app.use("/uploads", express.static("uploads"));
app.use("/reservationImgs", express.static("reservationImgs"));
app.use("/EmployeePhotos", express.static("EmployeePhotos"));
app.use("/servicesPhotos", express.static("servicesPhotos"));
app.use("/PostPhoto", express.static("PostPhoto"));

// Start Server
server.listen(3001, () => {
    console.log("Server is running on port 3001");
});
