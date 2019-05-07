# 智能合约 table 的二级索引之 checksum256

[《capi_checksum256 数据类型做table的索引》](eosio-smart-contract-capi_checksum256-as-table-key.md) 中提到过使用 `cap_checksum256` 作为智能合约的二级索引，但是 eosio.cdt 编译器升级到 1.6.x 版本之后 capi_checksum256 类型不再支持 C++ 的开发，这篇文章将介绍 c++ 类型的 checksum256 做二级索引。

**定义 table 表**

```c++
struct [[eosio::table("byhash"), eosio::contract("test")]] byhash {
  // 主键
  uint64_t id;
  // 用户名
  eosio::name user;
  // hash 为 checksum256 类型数据
  eosio::checksum256 hash;
  // id 为一级索引
  uint64_t primary_key() const { return id; }
  // hash 作为二级索引
  eosio::checksum256 by_hash() const { return hash; }    
  // 参数序列化，可有可无，加入的话可以提升编译速度
  EOSLIB_SERIALIZE(byhash, (id)(user)(hash))
};
typedef eosio::multi_index<
    "id"_n,
    byhash,
    eosio::indexed_by<
        "hash"_n,
        eosio::const_mem_fun<byhash, eosio::checksum256, &byhash::by_hash>>>
    hash_table;
```

**添加数据**

```c++
[[eosio::action]] void add(eosio::name user) {
  hash_table hashs(get_self(), get_self().value);
  // byhash 表添加数据
  hashs.emplace(get_self(), [&](auto& h) {
  // id 严格自增
    h.id = hashs.available_primary_key();
    h.user = user;
  // 将 name 类型的 user 转为 checksum256 类型
    h.hash = eosio::sha256(user.to_string().c_str(), user.to_string().length());
  });
}
```

```
cleos push action test add '["meetonetest1"]' -p test
```

查表中添加的数据：

```
cleos get table test test byhash 
```

```
{
  "rows": [{
      "id": 0,
      "user": meetonetest1,
      "hash": "6dc871c630acfa35bb00c533b10bae9e265c78297fec542bf513fcf89195a1e0"
    }
  ],
  "more": false
}
```

**合约中通过二级索引查找对应数据**

```c++
[[eosio::action]] getname(eosio::name user) {
  hash_table hashs(get_self(), get_self().value);
  // 获取二级索引表
  auto users = hashs.get_index<"hash"_n>();
  // 查找 user 转 hash 的数据
  auto user_it = users.find(
      eosio::sha256(user.to_string().c_str(), user.to_string().length()));
  // 验证打印 name 和 user 是否一致
  eosio::print(user_it->user);
}
```

```
cleos push action test getname '["meetonetest1"]' -p test 
executed transaction: b52586630766705a3efc29b1047ade09f1ef4c900b84b54c26f3c32a9c2f935c  104 bytes  246 us
#          test <= test::getname                {"user":"meetonetest1"}
>> meetonetest1
```

执行后打印出来的结果和输入一致。但是这种直接使用 checksum256 作为二级索引会有一个问题如果想使用下面命令行具体查询到某条数据是查不到的。

```
cleos get table test test id --index 2 --key-type sha256 -L 6dc871c630acfa35bb00c533b10bae9e265c78297fec542bf513fcf89195a1e0 -U 6dc871c630acfa35bb00c533b10bae9e265c78297fec542bf513fcf89195a1e0
{
  "rows": [],
  "more": false
}
```

查询的结果返回为空。 主要是 `--key-type` 的类型是 `sha256` 而 eosio::sha256 返回的 `checksum256` 还需要将 `checksum256` 转 `sha256`：

**checksum256 转 sha256**

```c++
static eosio::checksum256 checksum256_to_sha256(
    const eosio::checksum256& hash) {
  const uint128_t* p128 =
      reinterpret_cast<const uint128_t*>(hash.extract_as_byte_array().data());
  eosio::checksum256 k;
  k.data()[0] = p128[0];
  k.data()[1] = p128[1];
  return k;
}
```

**修改 table 表**

```c++
struct [[eosio::table("byhash"), eosio::contract("test")]] byhash {
  // 主键
  uint64_t id;
  // 用户名
  eosio::name user;
  // hash 为 checksum256 类型数据
  eosio::checksum256 hash;
  // id 为一级索引
  uint64_t primary_key() const { return id; }
  // hash 作为二级索引 (主要修改此处)
  eosio::checksum256 by_hash() const { return checksum256_to_sha256(hash); }
  // 参数序列化，可有可无，加入的话可以提升编译速度
  EOSLIB_SERIALIZE(byhash, (id)(user)(hash))
};
typedef eosio::multi_index<
    "id"_n,
    byhash,
    eosio::indexed_by<
        "hash"_n,
        eosio::const_mem_fun<byhash, eosio::checksum256, &byhash::by_hash>>>
    hash_table;
```

**合约中二级索引查找的修改**

```c++
[[eosio::action]] getname(eosio::name user) {
  hash_table hashs(get_self(), get_self().value);
  // 获取二级索引表
  auto users = hashs.get_index<"hash"_n>();
  // checksum256 转 sha256 （主要修改的地方）
  auto hash = checksum256_to_sha256(
      eosio::sha256(user.to_string().c_str(), user.to_string().length()));
  auto user_it = users.find(hash);
  // 验证打印 name 和 user 是否一致
  eosio::print(user_it->user);
}
```
添加数据的 action `add` 不需要修改。修改后在添加数据前需要清除原先表中的数据，虽然后续输入的加入对表没有影响，但是修改之前的已经加入的数据不支持修改后的二级索引查找。

**测试**

添加数据:

```
cleos push action test add '["meetonetest1"]' -p test
executed transaction: 96aadfbb4ae065f9ed12cc273f0968ca7947a01fbc8411ffefe28f65a891d8a3  104 bytes  204 us
#          test <= test::add                    {"user":"meetonetest1"}

添加多条数据后
table 中数据
{
  "rows": [{
      "id": 0,
      "user": "meetonetest1",
      "hash": "6dc871c630acfa35bb00c533b10bae9e265c78297fec542bf513fcf89195a1e0"
    }
  ],
  "more": true
}
```

合约中通过 `checksum256` 二级索引查找数据:

```
cleos push action test getname '["meetonetest1"]' -p test
executed transaction: 09ef0f4c727bd9684550690e0a91439dc435d286dc05a908fefe4d397a320911  104 bytes  247 us
#          test <= test::getname                {"user":"meetonetest1"}
>> meetonetest1
```

命令行中 `checksum256` 值精确查找:

```
cleos get table test test id --index 2 --key-type sha256 -L 6dc871c630acfa35bb00c533b10bae9e265c78297fec542bf513fcf89195a1e0 -U 6dc871c630acfa35bb00c533b10bae9e265c78297fec542bf513fcf89195a1e0
{
  "rows": [{
      "id": 0,
      "user": "meetonetest1",
      "hash": "6dc871c630acfa35bb00c533b10bae9e265c78297fec542bf513fcf89195a1e0"
    }
  ],
  "more": false
}
```
