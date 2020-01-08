# REX v1.8.3 新特性

相较于 v1.8.2 的主要变动有两点：

1、REX 池的预留量从 20% 调整为 10%， 增加了 REX 的可出租量

2、购买 ram 的手续费、CUP/NET 租用的费用以及短账户名交易的收入不再被一次性加入到 REX 池中，以 12 小时为间隔，将 12 小时内的全部收益按 30 天线性加入到 REX 池中。

主要介绍下第二点。

关于第二条特性，REX 新增了 2 张表 `rexretpool` 和 `retbuckets`

### rexretpool 表
```json
{
  "rows": [{
      "version": 0,
      "last_dist_time": "2020-01-07T07:20:00",       
      "pending_bucket_time": "2020-01-07T12:00:00",
      "oldest_bucket_time": "2020-01-02T12:00:00",
      "pending_bucket_proceeds": 2000906,
      "current_rate_of_increase": 12301,
      "proceeds": 50387622 
    }
  ],
  "more": false
}
```
字段说明：
* `last_dist_time`: 最后一次购买 ram 的手续费、CUP/NET 租用的费用或者短账户名交易的收入被添加到 REX 中的时间
* `pending_bucket_time`: 待处理的 12 小时返回桶的时间戳
* `oldest_bucket_time`: 最早的 12 小时间结算池的时间
* `pending_bucket_proceeds`: 当前 12 小时间结算池的收益
* `current_rate_of_increase`: 当前每 10 分钟加入到 REX 池中的收益比率
* `proceeds`: 在任意时间可以被添加到 REX 池中的最大收益金额

当有新增的 ram 的手续费、CUP/NET 租用的费用或者短账户名交易的收益时候, 这些收益会被加到 `proceeds` 以及 `pending_bucket_proceeds`.

`last_dist_time` 每隔 10 分钟的点更新一次，同时 `current_rate_of_increase` 数量的金额会被加入到 REX 池中，相应的 `proceeds` 会减去这部分值。`pending_bucket_proceeds` 是上一个时间段到 `pending_bucket_time` 的 12 小时内的累计收益,在新的一个 `pending_bucket_time` 会被重置为 0。

### retbuckets 表

记录了 12 个小时间隔内累计的收益率, 将 `return_bukets` 中所有的 `value` 相加其实就是  `current_rate_of_increase` 的值。
```json
{
  "rows": [{
      "version": 0,
      "return_buckets": [{
          "key": "2020-01-02T12:00:00",
          "value": 609
        },{
          "key": "2020-01-03T00:00:00",
          "value": 933
        },
        ....
      ]
    }
  ],
  "more": false
}
```
`return_buckets` 最多会有 `30 * (24 / 12) = 60` 条记录。超过 30 天的记录会被删除，同时将 `current_rate_of_increase` 减去对应的 `value` 以表示该 12 小时结算池的收益完成 30 天内线性释放到 REX 池。





