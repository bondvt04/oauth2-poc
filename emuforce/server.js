const express = require('express');
const cors = require('cors');
const session = require('express-session');
const connectFlash = require('connect-flash');
const app = express();


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

app.listen(3001);
console.log('Listen http://localhost:3001');