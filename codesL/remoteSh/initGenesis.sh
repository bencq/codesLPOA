curDir=$(cd `dirname $0`; pwd)
# echo ${curDir}
for((i=0;i<1;i++)); do
    cd $curDir
    cd ./node${i}
    if [ -d data/geth ]; then
    rm -rf data/geth/chaindata
    rm -rf data/geth/lightchaindata
    rm data/geth/transactions.rlp
    fi
    ./geth init --datadir data ./genesis.json
    
done
