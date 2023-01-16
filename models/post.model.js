const mongoose = require('mongoose')
const userModel = require('../models/user.model');
const postSchema = mongoose.Schema({
    uniqueId: {
        type: mongoose.Types.ObjectId,
        ref: 'insta_table'
    },
    postImage: '',
    caption: '',
    date: '',
    Comment: [{
        type: mongoose.Types.ObjectId,
        ref: 'insta_table'
    }],
    likes: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'insta_table'
        }
    ],
    savedPost: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'insta_table'
        }
    ],
    objectFit: ''
}, { timestamps: true })

postModel = mongoose.model('post_tb', postSchema)
module.exports = postModel