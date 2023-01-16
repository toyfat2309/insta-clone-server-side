const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')
const asyncHandler = require('express-async-handler')
const SECRET = process.env.JWT_SECRET

const protect = asyncHandler(async(request,response,next)=>{
    
    const token = request.headers.authorization.split(' ')[1]
    
    jwt.verify(token,SECRET,(err,result)=>{
        if (err) {
            response.status(401).json({status : false,message :'authorized'})
        }else{
            request.user = result.user
            next()
        }
    })
})

module.exports = {protect}