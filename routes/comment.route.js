const express = require('express');
const router2 = express.Router()
const {postComment,viewComment,like,unLike,replyComment,commentReply,miniLike,miniUnlike} = require('../controllers/comment.controller');
const {protect} = require('../authMiddleware/auth')

router2.route('/comment').post(protect,postComment)
router2.route('/viewcomment').post(protect,viewComment)
router2.route('/like').post(protect,like)
router2.route('/unlike').post(protect,unLike)
router2.route('/replycomment').post(protect,replyComment)
router2.route('/commentreply').post(protect,commentReply)
router2.route('/minilike').post(protect,miniLike)
router2.route('/minilike').post(protect,miniLike)
router2.route('/miniunlike').post(protect,miniUnlike)

// router2.post('/comment',commentController.postComment)
// router2.post('/viewcomment',commentController.viewComment)
// router2.post('/like',commentController.like)
// router2.post('/unlike',commentController.unLike)
// router2.post('/replycomment',commentController.replyComment)
// router2.post('/commentreply',commentController.commentReply)
// router2.post('/minilike',commentController.miniLike)

module.exports = router2