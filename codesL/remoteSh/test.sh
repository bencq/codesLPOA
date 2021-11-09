curDir=$(cd `dirname ${0}`; pwd;)
cmd=${1}
cd ${curDir}
# . config.sh
# echo "${PORT}"
# pswd="bencq"
# host="bencq@172.18.197.97"
# sshpass -p "${pswd}" ssh ${host} "tmux new -s con -d"

#!/bin/bash

. ${curDir}/config.sh
remoteDir=$(cat ${curDir}/remoteDir.txt)
echo $remoteDir
i=0;
while read -r line;
do
    if [ 1 ]; then
        if [ ! 2 ]; then
            echo "12"
        else
            echo "1-2"
        fi
    else
        echo "-1-2"
    fi
    

done < ${curDir}/hostpw.txt
