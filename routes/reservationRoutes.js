const express = require('express');
const multer = require('multer');
const path = require('path');
const { usersCollection, reservationsCollection } = require('../models/User');

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'reservationImgs/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Ensure this route is set up and working
router.post('/reserver', upload.single('image'), async (req, res) => {
    console.log(req.body);  // Log form data
    console.log(req.file);  // Log file data

    try {
        const { location, ...reservationInfos } = req.body;
        const parsedLocation = JSON.parse(location);
        
        const user = await usersCollection.findOne({ _id: reservationInfos.userId });

        if (user) {
            const imageName = req.file ? req.file.filename : reservationInfos.image.name;
            const reservation = new reservationsCollection({
                ...reservationInfos,
                location : parsedLocation,
                image: imageName
            });
            await reservation.save();

            res.status(200).json({ status: 'success', message: 'Reservation complete' });
        } else {
            res.status(400).json({ status: 'error', message: 'You must login first!' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error during reservation', error: error.message });
    }
});

module.exports = router;


