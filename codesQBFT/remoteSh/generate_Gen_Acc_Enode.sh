curDir=$(cd `dirname $0`; pwd)
. ${curDir}/config.sh

# rm dir
if [ -f ${curDir}/../node4/data/static-nodes.json ]; then
    rm ${curDir}/../node4/data/static-nodes.json
    echo "rm static-nodes.json"
fi

if [ -d ${curDir}/accs ]; then
    rm ${curDir}/accs/*
    echo "rm accs"
fi
if [ -d ${curDir}/enodes ]; then
    rm ${curDir}/enodes/*
    echo "rm enodes"
fi

if [ -d ${curDir}/../node4/data/keystore ]; then
    rm ${curDir}/../node4/data/keystore/*
    echo "rm keystore/*"
fi


# mkdir
mkdir -p ${curDir}/accs
mkdir -p ${curDir}/enodes

# variables
i=0
nodeCnt=$(wc -l < ${curDir}/hostpw.txt)
echo "nodeCnt: ${nodeCnt}"

# genMaterial.sh
cd ${curDir}/../material/
bash genMaterial.sh ${nodeCnt} ${PORT} >> /dev/null
jq '.maxGasLimit="0x9900000000000" | .gasLimit="1680000000" | .difficulty="0x1" | .config.chainId='"${NETWORKID}" genesis.json > ../node4/genesisB.json

# mvdir
cd ${curDir}/../node4

# head
echo "[" >> ${curDir}/../node4/data/static-nodes.json

# genesis.json
allocAddObj='{"2c7536E3605D9C16a7a3D7b1898e529396a65c23":{"balance": "0x200000000000000000000000000000000000000000000000000000000000000"}}'




# cat ${curDir}/hostpw.txt | while read line;
while read -r line;
do
    echo "$line"
    # get user & host & pswd
    user=$(echo ${line} | awk '{print $1}')
    host=$(echo ${line} | awk '{print $2}')
    pswd=$(echo ${line} | awk '{print $3}')


    # generate accs

    ret=$(yes "" | ./geth --datadir data account new)

    # below are old code

    # aclist=`./geth --datadir data account list`
    # str='Account #0: {'
    # cmd="expr index '"${aclist}"' '${str}'"
    # ind=`eval ${cmd}`
    # len=`expr length "${str}"`
    # eb=`expr substr "${aclist}" $((ind+len)) 40`

    pStr="Public address of the key:   0x"
    subStr=${ret#*${pStr}}
    eb=${subStr:0:40}

    echo "${i}-eb: ${eb}"
    mv ./data/keystore/UTC* ${curDir}/accs/${i}-${eb}

    # append to obj
    allocAddObj=$(echo ${allocAddObj} | jq ".+={\"${eb}\":{\"balance\":\"0x200000000000000000000000000000000000000000000000000000000000000\"}}")


    # generate enodes

    nodeKeyPbk=$(./bootnode -nodekey ../material/${i}/nodekey -writeaddress)
    cp ../material/${i}/nodekey ${curDir}/enodes/${i}-${nodeKeyPbk}

    # generate static-nodes.json
    echo -n "\"enode://${nodeKeyPbk}@${host}:${PORT}?discport=0\"" >> data/static-nodes.json
    if [ ${i} -lt $((nodeCnt-1)) ]; then
        echo "," >> data/static-nodes.json
    else
        echo "" >> data/static-nodes.json
    fi

    ((i++))
done < ${curDir}/hostpw.txt



echo "]" >> ${curDir}/../node4/data/static-nodes.json


# generate genesis.json


echo "${allocAddObj}"
echo ""

jq ".alloc+=${allocAddObj}" genesisB.json > genesis.json