const User = require('./user.js');
const passport = require('passport');
const PassportLocalStrategy = require('passport-local');

const authStrategy = new PassportLocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, function(email, password, done) {
    User.authenticate(email, password)
        .then((user) => {
            done(null, user, null);
        })
        .catch(error => {
            console.error(error);
            done(error);
        });
});

const authSerializer = function(user, done) {
    done(null, user.id);
};

const authDeserializer = function(id, done) {
    User.findById(id)
        .then(user => done(null, user))
        .catch(error => done(error));
};

passport.use(authStrategy);
passport.serializeUser(authSerializer);
passport.deserializeUser(authDeserializer);

module.exports = (app) => {
    // ... continue with Express.js app initialization ...
    app.use(require('connect-flash')()); // see the next section
    app.use(passport.initialize());
    app.post('/login', passport.authenticate('local', {
        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
    }));
}
