curDir=$(cd `dirname $0`; pwd)
. ${curDir}/config.sh
ebs=""

# rm dir

if [ -f ${curDir}/../jsTx/senders.txt ]; then
    rm ${curDir}/../jsTx/senders.txt
    echo "rm senders.txt"
fi

# variables
i=0
nodeCnt=$(wc -l < ${curDir}/hostpw.txt)

# cd dir
cd ${curDir}/../node4

while read -r line;
do
    echo "$line"
    # get user & host & pswd
    user=$(echo ${line} | awk '{print $1}')
    host=$(echo ${line} | awk '{print $2}')
    pswd=$(echo ${line} | awk '{print $3}')


    # generate senders

    ret=$(yes "" | ./geth --datadir data account new)
    pStr="Public address of the key:   0x"
    subStr=${ret#*${pStr}}
    address=${subStr:0:40}

    echo "${i}-address: ${address}"

    privKey=$(node "${curDir}/../jsTx/getPrivKey.js" 0x${address})

    echo "private key: ${privKey}"

    echo "${address} ${privKey}" >> ${curDir}/../jsTx/senders.txt

    ((i++))
done < ${curDir}/hostpw.txt

# remove keyStore
if [ -d ${curDir}/../node4/data/keystore ]; then
    rm ${curDir}/../node4/data/keystore/*
    echo "rm keystore/*"
fi