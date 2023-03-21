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
    'message': await getAllUsers()
  })
})


router.use("/auth", authRouter)
router.use("/todos", todosRouter)


router.post("/mail", async (req, res) => {
  const users = await getAllUsers()
  if (users) {
    for (const user of users) {
      const response = await getAllNonCompletedTodos(user._id)
      if (response.data && response.data.length > 0) {
        const from = process.env.GMAIL_ACCOUNT
        const to = user.email
        const subject = `Don't miss out your todos`
        const html = constructMailHtmlBody(response.data)
        const text = "Your todos"
        console.log(`Sending mail to ${user} about ${response.data}`)
        await sendMail(
          from,
          to,
          subject,
          text,
          html,
        )
      }
    }
  }
  res.json({
    'status': 'ok',
    'message': 'Users will be notified shortly'
  })
})

module.exports = router;
