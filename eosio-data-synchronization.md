# EOSIO 数据同步

> 作者: UMU @ MEET.ONE 实验

最近三个月尝试各种方案把 EOSIO 链上交易数据同步到数据库中，踩了不少坑，现总结一下经验。

## 1. 使用 MongoDB 插件同步 transaction_traces 和 action_traces

原始需求是要链上交易数据，所以先是把 transaction_traces 和 action_traces 都同步。

**踩坑**：无奈地发现速度跟不上，服务器的时间成本比较高，只能舍弃。

## 2. 使用 MongoDB 插件同步 transaction_traces

研究插件代码，发现 action_traces 是从 transaction_traces 拆出来的，是重复的，所以把 action_traces 去掉，这次成功追上主网区块高度。

**踩坑**：transaction_traces 在查询 actions 时不太方便，因为 actions 是放到 transaction_traces 内部的一个数组，要查询具体一个 action 就得分两步走，先在 MongoDB 查询出某个 trx，然后再 actions 数组里遍历。数据库使用端的工程师觉得这样太麻烦，无奈继续放弃这到手的肥肉。

## 3. 使用 MongoDB 插件同步 action_traces

明确 action_traces 才是客户端想要的后，就只同步 action_traces。

**踩坑**：action_traces 条数比 transaction_traces 多了三倍以上，又出现追不上区块的问题……

## 4. 使用 MongoDB 插件同步 action_traces，但只要 transfer 数据

客户端最关心的是 transfer 数据，既然跟不上，就舍弃其它数据。

**踩坑**：舍弃的数据后期不好补。

## 5. 考虑 kafka_plugin

有人说 kafka_plugin 同步数据很快，可以追上主网区块。

**踩坑**：从 kafka_plugin 代码就能看出它没有处理 action_traces，如果还要去后端再拿出来处理，再插入到 MongoDB 里，那开发成本和服务器成本一样又上去了。

## 6. 从 2019 年的区块开始同步

从 35058781 块开始，插入数据库。之前的区块（1 - 35058780）处理后，仅插入数据量相对很小的 account_controls、accounts、pub_keys，其它数据量大的表不插入。

做这个尝试很重要，因为发现重要的线索：

- 大约在 2200 万块开始，nodeos 的处理速度下降很多，平均每块要 2-3ms，所以同步慢的原因在于跑 nodeos 的服务器的性能。

- 在 1 开始的早期区块阶段，同时插入 transaction_traces 和 action_traces，并不能看出比只插入 action_traces 慢，说明 MongoDB 端压力很小。

## 7. 结论

- 要追上主网区块高度，nodeos 机器性能要好，2.5GHz CPU 不够用。之前听闻 BOS 要求 BP 使用 4.0GHz 的 CPU，现在看起来也是有道理的……以性能成本换取时间。

- MongoDB 集群，按之前的文章[《为 EOSIO MongoDB 插件搭建高可用集群》](mongodb-on-centos.md)的配置，插入阶段毫无压力。

- 插件代码有些问题，需要优化，最明显的就是 queue_size 的设计不合理，打印处理时间太长的提示也不合理。

  * queue 函数是个模板，所有的 queue 都调用它，但  max_queue_size 和 queue_sleep_time 缺只有一份，这可能导致一个 queue 导致的 queue_sleep_time 加大，影响到其它 queue，即整体的休眠时间会无用地加大。

  * 打印处理时间没有按照 max_queue_size 变化，当 max_queue_size 设置大时，打印就很频繁，带来延迟。

- 建议：一定要注意成本问题！如果查询量不是很巨大，找点友商的数据源用用就好了，自己搭建的成本好高……但如果查询量太大，或者友商卖太贵，以上经验就是很好的参考了。
