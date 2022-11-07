 const mongoose = require('mongoose')

const postSchema = mongoose.Schema ({
    username:String,
    profilepix : '',
    post : [{
        picture:'',
        caption:'',
        date : '',
        Comment:[],
        likes : [],
        dislike : []
    }],
    followers:[],
    following:[],

})

postModel = mongoose.model('post_tb', postSchema)
module.exports = postModel