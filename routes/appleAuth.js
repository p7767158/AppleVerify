var express = require('express');
var router = express.Router();
var https = require('https');
const jwt = require('jsonwebtoken');
const NodeRSA = require('node-rsa');
const axios = require('axios');

async function getApplePubKey() {
    let res = await axios.request(
        {
            method: "GET",
            url: "https://appleid.apple.com/auth/keys",
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
    let key = res.data.keys[0];
    const pubKey = new NodeRSA();
    pubKey.importKey({
        n: Buffer.from(key.n, 'base64'),
        e: Buffer.from(key.e, 'base64')
    }, 'components-public');
    return pubKey.exportKey(['public']);
}

async function verifyToken(token, callback) {
    const applePubKey = await getApplePubKey();
    jwt.verify(token, applePubKey, {algorithms: ['RS256']}, function(err, decode) {
        if (err) {
            callback(err);
        } else if (decode) {
            console.log(decode);
            callback && callback(decode);
        }
    });
}

/* GET home page. */
router.get('/', function(req, res, next) {
    // getPubKey(function(chunk) {

        res.send("zhhhhh");
    // });
});

router.post('/verify', function(req, res, next) {
    var data = req.body;
    var auth = data.auth;
    verifyToken(auth, function(err, decode) {
        if (decode) {
            res.send(decode);
        } else {
            res.send(err);
        }
    });
});

module.exports = router;