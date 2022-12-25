const mongoose = require('mongoose')

const commentSchema =  mongoose.Schema({
    content:{
        type:String,
        require:true
    },
    userId:{
        type: mongoose.Types.ObjectId,
        ref : 'insta_table',
    },
    likes:[{
        type: mongoose.Types.ObjectId,
        ref : 'insta_table',
    }],
    postId:{
        type: mongoose.Types.ObjectId,
        ref:'post_tbs'
    },commentReply : [{
        content : String ,
        replyee : {
            type: mongoose.Types.ObjectId,
            ref : 'insta_table',
        },
        replier : {
            type: mongoose.Types.ObjectId,
            ref : 'insta_table',
        },
        likes : [{
            type: mongoose.Types.ObjectId,
            ref : 'insta_table',
        }],
        date : {
            type : String
        },
    },{timestamps:true}],
    date:{
        type: String,
    }
},{timestamps:true})

const commentModel = mongoose.model("comment_model",commentSchema)

module.exports = commentModel