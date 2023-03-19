var express = require('express');
var router = express.Router();

var authRouter = require("./auth/users");
var todosRouter = require("./todos/todos")


router.get("/", (req, res) => {
  return res.json({
    "status": 'ok',
    'message': 'API is up and running'
  })
})


router.use("/auth", authRouter)
router.use("/todos", todosRouter)




module.exports = router;
