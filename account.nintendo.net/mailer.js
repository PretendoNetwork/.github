let nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
           user: 'removed',
           pass: 'removed'
       }
   });

function send(email, subject = 'No email subject provided', message = 'No email body provided') {
    let options = {
        from: 'riiunoreply@gmail.com',
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