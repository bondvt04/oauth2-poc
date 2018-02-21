const express = require('express');
const cors = require('cors');
const session = require('express-session');
const connectFlash = require('connect-flash');
const app = express();
const request = require('request');

app.use(session({ secret: 'simplifield-salesforce-plugin-session-secret', cookie: { maxAge: 60*60*1000 }}));
app.use(connectFlash());
app.use(cors());

app.get('/ping', function (req, res) {
    res.send('pong');
});
app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html');
});
app.get('/try_to_get_secured_resource',function(req, res){
    const access_token = req.session.access_token;
    const options = {
        uri: 'http://simplifield-oauth.local:3000/api/secured_resource',
        method: 'POST',
        json: {
            access_token
        },
        auth: {
            'bearer': access_token
        }
    };

    // console.log('***', (new Date).getTime());
    request(options, function (error, response, body) {
        if (error) {
            res.status(401);
            res.send(error);
            return console.error(error);
        }
        res.send(body);
    });
});

app.get('/finish_auth',function(req, res){
    req.session.auth_code = req.query.code;

    const client_id = 'salesforce_plugin___oauth_id_123';
    const client_secret = 'salesforce_plugin___oauth_secret_123';
    const code = req.session.auth_code;
    const grant_type = 'authorization_code';
    const options = {
        uri: 'http://simplifield-oauth.local:3000/auth/exchange',
        method: 'POST',
        json: {
            client_id,
            client_secret,
            code,
            grant_type
        }
    };

    // Exchange auth code (grant) for token
    request(options, function (error, response, body) {
        if (error) {
            return console.error(error);
        }
        req.session.access_token = body.access_token;
        res.sendFile(__dirname + '/finish_auth.html');
    });
});

app.get('/test-session1', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.write('<p>access_token: ' + req.session.access_token + '</p>');
    res.end();
});

app.get('/test-session2', function(req, res, next) {
    if (req.session.views) {
        req.session.views++;
        res.setHeader('Content-Type', 'text/html');
        res.write('<p>views: ' + req.session.views + '</p>');
        res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>');
        res.end();
    } else {
        req.session.views = 1;
        res.end('welcome to the session demo. refresh!');
    }
});

app.listen(3001);
console.log('Listen http://salesforce-plugin.local:3001');