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
    var options = {
        timeout: 60 * 1000, // ms
    
        // Useful for credentialed urls, e.g: ws://username:password@localhost:8546
    
        clientConfig: {
          // Useful if requests are large
          maxReceivedFrameSize: 10 * 1024 * 1024,   // bytes - default: 1MiB
          maxReceivedMessageSize: 10 * 1024 * 1024, // bytes - default: 8MiB
    
          // Useful to keep a connection alive
          keepalive: true,
          keepaliveInterval: 60000 // ms
        },
    
        // Enable auto reconnection
        reconnect: {
            auto: true,
            delay: 5000, // ms
            maxAttempts: 5,
            onTimeout: false
        }
    };
    var web3 = new Web3(ws, options);

    web3s.push(web3);
}
console.log("web3s.length", web3s.length);
var remoteDir = fs.readFileSync(path.resolve(__dirname, "..", "remoteSh", "remoteDir.txt")).toString();
var ipcPath = path.resolve(remoteDir, "node0", "data", "geth.ipc");
console.log("ipcPath", ipcPath)
web3s = [new Web3(ipcPath, net)];


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
    return [firstNotZeroHeight, lastNotZeroHeight, stTime * 1000, edTime * 1000];
}




var func = async ()=>{
    let res = parseMonitorLog();
    [firstNotZeroHeight, lastNotZeroHeight, stTime, edTime] = res;
    console.log("firstNotZeroHeight", firstNotZeroHeight, "lastNotZeroHeight", lastNotZeroHeight,);
    console.log("stTime", new Date(stTime), "edTime", new Date(edTime), "duration(ms)", edTime - stTime);
    let validBlockCnt = lastNotZeroHeight - firstNotZeroHeight + 1;
    let validDuration = edTime - stTime;

    //clear old file
    fs.writeFileSync(path.resolve(__dirname, "rec", "blockHash.log"), "");
    
    let f_queue_block = async (queueArr_block) =>
    {
        let cntIndex = 0;
        let res = null;
        for(let promise of queueArr_block)
        {
            res = await promise.then((data)=>
            {
                console.log("bNum done", cntIndex);
                let ts = data.timestamp;
                let blockHash = data.hash;
                let txHashs = data.transactions;

                let blockTs = [];

                for(let ind = 0; ind < txHashs.length; ind++)
                {
                    blockTs.push([blockHash, txHashs[ind]]);
                }
                fs.appendFileSync(path.resolve(__dirname, "rec", "blockHash.log"), blockTs.join("\n"));
            }).catch(data=>{
                console.error(data);
            })
            console.log("bNum dd", cntIndex);
            cntIndex++;
        }
        return res;
    }
    let queueArr_block = [];
    for(let bNum = firstNotZeroHeight; bNum <= lastNotZeroHeight; bNum++)
    {
        queueArr_block.push(
            web3s[0].eth.getBlock(bNum, false)
        );
    }
    f_queue_block(queueArr_block).then((data)=>{
        console.log(data);
    });


}
func();
