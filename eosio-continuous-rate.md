# EOSIO 的连续通胀率 4.879% 是怎么算出来的？

> 作者: UMU @ MEET.ONE 实验室

## 问题

在 `eosio.contracts/eosio.system/src/producer_pay.cpp` 中有这样一行代码：

```
const double   continuous_rate       = 0.04879;          // 5% annual rate
```

搜索一下，会得到这样的解释：

> EOS是连续增发的模式，连续通胀率是 4.879%，年度通胀是 5%；

> 运用微积分的知识，可以推导出来，假设是增发的次数是无限多次，那么，连续通胀的情景下，所设置的连续通胀率就是 4.879%。

然而，并没有解释具体算法……

## 求解

- 假设通胀率是“每日结算”的，记为 daily_rate，则：

```
(1 + daily_rate / 365) ^ 365 = 1 + annual_rate

注：这里的 ^ 表示幂，不是 XOR 运算。
```

那么计算 daily_rate 的公式为：

```
[365TH_ROOT(1 + annual_rate) - 1] * 365

注：365TH_ROOT 是开 365 次方
```

把 5% 带入，计算结果是：`0.048793425246406`，这个数值已经和 0.04879 基本一样了。

- 但是“每日结算”并不够，接下来推到时时刻刻都在结算的情况。

问题本质：已知 annual_rate、`(1 + continuous_rate / N) ^ N = 1 + annual_rate`，求 continuous_rate 在 N 为无穷大时的解。

复习一下大学数学，马上就会发现 `lim N->∞ (1 + x / N) ^ N` 就是 `e ^ x` 的定义，所以：

```
continuous_rate = ln(1 + annual_rate)
```

把 5% 代入 annual_rate，`continuous_rate = 0.048790164169432`

## 参考

\#1537 [DAWN-651 ⁃ setting correct per-block "continuous inflation" so annual inflation is 5%](https://github.com/EOSIO/eos/issues/1537)
