const mongoose = require('mongoose')
const userModel = require('../models/user.model');
const postSchema = mongoose.Schema({
    uniqueId: {
        type: mongoose.Types.ObjectId,
        ref: 'insta_table'
    },
    picture: '',
    caption: '',
    date: '',
    Comment: [],
    likes: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'insta_table'
        }
    ],
    savedPost: [],
    objectFit: ''
}, { timestamps: true })

postModel = mongoose.model('post_tb', postSchema)
module.exports = postModel