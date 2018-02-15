const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const connectFlash = require('connect-flash');
// const bodyParser = require('body-parser');
const app = express();
require('./auth.js');
const useOauth2orizeServer = require('./oauth2orize-server.js');
// const db = require('./db.js');
// const testDb = require('./test-db.js');
// testDb.run();

// app.use(bodyParser.json());
// app.use(session({
//     secret: 'keyboard cat',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: true }
// }));
// @TODO change default engine (MemoryStore) to something else
// app.use(session({
//     secret: 'salesforce-plugin',
//     cookie: { maxAge: 60000 }
// }));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))

app.use(connectFlash());
app.use(passport.initialize());

app.set('view engine', 'pug');
app.use(cors());
useOauth2orizeServer(app);
app.get('/ping', function (req, res) {
    res.send('pong');
});
app.post('/login', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true
}));

app.listen(3000);
console.log('Listen http://localhost:3000');