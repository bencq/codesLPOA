curDir=$(cd `dirname $0`; pwd)
# echo ${curDir}
ebs=""
for((i=0;i<4;i++)); do
    cd $curDir
    if [ ! -d node${i} ]; then
        return -1
    fi
    cd ./node${i}
    aclist=`./geth --datadir data account list`
    str='Account #0: {'
    cmd="expr index '"${aclist}"' '${str}'"
    ind=`eval ${cmd}`
    len=`expr length "${str}"`
    eb=`expr substr "${aclist}" $((ind+len)) 40`
    echo "this is ${i}"
    echo ${eb}
    ebs="${ebs}${eb}, "
    
done
echo "${ebs}"