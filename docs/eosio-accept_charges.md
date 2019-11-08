# **智能合约替用户承担事务的开销**

> Author: UMU @ MEET.ONE Lab
> 支持我们，请投票给 rex.m

# 需求

用户可能因为资源（NET 和 CPU）匮乏，无法愉快地使用 EOS 智能合约。

# 解决思路

智能合约承担事务的开销（NET 和 CPU）。

# 具体方案

## 1. ONLY_BILL_FIRST_AUTHORIZER 特性

eos 1.8 的 ONLY_BILL_FIRST_AUTHORIZER 特性，通过只向事务的首个授权方收费的方式，部分地解决这个问题。这一特性允许应用提供者对用户的每一笔事务进行联合签名，通过这一方式从公共池中支付事务的开销。

缺陷：联合签名操作门槛高，安全性堪忧。

### 本地实验

- 开启 ONLY_BILL_FIRST_AUTHORIZER

```bash
curl -X POST http://127.0.0.1:8888/v1/producer/get_supported_protocol_features -d '{}' | jq

# 复制 ONLY_BILL_FIRST_AUTHORIZER 的 feature_digest

cleos push action eosio activate '[8ba52fe7a3956c5cd3a656a3174b931d3bb2abb45578befc59f283ecd816a405]'

# 查看是否激活
curl -X POST http://127.0.0.1:8888/v1/chain/get_activated_protocol_features -d '{}' | jq
```

- 验证：cleos push action 时，带多个 -p 参数（指定多个账户），应该只有第一个账户被消耗 CPU。

## 2. 合约调用 accept_charges

[Contracts Paying Transaction Costs][cptc] 提出一种无需联合签名的方法。

关键函数如下：

```
bool accept_charges(
    uint32_t max_net_usage_words,   // Maximum NET usage to charge
    uint32_t max_cpu_usage_ms       // Maximum CPU usage to charge
);

void get_accept_charges(
    name*     contract,
    uint32_t* max_net_usage_words,
    uint32_t* max_cpu_usage_ms,
);

void get_num_actions(
    uint32_t* num_actions,
    uint32_t* num_context_free_actions,
);
```

简单地说，在合约调用 `accept_charges` 函数，如返回 `true`，则事务的开销将会由合约账户承担。

具体规则如下：

- 如果多个合约调用了 `accept_charges`，则首个调用者会被收取费用。`accept_charges` 会返回 `true` 给该合约，而返回 `false` 值给其他的合约。

- 如果首个合约调用了多次该函数（用于修改限制），无论是在相同的 action 还是不同的多个 action 之中，每次都会返回 true。

**关键点讲完了，其余请参考 [Contracts Paying Transaction Costs][cptc] 原文或[译文](https://bihu.com/article/1522267629)。**

[cptc]: https://github.com/EOSIO/spec-repo/blob/master/esr_contract_pays.md
