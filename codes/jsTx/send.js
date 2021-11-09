const path = require('path');
const net = require('net');
const Web3 = require('web3');
const fs = require('fs');
const config = require('./config');

var hostpwFile = path.join(__dirname, "..", "remoteSh", "hostpw.txt");
var data = fs.readFileSync(hostpwFile, 'utf8');
lines = data.split('\n');
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




const privateKey = "0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318";

//aa = web3.eth.accounts.privateKeyToAccount(privateKey);
//console.log(aa);


var encodedTxs = [];
var txCnt = config.txCnt;
var oneBatch = config.oneBatch;
var batchCnt = txCnt / oneBatch;
var period = config.period;


var totalSend = 0;
var totalReceive = 0;
var preTotalReceive = 0;





function sendOneBatch(batchInd) {    

    encodedTxs = fs.readFileSync("./temp/"+batchInd).toString().split("\n");
    
    for (i in encodedTxs) {
        if(encodedTxs[i]!="") {
            totalSend++;
            web3s[i%web3s.length].eth.sendSignedTransaction(encodedTxs[i]).then(data=>{
                console.log(totalReceive);
                totalReceive++;
                if(totalReceive >= (batchInd+1) * oneBatch)
                {
                    console.log("batchInd", batchInd, "remain", totalSend-totalReceive, "s", totalSend, "r", totalReceive);
                    if((batchInd+1) < batchCnt)
                    {
                        sendOneBatch(batchInd+1);
                    }
                }
            });
        }
    }
}

function fasong() {
    sendOneBatch(0);
}
fasong();
fs.writeFileSync("./rec/tps.txt", '', {flag: 'w'});
function calTps()
{
    var tps = (totalReceive - preTotalReceive) / config.period;
    preTotalReceive = totalReceive;
    var data = new Date() + " " + tps + "\n";
    fs.writeFileSync("./rec/tps.txt", data, {flag: 'a'});
}
setInterval(calTps, period * 1000);



// const path = require('path');
// const net = require('net');
// const Web3 = require('web3');
// const fs = require('fs');
// const config = require('./config');

// var hostpwFile = path.join(__dirname, "..", "remoteSh", "hostpw.txt");
// var data = fs.readFileSync(hostpwFile, 'utf8');
// lines = data.split('\n');
// lines.forEach((str, ind, arr)=>{arr[ind] = arr[ind].split(' ');});



// var web3s = [];
// for(var ind in lines)
// {
//     if(lines[ind].length != 3)
//         continue;
//     var ws = 'ws://' + lines[ind][1] + ':8546';
//     var web3 = new Web3(ws);
//     web3s.push(web3);
// }
// console.log("web3s.length", web3s.length);




// const privateKey = "0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318";

// //aa = web3.eth.accounts.privateKeyToAccount(privateKey);
// //console.log(aa);


// var encodedTxs = [];
// var batchIndex = 0;
// var txCnt = config.txCnt;
// var oneBatch = config.oneBatch;
// var period = config.period;


// var totalSend = 0;
// var totalReceive = 0;
// var preTotalReceive = 0;





// function sendOneBatch() {
//     console.log("remain", totalSend-totalReceive, "s", totalSend, "r", totalReceive);

//     if(batchIndex>=txCnt/oneBatch)
//     {
//         console.log("over");
//         return ;
//     }
        

//     encodedTxs = fs.readFileSync("./temp/"+batchIndex).toString().split("\n");
    
//     for (i in encodedTxs) {
//         if(encodedTxs[i]!="") {
//             totalSend++;
//             web3s[i%web3s.length].eth.sendSignedTransaction(encodedTxs[i]).then(data=>{
                
//                 totalReceive++;
//             });
//         }
//     }
//     batchIndex++;
// }

// function fasong() {
//     for (let k=0;k<txCnt/oneBatch;k++)
//         sendOneBatch();
// }
// fasong();
// fs.writeFileSync("./rec/tps.txt", '', {flag: 'w'});
// function calTps()
// {
//     var tps = (totalReceive - preTotalReceive) / config.period;
//     preTotalReceive = totalReceive;
//     var data = new Date() + " " + tps + "\n";
//     fs.writeFileSync("./rec/tps.txt", data, {flag: 'a'});
// }
// setInterval(calTps, period * 1000);