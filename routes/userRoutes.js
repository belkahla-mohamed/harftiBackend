const express = require("express");
const router = express.Router();
const { usersCollection } = require("../models/User");
const { ObjectId } = require('mongodb');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

router.get('/users', async (req, res) => {
  const users = await usersCollection.find().lean();
  if(users){
    res.json({status : "success", message : "users founded", users})
  }else{
    res.json({status : "error", message : "users not founded"})
  }
})

// Get user profile by user ID
router.post("/Profile", async (req, res) => {
  const { userID } = req.body;

  try {
    if (userID) {
      const user = await usersCollection.findOne({ _id: new ObjectId(userID) });

      if (user) {
        return res.send({ status: "success", message: "User found", user });
      } else {
        return res.send({ status: "error", message: "User not found" });
      }
    } else {
      return res.send({ status: "error", message: "User ID not provided" });
    }
  } catch (error) {
    console.error(error);
    return res.send({ status: "error", message: "Server error", error });
  }
});

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "EmployeePhotos/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Update user profile (including photo and password)
router.put("/Profile/Update", upload.single("photo"), async (req, res) => {
  try {
    const { userID, oldPass, newPass, service, ...formData } = req.body;
    const file = req.file;
    const userId = new ObjectId(userID);

    // Parse the service JSON string
    let serviceLabels;
    try {
      serviceLabels = JSON.parse(service); // Convert JSON string to array
    } catch (error) {
      console.error("Service parsing error:", error);
      return res.status(400).json({ status: "error", message: "Invalid service format" });
    }

    // Ensure it's an array
    if (!Array.isArray(serviceLabels)) {
      return res.status(400).json({ status: "error", message: "Service must be an array" });
    }

    formData.service = serviceLabels; // Store only labels

    // Validate user existence
    const user = await usersCollection.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    // Validate password if changing it
    if (newPass) {
      const passwordMatch = await bcrypt.compare(oldPass, user.password);
      if (!passwordMatch) return res.json({ status: "error", message: "Incorrect old password" });

      formData.password = await bcrypt.hash(newPass, 10);
    }
    if (!user?.photo?.startsWith('avatar') && user?.photo !== 'default.png') {
      const photoPath = path.join('C:/Users/belka/OneDrive/Documents/project Duo/HARFTI/Harfti/BackEnd/EmployeePhotos', user.photo);
      if(fs.existsSync(photoPath)){
        await fs.promises.unlink(photoPath)
      }
      
    }
    if (file) {

      const photoName = file.filename
      formData.photo = photoName
    }

    // Update user in MongoDB
    const result = await usersCollection.updateOne({ _id: userId }, { $set: formData });

    return res.json({
      status: result.modifiedCount > 0 ? "success" : "error",
      message: result.modifiedCount > 0 ? "Information updated successfully!" : "No changes were made",
    });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({ status: "error", message: "Server error", error });
  }
});



/* admin */
router.post('/dashUser' ,async (req,res)=>{
  try {
    const users = await usersCollection.find().lean()
    if(users){
      res.send({status : 'success' , message:'users finded ' , users:users})
    }else{
      res.send({status: 'error' , message : 'users dont finded ' })
    }
  }
  catch (error) {
    res.send({ status: "error", message: "error in server", error });
  }
})

router.post('/dashUser/supp', async (req, res) => {
  try {
    const {username} =req.body
    if(username){
      let  supp = await usersCollection.deleteOne({username:username});

      if(supp){
        res.send({ status: "success", message: "user deleted" });
      }
    }
    
  } catch (error) {
    console.error(error);
    res.send({ status: 'error', message: 'Error in server', error });
  }
});

router.post('/dashUser/show' , async (req,res)=>{
  try{   
    const {id} = req.body;
    console.log(id)
    const user = await usersCollection.findOne({_id:new ObjectId(id)});
    console.log(user)
      if(user){
        res.send({ status: "success", message: "user finded" , user });
        console.log(user)
      }else{
        res.send({ status: "error", message: "user dont finded"});
      }

  
    }catch (error) {
    console.error(error);
    res.send({ status: 'error', message: 'Error in server', error });
  }
})




module.exports = router;
