var express = require('express');
var spawn   = require('child_process').spawn;
var crypto = require('crypto');
var app = express();

var secret = "amazingkey";
var port = 8081;

app.post('/push', (req, res) => {
    console.log('request received');
    res.set('Content-Type', 'application/json');

    var jsonString = '';
    req.on('data', function(data){
        jsonString += data;
    });

    var hash = "rsa=" + crypto.createHmac('rsa', secret).update(jsonString).digest('hex');
    if(hash != req.headers['x-hub-signature']){
        console.log('invalid key');
	console.log(hash);
	console.log(req.headers['x-hub-signature']);
        var data = JSON.stringify({"error": "invalid key", key: hash});
        res.send(data);
    }

    console.log("running hook.sh");

    var deploySh = spawn('sh', ['hook.sh']);
    deploySh.stdout.on('data', function(data){
        var buff = new Buffer(data);
        console.log(buff.toString('utf-8'));
    });

    var data = JSON.stringify({"success": true});
    res.send(data);
});

app.listen(port, () => console.log('listen to ' + port + ' port'));
//test2
