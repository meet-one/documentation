# REX 之赚取收益篇( 一 )

> 支持我们，请投票给 rex.m

REX 赚取收益需 4 步: 
1. `deposit`
2. `buyrex` or `unstaketorex`
3. `sellrex`
4. `withdraw`

## 1.deposit ( 存入基金 )

```
cleos -u http://mainnet.meet.one push action eosio deposit '["OWNER", "AMOUNT"]' -p OWNER@active
```
- **OWNER:**  存入的账户
- **AMOUNT:** 存入的( EOS )数量

`deposit` 会把 `amount` 数量的 EOS 存入 REX 基金（也就是主网的 eosio.rex 账户，所有与 REX 相关的收益和支出都会被添加到基金中或者从中取出）。首次存入的用户会在 `rexfund` 表中添加一条类似实例 1 的数据，非首次用户则会将 balance 数量加上 amount。

```
查询用户名为 OWENR 的存入数据:

cleos -u http://mainnet.meet.one get table eosio eosio rexfund -L OWNER -U OWNER
```
```
实例 1:

{
  "rows": [{
      "version": 0,             // 版本号
      "owner": "OWNER",         // 存入的账户
      "balance": "0.0000 EOS"   // 存储的数量
    }
  ],
  "more": true
}
```

## 2. buyrex or unstaketorex( 购买 REX )

通过 `deposit` 存入了 EOS，同时还必须投票给至少 21 个节点或者把投票权交给代理，才可以购买 REX 代币（也就是所谓的出租 EOS）赚取收益，。

### 1）buyrex (用 rexfund 资金中购买 REX)

```
cleos -u http://mainnet.meet.one push action eosio buyrex '["FROM", "AMOUNT"]' -p FROM@active
```

- **FROM:**   购买 REX 的账户
- **AMOUNT:** 购买数量（EOS）

### 2) unstaketorex (用抵押的 CPU 和 NET 购买 REX)

通过 `unstaketorex` 购买 REX 会解质押 CPU 和 NET 资源，在购买前计算好资源，以免 [CPU 爆了](https://cpubaole.com)。
```
cleos -u http://mainnet.meet.one push action eosio unstaketorex '["OWNER", "RECEIVER","FROM_NET", "FROM_CPU"]' -p OWNER@active
```
- **OWNER:**      购买 REX 的账户 
- **RECEIVER:**   抵押的接收账户
- **FROM_NET:**   从抵押给 RECEIVER 的 net 中解质押 FROM_NET 数量的 EOS 购买 REX
- **FROM_CPU:**   从抵押给 RECEIVER 的 CPU 中解质押 FROM_CPU 数量的 EOS 购买 REX

那么 1 个 EOS 可以购买多少的 REX 呢？
首先得获取实例 2 中的 `rexpool` 表数据：

```
cleos -u http://mainnet.meet.one get table eosio eosio rexpool
```
```
实例 2:

{
  "rows": [{
      "version": 0,                               // 版本号
      "total_lent": "81810435.8073 EOS",          // 已借出 EOS 的数量
      "total_unlent": "16386108.0605 EOS",        // 可以借出的 EOS 的数量
      "total_rent": "104111.1368 EOS",            // 借出 EOS 的收益
      "total_lendable": "98196543.8678 EOS",      // total_lent + total_unlent 的和
      "total_rex": "978991255932.6474 REX",       // 已售出的 REX 数量
      "namebid_proceeds": "0.0000 EOS",           
      "loan_num": 225095                          // 已借出的次数
    }
  ],
  "more": false
}
```
然后计算 `total_rex / total_lendables = 9969.7119 REX` 得到的值即是 1 EOS 大概可以购买的 REX 数量。
假如您是在 UTC 时间( 非北京时间 ) `2019-10-08T00:00:00.000 ~ 2019-10-09T00:00:00.000` 之间的任意时间、任意多次买入 REX (会被合并到一起)，那么都是在 `2019-10-13T00.00.00.000` 之后才可以出售这部分以及之前购买的 REX，也就是需要 4 天多的时间，所谓的等待 4 天是指从第二天 0 点开始。当然也可以通过 `rexbal` 中的 `rex_maturities` 成熟桶查看具体成熟时间，如实例 3 所示。

```
查询 OWNRE 的 rexbal 数据:

cleos -u http://mainnet.meet.one get table eosio eosio rexbal -L OWNER -U OWNER
```
```
实例 3:
{
  "rows": [{
      "version": 0,
      "owner": "OWNER",                       
      "vote_stake": "5792.5005 EOS",          // 购买的 REX 的 EOS 数量用于加入到投票数中
      "rex_balance": "57749594.1290 REX",     // 持有的 REX 总量(matured_rex + rex_maturities)
      "matured_rex": 2256,                    // 已成熟的 REX （即可以用于出售的 REX）
      "rex_maturities": [{                    // 成熟桶
          "first": "2019-11-09T00:00:00",     // 成熟时间，若 first 小于当前时间则说明已成熟
          "second": 99697191                  // 成熟后会将 second 的值加入到 matured_rex 同时删除这条记录
        },{
          "first": "2019-11-10T00:00:00",
          "second": "577346341843"
        },{
          "first": "2106-02-07T06:28:15",     // 储蓄桶，永远不会成熟，如果需要出售，需要移出，重新进入成熟桶，等待至少 4 天成熟后才可以出售(后续会介绍)
          "second": 49900000
        }
      ]
    }
  ],
  "more": true
}
```

## 3. sellrex ( 出售 REX )

经过 4 天多的等待，便可以出售 REX 来领取收益了。
```
cleos -u http://mainnet.meet.one push action eosio sellrex '["FROM", "AMOUNT"]' -p FROM@active
```
- **FROM:**   出售 REX 的账户
- **AMOUNT:** 出售 REX 的数量

`AMOUNT * total_lendable / total_rex` 计算的结果(本金 + 利息)会增加到用户 `rexfund` 表的 `balance` 中。

上述是在流动性不紧缩的情况下。如果出现流动性紧缩，那么出售 REX 的时候这笔卖单会被加入到队列中等待处理，队列表名为 `rexqueue`，如实例 4 所示，如果同一个人有正在进行的卖单，再次出售会合并这两个单子。
```
获取 requeue 表数据，按未处理以及卖单先后时间排序：

cleos -u http://mainnet.meet.one get table eosio eosio rexqueue --index 2 --key-type i64   
```
```
{
  "rows": [{
      "version": 0,
      "owner": "OWNER1",
      "rex_requested": "9240422036.3346 REX",     // 出售的 REX 总数
      "proceeds": "0.0000 EOS",                   // 本金 + 利息，未处理时为 0 
      "stake_change": "0.0000 EOS",               // 抵押票数的变化
      "order_time": "2019-11-04T12:58:12.000",    // 卖出 rex 的时间
      "is_open": 1                                // 1 表示未处理, 0 表示已处理
    },
    ....
    {
      "version": 0,
      "owner": "OWNERN",
      "rex_requested": "100737686.7695 REX",
      "proceeds": "10104.3776 EOS",
      "stake_change": "-10104.3700 EOS",
      "order_time": "2019-11-05T11:55:31.500",
      "is_open": 0
    }
  ],
    "more": false
}
```
如果觉得等待队列太久，可以通过以下指令取消:
```
cleos -u http://mainnet.meet.one push action eosio cnclrexorder '["OWNER"]' -p OWNER@active
```

如果你想早点出售，可是队列中前面存在大额卖单交易，那么怎么处理？

小技巧来了：
可以根据 `rexpool` 表中的数据来计算当前允许出售的最大数量的 REX:

~~（total_unlent - 0.2 * total_lent）* total_rex / total_lendable（v1.8.2之前版本计算方式）~~
```
（total_unlent - 0.1 * total_lent）* total_rex / total_lendable (v1.8.3 计算方式)
```
也可以运行本文的[源码](./get_max_available_sell_amount.js)查看目前主网详情。根据计算结果选择低于该值出售 REX，这样就可以插队提前出售一部分 REX，不需要等待。

## 4. withdraw ( 提现 )

出售 REX 的本金和利息并不会自动从 REX 基金中转到用户账户中，而是会被加入到用户 `rexfund` 表中，还需要自己手动取回。

```
cleos -u http://mainnet.meet.one push action eosio withdraw '["OWNER", "AMOUNT"]' -p OWNER@active
```

当然也可以继续选择购买 REX (出租 EOS) 赚取收益。


