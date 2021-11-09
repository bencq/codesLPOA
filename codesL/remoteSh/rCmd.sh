#!/bin/bash
cmd=${1}
curDir=$(cd $(dirname $0); pwd)
. ${curDir}/config.sh
remoteDir=$(cat ${curDir}/remoteDir.txt)
echo $remoteDir

verbosity=${2}
if [ "${verbosity}" == "" ]; then
verbosity="3"
fi

i=0;
while read -r line;
do

    # get user & host & pswd
    user=$(echo ${line} | awk '{print $1}')
    host=$(echo ${line} | awk '{print $2}')
    pswd=$(echo ${line} | awk '{print $3}')

    userHost="${user}@${host}"

    echo "${i}: dealing "


    
    if [ "${cmd}" == "copy" ]; then 

        res=$(sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "test -d ${remoteDir}/node0 && echo 1 || echo 0")

        if [ "${res}" == "0" ]; then 
            sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "mkdir -p ${remoteDir}"
            sshpass -p "${pswd}" scp -rp ${curDir}/../node4 ${userHost}:${remoteDir}/node0
            sshpass -p "${pswd}" scp ${curDir}/accs/${i}-* ${userHost}:${remoteDir}/node0/data/keystore
            sshpass -p "${pswd}" scp ${curDir}/enodes/${i}-* ${userHost}:${remoteDir}/node0/data/geth/nodekey
            sshpass -p "${pswd}" scp ${curDir}/../node4/data/static-nodes.json ${userHost}:${remoteDir}/node0/data/
            sshpass -p "${pswd}" scp -r ${curDir}/initGenesis.sh ${userHost}:${remoteDir}/
        else
            echo "existed"
        fi

    elif [ "${cmd}" == "cp2Codes" ]; then

        rm ${curDir}/../../codes/remoteSh/accs/*
        cp ${curDir}/accs/* ${curDir}/../../codes/remoteSh/accs/

        rm ${curDir}/../../codes/remoteSh/enodes/*
        cp ${curDir}/enodes/* ${curDir}/../../codes/remoteSh/enodes/

        rm ${curDir}/../../codes/jsTx/temp/*
        cp ${curDir}/../jsTx/temp/* ${curDir}/../../codes/jsTx/temp/

        cp ${curDir}/../node4/data/static-nodes.json ${curDir}/../../codes/node4/data/static-nodes.json

        cp ${curDir}/../node4/genesis.json ${curDir}/../../codes/node4/genesis.json

        break

    elif [ "${cmd}" == "cpLogs2Rec" ]; then
        sshpass -p "${pswd}" scp ${userHost}:${remoteDir}/node0/test${i}.log ${curDir}/../jsTx/rec/

    elif [ "${cmd}" == "cpData2Rec" ]; then
        sshpass -p "${pswd}" scp -r ${userHost}:${remoteDir}/node0/data/geth/ ${curDir}/../jsTx/rec/node${i}/

    elif [ "${cmd}" == "delete" ]; then

        res=$(sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "test -d ${remoteDir} && echo 1 || echo 0")

        if [ "${res}" == "1" ]; then 
            sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "rm -r ${remoteDir}"
        else
            echo "not exists"
        fi

    elif [ "${cmd}" == "install" ]; then
        
        sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "sudo apt install -y sshpass"

    elif [ "${cmd}" == "init" ]; then
        sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "cd ${remoteDir} && bash ./initGenesis.sh"
    
    elif [ "${cmd}" == "startNode" ]; then
        sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "tmux new -s nodeL -d"
        sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "tmux send-keys -t nodeL 'cd ${remoteDir}/node0' C-m"
        sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "tmux send-keys -t nodeL './geth --datadir data --port ${PORT} --nodiscover --syncmode full --networkid 666666 --ws --ws.addr 0.0.0.0 --ws.api web3,eth --ws.origins \"*\" --allow-insecure-unlock --verbosity ${verbosity} --endpoints \"${endpoints}\" --endpointIndex ${i} --etherbases \"${etherbases}\" --overtime ${overtime} &>test${i}.log' C-m"

    elif [ "${cmd}" == "startCon" ]; then

        sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "tmux new -s conL -d"
        sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "tmux send-keys -t conL 'cd ${remoteDir}/node0' C-m"
        sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "tmux send-keys -t conL './geth --datadir data attach' C-m"

    elif [ "${cmd}" == "sRestart" ]; then

        sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "tmux send-keys -t nodeL 'C-c'"

        sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "tmux new -s nodeL -d"
        sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "tmux send-keys -t nodeL 'cd ${remoteDir}/node0' C-m"
        sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "tmux send-keys -t nodeL './geth --datadir data --port ${PORT} --nodiscover --syncmode full --networkid 666666 --ws --ws.addr 0.0.0.0 --ws.api web3,eth --ws.origins \"*\" --allow-insecure-unlock --verbosity ${verbosity} --endpoints \"${endpoints}\" --endpointIndex ${i} --etherbases \"${etherbases}\" --overtime ${overtime} &>test${i}.log' C-m"
        break

    elif [ "${cmd}" == "stop" ]; then
        sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "tmux send-keys -t nodeL 'C-c'"
        sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "tmux send-keys -t conL 'exit' C-m"
    
    elif [ "${cmd}" == "fStop" ]; then
        sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "for((ind=0;ind<10;ind++)); do tmux send-keys -t nodeL 'C-c'; done;"
        sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "tmux send-keys -t conL 'exit' C-m"
        

    elif [ "${cmd}" == "mine" ]; then
        sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "tmux new -s conL -d"
        sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "tmux send-keys -t conL 'personal.unlockAccount(eth.coinbase, \"\", 0)' C-m"
        sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "tmux send-keys -t conL 'miner.start()' C-m"

    elif [ "${cmd}" == "stopMine" ]; then
        sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "tmux new -s con -d"
        sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "tmux send-keys -t con 'miner.stop()' C-m"

    elif [ "${cmd}" == "sMine" ]; then

        sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "tmux new -s conL -d"
        sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "tmux send-keys -t conL 'personal.unlockAccount(eth.coinbase, \"\", 0)' C-m"
        sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "tmux send-keys -t conL 'miner.start()' C-m"
        break

    elif [ "${cmd}" == "tx" ]; then
        sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "tmux new -s conL -d"
        sshpass -p "${pswd}" ssh -n -o StrictHostKeyChecking=no ${userHost} "tmux send-keys -t conL 'personal.sendTransaction({from: eth.coinbase, to:eth.coinbase, value:100}, \"\")' C-m"

    else
        echo "cmd supported: \"copy\", \"\""
    fi

    ((i++))

done < ${curDir}/hostpw.txt
