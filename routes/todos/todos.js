var express = require('express');
var router = express.Router();
const Joi = require("joi");
const { authorize } = require('../../middlewares/authorize');
const { TodoExistsException } = require('../../services/exceptions');
const { createTodo, getAllTodos } = require('../../services/todos/todosService');

router.get("/", authorize(), async (req, res) => {
    const userId = req.user.id
    try {
        const todos = await getAllTodos(userId)
        return res.json({
            status: 'ok',
            data: todos
        })
    } catch (e) {
        return res.status(500).json({
            status: 'error',
            message: 'Could not fetch todos'
        })
    }
})

router.post("/create", authorize(), async (req, res) => {
    const data = req.body
    const taskSchema = Joi.object({
        title: Joi.string().required(),
        description: Joi.string().optional(),
        endDate: Joi.date().optional(),
    })
    const validator = Joi.object({
        title: Joi.string().required(),
        description: Joi.string().optional(),
        endDate: Joi.date().optional(),
        tasks: Joi.array().items(taskSchema).optional()
    })

    const validationResult = validator.validate(data)
    const userId = req.user.id
    if (!validationResult.error) {
        // Request service to create the todo
        try {
            await createTodo({
                userId,
                ...data
            })
            return res.status(201).json({
                status: 'ok',
                message: 'Todo created successfully'
            })
        }
        catch (e) {
            console.error(e)

            if (e instanceof TodoExistsException) {
                return res.status(500).json({
                    status: 'error',
                    message: e.message
                })
            } else {
                return res.status(500).json({
                    status: 'error',
                    message: 'Could not create the todo'
                })
            }

        }
    }
    else {
        return res.status(401).json({
            status: "error",
            message: "Validation error"
        })
    }
})


router.delete("/delete", () => {

})


router.patch("/update", () => {

})


module.exports = router