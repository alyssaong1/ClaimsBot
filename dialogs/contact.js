module.exports = () => {
    var data = require('../data.js');
    const utils = require('../utilities.js');
    bot.dialog('BeContacted', [
        (session, args, next) => {
            session.privateConversationData.contact = {};
            // Get the person's name if we don't have it yet
            if (!(session.userData.name) || session.userData.name === "") {
                session.beginDialog('GetName');
            } else {
                next();
            }
        }, (session, args, next) => {
            builder.Prompts.text(session, "Before we begin, please provide us with your email or phone number (whichever way you prefer to be contacted):");
        }, (session, args, next) => {
            builder.Prompts.text(session, "Please provide details of your enquiry.");
        }, (session, results) => {
            session.privateConversationData.contact.info = results.response;
            if (session.userData.registered) {
                dbAccess.getContact('SGP', function (err, doc){
                    if (err)
                    {
                        session.endConversation("Sorry, something went wrong. Please try again.")
                    } else if (!doc)
                    {
                        session.endConversation("Sorry, we couldn't find the right contact for the specified policy code and location")
                    } else {
                        session.send("Thank you for reaching out. " + doc.name + " will be contacting you shortly. You may also note the following contact details for further enquiries:");
                        // TODO: send a card instead
                        session.send("Name: " + doc.name + ", " + "Email: " + doc.email + ", Phone number: " + doc.phone)
                        session.beginDialog('Feedback')
                    }
                })
            } else {
                builder.Prompts.choice(session, "Do you know your policy number?", "yes|no", {listStyle: builder.ListStyle["button"]});                
            }
        }, (session, args, next) => {
            var choice = args.response.index;
            if (choice == 0) {
                // User knows policy number
                session.beginDialog('GetPolicyNumberContact');
            } else {
                session.beginDialog('NoPolicyNumberContact');
            }
        }
    ])
    .cancelAction('Cancel', 'Operation cancelled', {
        matches: /^cancel$/i,
        onSelectAction: (session, args) => {
            session.endConversation(`I have cancelled your request.`);
        },
        confirmPrompt: `Are you sure you wish to cancel?`
    })
    .triggerAction({matches: /^Be contacted$/i});

    bot.dialog('GetPolicyNumberContact', [
        (session, args, next) => {
            builder.Prompts.text(session, "What is your policy number?");
        }, (session, results) => {
            var reply = results.response.toUpperCase()
            session.privateConversationData.contact.policynum = reply.substring(0,3);
            var countrycode = reply.substring(0,2)
            var lobcode = reply.substring(2,3)
            var lob = data.lob.find(function (lob) {
                return lob.code === this[0]
            },lobcode)
            var country = data.countries.find(function (country){
                return country.code == this
            },[countrycode])
            if (country !== 'undefined' && lob !== 'undefined'){
                console.log(session.userData.name)
                console.log(lob)
                console.log(country)
                builder.Prompts.choice(session,"We understand that you have " + lob.name + " cover type in " + utils.toTitleCase(country.name) + ". Is this correct?", "yes|no", {listStyle: builder.ListStyle["button"]});
            } else {
                session.send("We could not find the policy number you specified. Please try again.  You may type or say 'cancel' to quit.");
                session.beginDialog('GetPolicyNumberContact');
            }
        }, (session, args, results) => {
            var choice = args.response.index;
            if (choice == 0) {
                var policycode = session.privateConversationData.contact.policynum
                console.log(policycode)
                dbAccess.getContact(policycode, function (err, doc){
                    if (err)
                    {
                        session.endConversation("Sorry, something went wrong. Please try again.")
                    } else if (!doc)
                    {
                        session.endConversation("Sorry, we couldn't find the right contact for the specified policy code and location")
                    } else {
                        session.send("Thank you for reaching out. " + doc.name + " we will be contacting you shortly. You may also note the following contact details for further enquiries:");
                        // TODO: send a card instead
                        session.send("Name: " + doc.name + ", " + "Email: " + doc.email + ", Phone number: " + doc.phone)
                        session.beginDialog('Feedback')
                    }
                })
            } else {
                session.privateConversationData.contact.policynum = null; //clear policy num
                // Policy retrieved was wrong
                session.beginDialog('NoPolicyNumberContact')
            }
        }
    ])

    bot.dialog('NoPolicyNumberContact', [
        (session, args, next) => {
            builder.Prompts.choice(session, "No worries! What is your policy line of business?", data.LOBchoices, {listStyle: builder.ListStyle["button"]});
        }, (session, results) => {
            session.dialogData.policytype = data.LOBchoices[results.response.entity];
            builder.Prompts.choice(session, "Which AGCS office issued your policy?", data.countrychoices, {listStyle: builder.ListStyle["button"]}); // change this to choices
        }, (session, results) => {
            var policycode = data.countrychoices[results.response.entity].code + session.dialogData.policytype.code;
            dbAccess.getContact(policycode, function (err, doc){
                if (err)
                {
                    session.endConversation("Sorry, something went wrong. Please try again.")
                } else if (!doc)
                {
                    session.endConversation("Sorry, we couldn't find the right contact for the specified policy code and location")
                } else {
                    console.log(doc)
                    session.send("Thank you for reaching out. " + doc.name + " will be contacting you shortly. You may also note the following contact details for further enquiries:");
                    // TODO: send a card instead
                    session.send("Name: " + doc.name + ", " + "Email: " + doc.email + ", Phone number: " + doc.phone)
                    session.beginDialog('Feedback')
                }
            })
        }
    ])
}