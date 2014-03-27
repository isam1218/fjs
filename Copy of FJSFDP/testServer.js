/**
 * @type {{static:Function}|*}
 */
var express = require('express');
var app = express();

app.use(express.bodyParser());
//var path = require('path');
//var https = require('https');
//var http = require('http');
//var fs = require('fs');

//var options = {
//   key: fs.readFileSync('ssl/cakey.pem')
//   , cert: fs.readFileSync('ssl/cacert.pem')
//};
var counter = 0;

var testModel = function(field1, field2, type, id) {
    this.field1 = field1-0;
    this.field2 = field2;
    this.xef001type = type;
    this.xef001id = id+"" || (++counter)+"";
    this.xef001iver = (counter++) + "";
}


var changes = {};
var isFullSync = {};

app.use('/', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST,  GET,  OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-PINGOTHER, Content-Type, Accept, Origin, Authorization, client_id, node, Set-Cookie, Cookie');
    next();
});

app.post('/accounts/ClientRegistry', function(req, res){
    var ticket = req.headers["authorization"];
    console.log("ticket", ticket);
    var node = req.headers["node"];
    console.log("node", node);
    if(ticket=="auth=error") {
        res.status("503");
        res.send('Server error');
    }
    else if(ticket.replace(/\d/g,"")!="auth=validTicket") {
        res.status("403");
        res.send('Wrong ticket');
    }
    else {
        var result = "Success\n"
            + "DB=5770_9bae2f5353d1790bba1f86ab3570f144bd3a704c\n"
            + "node=node\n"
            + "db_version=4161404170\n"
            + "runtime_version=1388123914091\n"
            + "it= 7\n"
            + "build= 3.7.0.008796\n";
        res.send(result);
    }
});

app.post('/v1/versions', function(req, res){
    var ticket = req.headers["authorization"];
    var node = req.headers["node"];
    if(ticket.replace(/\d/g,"")!="auth=validTicket") {
        res.status("403");
        res.send('Wrong ticket');
    }
    else {
        if(req.param("testFeed", undefined)!==undefined) {
            changes[ticket] = [
                new testModel(2, "qwe", "push")
                , new testModel(5, "asd", "push")
            ];
            isFullSync[ticket] = true;
            res.send("1395406176143;4143595651;" + (changes[ticket].length>0 ? "testFeed" : "") + ";;369cf947f441cc867636571f34010542700b0f747a63d7eb162");
        }
    }
});

app.post('/v1/versionscache', function(req, res){
    var ticket = req.headers["authorization"];
    var node = req.headers["node"];

    if(ticket.replace(/\d/g,"")!="auth=validTicket") {
        res.status("403");
        res.send('Wrong ticket');
    }
    else {
        setTimeout(function(){
            if(!changes[ticket])
                changes[ticket]=[];
            res.send("1395406176143;4143595651;"+(changes[ticket].length>0 ? "testFeed" : "") +";;369cf947f441cc867636571f34010542700b0f747a63d7eb162");
        }, 500);
    }
});

app.post('/v1/sync', function(req, res) {
    var ticket = req.headers["authorization"];
    var node = req.headers["node"];
    if (ticket.replace(/\d/g,"") != "auth=validTicket") {
        res.status("403");
        res.send('Wrong ticket');
    }
    else {
        if(req.param("testFeed", undefined)!==undefined) {
            var syncResponce = {"testFeed":{
                "full":isFullSync[ticket]
                , "0":{
                    "xef001type":isFullSync[ticket] ? "F" : "L"
                    , "items":changes[ticket]
                    , "xef001ver":"0:0:40f7f_329239db:"
                    , "xef001con":"n"
                    , "h_ver":0
                }
            }
            };
            changes[ticket] = [];
            isFullSync[ticket] = false;
            setTimeout(function(){
                    res.send(syncResponce);
                },500);

        }
    }
});

app.post('/v1/testFeed', function(req, res) {
    var ticket = req.headers["authorization"];
    var node = req.headers["node"];
    if (ticket.replace(/\d/g,"") != "auth=validTicket") {
        res.status("403");
        res.send('Wrong ticket');
    }
    else {
        if(!changes[ticket])
            changes[ticket] = [];
        if(req.param("action", undefined) == "create") {
            changes[ticket].push(new testModel(req.param("a.field1", undefined), req.param("a.field2", undefined), "push"));
        }
        else if(req.param("action", undefined) == "delete") {
            var p = req.param("a.pid", undefined).split("_")[1];
            changes[ticket].push(new testModel(null, null, "delete", p));
        }
        else if(req.param("action", undefined) == "update") {
            var p = req.param("a.pid", undefined).split("_")[1];
            changes[ticket].push(new testModel(req.param("a.field1", undefined), req.param("a.field2", undefined), "push", p));
        }

    }
    res.send('OK');
});

app.use(express.static(__dirname));



//var server = https.createServer(options, app)

//server.listen(98);

app.listen(99);

console.log('Listening on port 99');