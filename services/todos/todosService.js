const TodoModel = require("../../models/todo")
const { TodoExistsException } = require("../exceptions")


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
    return await TodoModel.find({
        createdBy: userId
    })
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
    return await TodoModel.create({
        title: title,
        description: description,
        endDate: endDate,
        tasks: tasks,
        createdBy: userId
    })
}

const deleteTodo = async ({
    userId,
    todoId
}) => {
    console.log(userId, todoId)
    const { deletedCount } = await TodoModel.deleteOne({
        createdBy: userId,
        todo_id: todoId
    })

    return deletedCount
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
        return await TodoModel.updateOne({
            createdBy: userId,
            todo_id: todoId
        }, {
            tasks: tasks
        })
    }
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

        return await TodoModel.updateOne({
            createdBy: userId,
            todo_id: todoId
        }, {
            tasks: filteredTasks
        })

    }
    else {
        return
    }
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
        return await todo.save()
    }
    return
}

module.exports = {
    getAllTodos,
    createTodo,
    deleteTodo,
    addTask,
    deleteTask,
    toggleTodo
}