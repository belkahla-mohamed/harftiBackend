const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcrypt'); // Import bcryptjs
const { usersCollection } = require('../models/User');

const router = express.Router();

// Ensure EmployeePhotos directory exists
const uploadDir = path.join(__dirname, '../EmployeePhotos');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// GET all employees from JSON and store in MongoDB with hashed passwords
router.get("/employees", async (req, res) => {
    try {
        const filePath = path.join(__dirname, '../dataJson/employees.json');
        const fileData = await fs.promises.readFile(filePath, 'utf-8');
        const data = JSON.parse(fileData);

        if (!Array.isArray(data)) {
            return res.status(500).json({ status: "error", message: "Invalid data format in JSON file" });
        }

        let addedUsers = 0;
        let skippedUsers = 0;

        for (const user of data) {
            const existingUser = await usersCollection.findOne({ 
                $or: [{ username: user.username }, { email: user.email }] 
            });

            if (!existingUser) {
                // Hash the password before storing it
                const hashedPassword = await bcrypt.hash(user.password, 10);
                user.password = hashedPassword;

                await usersCollection.create(user);
                addedUsers++;
            } else {
                skippedUsers++;
            }
        }

        const workers = await usersCollection.find({ role: "employee" }).lean();

        return res.json({
            status: "success",
            message: `Processing complete: ${addedUsers} new users added, ${skippedUsers} duplicates skipped.`,
            workers
        });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ status: "error", message: "Server error", error });
    }
});


router.post('/employees', async (req, res) => {
    try{
        const {service} = req.body;
        
        if (!service) {
            return res.status(400).json({ status: "error", message: "Service field is required!" });
        }
        const employees = await usersCollection.find({service}).lean();
        if(employees){
            return res.json({ status : "success", message: "employee exist", employees});
        }
    }catch (err) {
        return res.status(500).json({ status : "error", message: "problem in data employees", err });
    }
})

module.exports = router;
