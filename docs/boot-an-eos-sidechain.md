# 启动一条基于 EOS 的侧链

> 支持我们，请投票给 rex.m

## 当前信息

- EOSIO v1.8.5

- EOSIO.Contracts v1.8.0

## 1、启动genesis node
- cleos wallet create_key 生产一个公私钥。
- 配置genesis.json,修改initial_timestamp，initial_key是用上面生成的公钥。

>"initial_timestamp": "2019-11-01T08:08:08.888"  
>"initial_key": "EOSxxxxxxxxxxxxxx"

- config.ini  
 
> http-server-address = 0.0.0.0:8888  
> p2p-listen-endpoint = 0.0.0.0:9876  
> enable-stale-production = true  
> producer-name = eosio 
> signature-provider = EOSxxxxxx=KEY:xxxxxx # 上面公私钥拼接  
> plugin = eosio::chain_api_plugin  
> plugin = eosio::producer_api_plugin  
> p2p-peer-address = xxx.22.22.222:9876  #bp等的p2pip端口  
> p2p-peer-address = xx.x.xx.x:9876

```
cd ~
rm -rf nodeos
mkdir nodeos
mkdir nodeos/config-dir
mkdir nodeos/data-dir
mkdir shell
cd nodeos/config-dir
#把修改好的config.ini genesis.json 放到config-dir文件夹下面
cd ~/shell
#启动nodeos
nohup nodeos --config-dir ~/nodeos/config-dir --data-dir ~/nodeos/data-dir --genesis-json ~/nodeos/config-dir/genesis.json > log-nodeos.log 2>&1 &
```

## 2、genesis node加载系统合约

- 创建系统账号eosio.token,eosio.msig,eosio.ram,eosio.ramfee,eosio.stake,eosio.bpay,eosio.vpay,eosio.wrap,eosio.bios,eosio.abp,eosio.saving,eosio.rex 
  > 如下命令：  
  > cleos create account eosio eosio.token EOS公钥 EOS公钥

- 激活PREACTIVATE_FEATURE特性，具体说明详见eosio1.8.0共识协议升级说明
 ```
 curl -X POST http://127.0.0.1:8888/v1/producer/schedule_protocol_feature_activations -d '{"protocol_features_to_activate": ["0ec7e080177b2c02b278d5088611686b49d739925a92d9bfcacd7fc6b74053bd"]}' | jq
 ```
- 进入编译好的contract目录  
```
# XXX是token名字,数字是发行数量,create是最大发行量,issue目前发行量。因为有增发的存在，create要大于issue
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

#查看部署后contract的code
cleos get code eosio.token
cleos get code eosio
cleos get code eosio.msig
cleos get code eosio.wrap
cleos get code eosio.bios
```

- Genesis nodo对外公布节点地址, genesis.json, block.log(fullnode需要）,snapshot文件(是用快照启动其他节点)  

## 3、启动BP

- 使用Genesis nodo提供的genesis.json和snapshot快照启动nodeos。
- 生成出块公私钥。
- config.ini修改配置如下:  

> producer-name = xxxxxxxx  # bp名字
> enable-stale-production = false  
> http-server-address = 0.0.0.0:8888  
> p2p-listen-endpoint = 0.0.0.0:9876  
> producer-name = xxxxxxxx  # bp名字
> signature-provider = EOSxxxxxx=KEY:xxxxxx #bp的出块公私钥拼接  
> #genesis node和其他bp的ip端口  
> p2p-peer-address = 111.11.11.111:9876  
> p2p-peer-address = 222.22.22.222:9876  

- 配置修改好后使用快照启动bp  

```
nohup nodeos --config-dir ~/nodeos/config-dir --data-dir ~/nodeos/data-dir --snapshot  snapshotxxxx.bin > log-nodeos.log 2>&1 &
```

- 重复以上操作，启动全部21个BP  

## 4、BP出快

- 为了安全起见创建genessisuser账号

```
cleos system newaccount eosio genessisuser EOSxxxx公钥  --stake-net "1 XXX" --stake-cpu "20 XXX" --buy-ram "1 XXX"

#token 全部转移到genessisuser 
cleos transfer eosio genessisuser "999999978.0000 XXX"
```

- 创建BP账号
- 生成21对秘钥对供21个BP account使用
```
# bp名字跟bp congfig.ini里面的一样，公钥是刚生成的密钥对的

cleos system newaccount genessisuser bp名字 EOSxxx公钥 --stake-net "1 XXX" --stake-cpu "20 XXX" --buy-ram "1 XXX" -p genessisuser@active

# 转一些token ，后面用来给bp自己抵押投票（全网抵押投票需要超过150M）
cleos transfer genessisuser bp名字xxxx "10000000 XXX" "bp"
```

- 注册BP  
- regproducer,21个bp全部注册

```
cleos system  regproducer bp名字 EOSxxxc出块的公钥
```
>
- 抵押
- 21个bp全部给自己抵押（全网抵押投票需要超过150M）

```
cleos system delegatebw  bp名字  bp名字 "0.000 XXX" "10000000.0000 XXX"
```

- 投票
- BP给自己投票

```
cleos system voteproducer prods bp名字  bp名字

#查看全局状态
#"total_activated_stake": "1500000000000"显示总数
cleos get table eosio eosio global

#查看投票情况
cleos get table eosio eosio voters
```

- 当你的投票数超过150M时，你的节点BP将开始产生区块。