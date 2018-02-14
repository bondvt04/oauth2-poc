const express = require('express');
const cors = require('cors');
var session = require('express-session')
const app = express();
const useAuth = require('./auth.js');
const useOauth2orizeServer = require('./oauth2orize-server.js');
// const db = require('./db.js');
// const testDb = require('./test-db.js');
// testDb.run();

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

app.set('view engine', 'pug');
app.use(cors());
useAuth(app);
useOauth2orizeServer(app);
app.get('/ping', function (req, res) {
    res.send('pong');
});

app.listen(3000);
console.log('Listen http://localhost:3000');