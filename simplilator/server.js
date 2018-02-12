const express = require('express');
const cors = require('cors');
const app = express();
// const db = require('./db.js');
// const testDb = require('./test-db.js');
// testDb.run();

app.use(cors());
app.get('/ping', function (req, res) {
    res.send('pong');
})

app.listen(3000);
console.log('Listen http://localhost:3000');