# EOSIO 找出谁为我质押

> 作者: UMU @ MEET.ONE 实验室
> 支持我们，请投票给 rex.m

## 问题

很多 EOS 浏览器都只能显示别人给我抵押了多少 EOS，但不能看到是哪个账号帮我抵押的。

## 分析

### 1. 看抵押的实现代码

从 `eosio.contracts/eosio.system/src/delegate_bandwidth.cpp` 的 `delegatebw` 函数开始分析。

它调用了 `changebw`，其中的查表操作是这样的：

```cpp
del_bandwidth_table     del_tbl( _self, from.value );
auto itr = del_tbl.find( receiver.value );
```

scope 是 from，而 from 就是要求的未知项，直接粉碎我们用这路线继续求解的可能。

### 2. 找交易记录

MEET.ONE 之前发布过几篇关于 MongoDB 插件的文章，这些积累为我们继续求解提供了很大便利。

直接在 `Mongo Shell` 里尝试：

```
use EOS
db.transaction_traces.findOne({"action_traces.act.account" : "eosio", "action_traces.act.name" : "delegatebw", "action_traces.act.data.receiver" : "shengxiaokai"})
```

执行之后，找到一条 trx_id 为 `9bd50c0fd6f0e1d0ed4c6f5c6f873a33976955ff9dae2ac3eb16cb7e9a44d106` 的交易记录，显示 `1freeaccount` 为 `shengxiaokai` 抵押：

```JSON
{
    "from" : "1freeaccount",
    "receiver" : "shengxiaokai",
    "stake_net_quantity" : "0.0000 EOS",
    "stake_cpu_quantity" : "0.5000 EOS",
    "transfer" : 0
}
```
