var express = require('express');
const { sendMail } = require('../services/mailing/mailing');
const { constructMailHtmlBody } = require('../services/mailing/utils');
const { getAllNonCompletedTodos } = require('../services/todos/todosService');
const { getAllUsers } = require('../services/users/usersService');
var router = express.Router();

var authRouter = require("./auth/users");
var todosRouter = require("./todos/todos")


router.get("/", async (req, res) => {
  return res.json({
    "status": 'ok',
    'message': 'API is up and running'
  })
})


router.use("/auth", authRouter)
router.use("/todos", todosRouter)



module.exports = router;
