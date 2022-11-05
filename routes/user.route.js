const express = require('express');
const router = express.Router()
const userController = require('../controllers/user.controller')

router.post('/signup',userController.SignUp)
router.post('/login',userController.logIn)
router.post('/upload',userController.upload)
router.get('/dashboard',userController.dashboard)
router.post('/post',userController.createPost)
router.post('/profilepix',userController.profilePix)
module.exports = router