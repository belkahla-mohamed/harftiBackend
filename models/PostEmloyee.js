const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    prix: {
        type: String,
    },
    photo: {
        type: String
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }], // Stores user IDs who liked the post
    saves: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }], // Stores user IDs who saved the post
    comments: [{
        userID: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        text: String,
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

const PostCollection = mongoose.model('postEmployee', PostSchema);
module.exports = PostCollection;
