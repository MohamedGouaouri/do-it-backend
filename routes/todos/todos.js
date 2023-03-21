var express = require('express');
var router = express.Router();
const Joi = require("joi");
const { authorize } = require('../../middlewares/authorize');
const { TodoExistsException } = require('../../services/exceptions');
const { createTodo, getAllTodos, deleteTodo, deleteTask, addTask, toggleTodo, toggleTask } = require('../../services/todos/todosService');
const { toISOStringLocal } = require('../utils/utils');


/**
 * @swagger
 *  /todos:
 *    get:
 *      description: Get todos for the logged in user
 *      responses:
 *        200:
 *          description: Success
 *        500:
 *          description: Failure
 */
router.get("/", authorize(), async (req, res) => {
    const userId = req.user.id
    try {
        const response = await getAllTodos(userId)
        return res.json({
            status: 'ok',
            data: response.data,
            message: response.message
        })
    } catch (e) {
        return res.status(500).json({
            status: 'error',
            message: e.message
        })
    }
})

/**
 * @swagger
 *  /todos/create:
 *    post:
 *      description: Create a todo item for the logged in user
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      title:
 *                          type: string
 *                      description:
 *                          type: string
 *                      endDate:
 *                          type: string
 *                      tasks:
 *                          type: array
 *                  required:
 *                      - title
 *                      
 *      responses:
 *        201:
 *          description: Todo item created successfully 
 *        401:
 *          description: Todo item creation failure due to validation error
 *        500:
 *          description: Todo item creation failure due to service error
 */
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
            let {
                endDate,
                tasks
            } = data
            if (endDate) {
                endDate = new Date(endDate).toISOString()
            } else {
                endDate = toISOStringLocal(new Date())
            }
            if (tasks) {
                for (let task of tasks) {
                    if (task.endDate) {
                        task.endDate = new Date(task.endDate).toISOString()
                    } else {
                        task.endDate = toISOStringLocal(new Date())
                    }
                }
            }
            const response = await createTodo({
                userId,
                ...data,
                endDate,
                tasks
            })
            return res.status(201).json({
                status: 'ok',
                message: response.message
            })
        }
        catch (e) {
            console.log(e)
            return res.status(500).json({
                status: 'error',
                message: e.message
            })

        }
    }
    else {
        return res.status(401).json({
            status: "error",
            message: "Validation error"
        })
    }
})

/**
 * @swagger
 *  /todos/delete:
 *    delete:
 *      description: Delete a todo item for the logged in user
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      todo_id:
 *                          type: string
 *                  required:
 *                      - todo_id
 *                      
 *      responses:
 *        200:
 *          description: Todo item deleted successfully 
 *        401:
 *          description: Todo item deletion failure due to validation error
 *        500:
 *          description: Todo item deletion failure due to service error
 */
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
        try {

            const response = await deleteTodo({
                userId,
                todoId
            })

            return res.json({
                status: "ok",
                message: response.message,
                data: response.data
            })



        } catch (e) {
            return res.status(500).json({
                status: "error",
                message: e.message,
                data: null
            })
        }

    } else {
        return res.status(401).json({
            status: "error",
            message: "Validation error",
            data: null
        })
    }

})


/**
 * @swagger
 *  /todos/create/task:
 *    patch:
 *      description: Create a todo task for the logged in user for a specific todo item
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      todo_id:
 *                          type: string
 *                      title:
 *                          type: string
 *                      description:
 *                          type: string
 *                      endDate:
 *                          type: string
 *                  required:
 *                      - todo_id
 *                      - title
 *                      
 *      responses:
 *        201:
 *          description: Task created successfully 
 *        401:
 *          description: Task creation failure due to validation error
 *        500:
 *          description: Task creation failure due to service error
 */
router.patch("/create/task", authorize(), async (req, res) => {
    const data = req.body
    const validator = Joi.object({
        todo_id: Joi.string().required(),
        title: Joi.string().required(),
        description: Joi.string().optional(),
        endDate: Joi.date().optional(),
    })

    const validationResult = validator.validate(data)
    let {
        todo_id: todoId,
        title,
        description,
        endDate,
    } = data
    const userId = req.user.id
    if (!validationResult.error) {
        // Request service to create the a task for the todo
        try {

            if (endDate) {
                endDate = new Date(endDate).toISOString()
            } else {
                endDate = toISOStringLocal(new Date())
            }

            const response = await addTask({
                userId,
                todoId,
                title,
                description,
                endDate
            })
            return res.json({
                status: 'ok',
                message: response.message,
                data: response.data
            })
        } catch (e) {

            return res.status(500).json({
                status: 'error',
                message: e.message,
                data: null
            })
        }
    }
    else {
        return res.status(401).json({
            status: "error",
            message: "Validation error",
            data: null
        })
    }
})


/**
 * @swagger
 *  /todos/delete/task:
 *    delete:
 *      description: Delete a todo task for the logged in user for a specific todo item
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      todo_id:
 *                          type: string
 *                      task_id:
 *                          type: string
 *                  required:
 *                      - todo_id
 *                      - task_id
 *                      
 *      responses:
 *        201:
 *          description: Task deleted successfully 
 *        401:
 *          description: Task deletion failure due to validation error
 *        500:
 *          description: Task deletion failure due to service error
 */
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
        try {
            const response = await deleteTask({
                userId,
                todoId,
                taskId,
            })
            return res.json({
                status: 'ok',
                message: response.message,
                data: response.data
            })
        } catch (e) {

            return res.status(500).json({
                status: 'error',
                message: e.message,
                data: null
            })
        }
    } else {
        return res.status(401).json({
            status: "error",
            message: "Validation error",
            data: null
        })
    }
})


router.patch("/update", () => {

})


/**
 * @swagger
 *  /todos/toggle:
 *    patch:
 *      description: Toggles a todo item completion for the current logged in user
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      todo_id:
 *                          type: string
 *                  required:
 *                      - todo_id
 *                      
 *      responses:
 *        200:
 *          description: Todo item toggle completion was successful
 *        401:
 *          description: Todo item toggle completion failure due to validation error
 *        500:
 *          description: Todo item toggle completion failure due to service error
 */
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

        try {
            const response = await toggleTodo({
                userId,
                todoId,
            })
            return res.json({
                status: 'ok',
                message: response.message,
                data: response.data
            })
        } catch (e) {
            return res.status(500).json({
                status: 'ok',
                message: e.message,
                data: null
            })
        }


    } else {
        return res.status(401).json({
            status: "error",
            message: "Validation error",
            data: null
        })
    }
})


/**
 * @swagger
 *  /todos/toggle/task:
 *    patch:
 *      description: Toggles a task completion for the current logged in user and for a specific todo item
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      todo_id:
 *                          type: string
 *                      task_id:
 *                          type: string
 *                  required:
 *                      - todo_id
 *                      - task_id
 *                      
 *      responses:
 *        200:
 *          description: Task toggle completion was successful
 *        401:
 *          description: Task toggle completion failure due to validation error
 *        500:
 *          description: Task toggle completion failure due to service error
 */
router.patch("/toggle/task", authorize(), async (req, res) => {
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

        try {
            const response = await toggleTask({
                userId,
                todoId,
                taskId
            })
            return res.json({
                status: 'ok',
                message: response.message,
                data: response.data
            })
        } catch (e) {
            return res.status(500).json({
                status: 'ok',
                message: e.message,
                data: null
            })
        }


    } else {
        return res.status(401).json({
            status: "error",
            message: "Validation error",
            data: null
        })
    }
})


module.exports = router