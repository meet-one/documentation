# 如何使用capi_checksum256作为table的key

## capi_checksum256作为table的secondary_key

由于primary_key类型规定是uint64_t，而sha256是256位，强制类型转换会导致信息丢失，严格意义上是不能作为primary_key。
secondary_key则可以使用多种类型包括(i64, i128, i256, float64, float128, ripemd160, sha256)。那么这里就可以使用sha256作为索引，不过capi_checksum256也需要先进行转换。

**checksum256 to sha256:**

```c++
static eosio::checksum256 checksum256_to_sha256(const capi_checksum256& hash) {
  const uint128_t* p128 = reinterpret_cast<const uint128_t*>(&hash);
  eosio::checksum256 k;
  k.data()[0] = p128[0];
  k.data()[1] = p128[1];
  return k;
}
```

**table的定义:**

```c++
struct [[eosio::table("byhash"), eosio::contract("testcontract")]] byhash {
  // transaction_id 为capi_checksum256类型数据
  uint64_t index;
  capi_checksum256 transaction_id;

  uint64_t primary_key() const { return index; }
  //二级索引为sha256类型
  eosio::checksum256 by_hash() const {
    return checksum256_to_sha256(transaction_id);
  }

  //参数序列化，可有可无，加入的话可以提升编译速度
  EOSLIB_SERIALIZE(byhash, (index)(transaction_id))
};
//实例化，一级索引表名为index，二级索引名为hash，
typedef eosio::multi_index<
    "index"_n,
    byhash,
    eosio::indexed_by<
        "hash"_n,
        eosio::const_mem_fun<byhash, eosio::checksum256, &byhash::by_hash>>>
    hash_table;
```

**合约中数据的添加:**

```c++
//获取transaction id
cap_checksum256 transaction_id = get_hash();
hash_table hashs(get_self(), get_self().value);
//表中添加数据
hashs.emplace(get_self(), [&](auto& h) { 
  //每插入一条数据index自增+1
  h.index = hashs.available_primary_key();
  h.transaction_id = transaction_id; 
});
```

**查找:**

通过index一级索引查找方式和上面提到的方式相同。
这里介绍下二级索引查找方式：
```c++
hash_table hashs(get_self(), get_self().value);
//获取二级索引表hash
auto by_hash = hashs.get_index<"hash"_n>();
//查找hash表中transaction_id对应数据
auto it = by_hash.require_find(checksum256_to_sha256(transaction_id),
                               "hash not exist!");
```
改方法还可以通过cleos get table 查询到`hash`表中指定transaction id 的数据，并显示。查询命令：
```
cleos get table testcontract(合约账号) testcontract(创建表格的scope) index(一级索引表名) --key-type sha256 --index 2 -L (transaction_id) -U (transaction_id)
```