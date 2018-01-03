module.exports = () => {
    const data = require('../data.js')
    const utils = require('../utilities.js')
    bot.dialog('GetClaim', [
        (session, args, next) => {
            session.privateConversationData.claim = {};
            // Get the person's name if we don't have it yet
            if (!(session.userData.name) || session.userData.name === "") {
                session.beginDialog('GetName');
            } else {
                next();
            }
        }, (session, args, next) => {
            builder.Prompts.text(session, "Before we begin, please provide us with your email or phone number (whichever way you prefer to be contacted):");
        }, (session, args, next) => {
            builder.Prompts.text(session, "What is your claims reference?");
        }, (session, args, next) => {
            var statuses = ["Submitted", "Pending", "Approved"];
            var randomNumber = Math.floor(Math.random()*statuses.length);
            session.send("The status of your claim is: " + statuses[randomNumber]);
            builder.Prompts.choice(session, "Do you have any other queries?", "yes|no", {listStyle: builder.ListStyle["button"]});
        }, (session, results) => {
            var choice = results.response.index;
            if (choice == 0) {
                // User has other queries
                builder.Prompts.text(session, "Please enter your queries and our claims personnel will get back to you shortly.");
            } else {
                session.beginDialog('Feedback');
            }
        }, (session, results) => {
            session.send("Your query has been sent.");
            session.beginDialog('Feedback');
        }
    ])
    .cancelAction('Cancel', 'Operation cancelled', {
        matches: /^cancel$/i,
        onSelectAction: (session, args) => {
            session.endConversation(`I have cancelled your request.`);
        },
        confirmPrompt: `Are you sure you wish to cancel?`
    })
    .triggerAction({matches: /^Get claim status$/i});

    bot.dialog('GetClaimCode', [
        (session, args, next) => {
            builder.Prompts.text(session, "What is your full policy number?");
        }, (session, results) => {
            var reply = results.response.toUpperCase()
            session.privateConversationData.claim.policynum = reply;
            var countrycode = reply.substring(0,2)
            var lobcode = reply.substring(2,3)
            var lob = data.lob.find(function (lob) {
                return lob.code === this[0]
            },lobcode)
            var country = data.countries.find(function (country){
                return country.code == this
            },[countrycode])
            if (country !== undefined && lob !== undefined){
                builder.Prompts.choice(session, "We understand that you have " + lob.name + " cover type in " + utils.toTitleCase(country.name) + ". Is this correct?", "yes|no", {listStyle: builder.ListStyle["button"]});
            } else {
                session.send("We could not find the policy number you specified. Please try again or say 'cancel' to quit.");
                session.beginDialog('GetClaimCode');
            }
        }, (session, results) => {
            // TODO: show status and details
            var fullcode = session.privateConversationData.claim.policynum;
            dbAccess.getClaimStatus(fullcode, function (err, doc){
                if (err){
                    session.endConversation("Sorry, we couldn't get your results. Please try again later.")
                } else if (doc) {
                    session.send("The status of your claim is: " + doc.status);
                    var claimdetails = getClaimDetails(session.privateConversationData.claim.policynum);
                    session.send("Your claim details are: " + claimdetails[0] + " " + claimdetails[1]);
                    builder.Prompts.choice(session, "Do you have any other queries?", "yes|no", {listStyle: builder.ListStyle["button"]});
                } else {
                    session.send("Hmm, we can't seem to find your claim.")
                    session.beginDialog('NoClaimCode');
                }
            })
        }, (session, results) => {
            var choice = results.response.index;
            if (choice == 0) {
                // User has other queries
                builder.Prompts.text(session, "Please enter your queries and our claims personnel will get back to you shortly.");
            } else {
                session.beginDialog('Feedback');
            }
        }, (session, results) => {
            session.send("Your query has been sent.");
            session.beginDialog('Feedback');
        }
    ])

    bot.dialog('NoClaimCode', [
        (session, args, next) => {
            builder.Prompts.choice(session, "Which line of business does your claim fall under?", data.LOBchoices, {listStyle: builder.ListStyle["button"]})
        }, (session, results) => {
            session.privateConversationData.claim.lob = data.LOBchoices[results.response.entity];
            builder.Prompts.choice(session, "Which AGCS office has issued your policy?", data.countrychoices, {listStyle: builder.ListStyle["button"]})
        }, (session, results) => {
            var policycode = data.countrychoices[results.response.entity].code + session.privateConversationData.claim.lob.code;
            console.log(policycode)
            dbAccess.getContact(policycode, function (err, doc){
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
        }
    ])

    function getClaimDetails(fullcode){
        var countrycode = fullcode.substring(0,2)
        var lobcode = fullcode.substring(2,3)
        // var countryname = 
        var lob = data.lob.find(function (lob) {
            return lob.code == this[0]
        },lobcode)
        var country = data.countries.find(function (country){
            return country.code == this; // this must be double equals sign
        },[countrycode])
        return [lob.name,country.name]
    }
}