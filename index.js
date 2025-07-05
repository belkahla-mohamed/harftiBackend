const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/payment");
const postRoutes = require("./routes/postEmployee");
const reservationRoutes = require("./routes/reservationRoutes");

const app = express();
const server = http.createServer(app); // 👈 استبدلنا app.listen

const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

// Listener ديال socket
io.on("connection", (socket) => {
  console.log("🔌 New socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });

  // يمكنك تضيف هنا events خاصة بيك
});

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB
mongoose.connect("mongodb+srv://...")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Routes
app.use("/auth", authRoutes);
app.use("/", serviceRoutes);
app.use("/payment", paymentRoutes);
app.use("/services", employeeRoutes);
app.use("/user", userRoutes);
app.use("/post", postRoutes);
app.use("/reservations", reservationRoutes);

// Static folders
app.use("/uploads", express.static("uploads"));
app.use("/reservationImgs", express.static("reservationImgs"));
app.use("/EmployeePhotos", express.static("EmployeePhotos"));
app.use("/servicesPhotos", express.static("servicesPhotos"));
app.use("/PostPhoto", express.static("PostPhoto"));

// Test route
app.get('/', (req, res) => {
  res.send('✅ Node.js backend is running with Socket.io!');
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
