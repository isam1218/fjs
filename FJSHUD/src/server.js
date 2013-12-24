var express = require('express');
var app = express();
//var path = require('path');
//var https = require('https');
//var http = require('http');
//var fs = require('fs');
//
//var options = {
//    key: fs.readFileSync('ssl/cakey.pem')
//    , cert: fs.readFileSync('ssl/cacert.pem')
//};
app.use(express.static(__dirname));
//
//var server = https.createServer(options, app)
//
//server.listen(98);

app.listen(99);

console.log('Listening on port 99');