# shell cmds
./geth --datadir data --port 40303 --nodiscover --networkid 666667
./geth --datadir data --port 40304 --nodiscover --networkid 666667
./geth --datadir data --port 40305 --nodiscover --networkid 666667
./geth --datadir data --port 40306 --nodiscover --networkid 666667
./geth --datadir data attach
"enode://90f75beabfa9dd0dd6bd78ace55fbae746d5ebc33811ea9e94b2d7d911b74d3cc3abbb43b8307fb9c1ea292e5fd329c0615979e261874748e1e03ef7debac160@127.0.0.1:40303"
"enode://3c7703d518caa9b615768716cab8db615ec4c6fa0d80db56a0b360a976c9b66dd502770855e00b3a73d1652485f6ba6b0482e9788d921308bc99a9b71e2b4939@127.0.0.1:40304"
"enode://8310412154e12d6891ea1ceb0876e32f5a0a946e9734df4b6266cb5843005a0a8ee3091254ab4e14da5b617ac0bd07c206162bea5e40f8c217f0d6de1b2b82b0@127.0.0.1:40305"
"enode://be00c3ff6a88c73e0caf124f73c7dc6e1860bef474bce8f5621ab04ef2f1e256a03fce60f0e5e05526c9f4496951281251f94c01c23a1f9ddaadace68899585e@127.0.0.1:40306"

# accounts
84a067ec0e62359f0cf4eae1746f75d874f74104, ae59addd2339b3752ca6af82fb2571b3e418f90c, 33dc99a9c580d631e7503b5893c518104b91dd7e, 535ff3ab4513d8e940686caa817f6b04c8173638,

# geth console cmds
personal.unlockAccount(eth.coinbase, "", 0)
miner.start()

personal.sendTransaction({from: eth.coinbase, to:eth.coinbase, value:100}, "")

miner.stop()


