const mongoose = require("mongoose")
const uuid = require('uuid');


const Task = mongoose.Schema({
    task_id: {
        type: String,
        required: true,
        default: 'task_' + uuid.v4(),
    },
    title: {
        type: String,
        required: true,
        // index: { unique: true, sparse: true }, // add sparse index on text field
    },
    description: {
        type: String,
        required: false,
    },
    completed: {
        type: Boolean,
        required: false,
        default: false
    }
})


const Todo = mongoose.Schema({
    todo_id: {
        type: String,
        required: true,
        unique: true,
        default: 'todo_' + uuid.v4(),
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    completed: {
        type: Boolean,
        required: false,
        default: false,
    },
    endDate: {
        type: Date,
        required: false
    },

    tasks: {
        type: [Task],
        required: false,
        default: []
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel',
        required: true,

    }
}, {
    collection: "todos"
})



const TodoModel = mongoose.model('TodoModel', Todo)


module.exports = TodoModel