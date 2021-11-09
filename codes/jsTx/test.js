const path = require('path');
const net = require('net');
const Web3 = require('web3');
const fs = require('fs');
const config = require('./config');


var remoteDir = fs.readFileSync(path.resolve(__dirname, "..", "remoteSh", "remoteDir.txt")).toString();
var ipcPath = path.resolve(remoteDir, "node0", "data", "geth.ipc");
var web3s = [new Web3(ipcPath, net)];

var pKey = "f9ba9055697012daebd32ca1586a88c8b5f8de645c76884b117bb886ae7c4ca6";
var temp = web3s[0].eth.accounts.privateKeyToAccount(pKey)

web3s[0].eth.sendTransaction({from:temp, to:temp, value:0}, "");

// web

// console.log(temp.address);

