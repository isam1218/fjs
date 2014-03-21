/**
 * @type {{static:Function}|*}
 */
var express = require('express');
var app = express();
//var path = require('path');
//var https = require('https');
//var http = require('http');
//var fs = require('fs');

//var options = {
//   key: fs.readFileSync('ssl/cakey.pem')
//   , cert: fs.readFileSync('ssl/cacert.pem')
//};
app.use('/', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use('/testRequest', function(req, res){
    res.setHeader("Content-Type", "text/json");
    res.send('{"a":"a","b":2,"c":[123],"d":null}');
})

app.use(express.static(__dirname));



//var server = https.createServer(options, app)

//server.listen(98);

app.listen(99);

console.log('Listening on port 99');