const path = require('path');
const keythereum = require('keythereum');

var args = process.argv.slice(2);
if(args.length == 0)
    return -1;



var datadir = path.join(__dirname, "..", "node4", "data");
var address = args[0];
var keyObject = keythereum.importFromFile(address, datadir);
var password = Buffer.alloc(0);
var privateKey = keythereum.recover(password, keyObject);
console.log(privateKey.toString('hex'));

// var hostpwFile = path.join(__dirname, "..", "remoteSh", "hostpw.txt");

// var data = fs.readFileSync(hostpwFile, 'utf8');
// lines = data.split('\n');
// lines.forEach((str, ind, arr)=>{arr[ind] = arr[ind].split(' ');});





// const Web3 = require('web3');
// var ws = 'ws://' + lines[1][1] + ':8546';
// console.log(ws);
// var web3 = new Web3(ws); //|| 'ws://some.local-or-remote.node:8546'

// var subscription = web3.eth.subscribe('newBlockHeaders', function(error, result){
//     if (error)
//         console.error(error);
// })
// .on("data", function(blockHeader){
//     console.log(blockHeader.gasUsed);
// });
