'use strict';

global.builder = require('botbuilder');
const data = require('./data.js');
var cards = require("./Cards")
const User = require('./models/User');

var users = {};

const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

global.connector = connector;

global.bot = new builder.UniversalBot(connector, '/');

// Add the claim dialogs
require('./dialogs/makeclaim.js')();
require('./dialogs/getclaim.js')();
require('./dialogs/contact.js')();

bot.dialog('/', [
    (session, args, next) => {
        if (!session.privateConversationData.verified) {
            session.beginDialog('verifyUser')
        } else {
            session.beginDialog('menu')
        }
    }
])

bot.dialog('menu', [
    (session, args, next) => {
        session.send("Welcome Robert to Claims Aunty, the Allianz insurance claims bot. Let\'s get started by selecting one of the options below that I can assist you with:");
        var cards = getMenuCardsAttachments(session);
        // create reply with Carousel AttachmentLayout
        var reply = new builder.Message(session)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments(cards);

        session.send(reply);
    }]);

function getMenuCardsAttachments(session) {
    return [
        new builder.HeroCard(session)
        .title('Robert Johannes')
            .text(`Small Business: Policy number 123456 \n Coverage Type: Liability \n Policy Owner: Robert Johannes \n Effective Date: 09/05/2017 \n`)
            .buttons([
                // Value is what the user says when they click the button
                new builder.CardAction(session).title('Make a new claim').value('Make a claim').type('imBack'),
                new builder.CardAction(session).title('Get status on existing claim').value('Get claim status').type('imBack'),
                new builder.CardAction(session).title('Have a claims handler contact me').value('Be contacted').type('imBack'),
            ]),

        new builder.HeroCard(session)
        .title('Robert Johannes')
            .text(`Small Business: Policy number 456789 \n Coverage Type: Marine \n Policy Owner: Robert Johannes \n Effective Date: 07/6/2017 \n`)
            .buttons([
                // Value is what the user says when they click the button
                new builder.CardAction(session).title('Make a new claim').value('Make a claim').type('imBack'),
                new builder.CardAction(session).title('Get status on existing claim').value('Get claim status').type('imBack'),
                new builder.CardAction(session).title('Have a claims handler contact me').value('Be contacted').type('imBack'),
            ]),

        new builder.HeroCard(session)
        .title('Robert Johannes')
            .text(`Small Business: Policy number 99999 \n Coverage Type: Property \n Policy Owner: Robert Johannes \n Effective Date: 08/6/2017 \n`)
            .buttons([
                // Value is what the user says when they click the button
                new builder.CardAction(session).title('Make a new claim').value('Make a claim').type('imBack'),
                new builder.CardAction(session).title('Get status on existing claim').value('Get claim status').type('imBack'),
                new builder.CardAction(session).title('Have a claims handler contact me').value('Be contacted').type('imBack')
            ])
    ]
}

bot.dialog('verifyUser', [
    (session, args, next) => {
        // Get the person's name if we don't have it yet
        if (!(session.userData.registered) || session.userData.registered === "") {
            session.beginDialog('GetRegistered');
        } else {
            session.send("Hi there, it's good to see you again.");
            next();
        }
    }, (session, results) => {
        builder.Prompts.text(session, "Please provide me with your phone number (without country code) for verification purposes:");
    }, (session, results) => {
        var phone = results.response;
        console.log(phone)
        if (results.response === "skip" || results.response === "Skip") {
            session.beginDialog("menu")
        } else {
            session.privateConversationData.phoneNum = phone;
            // For demo purposes, create a new user
            const user = new User({
                fullName: session.userData.name,
                phone: phone,
                email: "test@lala.com", // put placeholder
                countryCode: session.userData.countryCode || "65" // Use singapore as default
            });
            users[session.message.address.conversation.id] = user;
            // If the user is created successfully, send them an account
            // verification token
            console.log(user);
            user.sendAuthyToken(function (err) {
                if (err) {
                    console.log(err)
                    session.endDialog("Sorry, there was an error sending the verification code.");
                    session.clearDialogStack();
                    session.beginDialog('NoPolicyNumberClaim');
                } else {
                    // Prompt for the token
                    builder.Prompts.text(session, "We have sent you a text at this phone number, please note it may take up to 2 minutes to receive. Enter the verification code received:");
                }
            });
        }
    }, (session, results, next) => {
        var user = users[session.message.address.conversation.id];
        // Verify token
        user.verifyAuthyToken(results.response, function (err) {
            if (err) {
                session.endDialog("The token you entered is incorrect. Please try again.");
                session.clearDialogStack();
            } else {
                session.privateConversationData.verified = true;
                session.send("Verification successful.");
                session.beginDialog('menu')
            }
        });
    }
])

    bot.on('conversationUpdate', function (message) {
        if (message.membersAdded) {
            message.membersAdded.forEach(function (identity) {
                if (identity.id === message.address.bot.id) {
                    bot.beginDialog(message.address, '/')
                }
            });
        }
    });

bot.dialog('Feedback', [
    (session, args, next) => {
        builder.Prompts.choice(session, "How did I perform?", "Excellent|Fair|Poor", { listStyle: builder.ListStyle["button"], maxRetries: 0 })
    }, (session, results) => {
        // TODO: Save somewhere
        builder.Prompts.text(session, "Please leave any other feedback that may help us better serve you in the future:")
    }, (session, results) => {
        session.endConversation("Thank you for using Claims Aunty.")
    }
])

bot.dialog('Reset', [
    (session, args) => {
        session.userData.name = null;
        session.userData.registered = null;
        session.endConversation("Ok, I have reset your user data.");
    }
]).triggerAction({ matches: /^reset$/i });

bot.dialog('GetRegistered', [
    (session, args, next) => {
        builder.Prompts.choice(session, "Hi there, thanks for reaching out. Are you already registered with us?", "Yes|No", { listStyle: builder.ListStyle["button"] });
    },
    (session, results) => {
        if (results.response.entity === "Yes" || results.response.entity === "yes") {
            session.userData.registered = true;
        } else {
            session.userData.registered = false;
        }
        // Ask the user for their name
        if (session.userData.registered) {
            session.beginDialog('GetName');
        } else {
            session.beginDialog('BeContacted')
        }
    }
])

bot.dialog('GetName', [
    (session, args, next) => {
        builder.Prompts.text(session, "Could you tell me your full name? I need it to verify your identity.");
    }, (session, results, next) => {
        // Save the name
        session.userData.name = results.response;
        session.endDialog("Thanks.");
    }
])

bot.dialog('ChangeCountry', [
    (session, args) => {
        builder.Prompts.choice(session, "Change country to:", data.countrycodes, { listStyle: builder.ListStyle["button"] })
    }, (session, results) => {
        var countryCode = data.countrycodes[results.response.entity];
        session.userData.countryCode = countryCode;
        session.endDialog("Alright, your country code has been set to " + results.response.entity + ".");
    }
]).triggerAction({ matches: /^change country$/i });

module.exports = bot;