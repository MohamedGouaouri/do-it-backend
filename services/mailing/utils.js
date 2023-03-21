

const constructMailHtmlBody = (todos) => {
    let html = `<h2>Hello my friend, don't miss today's tasks</h2> `

    const todosItems = todos.map(todo => {
        return `<li>${todo.title}</li>`
    })

    html += `<ul>`
    for (const todoItem of todosItems) {
        html += `${todoItem} `
    }
    html += `</ul>`
    return html
}


module.exports = {
    constructMailHtmlBody
}