const path = require('path');
const net = require('net');
const Web3 = require('web3');
const fs = require('fs');
const config = require('./config');

var remoteDir = fs.readFileSync(path.join(__dirname, "..", "remoteSh", "remoteDir.txt")).toString();
var ipcPath = path.resolve(path.join(remoteDir, "node0", "data", "geth.ipc"));

const web3 = new Web3(ipcPath, net);
console.log(ipcPath)

var senders = fs.readFileSync(path.join(__dirname, "senders.txt")).toString().split('\n');
senders.forEach((str, ind, arr)=>{arr[ind] = arr[ind].split(' ');});
if(senders.length > 0 && senders[senders.length - 1].length != 2)
{
    senders.pop();
}
console.log(senders);

for(var ind in senders)
{
    if(!senders[ind][0].startsWith("0x"))
        senders[ind][0] = "0x" + senders[ind][0];
    if(!senders[ind][1].startsWith("0x"))
        senders[ind][1] = "0x" + senders[ind][1];
    var acc = web3.eth.accounts.privateKeyToAccount(senders[ind][1]).address;
    console.log('acc', acc == senders[ind][0], acc, senders[ind][0]);
}


var txCnt = config.txCnt;
var oneBatch = config.oneBatch;
var batchCnt = parseInt(txCnt / oneBatch);
var encodedTxs = Array.from(Array(batchCnt), ()=>new Array());
// var tmpArr = Array.from(Array(batchCnt), ()=>new Array());




function signOne(batchInd, txIndInBatch) {
    
    var senderInd = batchInd % senders.length;
    var nonce = parseInt(batchInd / senders.length) * oneBatch + txIndInBatch;
    
    var privateKey = senders[senderInd][1];
    var txObj = {
        // to: '0x2c7536E3605D9C16a7a3D7b1898e529396a65c23',
        to: senders[senderInd][0],
        value: '0',
        gas: 30000,
        gasPrice: 0,
        nonce: 0
    };
    txObj.nonce = nonce;

    web3.eth.accounts.signTransaction(txObj , privateKey).then(data=>{
        
        // tmpArr[batchInd].push(senderInd + " " + nonce);
        var rawTx = data.rawTransaction;
        encodedTxs[batchInd].push(rawTx);
        if(encodedTxs[batchInd].length == oneBatch){
            
            

            var toWrite = encodedTxs[batchInd].join('\n');
            fs.writeFileSync("./temp/"+batchInd, toWrite);
            // fs.writeFileSync("./temp/"+batchInd+".tmp", tmpArr[batchInd].join('\n'));

            console.log("write batchInd", batchInd);
        }
        if(txIndInBatch + 1 < oneBatch)
            signOne(batchInd, txIndInBatch + 1);
    });
}

function signAllTx()
{
    for(var ind = 0; ind < batchCnt; ind++)
    {
        signOne(ind, 0);
    }
}




console.log("encode!", "batchCnt", batchCnt);
signAllTx();






/**
 * this is for interval encoded
*/

// const path = require('path');
// const net = require('net');
// const Web3 = require('web3');
// const fs = require('fs');
// const config = require('./config');

// var remoteDir = fs.readFileSync(path.join(__dirname, "..", "remoteSh", "remoteDir.txt")).toString();
// var ipcPath = path.join(remoteDir, "node0", "data", "geth.ipc");
// var mode = "";
// [mode] = process.argv.slice(2);
// if(mode == "LPOA")
// {
//     ipcPath = '/home/ubuntu/LPOA/node0/data/geth.ipc'
// }
// const web3 = new Web3(path.resolve(ipcPath), net);

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


// var txCnt = config.txCnt;
// var oneBatch = config.oneBatch;
// var batchCnt = parseInt(txCnt / oneBatch);
// var encodedTxs = Array.from(Array(batchCnt), ()=>new Array());
// // var tmpArr = Array.from(Array(batchCnt), ()=>new Array());





// function signOne(batchInd, txIndInBatch) {
    
//     var senderInd = txIndInBatch % senders.length;
//     var nonce = parseInt(batchInd * oneBatch / senders.length) + parseInt(txIndInBatch / senders.length);
    
//     var privateKey = senders[senderInd][1];
//     var txObj = {
//         to: '0x2c7536E3605D9C16a7a3D7b1898e529396a65c23',
//         value: '1',
//         gas: 30000,
//         nonce: 0
//     };
//     txObj.nonce = nonce;

//     web3.eth.accounts.signTransaction(txObj , privateKey).then(data=>{
        
//         // tmpArr[batchInd].push(senderInd + " " + nonce);
//         var rawTx = data.rawTransaction;
//         encodedTxs[batchInd].push(rawTx);
//         if(encodedTxs[batchInd].length == oneBatch){
//             console.log("write batchInd", batchInd);
//             var toWrite = encodedTxs[batchInd].join('\n');
//             fs.writeFileSync("./temp/"+batchInd, toWrite);
//             // fs.writeFileSync("./temp/"+batchInd+".tmp", tmpArr[batchInd].join('\n'));
//         }
//         if(txIndInBatch + 1 < oneBatch)
//             signOne(batchInd, txIndInBatch + 1);
//     });
// }

// function signAllTx()
// {
//     for(var ind = 0; ind < batchCnt; ind++)
//     {
//         signOne(ind, 0);
//     }
// }




// console.log("encode!", "batchCnt", batchCnt);
// signAllTx();



