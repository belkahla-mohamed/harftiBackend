const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { usersCollection } = require('../models/User');
const multer = require('multer');
const path = require('path')


const router = express.Router();
const JWT_SECRET = 'votre_clé_secrète_ici';

// User Registration

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'EmployeePhotos/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({ storage })
router.post("/create", upload.single("photo"), async (req, res) => {
    try {
        let formData = req.body;

        if (req.file) {
            formData.photo = req.file.filename;
        }

        console.log(formData);

        // Convert service from string to array if needed
        if (typeof formData.service === "string") {
            formData.service = JSON.parse(formData.service);
        }

        if (!Array.isArray(formData.service)) {
            formData.service = []; // Ensure it's always an array
        }

        // ✅ Hash the password before saving
        if (formData.password) {
            const salt = await bcrypt.genSalt(10); // Generate salt
            formData.password = await bcrypt.hash(formData.password, salt); // Hash password
        }

        const newUser = new usersCollection({
            ...formData,
            service: formData.service // ✅ Now correctly stored as an array
        });

        await newUser.save();
        res.status(201).json({ status: "success", message: "User created successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Server error" });
    }
});


// User Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.json({ status: 'error', message: 'All fields are required!' });
        }

        let user = await usersCollection.findOne({ email });
        if (!user) {

            user = await usersCollection.findOne({ username: email });
        }
        if (!user) {
            return res.json({ status: 'error', message: 'User does not exist!' });
        }

        const check = await bcrypt.compare(password, user.password);
        if (check) {
            const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
            return res.json({ status: 'success', message: 'Login successful', token, user });
        } else {
            return res.json({ status: 'error', message: 'Incorrect password' });
        }
    } catch (err) {
        console.error('Error in /login:', err);
        res.status(500).json({ message: 'Error during login', error: err.message });
    }
});

module.exports = router;
