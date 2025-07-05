const express = require("express");
const PostCollection = require("../models/PostEmloyee");
const { usersCollection } = require("../models/User");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Get Posts
router.get('/PostEmployee', async (req, res) => {
    try {
        const posts = await PostCollection.find().lean();
        const employees = await usersCollection.find({ "role": "employee" }).lean();
        res.send({ status: "success", posts, employees });
    } catch (err) {
        res.status(500).send({ status: "error", message: "Error fetching posts" });
    }
});

// Upload Image/Video
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "PostPhoto/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// Create Post
router.post("/PostEmployee", upload.single("photo"), async (req, res) => {
    try {
        const formData = req.body;
        const file = req.file;
        if (!formData.description) return res.send({ status: "error", message: "Description is required" })
       

        const newPost = new PostCollection({
            ...formData,
           
        });

        await newPost.save();
        res.send({ status: "success", message: "The Post has uploaded successfully." });
    } catch (err) {
        res.status(500).send({ status: "error", message: "Error posting" });
    }
});

// Like Post
router.post("/like/:postId", async (req, res) => {
    try {
        const { userID } = req.body;
        const post = await PostCollection.findById(req.params.postId);

        if (!post) return res.status(404).send({ status: "error", message: "Post not found" });

        const isLiked = post.likes.includes(userID);

        if (isLiked) {
            post.likes = post.likes.filter(id => id.toString() !== userID);
        } else {
            post.likes.push(userID);
        }

        await post.save();
        res.send({ status: "success", postLiked: post, });
    } catch (err) {
        res.status(500).send({ status: "error", message: "Error liking post" });
    }
});

// Save Post
router.post("/save/:postId", async (req, res) => {
    try {
        const { userID } = req.body;
        const post = await PostCollection.findById(req.params.postId);

        if (!post) return res.status(404).send({ status: "error", message: "Post not found" });

        const isSaved = post.saves.includes(userID);

        if (isSaved) {
            post.saves = post.saves.filter(id => id.toString() !== userID);
        } else {
            post.saves.push(userID);
        }

        await post.save();
        res.send({ status: "success", postSaved: post });
    } catch (err) {
        res.status(500).send({ status: "error", message: "Error saving post" });
    }
});

// Comment on Post
router.post("/comment/:postId", async (req, res) => {
    try {
        const { userID, text } = req.body;
        const post = await PostCollection.findById(req.params.postId);

        if (!post) return res.status(404).send({ status: "error", message: "Post not found" });

        post.comments.push({ userID, text });
        await post.save();

        res.send({ status: "success", comments: post.comments });
    } catch (err) {
        res.status(500).send({ status: "error", message: "Error adding comment" });
    }
});

router.delete("/delete/:postId", async (req, res) => {
    try {
        const result = await PostCollection.findByIdAndDelete(req.params.postId);
        if (!result) return res.status(404).send({ status: "error", message: "Post not found" });
        res.send({ status: "success", message: "The post has been deleted successfully." })
    } catch (err) {
        res.status(500).send({ status: "error", message: "Error delete post" });
    }
})



router.get("/ProfileEmployee/:username", async (req, res) => {
    try {
        console.log(req.params.username)
        const employee = await usersCollection.findOne({username : req.params.username});
        if (employee) {
            res.send({ status: "success", message: "The employee founded successfully.", employee })
        } else {
            res.send({ status: "error", message: 'Problem in Profile "404"' })
        }
    } catch (err) {
        res.status(500).send({ status: "error", message: "Error found employee" });
    }
})

module.exports = router;
