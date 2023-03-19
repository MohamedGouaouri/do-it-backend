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
        throw TodoExistsException(`User has already created that todo ${title}`)
    }
    return await TodoModel.create({
        title: title,
        description: description,
        endDate: endDate,
        tasks: tasks,
        createdBy: userId
    })
}


module.exports = {
    getAllTodos,
    createTodo
}