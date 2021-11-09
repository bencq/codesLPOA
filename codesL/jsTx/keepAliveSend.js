const path = require('path');
const net = require('net');
const Web3 = require('web3');
const fs = require('fs');
const config = require('./config');

function eth_sendRawTransaction(mWeb3, rawtx , callback){
    mWeb3._requestManager.send({
        method: 'eth_sendRawTransaction',
        params: [rawtx],
    },  callback);
}


var hostpwFile = path.join(__dirname, "..", "remoteSh", "hostpw.txt");
var data = fs.readFileSync(hostpwFile, 'utf8');
lines = data.split('\n');
lines.forEach((str, ind, arr)=>{arr[ind] = arr[ind].split(' ');});



var web3s = [];
var coinbases = [];
for(var ind in lines)
{
    if(lines[ind].length != 3)
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



// var senders = fs.readFileSync(path.join(__dirname, "senders.txt")).toString().split('\n');
// senders.forEach((str, ind, arr)=>{arr[ind] = arr[ind].split(' ');});
// if(senders.length > 0 && senders[senders.length - 1].length != 2)
// {
//     senders.pop();
// }
// console.log(senders);

// for(var ind in senders)
// {
//     senders[ind][0] = "0x" + senders[ind][0];
//     senders[ind][1] = "0x" + senders[ind][1];
//     var acc = web3.eth.accounts.privateKeyToAccount(senders[ind][1]).address;
//     console.log('acc', acc == senders[ind][0], acc, senders[ind][0]);
// }

function sendCntInd(sendInd) {


    

    // eth_sendRawTransaction(web3s[senderInd], encodedTxs[txIndInBatch], data=>{});
    for(let ind = 0; ind < web3s.length; ind++)
    {
        let senderInd = ind;
        web3s[senderInd].eth.sendTransaction({from: coinbases[senderInd], to: coinbases[senderInd], value:100}, "", data=>{console.log(data)});
    }
    
}
var txInd = 0;
(async ()=>{
    await (async ()=>{
        for(let ind = 0; ind < web3s.length; ind++)
        {
            await web3s[ind].eth.getCoinbase().then((data)=>{
                coinbases[ind] = data;
            });
        }
    })();
    console.log("coinbases", coinbases);
    setInterval(()=>{sendCntInd(txInd++);}, 3 * 1000);
})();







