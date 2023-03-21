var cron = require('node-cron');
const { sendMail } = require('../mailing/mailing');
const { getAllNonCompletedTodos } = require('../todos/todosService');
const { getAllUsers } = require('../users/usersService');



// cron.schedule('0 23 * * *', async () => {
//     const users = await getAllUsers()
//     if (users) {
//         for (const user of users) {
//             const todos = await getAllNonCompletedTodos(user.user_id)
//             const from = process.env.GMAIL_ACCOUNT
//             const to = user.email
//             const subject = `Don't miss out your todos`
//             const html = constructMailHtmlBody(todos)
//             const text = "Your todos"
//             await sendMail(
//                 from,
//                 to,
//                 subject,
//                 text,
//                 html,
//             )
//         }
//     }
// });