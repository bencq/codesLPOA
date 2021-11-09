const path = require('path');
const net = require('net');
const Web3Quorum = require('web3js-quorum');
const Web3 = require('web3');
const fs = require('fs');
const config = require('./config');
const { exit } = require('process');

if(config.sendType !== 'interval')
{
    console.log('config.sendType', config.sendType)
    exit(-1);
}
    
function eth_sendRawTransaction(mWeb3, rawtx, callback) {
    mWeb3._requestManager.send({
        method: 'eth_sendRawTransaction',
        params: [rawtx],
    }, callback);
}


var hostpwFile = path.join(__dirname, "..", "remoteSh", "hostpw.txt");
var data = fs.readFileSync(hostpwFile, 'utf8');
lines = data.split('\n');
lines.forEach((str, ind, arr) => { arr[ind] = arr[ind].split(' '); });



var web3s = [];
for (var ind in lines) {
    if (lines[ind].length != 3)
        continue;
    var ws = 'ws://' + lines[ind][1] + ':8546';
    var web3 = new Web3(ws);

    web3s.push(web3);
}
console.log("web3s.length", web3s.length);




const privateKey = "0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318";

//aa = web3.eth.accounts.privateKeyToAccount(privateKey);
//console.log(aa);


var encodedTxs = [];
var txCnt = config.txCnt;
var oneBatch = config.oneBatch;
var fixedCnt = config.fixedCnt;
var intervalCnt = config.intervalCnt;
var intervalMs = config.intervalMs;
var batchCnt = txCnt / oneBatch;
var period = config.period;
var batchInd = -1;
// var timeSt;
// var chk = []; //[number][web3Ind] = txCnt
// return 0

var totalSend = 0;
var totalReceive = 0;

var first = true;
var txCnt2timeStamps = [];

function sendTxInd(txInd) {
    if (txInd >= (batchInd + 1) * oneBatch) {
        batchInd++;
        if (txInd % parseInt(txCnt / 10) == 0) {
            console.log("txInd", txInd, "batchInd", batchInd)
        }
        encodedTxs = fs.readFileSync("./temp/" + batchInd).toString().split("\n");

    }
    var senderInd = batchInd % web3s.length;
    var txIndInBatch = txInd % oneBatch;



    eth_sendRawTransaction(web3s[senderInd], encodedTxs[txIndInBatch], data => { });
}

function sendTx(txCnt2Send) {
    var stInd = totalSend;
    if (stInd + txCnt2Send - 1 >= txCnt) {
        txCnt2Send = txCnt - stInd;
        console.log('totalSend', totalSend, "txCnt2Send", txCnt2Send);

    }
    if (stInd % 10000 == 0)
        console.log("stInd", stInd, stInd + txCnt2Send - 1);
    totalSend += txCnt2Send;
    // txCnt2timeStamps.push([txCnt2Send, new Date().getTime()].join(","));
    for (var ind = stInd; ind < stInd + txCnt2Send; ind++) {
        sendTxInd(ind);
    }
}

function fasong() {
    for (ind in web3s) {
        web3s[ind].eth.subscribe('newBlockHeaders', function (error, result) {
            if (error)
                console.error(error);
        })
    }
}
// timeSt = new Date();
fasong();
setInterval(() => { sendTx(intervalCnt); }, intervalMs);






