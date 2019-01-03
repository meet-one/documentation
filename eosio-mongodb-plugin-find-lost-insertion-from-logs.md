# EOSIO MongoDB 插件系列：从 log 中找回丢失的插入记录

> 作者: UMU @ MEET.ONE 实验室

## 问题

当 MongoDB 因不可抗力故障，nodeos 重启后会丢失上次故障时正在插入的记录。

## 解决

nodeos 会将插入语句连同错误原因等信息一起写入 log，这给了我们手动修复丢失的机会。下面以 transaction_traces 为例，介绍修复流程。

### 1. 找出所有失败记录

```bash
grep 'mongo exception, trans_traces insert:' *.log > lost.txt
```

### 2. 从 log 生成 mongo script

```bash
echo 'print("++++");
var eos = db.getSiblingDB("EOS");' > lost.js

cat lost.txt | sed -n 's/.*, trans_traces insert: \(.*\), line 920, code.*/eos.transaction_traces.insert(\1)/p' >> lost.js

echo 'print("----");' >> lost.js
```

### 3. 导入 MongoDB

```bash
nohup mongo mongodb://$user:$password@127.0.0.1:$port/admin lost.js > lost.log
```
