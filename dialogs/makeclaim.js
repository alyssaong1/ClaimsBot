module.exports = () => {
    const data = require('../data.js');
    const utils = require('../utilities.js');
    var Mail = require('../mail.js');
    var Promise = require('bluebird');
    var request = require('request-promise').defaults({ encoding: null });

    bot.dialog('MakeClaim', [
        (session, args, next) => {
            session.privateConversationData.claim = {};
            session.privateConversationData.claim.policynum = 'SGP';
            session.privateConversationData.claim.policyCode = "53829";
            session.beginDialog('HavePolicyNumberClaim');
        }
    ])
        .cancelAction('Cancel', 'Operation cancelled', {
            matches: /^cancel$/i,
            onSelectAction: (session, args) => {
                session.endConversation(`I have cancelled your request.`);
            },
            confirmPrompt: `Are you sure you wish to cancel?`
        })
        .triggerAction({ matches: /^Make a claim$/i });

    // Make a manual claim from scratch
    bot.dialog('NoPolicyNumberClaim', [
        (session, args, next) => {
            session.privateConversationData.claim = {};
            builder.Prompts.choice(session, "What is your policy line of business?", data.LOBchoices, { listStyle: builder.ListStyle["button"] });
        }, (session, results) => {
            session.privateConversationData.claim.lob = data.LOBchoices[results.response.entity];
            builder.Prompts.choice(session, "Which AGCS office has issued your policy?", data.countrychoices, { listStyle: builder.ListStyle["button"] })
        }, (session, results) => {
            session.privateConversationData.claim.policynum = data.countrychoices[results.response.entity].code + session.privateConversationData.claim.lob.code;
            builder.Prompts.text(session, "Please enter your policy number:");
        }, (session, results) => {
            console.log(results);
            session.privateConversationData.claim.policyCode = results.response;
            session.beginDialog('HavePolicyNumberClaim');
        }
    ]).cancelAction('Cancel', 'Operation cancelled', {
        matches: /^cancel$/i,
        onSelectAction: (session, args) => {
            session.endConversation(`I have cancelled your request.`);
        },
        confirmPrompt: `Are you sure you wish to cancel?`
    })

    bot.dialog('HavePolicyNumberClaim', [
        (session, args, next) => {
            builder.Prompts.text(session, "Please describe the situation or circumstances regarding your claim.");
        }, (session, results) => {
            session.privateConversationData.claim.description = results.response;
            builder.Prompts.text(session, "When was your date of loss? (DD/MM/YYYY)");
        }, (session, results) => {
            session.privateConversationData.claim.date = results.response;
            builder.Prompts.text(session, "What is your estimated potential loss?");
        }, (session, results) => {
            session.privateConversationData.claim.amount = results.response;
            builder.Prompts.attachment(session, "Please upload a photo or document relating to your loss (where available)", { maxRetries: 0 });
        }, (session, results) => {
            // If no image, results.response = undefined
            session.privateConversationData.attachments = results.response;
            sendEmail(session, results.response, "handler", function (doc) {
                session.send("Thank you for reaching out. " + doc.name + " will be contacting you shortly. You may also note the following contact details for further enquiries:");
                // TODO: send a card instead
                session.send("Name: " + doc.name + ", " + "Email: " + doc.email + ", Phone number: " + doc.phone)
                builder.Prompts.choice(session, "Would you like us to send an email to your broker to inform them as well?", "Yes|No", { listStyle: builder.ListStyle["button"] });
            });
        }, (session, results) => {
            if (results.response.entity === "Yes") {
                sendEmail(session, session.privateConversationData.attachments, "broker", function (doc) {
                    session.send("Ok, I have informed your broker as well.");
                    session.beginDialog("Feedback");
                });
            } else {
                session.send("Alright.");
                session.beginDialog("Feedback");
            }
        }
    ])

    bot.dialog('GetPolicyNumber', [
        (session, args, next) => {
            // This is SGAxxx
            builder.Prompts.text(session, "Please enter the first 3 characters of your policy number.");
        }, (session, results) => {
            // 1. Do a check that there's 3 alphanumerics
            // 2. Check first 2 against country code
            // 3. Check third against the lob
            if (results.response.length !== 3) {
                session.send('You have not entered 3 letters. Please try again or say cancel to quit.');
                session.replaceDialog('GetPolicyNumber')
            } else {
                // Format to upper case for search
                var reply = results.response.toUpperCase()
                // Save to session data temporarily
                session.privateConversationData.claim.policynum = reply
                var countrycode = reply.substring(0, 2)
                var lobcode = reply.substring(2, 3)
                var lob = data.lob.find(function (lob) {
                    return lob.code === this[0]
                }, [lobcode]);
                var country = data.countries.find(function (country) {
                    return country.code === this[0]
                }, [countrycode]);
                builder.Prompts.choice(session, utils.toTitleCase(session.userData.name) + ", we understand that you have " + lob.name + " cover type in " + utils.toTitleCase(country.name) + ". Is this correct?", "yes|no", { listStyle: builder.ListStyle["button"] });
            }
        }, (session, args, results) => {
            var choice = args.response.index;
            if (choice == 0) {
                session.beginDialog('HavePolicyNumberClaim')
            } else {
                // Policy retrieved was wrong
                // Reset the policy num in session data
                session.privateConversationData.policynum = null;
                session.beginDialog('NoPolicyNumberClaim')
            }
        }
    ])

    // Request file with Authentication Header
    var requestWithToken = function (url) {
        return obtainToken().then(function (token) {
            return request({
                url: url,
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/octet-stream'
                }
            });
        });
    };

    // Promise for obtaining JWT Token (requested once)
    var obtainToken = Promise.promisify(connector.getAccessToken.bind(connector));

    var checkRequiresToken = function (message) {
        return message.source === 'skype' || message.source === 'msteams';
    };

    var sendEmail = function (session, attachments, type, cb) {

        var policynum = session.privateConversationData.claim.policynum;
        dbAccess.getContact(policynum, function (err, doc) {
            if (err) {
                session.endConversation("Sorry, something went wrong. Please try again.")
            } else if (!doc) {
                session.endConversation("Sorry, we couldn't find the right contact for the specified policy code and location")
            } else {
                var subjectName = "";
                if (type === "broker") {
                    subjectName = "Mr Broker";
                } else {
                    subjectName = doc.name;
                }

                var options = {
                    to: 'receipient emails here',
                    subject: 'To be contacted about Policy #' + session.privateConversationData.claim.policynum + session.privateConversationData.claim.policyCode,
                    message: 'Dear ' + subjectName
                    + 'Thank you for reaching out. ' + doc.name + ' will be contacting you shortly. You may also note the following contact details for further enquiries:'
                    + 'Name: ' + doc.name + ', ' + 'Email: ' + doc.email + ', Phone number: ' + doc.phone,
                    html_message: '<b> Dear ' + subjectName + ', </b> <br/> <br/> '
                    + 'We have received a contact notification from ' + session.userData.name + '. <br/>'
                    + 'Below are the details of his/her request. <br/><br/>'
                    + '<table>'
                    + '<tr>'
                    + '<td>'
                    + 'Policy Number#:'
                    + '</td>'
                    + '<td>'
                    + session.privateConversationData.claim.policynum + session.privateConversationData.claim.policyCode
                    + '</td>'
                    + '</tr>'

                    + '<tr>'
                    + '<td>'
                    + 'Claim Description:'
                    + '</td>'
                    + '<td>'
                    + session.privateConversationData.claim.description
                    + '</td>'
                    + '</tr>'

                    + '<tr>'
                    + '<td>'
                    + 'Date of Loss:'
                    + '</td>'
                    + '<td>'
                    + session.privateConversationData.claim.date
                    + '</td>'
                    + '</tr>'

                    + '<tr>'
                    + '<td>'
                    + 'Estimated Loss:'
                    + '</td>'
                    + '<td>'
                    + session.privateConversationData.claim.amount
                    + '</td>'
                    + '</tr>'


                    + '</table>' // html body
                    + '<br/>' + '<br/>' + '<br/>'
                    + 'Claims Auntie'
                }

                var mailOptions = {
                    to: options.to,
                    subject: options.subject,
                    message: options.message,
                    html_message: options.html_message,
                    successCallback: function (suc) {
                        console.log("MAIL success");
                    },
                    errorCallback: function (err) {
                        console.log("MAIL error: " + err);
                    }
                };

                if (attachments) {
                    var attachment = attachments[0];
                    session.privateConversationData.claim.attachment = attachment;
                    var fileDownload = checkRequiresToken(session.message)
                        ? requestWithToken(attachment.contentUrl)
                        : request(attachment.contentUrl);

                    fileDownload.then(
                        function (response) {
                            options.attachments = [
                                {
                                    filename: attachment.name,
                                    content: response,
                                    contentType: attachment.contentType
                                }
                            ]
                            mailOptions.attachments = options.attachments;
                            var mail = new Mail(mailOptions);

                            mail.send();

                        }).catch(function (err) {
                            console.log(err)
                            console.log('Error downloading attachment:', { statusCode: err.statusCode, message: err.response.statusMessage });
                        });
                } else {
                    var mail = new Mail(mailOptions);

                    mail.send();

                }
                
                cb(doc);
            }});

    }
}