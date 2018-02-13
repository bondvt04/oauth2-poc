const url = require('url');
const passport = require('passport');
const oauth2orize = require('oauth2orize');
const server = oauth2orize.createServer();

const {
    Application,
    GrantCode,
    AccessToken
} = require('./oauth.js');

module.exports = (app) => {
    app.get('/auth/start', server.authorize(function(applicationID, redirectURI, done) {
        Application.findOne({ oauth_id: applicationID })
            .then(application => {
                    if (application) {
                        let match = false, uri = url.parse(redirectURI || '');
                        for (let i = 0; i < application.domains.length; i++) {
                            if (uri.host == application.domains[i] || (uri.protocol == application.domains[i] && uri.protocol != 'http' && uri.protocol != 'https')) {
                                match = true;
                                break;
                            }
                        }
                        if (match && redirectURI && redirectURI.length > 0) {
                            done(null, application, redirectURI);
                        } else {
                            done(new Error("You must supply a redirect_uri that is a domain or url scheme owned by your app."), false);
                        }
                    } else {
                        done(new Error("There is no app with the client_id you supplied."), false);
                    }
            })
            .catch(done);
    }), function(req, res) {

        const scopeMap = {
            // ... display strings for all scope variables ...
            view_account: 'view your account',
            edit_account: 'view and edit your account',
        };

        res.render('oauth', {
            transaction_id: req.oauth2.transactionID,
            currentURL: req.originalUrl,
            response_type: req.query.response_type,
            errors: req.flash('error'),
            scope: req.oauth2.req.scope,
            application: req.oauth2.client,
            user: req.user,
            map: scopeMap
        });
    });
    app.post('/auth/finish', function(req, res, next) {
        if (req.user) {
            next();
        } else {
            passport.authenticate('local', {
                session: false
            }, function(error, user, info) {
                if (user) {
                    next();
                } else if (!error) {
                    req.flash('error', 'Your email or password was incorrect. Try again.');
                    res.redirect(req.body['auth_url'])
                }
            })(req, res, next);
        }
    }, server.decision(function(req, done) {
        done(null, { scope: req.oauth2.req.scope });
    }));
}
