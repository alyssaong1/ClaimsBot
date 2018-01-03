
const restify = require('restify');
const path = require('path');
require('dotenv').config();
const bot = require('./bot.js');
global.dbAccess = require('./db_access.js');

const server = restify.createServer();

//Open connection to database before listening on server
dbAccess.connectToDb(function(){
    server.post('/api/messages', bot.connector('*').listen());
    server.listen(process.env.PORT || 3978, () => {
        console.log(`${server.name} listening to ${server.url}`);
    });
    server.get('/bot', restify.serveStatic({
        'directory': path.join(__dirname, 'public'),
        'file': 'index.html'
    }));
    server.get('/chat', restify.serveStatic({
        'directory': path.join(__dirname, 'public'),
        'file': 'chat.html'
    }));
    server.get(/\/public\/?.*/, restify.serveStatic({
        directory: __dirname
    }));
});