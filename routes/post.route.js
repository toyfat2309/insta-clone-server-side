const express = require('express');
const router = express.Router()
const { createPost, like, unLike, comment, explore, deletePost, savePost, reomoveSavedPost} = require('../controllers/post.controller')
const { protect } = require('../authMiddleware/auth')

router.route('/post').post(protect,createPost)
router.route('/like/:postId').patch(protect,like)
router.route('/unlike/:postId').patch(protect,unLike)
router.route('/comment').post(protect,comment)
router.route('/explore').get(protect,explore)
router.route('/deletepost').post(protect,deletePost)
router.route('/savepost/:postId').patch(protect,savePost)
router.route('/removesavedpost/:postId').patch(protect,reomoveSavedPost)

module.exports = router