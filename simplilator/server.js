var express = require('express');
var cors = require('cors');
var app = express();

app.use(cors());
app.get('/ping', function (req, res) {
    res.send('pong');
})

app.listen(3000);
console.log('Listen http://localhost:3000');