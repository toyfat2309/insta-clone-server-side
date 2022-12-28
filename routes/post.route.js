const express = require('express');
const router1 = express.Router()
const postController = require('../controllers/post.controller')

router1.post('/post',postController.createPost)
router1.post('/like',postController.like)
router1.post('/unlike',postController.unLike)
router1.post('/comment',postController.comment)
router1.get('/explore',postController.explore)
router1.post('/deletepost',postController.deletePost)
router1.post('/savepost',postController.savePost)
router1.post('/removesavedpost',postController.reomoveSavedPost)

module.exports = router1