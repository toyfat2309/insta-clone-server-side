const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config()
const cors = require('cors')
const app = express();
const URI = process.env.URL
mongoose.connect(URI,(err)=>{
    if (err) {
        console.log(err);
        console.log('unable to connect');
    }
    else{
        console.log('connected succesfully');
    }
})

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended:true,limit:"50mb"}))
app.use(bodyParser.json({limit:"50mb"}))
app.use(cors())
const PORT = process.env.PORT
const userRouter = require('./routes/user.route')
const postRouter = require('./routes/post.route')
app.use('/users',userRouter)
app.use('/posts',postRouter)

app.listen(PORT,()=>{
    console.log(`listenting at port ${PORT}`);
})