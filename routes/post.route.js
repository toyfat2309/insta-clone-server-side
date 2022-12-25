const express = require('express');
const router1 = express.Router()
const postController = require('../controllers/post.controller')

router1.post('/post',postController.createPost)
router1.post('/like',postController.like)
router1.post('/unlike',postController.unLike)
router1.post('/comment',postController.comment)
router1.get('/explore',postController.explore)

module.exports = router1