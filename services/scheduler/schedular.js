var cron = require('node-cron');
const { sendMail } = require('../mailing/mailing');
const { constructMailHtmlBody } = require('../mailing/utils');
const { getAllNonCompletedTodos } = require('../todos/todosService');
const { getAllUsers } = require('../users/usersService');



function registerMailingSchedular() {
    // Send notification emails at 23:00 pm
    console.log("Schedular started")
    cron.schedule('0 23 * * *', async () => {
        /**
         * Get current date string to match it with 
         * the endDate string of the todos
         */
        console.log("Sending emails")
        const currentDate = new Date().toLocaleDateString()
        const users = await getAllUsers()
        if (users) {
            for (const user of users) {
                // Get todos with endDate = currentDate
                try {
                    const response = await getAllNonCompletedTodos(user._id, currentDate)
                    console.log(response)
                    if (response.data.length > 0) {
                        const from = process.env.GMAIL_ACCOUNT
                        const to = user.email
                        const subject = `Don't miss out your todos`
                        const html = constructMailHtmlBody(response.data)
                        const text = "Your todos"
                        await sendMail(
                            from,
                            to,
                            subject,
                            text,
                            html,
                        )
                    }

                } catch (e) {
                    console.log(e)
                }
            }
        }
    });
}


module.exports = {
    registerMailingSchedular
}