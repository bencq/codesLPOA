curDir=$(cd `dirname $0`; pwd)
# echo ${curDir}
ebs=""
for((i=0;i<4;i++)); do
    cd $curDir
    cd ./node${i}
    
    ./geth init --datadir data ./genesis.json
    yes "" | ./geth --datadir data account new
    aclist=`./geth --datadir data account list`
    str='Account #0: {'
    cmd="expr index '"${aclist}"' '${str}'"
    ind=`eval ${cmd}`
    len=`expr length "${str}"`
    eb=`expr substr "${aclist}" $((ind+len)) 40`
    echo "address: ${eb}"
    ebs="${ebs}${eb}, "
    
done
echo "${ebs}"