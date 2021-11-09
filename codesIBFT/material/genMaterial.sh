num=${1}
PORT=${2}
echo "${num} ${PORT} ${1} ${2}"
curDir=$(cd `dirname $0`; pwd)
cd ${curDir}
./istanbul setup --num ${num} --nodes --quorum --save --verbose --nodePortBase ${PORT} | tee verbose.log
