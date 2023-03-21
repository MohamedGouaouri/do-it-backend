const nodemailer = require("nodemailer");


// async..await is not allowed in global scope, must use a wrapper
async function sendMail(
    from,
    to,
    subject,
    text,
    html
) {
    // create reusable transporter object using the default SMTP transport
    let smtpTransport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_ACCOUNT,
            pass: process.env.GMAIL_PASSWORD
        }
    });

    // send mail with defined transport object
    try {
        const info = await smtpTransport.sendMail({
            from: `Do-It ${from}`, // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
            html: html, // html body
        });
        return info.response
    } catch (e) {
        return new Error(`Mail could not be sent to ${to}`)
    }
}

module.exports = {
    sendMail
}