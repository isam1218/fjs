//var http = require('http');
//var fs = require('fs');
//var path = require('path');
//var url = require('url');

//http.createServer(function (request, response) {
//
//    console.log('request starting...');
//
//    var filePath = '.' + path.normalize(decodeURI(url.parse(request.url).pathname));
//    if (filePath == './')
//        filePath = './index.htm';
//
//    var extname = path.extname(filePath);
//    var contentType = 'text/html';
//    switch (extname) {
//        case '.js':
//            contentType = 'text/javascript';
//            break;
//        case '.css':
//            contentType = 'text/css';
//            break;
//    }
//
//    path.exists(filePath, function(exists) {
//
//        if (exists) {
//            fs.readFile(filePath, function(error, content) {
//                if (error) {
//                    response.writeHead(500);
//                    response.end();
//                }
//                else {
//                    response.writeHead(200, { 'Content-Type': contentType });
//                    response.end(content, 'utf-8');
//                }
//            });
//        }
//        else {
//            response.writeHead(404);
//            response.end();
//        }
//    });
//
//}).listen(99);
//
//console.log('Server running at http://127.0.0.1:99/');

var express = require('express');
var app = express();
var path = require('path');
var https = require('https');
var http = require('http');
var fs = require('fs');

var options = {
    key: fs.readFileSync('C:/Users/ddyachenko/Desktop/ssl/cakey.pem')
    , cert: fs.readFileSync('C:/Users/ddyachenko/Desktop/ssl/cacert.pem')
};
app.use(express.static(__dirname));

var server = https.createServer(options, app)

server.listen(98);

app.listen(99);

