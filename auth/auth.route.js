const Router = require('express').Router

const AuthController = require('./auth.controller')

const authRouter = Router()


authRouter.post('/signup', AuthController.SignupController)
authRouter.post('/login', AuthController.LoginController)

module.exports = authRouter;