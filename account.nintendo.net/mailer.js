let nodemailer = require('nodemailer'),
    config = require('./config.json');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.email.address,
        pass: config.email.password
    }
});

function send(email, subject = 'No email subject provided', message = 'No email body provided') {
    let options = {
        from: 'pretendonetwork@gmail.com',
        to: email,
        subject: subject,
        html: message
    }

    transporter.sendMail(options, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log(info);
        }
     });
}

module.exports = {
    send: send
}
