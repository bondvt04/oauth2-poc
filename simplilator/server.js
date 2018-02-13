const express = require('express');
const cors = require('cors');
const app = express();
const useAuth = require('./auth.js');
const useAuthApi = require('./auth-api.js');
// const db = require('./db.js');
// const testDb = require('./test-db.js');
// testDb.run();

app.use(cors());
useAuth(app);
useAuthApi(app);
app.get('/ping', function (req, res) {
    res.send('pong');
});

app.listen(3000);
console.log('Listen http://localhost:3000');