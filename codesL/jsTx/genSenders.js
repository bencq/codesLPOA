const path = require('path');
const net = require('net');
const Web3 = require('web3');
const fs = require('fs');
const config = require('./config');

var senderCnt = config.senderCnt;


var remoteDir = fs.readFileSync(path.resolve(__dirname, "..", "remoteSh", "remoteDir.txt")).toString();
var ipcPath = path.resolve(remoteDir, "node0", "data", "geth.ipc");
var web3s = [new Web3(ipcPath, net)];


let senderPairArr = [];
for(let ind = 0; ind < senderCnt; ind++)
{
    let res = web3s[0].eth.accounts.create("");
    senderPairArr.push([res.address, res.privateKey].join(' '));
}
{
    let toWrite = senderPairArr.join('\n');
    fs.writeFileSync(path.resolve(__dirname, "senders.txt"), toWrite);
}
console.log("done");
process.exit(0);
// web
// var pKey = "f9ba9055697012daebd32ca1586a88c8b5f8de645c76884b117bb886ae7c4ca6";
// var temp = web3s[0].eth.accounts.privateKeyToAccount(pKey)
// console.log(temp.address);

