const postModel = require('../models/post.model')
const userModel = require('../models/user.model');
const cloudinary = require('cloudinary')
const jwt = require('jsonwebtoken')
const SECRET = process.env.JWT_SECRET
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET 
  });

  const createPost = (request,response) => {
    const file =request.body.postImage // image to save to cloudinary
    const user = request.body.id // id in mongoDB
    const caption = request.body.postCaption // caption
    const usernamee = request.body.username //username
    const isoDate= request.body.isoDate // profilepix
    cloudinary.v2.uploader.upload(file,(err,result)=>{
        if(err){
            console.log(err)
            response.send({message:'upload failed'})
        }else{
            const pix = result.secure_url
            postModel.updateMany({_id:user},{$push:{post:{'caption':caption,'picture':pix,'date':isoDate}}},function(err,result){
                if (err) {
                    console.log(err);
                    response.send({message:'could not push'})
                }
                else{
                    console.log(result);
                    response.send({message:'pushed successfully',userDetails:result})
                }
            })
        }
    });
  }

  module.exports = {createPost}