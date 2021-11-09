curDir=$(cd `dirname $0`; pwd)
ebs=""

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

if [ -f ${curDir}/config.sh ]; then
    rm ${curDir}/config.sh
    echo "rm config.sh"
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
i2=0
nodeCnt=$(wc -l < ${curDir}/hostpw.txt)

# mvdir
cd ${curDir}/../node4

# head
echo "[" >> ${curDir}/../node4/data/static-nodes.json

# config.sh
PORT="30303"
EBPORT="40303"
endpoints=""
etherbases=""
overtime="8000"
echo "PORT=\"${PORT}\"" >> ${curDir}/config.sh
echo "EBPORT=\"${EBPORT}\"" >> ${curDir}/config.sh
echo "overtime=\"${overtime}\"" >> ${curDir}/config.sh

# genesis.json
allocAddObj="{}"
extraData="0x0000000000000000000000000000000000000000000000000000000000000000"

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
    pStr="Public address of the key:   0x"
    subStr=${ret#*${pStr}}
    eb=${subStr:0:40}

    echo "${i}-address: ${eb}"
    mv ./data/keystore/UTC* ${curDir}/accs/${i}-${eb}

    # append to obj
    allocAddObj=$(echo ${allocAddObj} | jq ".+={\"${eb}\":{\"balance\":\"0x200000000000000000000000000000000000000000000000000000000000000\"}}")
    extraData=${extraData}${eb}


    # generate enodes
    ./bootnode -genkey ./data/geth/nodekey
    nodeKeyPbk=$(./bootnode -nodekey ./data/geth/nodekey -writeaddress)
    mv ./data/geth/nodekey ${curDir}/enodes/${i}-${nodeKeyPbk}

    # generate config.sh
    endpoints=${endpoints}${host}":"${EBPORT}
    etherbases=${etherbases}"0x"${eb}

    # generate static-nodes.json
    echo -n "\"enode://${nodeKeyPbk}@${host}:${PORT}\"" >> data/static-nodes.json
    if [ ${i} -lt $((nodeCnt-1)) ]; then
        echo "," >> data/static-nodes.json
        endpoints=${endpoints}","
        etherbases=${etherbases}","
    else
        echo "" >> data/static-nodes.json
    fi

    ((i++))
done < ${curDir}/hostpw.txt


# while read -r line;
# do
#     echo "$line"

#     address=$(echo ${line} | awk '{print $1}')
#     privKey=$(echo ${line} | awk '{print $2}')

#     echo "${i2}-address: ${address}"

#     # append to obj
#     allocAddObj=$(echo ${allocAddObj} | jq ".+={\"${address}\":{\"balance\":\"0x200000000000000000000000000000000000000000000000000000000000000\"}}")

#     ((i2++))
# done < ${curDir}/../jsTx/senders.txt

echo "]" >> ${curDir}/../node4/data/static-nodes.json


# generate genesis.json

extraData=${extraData}"0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    echo "${allocAddObj}"
    echo ""
    echo "${extraData}"
jq ".alloc+=${allocAddObj}" genesisB.json | jq .extraData="\"${extraData}\"" > genesis.json

# generate config.sh
echo "endpoints=\"${endpoints}\"" >> ${curDir}/config.sh
echo "etherbases=\"${etherbases}\"" >> ${curDir}/config.sh
