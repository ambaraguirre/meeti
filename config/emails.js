require('dotenv').config({path: 'variables.env'});

module.exports = {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    host:"sandbox.smtp.mailtrap.io",
    port: 2525
}