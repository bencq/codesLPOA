const path = require('path');
const net = require('net');
const Web3 = require('web3');
const fs = require('fs');
const config = require('./config');



var txCnt = config.txCnt;
var oneBatch = config.oneBatch;
var batchCnt = parseInt(txCnt / oneBatch);



// var senderArr;
// var parseSenders = ()=>{
//     var senders = fs.readFileSync(path.join(__dirname, "senders.txt")).toString().split('\n');
//     senders.forEach((str, ind, arr)=>{arr[ind] = arr[ind].split(' ');});
//     if(senders.length > 0 && senders[senders.length - 1].length != 2)
//     {
//         senders.pop();
//     }
//     console.log(senders);
//     senderArr = senders;

// }

var recvArr = [];
var parseRecvTsLog = ()=>{
    let recvTsLogFile = path.resolve(__dirname, "rec", "recvTs.log")
    let data = fs.readFileSync(recvTsLogFile).toString();
    let lines = data.split('\n');

    for(let ind in lines)
    {
        if(lines[ind] == "")
            continue;
        let items = lines[ind].split(',');
        if(items.length != 2)
            continue;
        let recvTs = parseInt(items[0]); // unit: second
        let txHash = items[1];
        recvArr.push([recvTs, txHash]);
    }
};

var sendArr = [];
var parseSendTsLog = ()=>{
    let sendTsLogFile = path.resolve(__dirname, "rec", "sendTs.log")
    let data = fs.readFileSync(sendTsLogFile).toString();
    let lines = data.split('\n');

    for(let ind in lines)
    {
        if(lines[ind] == "")
            continue;
        let items = lines[ind].split(',');
        if(items.length != 2)
            continue;
        let sendTs = parseInt(items[0]); // unit: millisecond
        let txHash = items[1];
        sendArr.push([sendTs, txHash]);
    }
};

var txDelayArr = [];
var analysis = ()=>{
    let txHash2SendTs = new Map();
    for(let ind = 0; ind < sendArr.length; ind++)
    {
        let [sendTs, txHash] = sendArr[ind];
        txHash2SendTs.set(txHash, sendTs);
    }

    
    for(let ind = 0; ind < recvArr.length; ind++)
    {
        let [recvTs, txHash] = recvArr[ind];
        if(txHash2SendTs.has(txHash))
        {
            let sendTs = txHash2SendTs.get(txHash);
            let txDelay = (recvTs - sendTs) / (1000 * 1000);
            if(txDelay < 0)
            {
                console.log('err txHash txDelay < 0', txHash);
            }
            txDelayArr.push(txDelay);
        }
        else
        {
            console.error("err txHash not exists in sendArr", txHash);
        }
    }

    let sumDelay = 0;
    let maxDelay = 0;
    let minDelay = Infinity;
    for(let txDelay of txDelayArr)
    {
        sumDelay += txDelay;
        maxDelay = Math.max(maxDelay, txDelay);
        minDelay = Math.min(minDelay, txDelay);
    }
    let avgTxDelay = sumDelay / txDelayArr.length;
    console.log("txDelayArr length:", txDelayArr.length);
    console.log("avg txDelay(ms):", avgTxDelay, "maxDelay:", maxDelay, "minDelay:", minDelay);
    
};


parseRecvTsLog();
parseSendTsLog();
analysis();

