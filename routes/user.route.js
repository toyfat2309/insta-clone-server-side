const express = require('express');
const router = express.Router()
const { SignUp, logIn, upload, updateUserDetails, editProfile, dashboard, createPost, follow, unFollow, profilePix, userProfile, fetchDetails} = require('../controllers/user.controller')
const {protect} = require('../authMiddleware/auth')

router.route('/signup').post(SignUp)
router.route('/login').post(logIn)
router.route('/upload').post(protect,upload)
router.route('/update').post(protect,updateUserDetails)
router.route('/userdetails').get(protect,editProfile)
router.route('/dashboard').get(protect,dashboard)
router.route('/post').post(protect,createPost)
router.route('/follow').post(protect,follow)
router.route('/unfollow').post(protect,unFollow)
router.route('/profilepix').post(protect,profilePix)
router.route('/profile/:id').get(protect,userProfile)
router.route('/fetchdetails/:id').get(protect,fetchDetails)

module.exports = router