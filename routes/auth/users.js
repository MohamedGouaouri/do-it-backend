var express = require('express');
var router = express.Router();
const Joi = require("joi")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../../models/user")

const { roles } = require("../../middlewares/authorize")


/**
 * @swagger
 * /users/register:
 *  post:
 *    desription: registers a new user
 *    requestBody:
 *        required: true
 *        content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      email:
 *                          type: string
 *                      password:
 *                          type: string
 *                  required:
 *                      - email
 *                      - password
 *    reponses:
 *      201:
 *        description: User created
 *      401:
 *        description: validation error
 *      500:
 *        description: Couldn't create the user
 */
router.post("/register", async (req, res) => {
  const data = req.body
  const validator = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })

  const validationResult = validator.validate(data)
  if (!validationResult.error) {
    const { email, password } = req.body
    const salt = await bcrypt.genSalt(parseInt(process.env.ROUNDS));
    const hashPassowrd = await bcrypt.hash(password, salt)
    try {
      await User.create({
        email: email,
        password: hashPassowrd
      })
      res.status(201).json({
        status: "ok",
        message: "User created"
      })
    } catch (e) {
      res.status(500).json({
        status: "error",
        message: "Couldn't create the user"
      })
    }
  } else {
    res.status(400).json({
      status: "error",
      message: "validation error"
    })
  }
})


/**
 * @swagger
 * /users/login:
 *  post:
 *    desription: Login user
 *    requestBody:
 *        required: true
 *        content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      email:
 *                          type: string
 *                      password:
 *                          type: string
 *                  required:
 *                      - email
 *                      - password
 *    reponses:
 *      200:
 *        description: Successfull login
 *      404:
 *        description: User not found error
 *      403:
 *        description: Password is incorrect
*       401:
 *        description: Validation error
 */

router.post("/login", async (req, res) => {
  const data = req.body
  const validator = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
  })

  const validationResult = validator.validate(data)
  if (!validationResult.error) {
    const { email, password } = req.body
    const user = await User.findOne({ email: email }).exec()
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: `No user of email ${email} was found`
      })

    }

    // 1. compare hashes
    const passwordDoesMatch = await bcrypt.compare(password, user.password)
    if (!passwordDoesMatch) {
      return res.status(403).json({
        status: "error",
        message: "Password is incorrect"
      })
    }

    // 2. Generate toke with role
    const token = jwt.sign({
      id: user._id,
      email: email,
      role: roles.User
    }, process.env.JWT_SECRET, {
      expiresIn: 360000
    })

    // 3. Send token
    return res.json({
      status: "ok",
      token
    })
  } else {
    res.status(401).json({
      status: "error",
      message: "validation error"
    })
  }
})


module.exports = router;
