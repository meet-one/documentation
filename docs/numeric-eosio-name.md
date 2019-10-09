# 纯数字 EOS 账号

> 作者: UMU @ MEET.ONE 实验室
> 支持我们，请投票给 rex.m

## 问题

2018 年最后一个工作日，智能合约开发小哥哥遇到一个奇怪的现象：某个账号给我们合约转账，在 EOS 浏览器上都可以找到记录，但用 `cleos get table` 在合约的 RAM 里找却找不到！

## 解决

### 观测

了解具体情况后，注意到两个事实：

1. 只有某个特定账号有问题，其它账号很正常。

2. 那个有问题的账号是纯数字的。

这是 EOS 账号解析的问题，UMU 曾经给 EOS 提过一个相关的 issue：[get_table_by_scope parameter lower_bound is NOT properly converted, cause enumeration dead loop #5824](https://github.com/EOSIO/eos/issues/5824)，里面有问题产生原因和解决方案。

### 原因

eosio::name 本质是一个 uint64_t 数字的 base32 编码，编码形式是为了方便人类记忆。举个例子：

`shengxiaokai` 本质上是 `14075216089888066784 (0xc3553675c6a40ce0)`

`cleos get table` 在解析账号时，兼容了这两种表达形式，所以 `14075216089888066784` 和 `shengxiaokai` 是等价的。

但本身是纯数字的账号可就有歧义了，比如 `313131313131` 是当成一个 uint64_t 解释，还是当成 base32？很不巧，解析代码是优先当成 uint64_t 解释的。

### 解决方案

给纯数字 EOS 账号加上个空格后缀，比如 `111122223333` 可以改为 `"111122223333 "`。
