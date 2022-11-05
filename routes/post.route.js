const express = require('express');
const router1 = express.Router()
const postController = require('../controllers/post.controller')

router1.post('/post',postController.createPost)

module.exports = router1