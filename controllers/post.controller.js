const postModel = require('../models/post.model')
const cloudinary = require('cloudinary')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { request } = require('express')
const commentModel = require('../models/comment.model')
const SECRET = process.env.JWT_SECRET
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});


const createPost = (request, response) => {
    const file = request.body.postImage
    cloudinary.v2.uploader.upload(file, (err, result) => {
        if (err) {
            console.log(err)
            response.send({ message: 'upload failed' })
        } else {
            async function userPost() {
                const post = await new postModel({
                    //username : request.body.userName,
                    uniqueId: request.body.uniqueId,
                    //profilepix: request.body.profilePix,
                    postImage: result.secure_url,
                    caption: request.body.caption,
                    date: request.body.isoDate,
                    objectFit: request.body.objectFit,
                    // Comment: [],
                    // likes: [],
                    // dislike: []
                })
                await post.save()
                response.status(200).send({ status: true, message: 'upload successful' })
            }
            userPost()
         
        }
    });
}

const like = async (request, response) => {

    let postId = request.params.postId
    let userId = request.body.userId
    try {
        findPost = await postModel.find({ _id: postId })
        if (!findPost) {
            response.status(500).send({ message: 'error occured' })
        } else {
            
            if (findPost[0].likes.includes(userId)) {
                response.status(200).send({ message: "can't like this post twice" })
            } else {
                updateLikes = await postModel.findOneAndUpdate({ _id: postId }, { $push: { likes: userId } })
                if (!updateLikes) {
                    response.status(500).send({ message: "error occured" })
                }else {
                    response.status(200).send({ message: "liked successfully" })
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
    
}

const unLike = async (request, response) => {

    let postId = request.params.postId
    let userId = request.body.userId
    try {
        findPost = await postModel.find({ _id: postId })
        if (!findPost) {
            response.status(500).send({ message: 'error occured' })
        } else {
            if (findPost[0].likes.includes(userId)) {
                updateLikes = await postModel.findOneAndUpdate({ _id: postId }, { $pull: { likes: userId } })
                if (!updateLikes) {
                    response.status(500).send({ message: "error occured" })
                }else {
                    response.status(200).send({ message: "unliked successfully" })
                }
            } else {
                response.status(200).send({ message: "you havent like this post before" })
            }
        }
    } catch (error) {
        console.log(error);
    }
}


const comment = async (request, response) => {
    const userComment = request.body.userCommentInput
    const userId = request.body.id
    const postId = request.body.postId

    try {
        const user = await postModel.findOneAndUpdate({ _id: postId }, { $push: { "post.$.Comment": { $each: [{ userId, userComment }], $position: 0 } } })
        if (!user) {
            response.status(500).send({ message: 'an error occur' })
            console.log(user);
        } else {
            response.send({ message: 'comment post successfully', status: true })
            console.log(user);
        }

    } catch (error) {
        console.log(error);
    }
}

const explore = (request, response) => {
    const token = request.headers.authorization.split(' ')[1]
    jwt.verify(token, SECRET, async (err, result) => {
        if (err) {
            console.log(err);
            response.status(404).send({ message: 'unauthorized' })
        } else {
            const userDDetails = await userModel.findOne({ _id: result.user })
            if (!userDDetails) {
                response.status(501).send({ status: false, message: 'unauthorize' })
            } else {
                const allPost = await postModel.find({})
                const { password, fullname, id, ...others } = userDDetails._doc
                response.send({ message: 'comment post successfully', status: true, allPost, others })
            }

        }
    })
}

const deletePost = async (request, response) => {

    try {
        const deletePostFromPostTb = await postModel.deleteOne({ _id: request.body.postToDeleteId })
        if (!deletePostFromPostTb) {
            response.status(501).json({ message: 'internal server error' })
        } else {
            const deletePostFromCommentTb = await commentModel.deleteMany({ postId: request.body.postToDeleteId })
            if (!deletePostFromCommentTb) {
                console.log('no comment found');
                response.status(200).json({ message: 'no comment for this post' })
            } else {
                response.status(200).send({ message: 'deleted successfully' })
            }
        }
    } catch (error) {

    }

}

const savePost = async (request, response) => {

    let postId = request.params.postId
    let userId = request.body.userId
    try {
        findPost = await postModel.find({ _id: postId })
        if (!findPost) {
            response.status(500).send({ message: 'error occured' })
        } else {
            if (findPost[0].savedPost.includes(userId)) {
                response.status(200).send({ message: "can't save this post twice" })
            } else {
                updatePost = await postModel.findOneAndUpdate({ _id: postId }, { $push: { savedPost: userId } })
                if (!updatePost) {
                    response.status(500).send({ message: "error occured" })
                }else {
                    updateSavePostInUserModel = await userModel.findOneAndUpdate({ _id: userId },{ $push: { savedPost: postId} })
                    response.status(200).send({ message: "post saved successfully" })
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}

const reomoveSavedPost = async (request, response) => {

    let postId = request.params.postId
    let userId = request.body.userId
    try {
        findPost = await postModel.find({ _id: postId })
        if (!findPost) {
            response.status(500).send({ message: 'error occured' })
        } else {
            if (findPost[0].savedPost.includes(userId)) {
                updatePost = await postModel.findOneAndUpdate({ _id: postId }, { $pull: { savedPost: userId } })
                if (!updatePost) {
                    response.status(500).send({ message: "error occured" })
                }else {
                    response.status(200).send({ message: "post removed successfully" })
                }
            } else {
                response.status(200).send({ message: "you havent save this post before" })
            }
        }
    } catch (error) {
        console.log(error);
    }

}

module.exports = { createPost, like, unLike, comment, explore, deletePost, savePost, reomoveSavedPost }