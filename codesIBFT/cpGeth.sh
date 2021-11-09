curDir=$(cd `dirname $0`; pwd)
# echo ${curDir}
for((i=0;i<5;i++)); do
    cd $curDir
    if [ ! -d node${i} ]; then
        mkdir -p node${i}
    fi
    cd ./node${i}
    cp /home/bencq/source_code/LPOA/build/bin/gethOri ./geth
    
done
