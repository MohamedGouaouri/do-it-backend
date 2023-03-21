const TodoModel = require("../../models/todo")
const { TodoExistsException } = require("../exceptions")
const { TodoServiceResponse } = require("./responses")


/**
 * Checks if already created a todo
 */
const userHasTodo = async (userId, todo) => {
    // Search for user non compeleted todos
    const todos = await TodoModel.find({
        createdBy: userId,
        title: todo
    }).select('titles')
    if (todos.length > 0) {
        return true
    }
    return false
}

const getAllTodos = async (userId) => {
    try {
        const todos = await TodoModel.find({
            createdBy: userId
        }, { _id: 0, 'tasks._id': 0 }) // Exclude _id from response

        return new TodoServiceResponse(
            todos,
            "Todos fetched successfully"
        )
    } catch (e) {
        return new Error("Could not fetch todos for that user")
    }
}

const createTodo = async ({
    userId,
    title,
    description,
    endDate,
    tasks
}) => {
    if (await userHasTodo(userId, title)) {
        throw new TodoExistsException(`User has already created that todo ${title}`)
    }
    try {
        await TodoModel.create({
            title: title,
            description: description,
            endDate: endDate,
            tasks: tasks,
            createdBy: userId
        })
        return new TodoServiceResponse(
            null,
            "Todo created successfully"
        )
    } catch (e) {
        throw new Error("Could not create the todo")
    }
}

const deleteTodo = async ({
    userId,
    todoId
}) => {
    const { deletedCount } = await TodoModel.deleteOne({
        createdBy: userId,
        todo_id: todoId
    })

    if (deletedCount == 1) {
        return new TodoServiceResponse(
            null,
            "Todo deleted successfully"
        )
    }

    throw new Error(`Todo of id ${todoId} cannot be deleted for that user`)
}

const addTask = async ({
    userId,
    todoId,
    title,
    description,
    endDate
}) => {
    // Search for the todo
    const todo = await TodoModel.findOne({
        createdBy: userId,
        todo_id: todoId
    })

    if (todo) {

        const task = { title, description, endDate }
        const tasks = todo.tasks
        tasks.push(task)
        try {
            await TodoModel.updateOne({
                createdBy: userId,
                todo_id: todoId
            }, {
                tasks: tasks
            })
            return new TodoServiceResponse(
                null,
                `Task added successfully to the todo with id ${todoId}`
            )
        } catch (e) {
            throw new Error(`Could not create a task for the todo ${todoId}`)
        }
    }
    throw new Error(`Could not find todo item with id ${todoId}`)

}


const deleteTask = async ({
    userId,
    todoId,
    taskId,
}) => {
    // Find the todo
    const todo = await TodoModel.findOne({
        createdBy: userId,
        todo_id: todoId
    })
    if (todo) {
        // Search for task and delete it
        const tasks = todo.tasks
        if (tasks.length == 0) return
        const filteredTasks = tasks.filter((task) => {
            return task.task_id != taskId
        })

        try {
            await TodoModel.updateOne({
                createdBy: userId,
                todo_id: todoId
            }, {
                tasks: filteredTasks
            })
            return new TodoServiceResponse(
                null,
                `Task deleted successfully to the todo with id ${todoId}`
            )
        } catch (e) {
            throw new Error(`Could not delete a task for the todo ${todoId}`)

        }

    }
    throw new Error(`Could not find todo item with id ${todoId}`)

}


const toggleTodo = async ({
    userId,
    todoId
}) => {
    /*
    If I toggle the todo, do all tasks get toggled as well?
    */

    const todo = await TodoModel.findOne({
        createdBy: userId,
        todo_id: todoId
    })
    if (todo) {
        // Toggle completed
        todo.completed = !todo.completed
        try {
            await todo.save()
            return new TodoServiceResponse(
                null,
                `Todo ${todoId} toggled successfully`
            )
        } catch (e) {
            throw new Error(`Could not toggle todo item ${todoId}`)
        }
    }

    throw new Error(`Could not find todo item ${todoId}`)


}

const toggleTask = async ({
    userId,
    todoId,
    taskId
}) => {
    // Search for task 
    const todo = await TodoModel.findOne({
        "createdBy": userId,
        "todo_id": todoId,
    })

    if (todo) {
        const task = todo.tasks.filter(task => task.task_id == taskId)
        if (task.length > 0) {
            try {
                await TodoModel.findOneAndUpdate({
                    "createdBy": userId,
                    "todo_id": todoId,
                    'tasks.task_id': taskId
                }, {
                    '$set': {
                        'tasks.$.completed': !task[0].completed
                    }
                })
                return new TodoServiceResponse(
                    null,
                    `Task ${taskId} toggled successfully`
                )
            } catch (e) {
                // Repository exception
                throw new Error(`Could toggle task ${taskId}`)

            }
        }
        throw new Error(`Could not find task item ${taskId}`)
    }

    throw new Error(`Could not find todo item ${todoId}`)

}


const getAllNonCompletedTodos = async (userId, endDate) => {
    try {
        const todos = await TodoModel.find({
            createdBy: userId,
            completed: false,
            endDate: endDate
        }, { _id: 0, 'tasks._id': 0 }) // Exclude _id from response

        return new TodoServiceResponse(
            todos,
            "Todos fetched successfully"
        )
    } catch (e) {
        throw new Error("Could not fetch todos for that user")
    }
}

module.exports = {
    getAllTodos,
    createTodo,
    deleteTodo,
    addTask,
    deleteTask,
    toggleTodo,
    toggleTask,
    getAllNonCompletedTodos
}