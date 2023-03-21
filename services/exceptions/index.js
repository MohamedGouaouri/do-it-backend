

class TodoExistsException extends Error {
    constructor(message) {
        super(message)
        this.message = message
        this.name = this.constructor.name;
        this.stack = Error.captureStackTrace()
    }
}

module.exports = {
    TodoExistsException,
}