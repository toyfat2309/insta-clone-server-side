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


  const createPost =  (request,response) => {
    const file =request.body.postImage 
    cloudinary.v2.uploader.upload(file,(err,result)=>{
        if(err){
            console.log(err)
            response.send({message:'upload failed'})
        }else{
            async function userPost () {
                const post = await new postModel({
                    username : request.body.userName,
                    uniqueId :request.body.id,
                    profilepix: request.body.profilePix,
                    picture: result.secure_url,
                    caption: request.body.postCaption,
                    date: request.body.isoDate,
                    objectFit: request.body.objectFit,
                    Comment: [],
                    likes: [],
                    dislike: []
                })
                await post.save()
                response.send({status :true, message:'upload successful',userDetails:result})
            }
            userPost ()
        //     postModel.updateMany({_id:user},{$push:{post:{'caption':caption,'picture':pix,'date':isoDate}}},function(err,result){
        //         if (err) {
        //             console.log(err);
        //             response.send({message:'could not push'})
        //         }
        //         else{
        //             console.log(result);
        //             response.send({message:'upload successful',userDetails:result})
        //         }
        //     })
         }
    });
  }

  const like = async (request,response) => {
    let postId = request.body.postId
    let userId = request.body.id
    try {
        const findLike = await postModel.find({'likes.like':userId})
        if (findLike.length >= 1) {
            const postTb = await postModel.find({_id:postId}).populate({path:'uniqueId',model:'insta_table',select:'profilepix username'})
            if (!postTb) {
                response.send({ message: 'an error occured' })
            }else{
                const currentPost = postTb[0];
                response.send({ message: 'liked succesfully',status:true,currentPost })
            }
        }else{
            const updateLikes = await postModel.findOneAndUpdate({ _id : postId }, { $push: { likes: { 'like':mongoose.Types.ObjectId(userId) } } })
            if (!updateLikes) {
                response.send({ message: 'error occured', status: 500 })
            } else {
                const postTb = await postModel.find({_id:postId}).populate({path:'uniqueId',model:'insta_table',select:'profilepix username'})
                if (!postTb) {
                    response.send({ message: 'an error occured' })
                }else{
                    const currentPost = postTb[0];
                    response.send({ message: 'liked succesfully',status:true,currentPost })
                }
            }
        }

    } catch (error) {
        console.log(error);
    }
  }
 
  const unLike = async (request, response) => {

    let postId = request.body.postId
    let userId = request.body.id
    try {
        const updateLikes = await postModel.findOneAndUpdate({ _id: postId }, { $pull: { likes: { 'like':mongoose.Types.ObjectId(userId) } } })
        if (!updateLikes) {
            response.send({ message: 'error occured', status: 500 })
        } else {
            const postTb = await postModel.find({_id:postId}).populate({path:'uniqueId',model:'insta_table',select:'profilepix username'})
            if (!postTb) {
                response.send({ message: 'an error occured' })
            }else{
                const currentPost = postTb[0];
                response.send({ message: 'liked succesfully',status:true,currentPost })
            }
        }

    } catch (error) {
        console.log(error);
    }
}


const comment = async (request,response) => {
    const userComment = request.body.userCommentInput
    const userId = request.body.id
    const postId = request.body.postId
    
    try {
        const user = await postModel.findOneAndUpdate({_id:postId},{$push : {"post.$.Comment":{$each:[{userId,userComment}],$position:0} }})
        if (!user) {
            response.status(500).send({message : 'an error occur'})
            console.log(user);
        }else{
            response.send({message : 'comment post successfully',status:true})
            console.log(user);
        }
        
    } catch (error) {
        console.log(error);
    }
}

const explore = (request,response) => {
    const token = request.headers.authorization.split(' ')[1]
    jwt.verify(token,SECRET,async(err,result)=>{
        if (err) {
            console.log(err);
            response.status(404).send({message : 'unauthorized'})
        }else{
            const userDDetails = await userModel.findOne({_id:result.user})
            if (!userDDetails) {
                response.status(501).send({ status: false, message: 'unauthorize' })
            }else{
                const allPost = await postModel.find({})
                const {password,fullname,id, ...others} = userDDetails._doc
                response.send({message : 'comment post successfully',status:true,allPost,others})
            }
            
        }
    })
}

const deletePost = async(request, response) => {

    try {
        const deletePostFromPostTb = await postModel.deleteOne({_id:request.body.postToDeleteId})
        if (!deletePostFromPostTb) {
            response.status(501).json({message : 'internal server error'})
        }else{
            const deletePostFromCommentTb = await commentModel.deleteMany({postId:request.body.postToDeleteId})
            if (!deletePostFromCommentTb) {
                console.log('no comment found');
                response.status(200).json({message : 'no comment for this post'})
            }else{
                response.status(200).send({message : 'deleted successfully'})
            }
        }
    } catch (error) {
        
    }
    
}

const savePost = async(request,response) => {
    
    const user = await userModel.findOneAndUpdate({_id:request.body.id},{ $push :{'savedPost':request.body.postId}})
    if (!user) {
        response.status(501).json({message : 'internal server error'})
    }else{
        const postTb = await postModel.findOneAndUpdate({_id : request.body.postId},{ $push : {'savedPost' : request.body.id}})
        if (!postTb) {
            
        }else{
            response.status(200).json({message : 'post save successfully'})
        }
    }
}

const reomoveSavedPost = async(request,response) => {
    
    const user = await userModel.findOneAndUpdate({_id:request.body.id},{ $pull :{'savedPost':request.body.postId}})
    if (!user) {
        response.status(501).json({message : 'internal server error'})
    }else{
        const postTb = await postModel.findOneAndUpdate({_id : request.body.postId},{ $pull : {'savedPost' : request.body.id}})
        if (!postTb) {
            
        }else{
            response.status(200).json({message : 'post save successfully'})
        }
    }
}

  module.exports = {createPost, like, unLike, comment,explore, deletePost , savePost, reomoveSavedPost}