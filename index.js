const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/payment");
const postRoutes = require("./routes/postEmployee");
const reservationRoutes = require("./routes/reservationRoutes");

const app = express();

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb+srv://devmohamedbelkahla:uCMzWAlgTVWZGisi@cluster1.lrw6fh3.mongodb.net/harfti?retryWrites=true&w=majority&appName=Cluster1")
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

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
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
