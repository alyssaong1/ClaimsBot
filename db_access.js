//Top level object
var dataAccess = {};
var data = require('./data.js');

/*
MongoDB
*/
// User is alyssaong1, insurancebot123
var mongoClient = require('mongodb').MongoClient;
var connectionUrl = 'your mongo db url';
var db;

//Called before server start in index to establish reusable connection
dataAccess.connectToDb = function(callback)
{
    mongoClient.connect(connectionUrl, function(err,database){
        if(!err)
        {
            console.log('Successfully connected to database');
            db = database;
            callback();
        }
        else
        {
            console.log(err)
            console.error('Error connecting to database');
        }
    });
}

dataAccess.addContacts = function (callback)
{
    db.collection('contacts').insert(data.contacts);
    callback();
}

dataAccess.getClaimStatus = function (code, callback)
{
    db.collection('claims').findOne({"claimcode": code}, function(err, doc){
        if(!err)
        {
            if(doc)
            {
                console.dir(doc);
            }
            else
            {
                console.error('Response not found');
            }
        }
        else
        {
            console.error('Error finding document');
        }
        callback(err, doc);
    });
}

dataAccess.getContact = function (policycode, callback)
{
    db.collection('contacts').findOne({"policycode": policycode}, function (err, doc) {
        if(!err)
        {
            if(doc)
            {
                console.dir(doc);
            }
            else
            {
                console.error('Response not found');
            }
        }
        else
        {
            console.error('Error finding document');
        }
        callback(err, doc);
    })
}

module.exports = dataAccess;