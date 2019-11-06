# 启动一条基于 EOS 的侧链

> 支持我们，请投票给 rex.m

## 当前信息

- EOSIO v1.8.5

- EOSIO.Contracts v1.8.0

## 参考

[EOSIO 主网启动流程](EOSIO-BIOS.md)

## 1. 启动 genesis node

- cleos wallet create_key 生产一个公私钥。

- 配置 genesis.json，修改 initial_timestamp，initial_key 是用上面生成的公钥。

```json
"initial_timestamp": "2019-11-01T08:08:08.888"  
"initial_key": "EOSxxxxxxxxxxxxxx"
```

- config.ini

```ini
http-server-address = 0.0.0.0:8888
p2p-listen-endpoint = 0.0.0.0:9876
enable-stale-production = true
producer-name = eosio
signature-provider = EOSxxxxxx=KEY:xxxxxx # 上面公私钥拼接
plugin = eosio::chain_api_plugin
plugin = eosio::producer_api_plugin
p2p-peer-address = xxx.22.22.222:9876  # BP 等的 p2p ip 端口
p2p-peer-address = xx.x.xx.x:9876
```

```bash
cd ~
rm -rf nodeos
mkdir nodeos
mkdir nodeos/config-dir
mkdir nodeos/data-dir
mkdir shell
cd nodeos/config-dir
# 把修改好的 config.ini genesis.json 放到 config-dir 文件夹下面
cd ~/shell
# 启动 nodeos
nohup nodeos --config-dir ~/nodeos/config-dir --data-dir ~/nodeos/data-dir --genesis-json ~/nodeos/config-dir/genesis.json > log-nodeos.log 2>&1 &
```

## 2. genesis node 加载系统合约

- 创建系统账号 eosio.token,eosio.msig,eosio.ram,eosio.ramfee,eosio.stake,eosio.bpay,eosio.vpay,eosio.wrap,eosio.bios,eosio.abp,eosio.saving,eosio.rex

如下命令：

```bash
cleos create account eosio eosio.token $pubkey $pubkey
```

- 激活 PREACTIVATE_FEATURE 特性，具体说明详见 eosio1.8.0 共识协议升级说明

```bash
curl -X POST http://127.0.0.1:8888/v1/producer/schedule_protocol_feature_activations -d '{"protocol_features_to_activate": ["0ec7e080177b2c02b278d5088611686b49d739925a92d9bfcacd7fc6b74053bd"]}' | jq
```

- 进入编译好的 contract 目录

```bash
# XXX 是 token 名字，数字是发行数量，create 是最大发行量，issue 目前发行量。因为有增发的存在，create 要大于 issue

cleos set contract eosio.token ./ eosio.token.wasm eosio.token.abi -p eosio.token@active
cleos push action eosio.token create '[ "eosio", "10000000000.0000 XXX"]' -p eosio.token@active
cleos push action eosio.token issue '[ "eosio", "1000000000.0000 XXX", "xxx" ]' -p eosio@active

cleos set contract eosio ./ eosio.system.wasm eosio.system.abi -p eosio@active
cleos push action eosio setpriv '["eosio", 1]' -p eosio@active
cleos push action eosio init '[0,"4,XXX"]' -p eosio@active
cleos push action eosio setramrate '[1024]' -p eosio@active

cleos set contract eosio.msig ./ eosio.msig.wasm eosio.msig.abi -p eosio.msig@active
cleos push action eosio setpriv '["eosio.msig", 1]' -p eosio@active

cleos set contract eosio.wrap ./ eosio.wrap.wasm eosio.wrap.abi -p eosio.wrap@active
cleos push action eosio setpriv '["eosio.wrap", 1]' -p eosio@active

cleos set contract eosio.bios ./ eosio.bios.wasm eosio.bios.abi -p eosio.bios@active
cleos push action eosio setpriv '["eosio.bios", 1]' -p eosio@active

#查看部署后 contract 的 code
cleos get code eosio.token
cleos get code eosio
cleos get code eosio.msig
cleos get code eosio.wrap
cleos get code eosio.bios
```

- Genesis nodo 对外公布节点地址, genesis.json, block.log（fullnode 需要），snapshot 文件（其他节点是用快照启动）

## 3. 启动 BP

- 使用 Genesis node 提供的 genesis.json 和 snapshot 快照启动 nodeos。

- 生成出块公私钥。

- config.ini 修改配置如下：

```ini
producer-name = xxxxxxxx  # BP名字
enable-stale-production = false
http-server-address = 0.0.0.0:8888
p2p-listen-endpoint = 0.0.0.0:9876
producer-name = xxxxxxxx  # BP名字
signature-provider = EOSxxxxxx=KEY:xxxxxx # BP的出块公私钥拼接  
#genesis node和其他 BP的ip端口  
p2p-peer-address = 111.11.11.111:9876  
p2p-peer-address = 222.22.22.222:9876  
```

- 配置修改好后使用快照启动 BP

```bash
nohup nodeos --config-dir ~/nodeos/config-dir --data-dir ~/nodeos/data-dir --snapshot  snapshotxxxx.bin > log-nodeos.log 2>&1 &
```

- 重复以上操作，启动全部 21 个 BP

## 4. BP 出快

- 为了安全起见创建 genessisuser 账号

```bash
cleos system newaccount eosio genessisuser EOSxxxx公钥 --stake-net "1 XXX" --stake-cpu "20 XXX" --buy-ram "1 XXX"

# token 全部转移到 genessisuser
cleos transfer eosio genessisuser "999999978.0000 XXX"
```

- 创建 BP 账号
- 生成 21 对密钥对供 21 个 BP account 使用

```
# BP 名字跟 BP congfig.ini 里面的一样，公钥是刚生成的密钥对的

cleos system newaccount genessisuser $BP $pubkey --stake-net "1 XXX" --stake-cpu "20 XXX" --buy-ram "1 XXX" -p genessisuser@active

# 转一些 token ，后面用来给 BP 自己抵押投票（全网抵押投票需要超过 150M）
cleos transfer genessisuser BP名字xxxx "10000000 XXX" " BP"
```

- 注册 BP

- regproducer，21 个 BP 全部注册

```
cleos system regproducer BP名字 EOSxxxc出块的公钥
```

- 抵押

- 21 个 BP 全部给自己抵押（全网抵押投票需要超过 150M）

```bash
cleos system delegatebw BP名字 BP名字 "0.000 XXX" "10000000.0000 XXX"
```

- 投票

- BP 给自己投票

```bash
cleos system voteproducer prods BP名字 BP名字

# 查看全局状态
# "total_activated_stake": "1500000000000"显示总数
cleos get table eosio eosio global

# 查看投票情况
cleos get table eosio eosio voters
```

- 当你的投票数超过 150M 时，你的节点 BP 将开始产生区块。