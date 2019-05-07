# EOSIO 1.8.0-rc1 详解

> Author: MEET.ONE Lab

Block.one 于 4 月 30 日发布了 EOSIO 1.8.0-rc1 版本，该版本发布了全新的共识升级机制，且新增了 11 个共识协议选项，由于该升级机制需要所有 BP 升级到1.8.x 才能激活，而 1.8.x 版本不与 1.7.x 以下的版本兼容，导致它的升级流程相对之前更加复杂。

开发这套共识升级机制最根本的原因在于 Block.one 希望 EOSIO 主网可以变的更加去中心化，目前只要 EOSIO 发布了全新的版本，所有超级节点只有升级或不升级两个选项，如果某个新版本有紧急需要修复的 Bug，但是又有某些超级节点不认可的新功能，这种情况会很尴尬，因此 1.8.x 更新非常重要，把权力下放给社区，由社区决定新功能是否上线。

预计后续所有的新功能都会在 protocol_features/*.json 中预留开关，由超级节点决定该功能是否启用。

## 建议升级方案

1. 社区所有节点以及所有 DAPP 节点的 nodeos 升级到 1.7.x 版本。

2. 备份 data-dir 目录中的三个目录 blocks/reversible、state-history、state。

3. 将 nodeos 升级至 1.8.x 新版本。

4. 启动 nodeos 从创世区块开始 replay，注意 1.8.x 版本仅兼容 1.7.x 版本。

5. 所有节点升级至 1.8.x 版本。

6. 激活 PREACTIVATE_FEATURE 协议。

7. 部署最新版本系统合约。

8. 激活其他共识协议。


## 超级节点注意事项

1. 超级节点在升级过程中，需要保证出块节点不下线，否则将出现丢块以及出块共识无法达成的问题。

2. PREACTIVATE_FEATURE 被激活以后，所有 1.7.x 版本的节点将停止同步区块，且不可逆块不再更新，因此一定要提前公布预计激活时间，给社区节点足够的时间升级至 1.8.x。

3. PREACTIVATE_FEATURE 被激活且系统合约升级至最新版本以后，其他的共识协议可以通过 15/21 多签执行系统合约的 activate 函数开启。

4. 出块节点升级至 1.8.x 以后，需要保证 15/21 的出块节点在 protocol_features/BUILTIN-PREACTIVATE_FEATURE.json 配置文件中设置同样的 earliest_allowed_activation_time 参数，以防 PREACTIVATE_FEATURE 协议被提前激活。


## 区块浏览器、交易所、DApp 注意事项

1. 1.8.x 调整了 transaction traces 的数据结构，如果有使用 history_plugin，mongo_db_plugin，state_history_plugin 请确认这两个 PR 是否对你们业务代码有影响。[#7044](https://github.com/EOSIO/eos/pull/7044) & [#7108](https://github.com/EOSIO/eos/pull/7108)

2. state_history_plugin 插件的 API 以及存储在磁盘的文件结构也被修改了，需要升级至最新版本。


## 1.8.x 新功能简介

#### 1. PREACTIVATE_FEATURE

\([#6431](https://github.com/EOSIO/eos/issues/6431)\) Enable protocol feature pre-activation

预激活协议，被激活以后，所有 1.7.x 版本的节点将停止同步区块，且不可逆块不再更新。此协议被激活以后，才能继续激活下列其他协议。

#### 2. ONLY_LINK_TO_EXISTING_PERMISSION

\([#6333](https://github.com/EOSIO/eos/issues/6333)\) Disallow linking to non-existing permission

禁止通过系统合约的 linkauth 绑定一个不存在的账户权限。在 1.8.x 以下的版本如果用户尝试给一个合约的 action 添加一个不存在的自定义账户权限，可以添加成功，而且如果想要 unlink 必须先创建这个不存在的账户权限，有点反人类。

#### 3. FIX_LINKAUTH_RESTRICTION

\([#6672](https://github.com/EOSIO/eos/issues/6672)\) Fix excessive restrictions of eosio::linkauth

在 1.8.x 以下的版本，如果尝试给非系统合约的 updateauth，deleteauth，linkauth，unlinkauth，or canceldelay 这五个 action 添加自定义账户权限会报错，因为底层代码有 Bug 没有判断合约名是否为 eosio，导致所有的都无法添加，激活此协议以后，这个 Bug 将会被修复。

#### 4. DISALLOW_EMPTY_PRODUCER_SCHEDULE

\([#6458](https://github.com/EOSIO/eos/issues/6458)\) Disallow proposing an empty producer schedule

修复在 1.8.x 以下的版本，set_proposed_producers 允许传入空 Schedule 的 Bug，虽然当前空 Schedule 会进入 Pending 状态，但是不会被激活，不会出现异常。

#### 5. RESTRICT_ACTION_TO_SELF

\([#6705](https://github.com/EOSIO/eos/issues/6705)\) Restrict authorization checking when sending actions to self

v1.5.1 之前，当合约调用自身 Action 时，允许忽略鉴权，这个特征在 v1.5.1 被废弃。现在做成可选项，开启后，将禁用这个忽略鉴权的机制，若合约依赖这个忽略机制，则需要修改合约。

#### 6. REPLACE_DEFERRED

\([#6103](https://github.com/EOSIO/eos/issues/6103)\) Fix problems associated with replacing deferred transaction

早前使用 send_deferred 替换一个现有的延迟交易时，存在两个问题：一是旧延迟交易的 RAM 无法被回收；二是旧延迟交易的 ID 被永久保留，这意味着新延迟交易失效后会在区块上留下错误的 ID。这个特征解决这两个 Bug。

#### 7. NO_DUPLICATE_DEFERRED_ID

\([#6115](https://github.com/EOSIO/eos/issues/6115)\) Avoid transaction ID collision of deferred transactions

早前替换一个现有的延迟交易时，最终将留下两个一样的 ID，用区块浏览器查看时，容易产生困扰。开启后，将保证替换后不会出现相同 ID。此特征依赖 REPLACE_DEFERRED 特征。

#### 8. RAM_RESTRICTIONS

\([#6105](https://github.com/EOSIO/eos/issues/6105)\) Modify restrictions on RAM billing

早前版本禁止非特权合约在收到通知时给其它账户购买 RAM。本特征开启后，依然如此，但允许交易过程中临时使用超标的 RAM，只要交易最终完成时未超标即可。

#### 9. ONLY_BILL_FIRST_AUTHORIZER

\([#6332](https://github.com/EOSIO/eos/issues/6332)\) Only bill CPU and network bandwidth to the first authorizer of a transaction

智能合约账户承担用户消耗的 CPU 和 NET 资源。

#### 10. FORWARD_SETCODE

\([#6988](https://github.com/EOSIO/eos/issues/6988)\) Forward setcode action to WebAssembly code deployed on eosio account

改进 eosio::setcode 的派遣机制，开启后，用户部署合约时，系统合约将有机会收到通知。

#### 11. GET_SENDER
\([#7028](https://github.com/EOSIO/eos/issues/7028)\) Allow contracts to determine which account is the sender of an inline action

智能合约新增 get_sender 函数，允许合约获取当前调用 inline_action 的账户。


参考文章:

[EOSIO<sup>TM</sup> Version 1.8.0-rc1: EOSIO Consensus Protocol Upgrade Release Candidate for Enhanced Security and Usability Features](https://medium.com/eosio/eosio-version-1-8-0-rc1-2d2d68995bbe)

[EOSIO v1.8.0-rc1 Release Notes](https://github.com/EOSIO/eos/releases/tag/v1.8.0-rc1)

[Consensus Protocol Upgrade Process](https://github.com/EOSIO/eos/issues/7237)