# codesLPOA
All codes used in LPOA performance test, including POA/LPOA/quorum-ibft/quorum-qbft/quorum-raft

## Main directories
`codesL` directory is the deployment and testing code for LPOA.

`codesL/node4` directory contains:

- `geth`. The LPOA ethereum binary

- `genesis.json`. The genesis block configuration file used

- `genesisB.json`. The base of block configuration file used to generete previous "genesis.json"

`codesL/remoteSh` directory contains:

- `hostpw.txt`. This file is the ubuntu user login information of the machines used. Each line is composed of 3 items: username, IP address and password, which are seperated by commas.

- `rCmd.sh`. The commands used to control remote and local machines to make LPOA works in a multi-machine network.


`codesL/jsTx` directory contains:

- `config.js`. The configuration file for encoding, sending transactions.

- `fixedSend.js`. The sending program for 'f-stress'.

- `intervalSend.js`. The sending program for 'i-stress'.

- `monitor.js`. The logging program to collect block info by subscribing block headers.

- `statistics.js`. The program to generate statistics based on collected info

- `statistics_avgTxDelay.js`. The program to calculate latency based on collected info

## How to use

*Note that one node is one mahcine and vice versa.*

---

First, set up machines for nodes and fill in `hostpw.txt`.

---

Then run

```bash
# codesL/remoteSh
bash generate_Sender.sh
```
This generates accounts for sending transactions.

---

Next, run

```bash
# codesL/remoteSh
bash generate_Gen_Acc_Enode_Config.sh
```

This generates `genesis.json`, `config.sh`, `static-nodes.json` and `etherbases`

---

Next, run

```bash
# codesL/remoteSh
bash rCmd.sh copy
```

This copies files from the local machine to the other machines. The destination path is defined in `remoteDir.txt`.

---

Next, run

```bash
# codesL/remoteSh
bash rCmd.sh init
```

This initializes all the nodes based on `genesis.json`

---

Next, run

```bash
# codesL/remoteSh
bash rCmd.sh startNode
bash rCmd.sh startCon
```

The two commands start each LPOA geth node and its console.

---

After the local node starts, run

```bash
# codesL/jsTx
node encode.js
```

This encodes transactions according to `config.js` and the encoded transactions are stored in `jsTx/temp`. This may take some time according to the `txCnt` in `config.js`.

---

Last, run

```bash
# codesL/remoteSh
bash rCmd.sh mine
```

This make the nodes begin to generate new blocks.

---

Now, the sending program can be run.

```bash
# codesL/jsTx
node monitor.js | tee rec/monitor.log # this starts the monitor program to collect block info.

node intervalSend.js # i-stress
# or
node fixedSend.js # f-stress
```

The sending program sends all encoded transactions to the nodes. The sending procedure won't quit automatically after all the transactions are done and needs manual `Ctrl-C`.

---

finally, to get statistical results, run

```bash
# codesL/remoteSh
bash rCmd cpLogs2Rec # this copies all the remote LPOA geth logs to the local machine
# codesL/jsTx
node genBlockHash.js # get blocks info
node statistics.js | tee rec/statistics.log # calculate TPS、block forking rate, etc.
node statistics_avgTxDelay.js | tee rec/statistics_avgTxDelay.log # calcualte latency.
```

The results are recorded in `rec/statistics.log` and `rec/statistics_avgTxDelay.log`.


