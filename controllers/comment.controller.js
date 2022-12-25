//const Comment = require('../models/comment.model')
const mongoose = require('mongoose')
const cloudinary = require('cloudinary')
const commentModel = require('../models/comment.model')
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

const postComment = (request, response) => {
    console.log(request.body.postId);
    const postId = mongoose.Types.ObjectId(request.body.postId)
    async function getUser() {
        try {
            const user = await userModel.find({ _id: request.user })
            if (!user) {
                response.status(404).json({ message: 'user not found' })
            } else {
                const comment = await new commentModel({
                    content: request.body.userCommentInput,
                    userId: user[0]._id,
                    postId: request.body.postId,
                    date: request.body.isoDate
                })
                const comments = await postModel.findOneAndUpdate({ _id: postId }, { $push: { Comment: { 'id': mongoose.Types.ObjectId(request.user) } } })
                if (!comments) {
                    console.log(request.body);
                    response.status(500).json({ message: 'server error' })
                } else {
                    await comment.save()
                    const postTb = await postModel.find({ _id: postId }).populate({ path: 'uniqueId', model: 'insta_table', select: 'profilepix username' })
                    if (!postTb) {
                        response.status(404).json({ message: 'error' })
                    } else {
                        const allComment = await commentModel.find({ postId: postId }).populate({ path: 'userId', model: 'insta_table', select: 'username profilepix' })
                        const currentPost = postTb[0];
                        const commentTB = allComment.sort((a, b) => {
                            return b.createdAt - a.createdAt
                        })
                        response.send({ status:true, message: 'fulfilled', commentTB, currentPost })
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    getUser()

}

const viewComment = async (request, response) => {
    const postId = mongoose.Types.ObjectId(request.body.postId)

    try {
        const postTb = await postModel.find({ _id: postId }).populate({ path: 'uniqueId', model: 'insta_table', select: 'profilepix username' })
        if (!postTb) {
            response.status(404).json({ message: 'error' })
        } else {
            const allComment = await commentModel.find({ postId: postId }).populate({ path: 'userId', model: 'insta_table', select: 'username profilepix' })
            const currentPost = postTb[0];
            const commentTB = allComment.sort((a, b) => {
                return b.createdAt - a.createdAt
            })
            response.status(200).json({ message: 'fulfilled', commentTB, currentPost })
        }
    } catch (error) {
        console.log(error);
    }
}


const like = async(request,response) => { 
    const postId = mongoose.Types.ObjectId(request.body.postId)
    let commentId = request.body.commentId
    let userId = request.body.id
    console.log(postId);
    try {
        const updateLikes = await commentModel.findOneAndUpdate({ _id: commentId }, { $push: { likes: userId } })
        if (!updateLikes) {
            response.send({ message: 'error occured', status: 500 })
        } else {
            const postTb = await postModel.find({ _id: postId }).populate({ path: 'uniqueId', model: 'insta_table', select: 'profilepix username' })
                    if (!postTb) {
                        response.status(404).json({ message: 'error' })
                    } else {
                        const allComment = await commentModel.find({ postId: postId }).populate([{path: 'userId', model: 'insta_table', select: 'username profilepix'},{path:'commentReply.replyee',model : 'insta_table', select : 'username _id profilepix'},{path:'commentReply.replier',model : 'insta_table', select : 'username _id profilepix'}])
                        const currentPost = postTb[0];
                        const commentTB = allComment.sort((a, b) => {
                            return b.createdAt - a.createdAt
                        })
                        response.send({ status:true, message: 'like succesfully', commentTB, currentPost })
                    }
        }

    } catch (error) {
        console.log(error);
    }
}

const miniLike = async(request,response) => { 
    const postId = mongoose.Types.ObjectId(request.body.postId)
    let replyId = request.body.commentId
    let userId = request.body.id
    console.log(request.body);
    try {
        const updateLikes = await commentModel.findOneAndUpdate({ 'commentReply._id': replyId }, { $push: { 'commentReply.$[i].likes': userId } },{arrayFilters:[{'i._id':replyId}]})
        if (!updateLikes) {
            response.send({ message: 'error occured', status: 500 })
        } else {
            const postTb = await postModel.find({ _id: postId }).populate({ path: 'uniqueId', model: 'insta_table', select: 'profilepix username' })
                    if (!postTb) {
                        response.status(404).json({ message: 'error' })
                    } else {
                        const allComment = await commentModel.find({ postId: postId }).populate([{path: 'userId', model: 'insta_table', select: 'username profilepix'},{path:'commentReply.replyee',model : 'insta_table', select : 'username _id profilepix'},{path:'commentReply.replier',model : 'insta_table', select : 'username _id profilepix'}])
                        const currentPost = postTb[0];
                        const commentTB = allComment.sort((a, b) => {
                            return b.createdAt - a.createdAt
                        })
                        response.send({ status:true, message: 'like succesfully', commentTB, currentPost })
                    }
        }

    } catch (error) {
        console.log(error);
    }
}

const unLike = async(request,response) => {
    const postId = mongoose.Types.ObjectId(request.body.postId)
    let commentId = request.body.commentId
    let userId = request.body.id
    console.log(postId);
    try {
        const updateLikes = await commentModel.findOneAndUpdate({ _id: commentId }, { $pull: { likes: userId } })
        if (!updateLikes) {
            response.send({ message: 'error occured', status: 500 })
        } else {
            const postTb = await postModel.find({ _id: postId }).populate({ path: 'uniqueId', model: 'insta_table', select: 'profilepix username' })
                    if (!postTb) {
                        response.status(404).json({ message: 'error' })
                    } else {
                        const allComment = await commentModel.find({ postId: postId }).populate([{path: 'userId', model: 'insta_table', select: 'username profilepix'},{path:'commentReply.replyee',model : 'insta_table', select : 'username _id profilepix'},{path:'commentReply.replier',model : 'insta_table', select : 'username _id profilepix'}])
                        const currentPost = postTb[0];
                        const commentTB = allComment.sort((a, b) => {
                            return b.createdAt - a.createdAt
                        })
                        response.send({ status:true, message: 'unlike successfully', commentTB, currentPost })
                    }
        }

    } catch (error) {
        console.log(error);
    }
}

const miniUnlike = async(request,response) => {
    const postId = mongoose.Types.ObjectId(request.body.postId)
    let replyId = request.body.commentId
    let userId = request.body.id
    console.log(request.body);
    try {
        const updateLikes = await commentModel.findOneAndUpdate({ 'commentReply._id': replyId }, { $pull: { 'commentReply.$[i].likes': userId } },{arrayFilters:[{'i._id':replyId}]})
        if (!updateLikes) {
            response.send({ message: 'error occured', status: 500 })
        } else {
            const postTb = await postModel.find({ _id: postId }).populate({ path: 'uniqueId', model: 'insta_table', select: 'profilepix username' })
                    if (!postTb) {
                        response.status(404).json({ message: 'error' })
                    } else {
                        const allComment = await commentModel.find({ postId: postId }).populate([{path: 'userId', model: 'insta_table', select: 'username profilepix'},{path:'commentReply.replyee',model : 'insta_table', select : 'username _id profilepix'},{path:'commentReply.replier',model : 'insta_table', select : 'username _id profilepix'}])
                        const currentPost = postTb[0];
                        const commentTB = allComment.sort((a, b) => {
                            return b.createdAt - a.createdAt
                        })
                        response.send({ status:true, message: 'unlike succesfully', commentTB, currentPost })
                    }
        }

    } catch (error) {
        console.log(error);
    }
}

const replyComment = async(request,response) => {
    console.log(request.body);
    const date = request.body.time
    const content = request.body.content
    const replyeeId = request.body.replyeeId
    const replierId = request.body.replierId
    const userCommentId = request.body.userCommentId

    const replyPost = await commentModel.findOneAndUpdate({_id:userCommentId},{$push :{'commentReply':{$each :[{'date':date,'content':content,'replyee': replyeeId,'replier':replierId}],$position:0}}}).populate([{path:'commentReply.replyee',model : 'insta_table', select : 'username _id profilepix'},{path:'commentReply.replier',model : 'insta_table', select : 'username _id profilepix'}])
    response.send({replyPost})
}

const commentReply = async(request,response) => {
    console.log(request.body.commentId);
    try {
        const currentComment= await commentModel.find({postId : request.body.commentId}).populate([{path: 'userId', model: 'insta_table', select: 'username profilepix'},{path:'commentReply.replyee',model : 'insta_table', select : 'username _id profilepix'},{path:'commentReply.replier',model : 'insta_table', select : 'username _id profilepix'}])
        if (!currentComment) {
            
        }else{
            const commentTB = currentComment.sort((a, b) => {
                return b.createdAt - a.createdAt
            })
            response.send({status : true, commentTB })
        }
        
        // const postTb = await postModel.find({ _id: request.body.commentId }).populate({ path: 'uniqueId', model: 'insta_table', select: 'profilepix username' })
        // const currentPost = postTb[0];
       
    } catch (error) {
        console.log(error.message);
    }
}
module.exports = { postComment, viewComment, like, unLike,replyComment,commentReply,miniLike,miniUnlike }