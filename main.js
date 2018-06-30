var express = require('express');
var app = express();
var path = require('path');

// publish under the dir name of public
app.use(express.static('public'))

// return static file sample
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/html/helloworld.html');
});

// return static file sample
app.get('/index', function (req, res) {
  res.sendFile(__dirname + '/public/html/index.html');
});

app.get('/hello', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});