# 改进 EOSIO MongoDB 插件对分片集群的插入性能

> 作者: UMU @ MEET.ONE 实验室
> 支持我们，请投票给 rex.m

## 问题

为了保证 MongoDB 服务器的容量足够应对未来发展，我们做了分片，但经过对比测试，发现每隔 15 分钟左右，nodeos 就会报错，并优雅退出。

查看了社区的 issues 发现有类似情况：[mongodb shard: line 870, code 61, generic server error](https://github.com/EOSIO/eos/issues/5488)

## 解决

### 定位代码

反复测试发现，总是同一个地方抛出异常：

```
   // insert action_traces
   if( write_atraces ) {
      try {
         if( !bulk_action_traces.execute() ) {
            EOS_ASSERT( false, chain::mongo_db_insert_fail,
                        "Bulk action traces insert failed for transaction trace: ${id}", ("id", t->id) );
         }
      } catch( ... ) {
         handle_mongo_exception( "action traces insert", __LINE__ );
      }
   }
```

插入数据的代码很多，但就这个地方报错，说明 action_traces 表有特殊性。

### 分析异同

action_traces 的 shard key 被定义为 _id，而其他没报错的表并不是 _id。

### 理论

批量插入时，_id 是有单调递增性的，根据官方文档 
[Avoid Monotonic Throttling](https://docs.mongodb.com/master/core/bulk-write-operations/#avoid-monotonic-throttling)，需要降低单调递增性，才能使批量插入均匀分散到各个 shard 上。

### 成果

([#6498](https://github.com/EOSIO/eos/pull/6498)) Fix cluster writes for mongo DB
