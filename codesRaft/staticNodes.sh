curDir=$(cd `dirname $0`; pwd)
# echo ${curDir}
for((i=0;i<4;i++)); do
    cd $curDir
    if [ "${1}" == "copy" ]; then
    cp static-nodes.json  ./node${i}/data
    elif [ "${1}" == "remove" ]; then
    rm  ./node${i}/data/static-nodes.json
    else
    echo "error param, 'remove' and 'copy' accepted only"
    fi
    
done
