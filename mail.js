var nodemailer = require('nodemailer');

// Replace with your email address details, better to use env variables
var transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: 'yourbotemail@outlook.com',
        pass: 'yourbotemailpassword'
    }
});

module.exports = function(params) {
    this.from = 'yourbotemail@outlook.com';

    this.send = function(){
        var options = {
            from : this.from,
            to : params.to,
            subject : params.subject,
            text : params.message,
            html : params.html_message,
            attachments : params.attachments
        };
        console.log('mail.send function');
        transporter.sendMail(options, function(err, suc){
            err ? params.errorCallback(err) : params.successCallback(suc);
        });
    }
}