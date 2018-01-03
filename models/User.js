const mongoose = require('mongoose');
// Use native promises
mongoose.Promise = require('bluebird');

// Create authenticated Authy and Twilio API clients
const authy = require('authy')(process.env.authyKey);
const twilioClient = require('twilio')(process.env.accountSid, process.env.authToken);

// Used to generate password hash
const SALT_WORK_FACTOR = 10;

// Define user model schema
const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    countryCode: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    authyId: String,
    email: {
        type: String,
        required: true,
        unique: true,
    }
});

// Send a verification token to this user
UserSchema.methods.sendAuthyToken = function(cb) {
    var self = this;

    if (!self.authyId) {
        // Register this user if it's a new user
        authy.register_user(self.email, self.phone, self.countryCode,
            function(err, response) {
                console.log("register the user")
            if (err || !response.user) return cb.call(self, err);
            self.authyId = response.user.id;
            console.log(response.user.id)
            sendToken();
        });
    } else {
        console.log("no register the user")
        // Otherwise send token to a known user
        sendToken();
    }

    // With a valid Authy ID, send the 2FA token for this user
    function sendToken() {
        authy.request_sms(self.authyId, true, function(err, response) {
            cb.call(self, err);
        });
    }
};

// Test a 2FA token
UserSchema.methods.verifyAuthyToken = function(otp, cb) {
    const self = this;
    authy.verify(self.authyId, otp, function(err, response) {
        cb.call(self, err, response);
    });
};

// Send a text message via twilio to this user
UserSchema.methods.sendMessage =
  function(message, successCallback, errorCallback) {
      const self = this;
      const toNumber = `+${self.countryCode}${self.phone}`;

      twilioClient.messages.create({
          to: toNumber,
          from: process.env.twilioNumber,
          body: message,
      }).then(function() {
        successCallback();
      }).catch(function(err) {
        errorCallback(err);
      });
  };

// Export user model
module.exports = mongoose.model('User', UserSchema);
