```bash
bash generate_Sender.sh # for once only
# or
bash node genSender.js # this is for newSender # in jsTx directory


-----------------------------
bash generate_Gen_Acc_Enode.sh

bash rCmd.sh copy

bash rCmd.sh init

bash rCmd.sh startNode

node encode.js # for once only # this requires geth running # in jsTx directory

bash rCmd.sh startCon 



bash rCmd.sh mine # this enables generating blocks
-----------------------------

bash rCmd.sh tx # this tests tx

-----------------------------


node monitor.js | tee rec/monitor.log

node intervalSend.js
# or
node fixedSend.js

# after all txs done
node genBlockHash.js

# after genBlockHash done

bash rCmd.sh stopMine # this stops generating blocks # this doesn't work for LPOA
# or
bash rCmd.sh fStop # this stops geth nodes

bash rCmd.sh cpLogs2Rec

node statistics | tee rec/statistics.log

node statistics_avgTxDelay.js | tee rec/statistics_avgTxDelay.log

mkdir exp/<xxx>/<id>

mv rec/* exp/<xxx>/<id>

```
