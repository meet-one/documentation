# 进阶：多签的管理账户也是多签账户

 [EOSIO 多签的合约账户部署合约](eosio-set-multisig-contract.md) 的文章里说明如何对一个多签的账户发起提案，其中提案的发起者不是一个多签的账户。如果发起提案的账户也是一个多签账户，那么这时候该怎么处理。

 ## 账户准备

 ```
cleos -u http://kylin.meet.one:8888 get account meetonehello

permissions: 
    owner     1:    1 EOS8m2bUwUyz3NkWJ3AAmSd8c88SVBk2fGwHrn4X4k6HMafiyETW4
      active     2:    1 meetdotone21@active, 1 meetdotone22@active, 1 meetdotone23@active
 ```

`meetonehello` 的 `active` 权限是一个多签的账户权限，由 `meetdotone21`、`meetdotone22` 和 `meetdotone23` 共同管理，只要三者中的两个同意就可以使用 active 权限。


 ```
cleos -u http://kylin.meet.one:8888 get account meetdotone21

permissions: 
    owner     1:    1 EOS58VdoXgeaJurUntJ97mTYXLX7gxs6yN5Xx97bAHHZG7sJibkR8
      active     2:    1 meetdotone11@active, 1 meetdotone12@active, 1 meetdotone13@active
 ```

`meetdotone21` 的 `active` 权限是一个多签的账户权限，由 `meetdotone11`、`meetdotone12` 和 `meetdotone13` 共同管理，同样的也只要三者中的两个同意就可以使用 active 权限。`meetdotone21` 又恰好是 `meetonehello` 权限管理中的一员。

## 合约准备

```c++
#include <eosio/eosio.hpp>

namespace meetone {

CONTRACT hello : public eosio::contract {
 public:
  using eosio::contract::contract;

  ACTION hi(eosio::name user) { 
    eosio::print("Hello ", user); 
  }
};
}  // namespace meetone
```

这个简短的合约只有一个 `action`，这个合约将部署到 `meetonehello` 账户下。所有工作准备就绪。

## 发起多签提案

1. 首先生成需要部署合约的 json 文件 

```
cleos -u http://kylin.meet.one:8888 set contract -d -j -s meetonehello ../hello > deployhello.json
```

生成的 `deployhello.json` 文件记得修改 `expiration` 为未来的某个时间，`ref_block_num` 和 `ref_block_prefix` 设置为 `0`。

2. 合约账户管理员的 json 文件

`meetonehello_manager.json` 内容如下：

```
[
  {"actor": "meetdotone21", "permission": "active"},
  {"actor": "meetdotone22", "permission": "active"},
  {"actor": "meetdotone23", "permission": "active"}
]
```

如果 `meetdotone21` 不是多签账户那么直接可以使用以下命令：

```
cleos -u http://kylin.meet.one:8888 multisig propose_trx deployhello meetonehello_manager.json deployhello.json -p meetdotone21@active
Error 3090003: Provided keys, permissions, and delays do not satisfy declared authorizations
Ensure that you have the related private keys inside your wallet and your wallet is unlocked.
Error Details:
transaction declares authority '${auth}', but does not have signatures for it.
```
但是报错了，因为 `meetdotone21` 是一个多签账户，不能直接使用它的 `active` 权限发起多签提案。不过有一种情况是不会报错，那就是在本地同一个钱包中包含了 `meetdotone21` 多签账户的所有私钥，需要把这些私钥隔离开。

当然如果使用其他两个非多签账户就可以正常发起多签提案：

```
cleos -u http://kylin.meet.one:8888 multisig propose_trx deployhello meetonehello_manager.json deployhello.json -p meetdotone22@active
executed transaction: 78da96c6684a0a79ffabe7b9b1877d97b83f48dc122fb7b0c3b0ecea4c9de9bd  1128 bytes  2178 us
#    eosio.msig <= eosio.msig::propose          {"proposer":"meetdotone22","proposal_name":"deployhello","requested":[{"actor":"meetdotone21","permi...
warning: transaction executed locally, but may not be confirmed by the network yet         ]
```

3. 多签账户管理员的 json 文件

`meetdotone21_manager.json` 内容如下：

```
[
  {"actor": "meetdotone11", "permission": "active"},
  {"actor": "meetdotone12", "permission": "active"},
  {"actor": "meetdotone13", "permission": "active"}
]
```

4. 使用多签账户生成部署合约的 deploy_trx.json 文件

```
cleos -u http://kylin.meet.one:8888 multisig propose_trx -d -j -s deployhello meetonehello_manager.json deployhello.json -p meetdotone21@active > deploy_trx.json
```
提案的名称为 `deployhello` ，生成的 `deploy_trx.json` 文件修改 `expiration` 为未来的某个时间，`ref_block_num` 和 `ref_block_prefix` 设置为 `0`。

5. 使用多签账户中的管理账户之一发起提案

```
cleos -u http://kylin.meet.one:8888 multisig propose_trx propose meetdotone21_manager.json deploy_trx.json -p meetdotone11@active
```

这里使用 `meetdotone21` 的管理账户之一 `meetdotone11` 发起名为 `propose` 的提案，提案的内容是使用 `meetdotone21` 的 `active` 权限发起部署合约到 `meetonehello` 的提案。

6. 同意 `meetdotone11` 的 `propose` 提案

```
cleos -u http://kylin.meet.one:8888 multisig approve meetdotone11 propose '{"actor":"meetdotone11","permission":"active"}' -p meetdotone11@active
executed transaction: d5061eaa7cc0d82937a01691c52c96d39f03579468727cfc2f27877558ceb0b5  128 bytes  677 us
#    eosio.msig <= eosio.msig::approve          {"proposer":"meetdotone11","proposal_name":"propose","level":{"actor":"meetdotone11","permission":"a...

cleos -u http://kylin.meet.one:8888 multisig approve meetdotone11 propose '{"actor":"meetdotone12","permission":"active"}' -p meetdotone12@active
executed transaction: a3696d7da194885db9e34a25fb3239a9bd359d6106b0559035b8f16aed8c9fae  128 bytes  782 us
#    eosio.msig <= eosio.msig::approve          {"proposer":"meetdotone11","proposal_name":"propose","level":{"actor":"meetdotone12","permission":"a...
```

7. 执行 `meetdotone11` 的 `propose` 提案

```
cleos -u http://kylin.meet.one:8888 multisig exec meetdotone11 propose meetdotone11
executed transaction: 0a606afbdcf767247be0abd9b661536ef306f25002be13ce2a21e99ed9895d06  160 bytes  1351 us
#    eosio.msig <= eosio.msig::exec             {"proposer":"meetdotone11","proposal_name":"propose","executer":"meetdotone11"}
```

执行完后可以查看 `meetdotone21` 发起了部署合约的提案 `deployhello`

```
cleos -u http://kylin.meet.one:8888 multisig review meetdotone21 deployhello
```

8. 同意 `meetdotone21` 多签账户的 `deployhello` 提案

简单点的话直接使用其他两个非多签账户同意提案即可

```
cleos -u http://kylin.meet.one:8888 multisig approve meetdotone21 deployhello '{"actor":"meetdotone22","permission":"active"}' -p meetdotone22@active
executed transaction: 998f7e15a9788ad0d182558f4f2ee87d3746666b517854fa8f62fa08f5c34892  128 bytes  1612 us
#    eosio.msig <= eosio.msig::approve          {"proposer":"meetdotone21","proposal_name":"deployhello","level":{"actor":"meetdotone22","permission...

cleos -u http://kylin.meet.one:8888 multisig approve meetdotone21 deployhello '{"actor":"meetdotone23","permission":"active"}' -p meetdotone23@active
executed transaction: 998f7e15a9788ad0d182558f4f2ee87d3746666b517854fa8f62fa08f5c34892  160 bytes  1351 us
#    eosio.msig <= eosio.msig::approve          {"proposer":"meetdotone21","proposal_name":"deployhello","level":{"actor":"meetdotone23","permission...
```
到这里可以跳到第 `9` 步了。

但是就喜欢折腾，那就用多签账户 `meetdotone21` 同意提案:

先生成离线的同意提案交易的 json 文件

```
cleos -u http://kylin.meet.one:8888 multisig approve -d -j -s meetdotone21 deployhello '{"actor":"meetdotone21","permission":"active"}' -p meetdotone21@active > approvedeploy.json
```

多签账户管理员之一发起 `approvedeploy` 的提案

```
cleos -u http://kylin.meet.one:8888 multisig propose_trx approve meetdotone21_manager.json approvedeploy.json -p meetdotone11@active
executed transaction: c2a14d7cd48fd1c49aa2f6fa5a56453b76a0f933d9f2ee14f984c6a3b23129a7  240 bytes  1076 us
#    eosio.msig <= eosio.msig::propose          {"proposer":"meetdotone11","proposal_name":"approve","requested":[{"actor":"meetdotone11","permissio...
```

多签账户管理员同意提案并执行同意提案：

```
cleos -u http://kylin.meet.one:8888 multisig approve meetdotone11 approve '{"actor":"meetdotone11","permission":"active"}' -p meetdotone11@active
executed transaction: c5d4e45476dafbb5810b2d8775a7acbed525c1a06fba716497379a0c03d0a601  128 bytes  1065 us
#    eosio.msig <= eosio.msig::approve          {"proposer":"meetdotone11","proposal_name":"approve","level":{"actor":"meetdotone11","permission":"a...

cleos -u http://kylin.meet.one:8888 multisig approve meetdotone11 approve '{"actor":"meetdotone12","permission":"active"}' -p meetdotone12@active
executed transaction: b95e498c16714bb1bd3f520ded64d2c2cc423299f5dd48d64f133de41b199d64  128 bytes  711 us
#    eosio.msig <= eosio.msig::approve          {"proposer":"meetdotone11","proposal_name":"approve","level":{"actor":"meetdotone12","permission":"a...

cleos -u http://kylin.meet.one:8888 multisig exec meetdotone11 approve meetdotone11                                                       
executed transaction: 321f078bcdecd07a04968c84a3fd14ccd6e2d5fbebdf9309cf2e53ffc08143a4  160 bytes  1180 us
#    eosio.msig <= eosio.msig::exec             {"proposer":"meetdotone11","proposal_name":"approve","executer":"meetdotone11"}
```

查看 `approve` 情况

```
cleos -u http://kylin.meet.one:8888 get table eosio.msig meetdotone21 approvals2
{
  "rows": [{
      "version": 1,
      "proposal_name": "deployhello",
      "requested_approvals": [{
          "level": {
            "actor": "meetdotone23",
            "permission": "active"
          },
          "time": "1970-01-01T00:00:00.000"
        }
      ],
      "provided_approvals": [{
          "level": {
            "actor": "meetdotone22",
            "permission": "active"
          },
          "time": "2019-08-07T02:26:45.000"
        },{
          "level": {
            "actor": "meetdotone21",
            "permission": "active"
          },
          "time": "2019-08-07T02:48:35.000"
        }
      ]
    }
  ]
}
```

可以看到 `provided_approvals` 中已经有 `meetdotone22` 以及 `meetdotone21` 两个账户的 approve，可以安心执行了部署合约的提案了。

9. 执行 `meetdotone21` 多签账户的 `deployhello` 提案

简单点的话也是直接用非多签的任意账户执行

```
cleos -u http://kylin.meet.one:8888 multisig exec meetdotone21 deployhello -p meetonetest1
executed transaction: 7bf3515ecb8923a53f11c322a32bf87e2a3e18e96b23fff5515239aa93ef6052  160 bytes  2514 us
#    eosio.msig <= eosio.msig::exec             {"proposer":"meetdotone21","proposal_name":"deployhello","executer":"meetonetest1"}
```

即使是非管理账户也可以执行。当然非得要用多签账户执行的话，可以参考步骤 `8` 的方式


10. 测试

验证合约是否已经正常部署

```
cleos -u http://kylin.meet.one:8888 get code meetonehello
code hash: d54fbc86080cd692ed7698733ea8593420da268e564209b67c701936f2dfee60

cleos -u http://kylin.meet.one:8888 push action meetonehello hi '["meetone"]' -p meetdotone11
executed transaction: 26a518602b6b6dc727cb49af32ff3a5aced21630b5d4bfbbe244c264836097e2  104 bytes  799 us
#  meetonehello <= meetone hello::hi             {"user":"meetone"}
warning: transaction executed locally, but may not be confirmed by the network yet         ] 
```

all done.

## 总结
 
多签账户 `A` 的管理账户之一 `B` 也为多签账户，此时由 `B` 发起一笔和 `A` 相关的多签提案，首先 `B` 在本地生成离线的多签交易，然后使用 `B` 多签管理账户对之前生成的离线交易发起多签提案，待 `B` 的多签管理账户都同意并执行后，`B` 发起的关于 `A` 相关的多签提案被会被自动提交，此时等待 `A` 的其他多签管理账户同意和执行即可，麻烦点当然可以按文中的方法让 `B` 同意提案和执行提案。