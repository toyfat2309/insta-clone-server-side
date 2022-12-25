const userModel = require('../models/user.model');
const postModel = require('../models/post.model')
const cloudinary = require('cloudinary')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const SECRET = process.env.JWT_SECRET
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

const SignUp = async (request, response) => {
    const newUser = request.body;
    const form = new userModel(newUser)
    try {
        const existingEmail = await userModel.findOne({ id: request.body.id })
        if (existingEmail) {
            response.send({ message: 'email already exists', status: false });
        } else {
            const existingUserName = await userModel.findOne({ username: request.body.username })
            if (existingUserName) {
                response.send({ message: 'Username already exists', status: false });
            } else {
                form.save()
                response.send({ message: 'Registration Successful', status: true })
            }
        }

    } catch (err) {
        console.log(err); 
    }

}


const logIn = async (request, response) => {
    const userId = request.body.id;
    const password = request.body.password

    try {
        const user = await userModel.findOne({ id: userId })
        if (!user) {
            response.send({ status: false, message: 'User not found' })
        } else {
            const verifyPassWord = await bcrypt.compare(password, user.password)
            // !verifyPassWord && response.status(401).json({message: 'invalid password', status: false})
            if (!verifyPassWord) {
                response.send({ message: 'invalid password', status: false })
            } else {
                const activeUser = await userModel.findOne({ id: userId })
                const user = activeUser._id
                const token = jwt.sign({ user }, SECRET, { expiresIn: 3600 })
                console.log(token);
                response.send({ status: true, token })
            }

        }

    } catch (error) {
        console.log(error);
    }
}

const dashboard =  (request, response) => {
    const token = request.headers.authorization.split(' ')[1]
    jwt.verify(token, SECRET, (err, result) => {
        if (err) {
            console.log(err)
            response.send({ status: false, message: 'unauthorized' })
        } else {
                
                try {
                    async function tee () {

                        const currentUser= await userModel.findOne({ _id: result.user })
                        if (!currentUser) {
                            response.status(501).send({ status: false, message: 'unauthorize' })
                        }else{ 
                            const {password,id,fullname ,...userDetails} = currentUser._doc
                            const userPost = await postModel.find({uniqueId:currentUser._id}).populate({path:'uniqueId',model:'insta_table',select:'profilepix username'})

                            if (userPost.length === 0 && currentUser.following.length === 0){
                                const allUserFilter = []
                                const allPost =[]
                               response.send({ status: true, message: 'no post yet',userDetails,allUserFilter,allPost })
                             }else if (!userPost.length === 0 && currentUser.following.length === 0) {
                                const allUserFilter = []
                                const allPost = userPost
                               response.send({ status: true, message: 'no post yet',userDetails,allUserFilter,allPost })
                             }
                             else{
                                    const ppp = await Promise.all(
                                    currentUser.following.map((friendId)=>{
                                        return postModel.find({uniqueId:friendId.id}).populate({path:'uniqueId',model:'insta_table',select:'profilepix username'}) 
                                    })
                                )
                                    const buaisi = await currentUser.following.map(function(i){
                                        return i.id
                                    })
                                    const allUserFilter = await userModel.find({_id:{$nin : buaisi}}).select('username profilepix')
                                    const allPost = await userPost.concat(...ppp).sort((a,b)=>{
                                        return b.createdAt - a.createdAt
                                     })
                                     
                                    response.send({ status: true, message: 'still valid',userDetails,allPost,allUserFilter})
                                }
                                 
                             
                        } 
                            
                    }
                         
                    tee()
                    
                } catch (error) {
                    console.log(error);
                }

                // userModel.findOne({ _id: result.user }, (err, userDetails) => {
                //     if (err) {
                //         response.status(501).send({ status: false, message: 'internal server error' })
                //     } else {
                //         response.send({ status: true, message: 'still valid',userDetails })
                //     }
                // })

        }
        //         async function tee () {
        //         try {
                    
        //             const userPost = await  userModel.findOne({ _id: result.user })
        //             if (!userPost) {
        //                 response.status(501).send({ status: false, message: 'unauthorize' })
        //             }else{
        //                 const {fullname,password,id, ...activeUserPost} = userPost._doc
        //                 postDetails.push(activeUserPost)
        //                 const postDetails = await Promise.all(
        //                      userPost.followers.map((friendId)=>{
        //                    return userModel.findOne({_id:friendId.id})
        //                     ,(err,result)=>{
        //                             if (err) {
        //                                 response.send({ message : 'cant find post'})
        //                             }else{
        //                                 const a = result
        //                                 const {fullname,password, ...postDetails} = a._doc
        //                                 response.send({ status: true, message: 'still valid',postDetails})
                                        
        //                             }
        //                         })
                            
        //                     })
    
        //                  )
        //                  response.send({ status: true, message: 'still valid',postDetails}) 
        //                  console.log(postDetails);  
        //             }                  
        //         } catch (error) {
        //             console.log(error);
        //         }
        //         }
                
        //         tee()
        // }
    })

}


const editProfile = async (request, response) => {
    const token = request.headers.authorization.split(' ')[1]
    jwt.verify(token,SECRET,(err,result)=>{
        if (err) {
            response.status(500).send({ status: false, message: 'not authoriozed' })
        }else{
            async function edit(){
                const userDetails = await userModel.findOne({ _id: result.user })
                if (!userDetails) {
                    response.status(404).send({ status: false, message: 'user not found' })
                }else{
                    response.send({ status: true, message: 'still valid', userDetails })
                }
            }
            edit()
        }
    })
}


const upload = (request, response) => {
    const file = request.body.myFile
    cloudinary.v2.uploader.upload(file, (err, result) => {
        if (err) {
            console.log(err)
            response.send({ message: 'upload failed' })
        } else {
            console.log(result.secure_url)
            response.send({ message: 'upload successful', image: result.secure_url })
        }
    });
}

const createPost = async (request, response) => {
    const file = request.body.postImage // image to save to cloudinary
    const user = request.body.id // id in mongoDB
    const caption = request.body.postCaption // caption
    const isoDate = request.body.isoDate // date

    try {
        const image = await cloudinary.v2.uploader.upload(file)
        if (!image) {
            response.send({ message: 'upload failed' })
        } else {
            const pix = image.secure_url
            const result = await postModel.updateMany({ _id: user }, { $push: { post: { $each:[{'caption': caption, 'picture': pix, 'date': isoDate}],$position:0 } } })
            if (!result) {
                response.send({ message: 'could not push' })
            }
            else {
                response.send({ message: 'upload successful', userDetails: result })
                console.log(result);
            }
        }

    } catch (error) {
        console.log(error);
    }

    // userModel.updateMany({ _id: user }, { $unshift: { post: { 'caption': cap, 'picture': pix, 'date': usernamee, 'profilepix': profilephoto } } }, function (err, result) {
    //     if (err) {
    //         console.log(err);
    //         response.send({ message: 'could not push' })
    //     }
    //     else {
    //         console.log(result);
    //         response.send({ message: 'pushed successfully', userDetails: result })
    //     }
    // })
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

const profilePix = (request, response) => {
    //const userId = request.body.userName
    const pix = request.body.profilePhoto
    const user = request.body.currentUser
    cloudinary.v2.uploader.upload(pix, { folder: 'profilepix', public_id: `/${user}` }, (err, result) => {
        if (err) {
            console.log(err)
            response.send({ message: 'upload failed' })
        } else {
            console.log(result);
            userModel.updateMany({ username: user }, { $set: { 'profilepix': result.secure_url } }, function (err, res) {
                if (err) {
                    console.log(err);
                    response.send({ message: 'there is an err' })
                } else {
                    postModel.updateMany({ username: user }, { $set: { 'profilepix': result.secure_url } }, function (err, res) {
                        if (err) {
                            console.log(err);
                            response.send({ message: 'there is an err' })
                        } else {
                            response.send({ message: 'saved sucessfully', image: result.secure_url })
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

const userProfile = async (request, response) => {
    const user = request.params.id
    const token = request.headers.authorization.split(' ')[1]
    
    try {
        jwt.verify(token,SECRET,(err,result)=>{
            if (err) {
                console.log(err)
                response.send({ status: false, message: 'unauthorized' })
            }else{
                async function currentUserProfile () {
                    const currentUserDetails =  await userModel.findOne({ _id: result.user }).select('-password')
                    if (currentUserDetails.username == user) {
                        const userPictures = await userModel.aggregate([
                            {$match : {_id:currentUserDetails._id}},
                            {
                                $lookup : {
                                    from :'post_tbs',
                                    localField :'_id',
                                    foreignField :'uniqueId',
                                    as : 'userPictures'
                                }
                            },
                            {
                                $project : {
                                    userPictures : 1,
                                    _id : 0
                                }
                            }
                        ])
                        const profilePost = userPictures[0].userPictures
                         response.send({ status: true, message: 'active user', currentUserDetails,profilePost })
                    }else{

                        const userDetails = await userModel.findOne({ username: user }).select('-password')
                        if (!userDetails) {
                            response.status(404).send({ status: false, message: 'user not found' })
                        } else {
                            const userPictures = await userModel.aggregate([
                                {$match : {_id:userDetails._id}},
                                {
                                    $lookup : {
                                        from :'post_tbs',
                                        localField :'_id',
                                        foreignField :'uniqueId',
                                        as : 'userPictures'
                                    }
                                },
                                {
                                    $project : {
                                        userPictures : 1,
                                        _id : 0
                                    }
                                }
                            ])
                            const profilePost = userPictures[0].userPictures
                             response.send({ status: true, message: 'not active user', userDetails,currentUserDetails,profilePost })
                        }
                
                    }
                }
                currentUserProfile()
            }
        })
    } catch (error) {
        console.log(error);
    }
    // try {

    //     const userDetails = await userModel.findOne({ username: user })
    //     if (!userDetails) {
    //         response.status(404).send({ status: false, message: 'user not found' })
    //     } else {
    //         const userPictures = await userModel.aggregate([
    //             {$match : {_id:userDetails._id}},
    //             {
    //                 $lookup : {
    //                     from :'post_tbs',
    //                     localField :'_id',
    //                     foreignField :'uniqueId',
    //                     as : 'userPictures'
    //                 }
    //             },
    //             {
    //                 $project : {
    //                     userPictures : 1,
    //                     _id : 0
    //                 }
    //             }
    //         ])
    //         const profilePost = userPictures[0].userPictures
    //          response.send({ status: true, message: 'still valid', userDetails,profilePost })
    //     }

        
    // } catch (error) {
    //     console.log(error);
    // }
}


const fetchDetails = (request, response) => {
    const user = request.params.id
    console.log(request.body);
    userModel.findOne({ username: user }, (err, userDetails) => {
        if (err) {
            response.status(501).send({ status: false, message: 'internal server error' })

        } else {
            response.send({ status: true, message: 'still valid', userDetails })
            console.log(userDetails);
        }
    })
}


// const updateUserDetails = async(request,response) =>{
//     const userId = request.body._id
//     const oldUserName = request.body.oldUserName
//     const name = request.body.name
//     const username = request.body.userName
//     const email = request.body.email
//     const bio = request.body.bio

//         userModel.findOne({username:username},(err,result)=>{
//         if (err) {
//             response.send({message:'Server Error, Please try again later',status:false})
//         }
//         else{
//             if (result) {
//                 response.send({message:'username exists, please choose a different userName',status:false})
//             }else{
//                  userModel.updateOne({_id:userId},{$set:{'fullname':name,'username':username,'id':email,'bio':bio}},function(err,updatedDetails){
//                     if (err) {
//                         console.log(userId);
//                         response.send({message:'Server Error2, Please try again later',status:false})

//                     }else{
//                          postModel.updateOne({username:oldUserName},{$set:{'username':username}},(err,allDetails)=>{
//                             if (err) {
//                                 response.send({message:'Server Error3, Please try again later',status:false})
//                                 console.log(err);
//                             }else{
//                                 response.send({message:'all details updated',status:true,updatedDetails})
//                             }
//                         })
//                     }

//                 })
//             }
//         }
//     })
// }
const updateUserDetails = async (request, response) => {
    const userId = request.body.id
    const oldUserName = request.body.oldUserName
    const name = request.body.name
    const username = request.body.userName.toLowerCase()
    const email = request.body.email
    const bio = request.body.bio
    try {
        // to check if abnyone has the username already
        const editor = await userModel.findOne({ _id: userId })
        if (!editor) {
            response.send({ message: 'user not found', status: 400 })
        } else {
            if ((username && email) != '') {
                if (editor.username === username && editor.id === email ) {
                    const updateDetails = await userModel.findOneAndUpdate({ _id: userId }, { $set: { 'fullname': name, 'username': username, 'id': email, 'bio': bio } })
                     if (!updateDetails) {
                           response.send({ message: 'couldnt dave1', status: 400 })
                     } else {
                           response.send({ message: 'save successfuly1', status: 200,updateDetails })
                     }
               }else if (editor.username === username && editor.id != email) {
                   const checkEmail = await userModel.find({ id: email })
                   if (checkEmail.length >=1) {
                       response.send({ message: 'couldnt save2, email exists', status: 400 })
                   }else{
                       const updateDetails = await userModel.findOneAndUpdate({ _id: userId }, { $set: { 'fullname': name, 'username': username, 'id': email, 'bio': bio } })
                       response.send({ message: 'save successfuly2', status: 200,updateDetails })
                   }
               } else if (editor.username != username && editor.id === email) {
                   const checkEmail = await userModel.find({ username: username })
                   if (checkEmail.length >= 1) {
                       response.send({ message: 'couldnt save3, username exists', status: 400 })
                   }else{
                       const updateDetails = await userModel.findOneAndUpdate({ _id: userId }, { $set: { 'fullname': name, 'username': username, 'id': email, 'bio': bio } })
                       response.send({ message: 'save successfuly3', status: 200,updateDetails })
                   }
               }
            } else {
                response.send({ message: 'username or email cannot be empty', status: 504 })
            }
            

        }
    } catch (err) {
        console.log(err);
    }
}


const follow = async (request, response) => {
    const isFollow = request.body.isUser
    const follower = request.body.userToFollowId
    console.log(request.body);
    try {
        const personOne = await userModel.findOneAndUpdate({_id: isFollow},{$push: { following: { id:mongoose.Types.ObjectId(follower) } }})
         if (!personOne) {
            response.send({ message: 'error occured', status: 500 })
         }else{
            const personTwo = await userModel.findOneAndUpdate({ _id: follower }, { $push: { followers: { id:mongoose.Types.ObjectId(isFollow) } } })
            if (!personTwo) {
                response.send({ message: 'error occured 1', status: 500 })
            } else {
                const currentUserDetails =  await userModel.findOne({ _id: isFollow }).select('-password')
                if (!currentUserDetails) {
                    response.send({ message: 'error occured', status: 500 })
                }else{
                    const userDetails = await userModel.findOne({ _id: follower }).select('-password')
                    if (!userDetails){
                        response.send({ message: 'error occured', status: 500 })
                    }else{
                        response.send({ message: 'followed succesfully',userDetails,currentUserDetails })
                    }
                    
                }
            }
         }
       
    } catch (error) {
        console.log(error);
    }

}


const unFollow = async (request, response) => {
    const isFollow = request.body.isUser
    const follower = request.body.userToFollowId
    console.log(request.body);
    try {
        const personOne = await userModel.findOneAndUpdate({_id:follower},{$pull : {followers : { id:mongoose.Types.ObjectId(isFollow)}}})
        if (!personOne) {
            response.send({ message: 'error occured', status: 500 })
        }else{
            const personTwo = await userModel.findOneAndUpdate({_id:isFollow},{$pull : {following : { id:mongoose.Types.ObjectId(follower)}}})
            if (!personTwo) {
                response.send({ message: 'error occured 1', status: 500 })
            } else {
                const currentUserDetails =  await userModel.findOne({ _id: isFollow }).select('-password')
                if (!currentUserDetails) {
                    response.send({ message: 'error occured', status: 500 })
                }else{
                    const userDetails = await userModel.findOne({ _id: follower }).select('-password')
                    if (!userDetails){
                        response.send({ message: 'error occured', status: 500 })
                    }else{
                        response.send({ message: 'followed succesfully',userDetails,currentUserDetails })
                    }
                    
                }
            }
        }
        
    } catch (error) {
        console.log(error);
    }

}


module.exports = { SignUp, logIn, upload, dashboard, createPost, profilePix, userProfile, fetchDetails, updateUserDetails, editProfile, follow, unFollow, }