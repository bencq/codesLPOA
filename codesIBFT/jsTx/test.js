const path = require('path');
const net = require('net');
const Web3Quorum = require('web3js-quorum');
const Web3 = require('web3');
const fs = require('fs');
const config = require('./config');


// var remoteDir = fs.readFileSync(path.resolve(__dirname, "..", "remoteSh", "remoteDir.txt")).toString();
var remoteDir = fs.readFileSync(path.resolve('/', 'home', 'ubuntu', 'codes', 'jsTx', "..", "remoteSh", "remoteDir.txt")).toString();
var ipcPath = path.resolve(remoteDir, "node0", "data", "geth.ipc");
var web3 = new Web3Quorum(new Web3(ipcPath, net), {ipcPath: ipcPath}, true);

// var pKey = "ae825c58d991e9ee86a0f5d897a031e40126ad407d5ee55983f9b2dc6e39a69a";
// var temp = web3s[0].eth.accounts.privateKeyToAccount(pKey)
var temp = '0xea32b08715d068619e7095f8529f8668dce70010';

web3.eth.personal.unlockAccount(temp, "", 0);
web3.eth.sendTransaction({from:temp, to:temp, value:0, data:'0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675'}, "", console.log);

// web

// console.log(temp.address);

