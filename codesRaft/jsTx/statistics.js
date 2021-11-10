const path = require('path');
const net = require('net');
const Web3 = require('web3');
const fs = require('fs');
const config = require('./config');


var hostpwFile = path.join(__dirname, "..", "remoteSh", "hostpw.txt");
var data = fs.readFileSync(hostpwFile, 'utf8');
var lines = data.split('\n');
lines.forEach((str, ind, arr)=>{arr[ind] = arr[ind].split(' ');});

var web3s = [];
for(var ind in lines)
{
    if(lines[ind].length != 3)
        continue;
    var ws = 'ws://' + lines[ind][1] + ':8546';
    var web3 = new Web3(ws);
    web3s.push(web3);
}
console.log("web3s.length", web3s.length);


var parseMonitorLog = ()=>{
    let monitorLogFile = path.resolve(__dirname, "rec", "monitor.log")
    let data = fs.readFileSync(monitorLogFile).toString();
    let lines = data.split('\n');

    let firstNotZeroHeight = -1;
    let lastNotZeroHeight = -1;
    let stTime = -1;
    let edTime = -1;

    for(let ind in lines)
    {
        if(lines[ind] == "")
            continue;
        let items = lines[ind].split(' ');
        if(items.length != 4)
            continue;
        let blockNumber = parseInt(items[0]);
        let blockTxCnt = parseInt(items[1]);
        let hash = items[2];
        let timestamp = parseInt(items[3]);
        if(blockTxCnt > 0)
        {
            if(stTime == -1)
                stTime = timestamp;
            edTime = Math.max(edTime, timestamp);

            if(firstNotZeroHeight == -1)
                firstNotZeroHeight = blockNumber;
            lastNotZeroHeight = Math.max(lastNotZeroHeight, blockNumber);
            
        }
    }
    // let validBlockCnt = lastNotZeroHeight - firstNotZeroHeight + 1;
    return [firstNotZeroHeight, lastNotZeroHeight, stTime, edTime];
}



// var promises = [];
// for(let ind = 0; ind < web3s.length; ind++)
// {
//     promises.push(
//         web3s[ind].eth.getBlockNumber()
//     );
// }
// (async ()=>{
//     let heights = await Promise.all(promises)
//     console.log("heights", heights)
// })()
var PTN_SEND = /ERROR\[\S+\|\S+\] +bencq: Submitted transaction +ts=([0-9,]+) +hash=(0x[0-9a-fA-f]{64}) +from=(0x[0-9a-fA-f]{40}) +nonce=([0-9,]+) +recipient=(0x[0-9a-fA-f]{40}) +value=([0-9,]+)/;
var PTN_RECV = /ERROR\[\S+\|\S+\] +bencq: writeBlockWithState +ts=([0-9,]+) +blockNumber=([0-9,]+) +blockHash=(0x[0-9a-fA-f]{64})/
var func = ()=>{
    let res = parseMonitorLog();
    [firstNotZeroHeight, lastNotZeroHeight, stTime, edTime] = res;
    console.log("firstNotZeroHeight", firstNotZeroHeight, "lastNotZeroHeight", lastNotZeroHeight,);
    console.log("stTime", new Date(stTime), "edTime", new Date(edTime), "duration(ms)", edTime - stTime);
    let validBlockCnt = lastNotZeroHeight - firstNotZeroHeight + 1;
    let validDuration = edTime - stTime;
    let chainSideRates = [];
    let sendTxArr = [];
    let recvTxArr = [];
    let blockHash2RecvTs = new Map();
    for(let ind = 0; ind < web3s.length; ind++)
    {
        let logFile = path.resolve(__dirname, "rec", "test" + ind + ".log")
        let data = fs.readFileSync(logFile).toString();
        let lines = data.split('\n');
        console.log("lines.length", lines.length)
        let chainSideCnt = 0;
        let lastLineCnt = 0;
        for(let lInd in lines)
        {
            lastLineCnt = lInd;
            if(lines[lInd].includes("<-w.chainSideCh"))
                chainSideCnt++;
            
            {
                let res = null
                if((res = PTN_SEND.exec(lines[lInd])) != null)
                {
                    let sendTs = parseInt(res[1].replace(/,/g, ""));
                    let txHash = res[2];
                    sendTxArr.push([sendTs, txHash].join(','));
                }    
            }

            {
                let res = null
                if((res = PTN_RECV.exec(lines[lInd])) != null)
                {
                    let recvTs = parseInt(res[1].replace(/,/g, ""));
                    let blockHash = res[3];
                    if(blockHash2RecvTs.has(blockHash))
                    {
                        let prevRecvTs = blockHash2RecvTs.get(blockHash);
                        if(recvTs > prevRecvTs)
                        {
                            blockHash2RecvTs.set(blockHash, recvTs);
                        }
                    }
                    else
                    {
                        blockHash2RecvTs.set(blockHash, recvTs);
                    }
                }
            }
        }
        // chainSideRates.push(chainSideCnt / heights[ind])
        chainSideRates.push(chainSideCnt / validBlockCnt)
        console.log("sendTxArr.length", sendTxArr.length, "lastLineCnt", lastLineCnt)
    }

    {
        //deal with recvTsArr
        let blockHashFile = path.resolve(__dirname, "rec", "blockHash.log")
        let data = fs.readFileSync(blockHashFile).toString();
        let lines = data.split('\n');
    
        for(let ind in lines)
        {
            if(lines[ind] == "")
                continue;
            let items = lines[ind].split(',');
            if(items.length != 2)
                continue;
            let blockHash = items[0];
            let txHash = items[1];
            if(blockHash2RecvTs.has(blockHash))
            {
                let recvTs = blockHash2RecvTs.get(blockHash);
                recvTxArr.push([recvTs, txHash].join(','));
            }
            else
            {
                console.error("err blockHash in blockHash2RecvTs not found: ", blockHash)
            }
        }
        console.log("recvTxArr.length", recvTxArr.length)
    }

    {
        let toWrite = sendTxArr.join("\n");
        fs.writeFileSync(path.resolve(__dirname, "rec", "sendTs.log"), toWrite);
    }
    {
        let toWrite = recvTxArr.join("\n");
        fs.writeFileSync(path.resolve(__dirname, "rec", "recvTs.log"), toWrite);
    }

    console.log("chainSideRates", chainSideRates);
    console.log("avg chainSideRate", ((chainSideRates)=>{
        let sum = 0;
        for(value of chainSideRates)
        {
            sum += value;
        }
        let avg = sum / chainSideRates.length;
        return avg;
    })(chainSideRates));
    console.log("tps", ((validDuration)=>{
        let tps = recvTxArr.length / (validDuration / 1000.0);
        return tps;
    })(validDuration));
}
func();
