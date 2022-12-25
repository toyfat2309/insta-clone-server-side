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

// userSchema.methods.validatePassword = function(password,callback){
//     bcrypt.compare(password,this.password,(err,same)=>{
//         if (!err) {
//             callback(err,same)
//         }
//         else{
//             next()
//         }
//     })
// }

userModel = mongoose.model('insta_table',userSchema)
module.exports = userModel