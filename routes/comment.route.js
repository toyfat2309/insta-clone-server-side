const express = require('express');
const router = express.Router()
const { postComment, viewComment, like, unLike, replyComment, commentReply, miniLike, miniUnlike } = require('../controllers/comment.controller');
const { protect } = require('../authMiddleware/auth')

router.route('/comment').post(protect,postComment)
router.route('/viewcomment/:postId').get(protect,viewComment)
router.route('/like').post(protect,like)
router.route('/unlike').post(protect,unLike)
router.route('/replycomment').post(protect,replyComment)
router.route('/commentreply').post(protect,commentReply)
router.route('/minilike').post(protect,miniLike)
router.route('/minilike').post(protect,miniLike)
router.route('/miniunlike').post(protect,miniUnlike)



module.exports = router