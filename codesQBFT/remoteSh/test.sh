echo "${0}"
curDir=$(cd `dirname $0`; pwd)
. ${curDir}/config.sh
ebs=""

# cd ${curDir}/../

ret=$(node ${curDir}/../jsTx/test.js)
echo "${ret}"


# ubuntu 10.206.0.15 Ininin123
# ubuntu 10.206.0.8 Ininin123
