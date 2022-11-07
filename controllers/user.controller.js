const userModel = require('../models/user.model');
const postModel = require('../models/post.model')
const cloudinary = require('cloudinary')
const jwt = require('jsonwebtoken')
const SECRET = process.env.JWT_SECRET
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET 
  });

const SignUp = (request,response) =>{
    const newUser = request.body;
    const form = new userModel(newUser)
    const post = new postModel(newUser)

    userModel.findOne({id:request.body.id},(err,result)=>{
            if (err) {
                response.send({message:'Server Error, Please try again later',status:false})
            }
            else{
                if (result) {
                    response.send({message:'User already exists',status:false});
                }
                else{
                    userModel.findOne({username:request.body.username},(err,result)=>{
                        if (result) {
                            response.send({message:'Username is taken,please choose another username',status:false});
                        }
                        else{
                            form.save((err)=>{
                                if (err) {
                                    response.send({message:'User sign up failed,please try again later',status:false})
                                }
                                else{
                                    post.save()
                                    response.send({message:'Registration Successful',status:true})
                                }
                            })
                        }
                    })
                }
            }
    
    })

}

const logIn = (request,response) => {
    const userId = request.body.id;
    const password = request.body.password
    userModel.findOne({id:userId},(err,user)=>{
        if (err) {
            response.send({message:'user login failed,please try again',status:false})
            console.log(err);
        }
        else{
            if (!user) {
                response.send({message:'email doesnt exist, please signUp', status:false})
            }
            else{
                user.validatePassword(password,(err,same)=>{
                    if (err) {
                        response.send({message:'network err', status:false})
                    }
                    else{
                        if (same) {
                            const token = jwt.sign({userId},SECRET,{expiresIn:3600})
                            console.log(token);
                            response.send({message:'password correct', status:true,token})
                        }
                        else{
                            response.send({message:'invalid password', status:false})
                        }
                    }
                })
            }
        }
    })
}

 const dashboard = (request,response) =>{
    const token= request.headers.authorization.split(' ')[1]
    jwt.verify(token,SECRET,(err,result)=>{
        if(err){
            console.log(err)
            response.send({status:false,message:'unauthorized'})
        }else{
            postModel.findOne({id:result.userId},(err,userDetails)=>{
                if(err){
                    response.status(501).send({status:false,message:'internal server error'})
                }else{
                    response.send({status:true,message:'still valid',userDetails})
                    console.log(userDetails);
                }
            })
        }
    })
 }

const upload = (request,response) =>{
    const file =request.body.myFile
    cloudinary.v2.uploader.upload(file,(err,result)=>{
        if(err){
            console.log(err)
            response.send({message:'upload failed'})
        }else{
            console.log(result.secure_url)
            response.send({message:'upload successful',image:result.secure_url})
        }
    });
}

const createPost = (request,response) =>{
    const user = request.body.id
    const cap = request.body.post
    const pix = request.body.image
    const usernamee = request.body.username
    const profilephoto= request.body.profilePhoto

    userModel.updateMany({_id:user},{$push:{posts:{'post':cap,'picture':pix,'username':usernamee,'profilepix':profilephoto}}},function(err,result){
        if (err) {
            console.log(err);
            response.send({message:'could not push'})
        }
        else{
            console.log(result);
            response.send({message:'pushed successfully',userDetails:result})
        }
    })
    // postModel.updateOne({username:user},{$push:{"post.$.picture":image,"post.$.caption":cap}},function(err,result){
    //     if (err) {
    //         console.log(err);
    //         response.send({message:'could not push'})
    //     }
    //     else{
    //         console.log(result);
    //         response.send({message:'pushed successfully'})
    //     }
    // })
}

const profilePix = (request,response) => {
    //const userId = request.body.userName
    const pix = request.body.profilePhoto
    const user = request.body.currentUser
    cloudinary.v2.uploader.upload(pix,{folder:'profilepix',public_id:`/${user}`},(err,result)=>{
        if(err){
            console.log(err)
            response.send({message:'upload failed'})
        }else{
            console.log(result);
            userModel.updateMany({username:user},{$set:{'profilepix':result.secure_url}}, function(err,res){
                if (err) {
                    console.log(err);
                    response.send({message:'there is an err'})
                }else{
                    postModel.updateMany({username:user},{$set:{'profilepix':result.secure_url}}, function(err,res){
                        if (err) {
                            console.log(err);
                            response.send({message:'there is an err'})
                        }else{
                            response.send({message:'saved sucessfully', image:result.secure_url})
                            console.log(res);
                        }
                    })
                }
            })
            // console.log(result.secure_url)
            // response.send({message:'upload successful',image:result.secure_url})
        }
    });
}

const userProfile = (request,response) =>{
    const user = request.params.id
    postModel.findOne({username:user},(err,userDetails)=>{
        if(err){
            response.status(501).send({status:false,message:'internal server error'})
            
        }else{
            response.send({status:true,message:'still valid',userDetails})
        }
    })
}
const fetchDetails = (request,response) =>{
    const user = request.params.id
    userModel.findOne({username:user},(err,userDetails)=>{
        if(err){
            response.status(501).send({status:false,message:'internal server error'})
            
        }else{
            response.send({status:true,message:'still valid',userDetails})
        }
    })
}

module.exports = {SignUp,logIn,upload,dashboard,createPost,profilePix,userProfile,fetchDetails}