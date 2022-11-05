 const mongoose = require('mongoose')

const postSchema = mongoose.Schema ({
    username:String,
    profilepix:String,
    post : [{
        picture:'',
        caption:'',
        time:''
    }],
    Comment:[],
    followers:[],
    following:[],
     likes : [],
     dislike : []
})

postModel = mongoose.model('post_tb', postSchema)
module.exports = postModel