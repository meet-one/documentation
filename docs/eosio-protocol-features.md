# EOSIO 1.8.0-rc1 协议特征

> Author: UMU @ MEET.ONE Lab

本文简略摘抄自《[EOSIO<sup>TM</sup> Version 1.8.0-rc1: EOSIO Consensus Protocol Upgrade Release Candidate for Enhanced Security and Usability Features](https://medium.com/eosio/eosio-version-1-8-0-rc1-2d2d68995bbe)》

EOSIO 1.8.0-rc1 版本带来一些列共识协议升级，使它的升级流程相对之前升级复杂。

## 1. BP 们需要协商哪些特征要启用和启用的时刻

> As long as more than two-thirds of the active block producers have set the same future time in the configuration file for the PREACTIVATE_FEATURE on their BP nodes, the network will be safe from any attempts at premature activation by some other active BP.

需要 2/3 的活跃 BP（即至少 15 个），设定同一时间才能生效。

## 2. 启用 producer_api_plugin

启用 producer_api_plugin 以激活协议特征，安全原因，操作成功后建议关闭。

## 3. 协议特征用途简介

### 1. PREACTIVATE_FEATURE

\([#6431](https://github.com/EOSIO/eos/issues/6431)\) Enable protocol feature pre-activation

需要首先被激活，才能激活其它特征。

### 2. ONLY_LINK_TO_EXISTING_PERMISSION

\([#6333](https://github.com/EOSIO/eos/issues/6333)\) Disallow linking to non-existing permission

不允许不存在的权限。非安全问题，减少用户困扰。

### 3. FIX_LINKAUTH_RESTRICTION

\([#6672](https://github.com/EOSIO/eos/issues/6672)\) Fix excessive restrictions of eosio::linkauth

之前如果把合约 Action 名字取成 updateauth, deleteauth, linkauth, unlinkauth, or canceldelay，则在自定义这些 Action 的最小权限时将遇到麻烦。

### 4. DISALLOW_EMPTY_PRODUCER_SCHEDULE

\([#6458](https://github.com/EOSIO/eos/issues/6458)\) Disallow proposing an empty producer schedule

改进合理性。原来允许设置空的计划列表，空表会进入 Pending 状态，但不会转正，现在不允许设置空表。

### 5. RESTRICT_ACTION_TO_SELF

\([#6705](https://github.com/EOSIO/eos/issues/6705)\) Restrict authorization checking when sending actions to self

改进安全性。即使调用合约自身的 Action 也要传入权限。

### 6. REPLACE_DEFERRED

\([#6103](https://github.com/EOSIO/eos/issues/6103)\) Fix problems associated with replacing deferred transaction

修复 bug：以前 RAM 没还回。

### 7. NO_DUPLICATE_DEFERRED_ID

\([#6115](https://github.com/EOSIO/eos/issues/6115)\) Avoid transaction ID collision of deferred transactions

改进合理性。依赖 REPLACE_DEFERRED。onerror 通知里的结构体会稍微改变，可能导致需要重写合约。

### 8. RAM_RESTRICTIONS

\([#6105](https://github.com/EOSIO/eos/issues/6105)\) Modify restrictions on RAM billing

只要 RAM 最终不消耗，可以在中间临时增加。

### 9. ONLY_BILL_FIRST_AUTHORIZER

\([#6332](https://github.com/EOSIO/eos/issues/6332)\) Only bill CPU and network bandwidth to the first authorizer of a transaction

合约可以为第一级直接用户买 CPU 和 NET 资源。

### 10. FORWARD_SETCODE

\([#6988](https://github.com/EOSIO/eos/issues/6988)\) Forward setcode action to WebAssembly code deployed on eosio account

合约部署时，系统合约可以得到通知。

### 11. GET_SENDER
\([#7028](https://github.com/EOSIO/eos/issues/7028)\) Allow contracts to determine which account is the sender of an inline action

被调用者可以知道是哪个合约调用它，减少滥用 require_receipient。
