let express = require('express');
let bodyParser = require('body-parser');
let spawn = require('child_process').spawn;
let crypto = require('crypto');
let app = express();

app.use(bodyParser.json());

let secret = "amazingkey";
let port = 8081;

app.post('/push', (req, res) => {
    console.log('[LOG] request received');
    res.status(400).set('Content-Type', 'application/json');

    let jsonString = '';
    req.on('data', function (data) {
        jsonString += data;
    });

    req.on('end', function () {

        let hash = "sha1=" + crypto.createHmac('sha1', secret).update(jsonString).digest('hex');

        if (hash != req.get('x-hub-signature')) {
            console.log('[ERROR] invalid key');
            console.log(hash);
            let data = JSON.stringify({ "error": "invalid key", key: hash });
            return res.end(data);
        }

        console.log("[LOG] running hook.sh");

        let deploySh = spawn('sh', ['hook.sh']);
        deploySh.stdout.on('data', function (data) {
            let buff = new Buffer(data);
            console.log(buff.toString('utf-8'));
        });

        let data = JSON.stringify({ "success": true });
        console.log('[LOG] success!!');
        return res.end(data);
    });
});

app.listen(port, () => console.log('listen to ' + port + ' port'));
