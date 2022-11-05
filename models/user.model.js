const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const postSchema = mongoose.Schema({
    post:String,
    picture:String,
    username:String,
    profilepix:String
})
const followerSchema = mongoose.Schema({
    username: String,
})
const followingSchema = mongoose.Schema({
    username: String,
})
const userSchema = mongoose.Schema({
    id:String,
    fullname:String,
    username:String,
    password:String,
    profilepix:String,
    posts:[postSchema],
    followers:[followerSchema],
    following:[followingSchema]
})

let saltRound = 5
userSchema.pre('save',function(next){
    bcrypt.hash(this.password,saltRound,(err,hashedPassword)=>{
        if (err) {
            console.log(err);
        }
        else{
            this.password = hashedPassword
            next()
        }
    })
})

userSchema.methods.validatePassword = function(password,callback){
    bcrypt.compare(password,this.password,(err,same)=>{
        if (!err) {
            callback(err,same)
        }
        else{
            next()
        }
    })
}

userModel = mongoose.model('insta_table',userSchema)
module.exports = userModel