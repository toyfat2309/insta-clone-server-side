const express = require('express');
const router = express.Router()
const userController = require('../controllers/user.controller')

router.post('/signup',userController.SignUp)
router.post('/login',userController.logIn)
router.post('/upload',userController.upload)
router.post('/update',userController.updateUserDetails)
router.get('/userdetails',userController.editProfile)
router.get('/dashboard',userController.dashboard)
router.post('/post',userController.createPost)
router.post('/follow',userController.follow)
router.post('/unfollow',userController.unFollow)
router.post('/profilepix',userController.profilePix)
router.get('/profile/:id',userController.userProfile)
router.get('/fetchdetails/:id',userController.fetchDetails)

module.exports = router