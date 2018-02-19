const express = require('express');
const cors = require('cors');
const session = require('express-session');
const connectFlash = require('connect-flash');
const app = express();
const request = require('request');


app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
app.use(connectFlash());
app.use(cors());

app.get('/ping', function (req, res) {
    res.send('pong');
});

app.get('/',function(req,res){
    res.sendFile(__dirname + '/index.html');
});
app.get('/finish_auth',function(req, res){
    req.session.auth_code = req.query.code;
    updateToken(req, res);
    res.sendFile(__dirname + '/finish_auth.html');
});
app.get('/try_to_get_secured_resource',function(req, res){
    const access_token = req.session.access_token;
    const options = {
        uri: 'http://localhost:3000/api/secured_resource',
        method: 'POST',
        json: {
            access_token
        }
    };

    request(options, function (error, response, body) {
        if (error) { return console.log(error); }
        console.log(body);
    });
});

function updateToken(req, res) {
    const client_id = 'salesforce_plugin___oauth_id_123';
    const client_secret = 'salesforce_plugin___oauth_secret_123';
    const code = req.session.auth_code;
    const grant_type = 'authorization_code';
    const options = {
        uri: 'http://localhost:3000/auth/exchange',
        method: 'POST',
        json: {
            client_id,
            client_secret,
            code,
            grant_type
        }
    };

    request(options, function (error, response, body) {
        if (error) { return console.log(error); }
        req.session.access_token = body.access_token;
    });
};

app.listen(3001);
console.log('Listen http://localhost:3001');