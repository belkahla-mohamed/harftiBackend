const express = require('express');
const fs = require('fs');
const servicesCollection = require('../models/Services');

const router = express.Router();

const multer = require("multer");
const path = require("path");

// Get Services
router.get('/services', async (req, res) => {
    try {
        const data = await fs.promises.readFile('./dataJson/services.json', 'utf8');
        const servicesData = JSON.parse(data);

        if (!Array.isArray(servicesData) || servicesData.length === 0) {
            return res.status(400).json({ status: 'error', message: 'Invalid or empty services data' });
        }

        $result = await servicesCollection.deleteMany();
        if ($result) {
            await servicesCollection.insertMany(servicesData);
            check = await servicesCollection.find().lean();
            return res.json({ status: 'success', services: check });
        }



    } catch (err) {
        console.error('Error in /services:', err);
        return res.status(500).json({ status: 'error', message: 'Error fetching services', error: err.message });
    }
});


/* Admin */

router.post("/servicesDelete", async (req, res) => {
    const { id } = req.body;
    try {
      if (id) {
        const supp = await servicesCollection.deleteOne({ _id: id });
  
        if (supp) {
          const lastServices = await servicesCollection.find().lean();
          await fs.promises.writeFile(
            "./dataJson/services.json",
            JSON.stringify(lastServices, null, 4)
          );
          return res.json({ status: "success", message: "service deleted" });
        } else {
          return res.json({ status: "error", message: "service dont deleted" });
        }
      } else {
        return res.json({ status: "error", message: "service dont selected" });
      }
    } catch (error) {
      console.error("Error in /services:", err);
      return res.status(500).json({
        status: "error",
        message: "Error fetching services",
        error: err.message,
      });
    }
  });
  
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "servicesPhotos/");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
  
  const upload = multer({ storage: storage });
  router.post("/newservices", upload.single("image"), async (req, res) => {
    let formData = req.body;
    const file = req.file;
  
    if (!file) {
      return res.json({ status: "error", message: "file is required" });
    }
    formData = { ...formData, image: file.filename };
  
    const services = await servicesCollection.find().lean();
  
    await services.push(formData);
    console.log(services);
    await fs.promises.writeFile(
      "./dataJson/services.json",
      JSON.stringify(services, null, 4)
    );
    const newservice = new servicesCollection(formData);
    await newservice.save();
  
    if (newservice) {
      return res.json({ status: "success", message: "service added" });
    } else {
      return res.json({ status: "error", message: "service dont added" });
    }
  });
  
  

module.exports = router;
