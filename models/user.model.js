const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    id:{
        type : String,
        lowercase : true
    },
    fullname:String,
    username:String,
    password:String,
    profilepix:String,
    bio:String,
    followers:[],
    following:[],
    savedPost : [{
        type:mongoose.Types.ObjectId,
        ref : 'insta_table'
    }]
},{timestamps: true})

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



userModel = mongoose.model('insta_table',userSchema)
module.exports = userModel