var express = require('express');
var router = express.Router();
const Joi = require("joi");
const { authorize } = require('../../middlewares/authorize');
const { TodoExistsException } = require('../../services/exceptions');
const { createTodo, getAllTodos, deleteTodo, deleteTask, addTask, toggleTodo } = require('../../services/todos/todosService');

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


router.delete("/delete", authorize(), async (req, res) => {
    const data = req.body
    const validator = Joi.object({
        todo_id: Joi.string().required()
    })

    const validationResult = validator.validate(data)
    const { todo_id: todoId } = data
    const userId = req.user.id
    if (!validationResult.error) {
        // Call service to delete
        const deletedCount = await deleteTodo({
            userId,
            todoId
        })
        if (deletedCount == 1) {
            return res.json({
                status: "ok",
                message: "Todo deleted successfully"
            })
        }
        return res.status(500).json({
            status: "error",
            message: `Todo of id ${todoId} cannot be deleted for that user`
        })
    } else {
        return res.status(401).json({
            status: "error",
            message: "Validation error"
        })
    }

})


// Create a task for the todo
router.patch("/create/task", authorize(), async (req, res) => {
    const data = req.body
    const validator = Joi.object({
        todo_id: Joi.string().required(),
        title: Joi.string().required(),
        description: Joi.string().optional(),
        endDate: Joi.date().optional(),
    })

    const validationResult = validator.validate(data)
    const {
        todo_id: todoId,
        title,
        description,
        endDate,
    } = data
    const userId = req.user.id
    if (!validationResult.error) {
        // Request service to create the a task for the todo
        await addTask({
            userId,
            todoId,
            title,
            description,
            endDate
        })
        return res.json({
            status: 'ok',
            message: `Task added successfully to the todo`
        })
    }
    else {
        return res.status(401).json({
            status: "error",
            message: "Validation error"
        })
    }
})

router.delete("/delete/task", authorize(), async (req, res) => {
    const data = req.body
    const validator = Joi.object({
        todo_id: Joi.string().required(),
        task_id: Joi.string().required(),
    })

    const validationResult = validator.validate(data)
    const {
        todo_id: todoId,
        task_id: taskId
    } = data
    const userId = req.user.id
    if (!validationResult.error) {
        // Call service to delete
        await deleteTask({
            userId,
            todoId,
            taskId,
        })
        return res.json({
            status: 'ok',
            message: `Task of id ${taskId} deleted successfully`
        })
    } else {
        return res.status(401).json({
            status: "error",
            message: "Validation error"
        })
    }
})


router.patch("/update", () => {

})

router.patch("/toggle", authorize(), async (req, res) => {
    const data = req.body
    const validator = Joi.object({
        todo_id: Joi.string().required(),
    })

    const validationResult = validator.validate(data)
    const {
        todo_id: todoId,
    } = data
    const userId = req.user.id
    if (!validationResult.error) {

        await toggleTodo({
            userId,
            todoId
        })
        return res.json({
            status: 'ok',
            message: 'Todo toggled'
        })

    } else {
        return res.status(401).json({
            status: "error",
            message: "Validation error"
        })
    }
})

router.patch("/toggle/task", () => {

})


module.exports = router