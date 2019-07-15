# 智能合约之公钥的解析

在 eosio.cdt 标准库的 crypto.hpp 中定义了公钥的结构体 public_key:

```c++
struct public_key {
  // 公钥的类型，可以是 K1 或者 R1    
  unsigned_int        type;

  // 公钥的数据，33字节    
  std::array<char,33> data;
  
  //...
}
```

`type` 是私钥生成公钥的加密算法，`K1` 和 `R1` 分别代表的是椭圆曲线加密算法 `secp256k1` 和 `secp256r1`。`cleso` 客户端提供了基于两种加密算法的公私钥生成命令：

生成基于 `secp256k1` 算法的公私钥：

```
cleos create key --to-console
Private key: 5K93psBGUHkkKekjC8ewvA2LZ7MXinwJf6Zve5eWjktochWyUaF
Public key: EOS5G9qEF6oMaDAwJCK8j7MQzrRcbic2N5Qui1mArnAVrZK9mgZBJ
```

生成基于 `secp256r1` 算法的公私钥：

```
cleos create key --r1 --to-console
Private key: PVT_R1_Sm695uzbqU3dcCwnpMBFWKN34AMq1fjSjanuG3WU8zj5K76pb
Public key: PUB_R1_7SzfmRTn5YFewuShcM3FWAjBoBJgPsfaEG2ptigqTATBrCo8iA
```

从上面生成的公私钥可以看出，在 EOS 上面我们使用的公私钥是基于 `secp256k1` 算法。

结构体 `public_key` 中 `data` 存储的是上述生成的 Public key 经过 Base58check 解码后的字节。

**Base58check 编码**

Base58check 是在 Base58 的基础上加入 4 个字节的校验码，而 Base58 又是在 Base64 的基础上去除容易混淆的字母：0、O、l、I，和"+"、"-"符号。通过 Base58check 编码后将长串的数字，使用更少的符号来表示。

Base58 字母表：

```
123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz
```

Base58check 编码过程：

1. 计算原始数据（data）的 sha256 哈希值得到 S1;
2. 对 S1 再计算 sha256 哈希值的 S2，即（sha(sha256(data))）；
3. 取 S2 前 4 个字节作为校验码 checksum；
4. 在原始数据（data）末尾添加 checksum，得到 S3；
5. 对 S3 做 base58 编码，得到最终编码结果。

原始数据是指私钥经过 `secp256k1` 椭圆曲线加密算法得到的（这是一个不可逆的过程，所以想从公钥推出私钥是不可能的，只能做一些验证），上述是 Base58check 编码过程，但是在 EOS 上做了一些变动，checksum 取的是 ripemd160 后的前 4 个字节作为校验码。[click me](https://github.com/EOSIO/eosjs-ecc/blob/7ec577cad54e17da6168fdfb11ec2b09d6f0e7f0/src/key_utils.js#L191)

**Base58check 解码**

1. 对数据进行 Base58 解码，得到 D1；
2. 去掉 D1 最后 4 个字节得到 D2，取 D1 的最后 4 个字节的校验码为 checksum；
3. 计算 D2 的 sha256 得到 D3；
4. 计算 D3 的 sha256 得到 D4；
5. 取 D4 的前 4 个字节与 checksum 进行匹配，成功匹配则获得解码后数据。

关于 Base58check 编解码的具体源代码可以参考比特币相关项目。[click me](https://github.com/bitcoin/bitcoin/blob/master/src/base58.cpp)

## 实战

那么如何验证一串字符串类型的公钥解析正确？
下面将从一个实际的 EOS 公钥解析标准库中对应的公钥结构体 `public_key`。

```
EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV
```

这是 EOS 常见的公钥类型，去掉前缀 `EOS`：

```c++
std::string base58_payload =
    "6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV";
```

这 50 个字符就是基于 Base58check 编码得到的。

```c++
std::vector<unsigned char> vch;
// DecodeBase58() from https://github.com/bitcoin/bitcoin/blob/master/src/base58.cpp,
// 返回 true 表示解码成功
eosio::check(DecodeBase58(base58_payload, vch), "decode public key failed");
// 33 个字节是解析后的 data，后 4 个字节是校验码
eosio::check(vch.size() == 37, "invalid public key length");
// 声明 public_key 的 key
eosio::public_key key;
// 将 vch 前 33 个字节拷贝到 key 中
copy_n(vch.begin(), 33, key.data.begin());
// 声明 checksum 用于获取校验码相关
eosio::checksum160 checksum;
checksum = eosio::ripemd160(key.data.data(), 33);
// 对比校验码一致则说明输入的公钥和解析后的结果是真确的
eosio::check(std::equal(vch.cend() - 4, vch.cend(),
                          checksum.extract_as_byte_array().data()),
               "wrong checksum for public key");
```

上述公钥解码后在是 37 字节的二进制数据，十进制表示如下：

```
2 192 222 210 188 31 19 5 251 15 170 197 230 192 62 227 161 146 66 52 152 84 39 182 22 124 165 105 209 61 244 53 207 235 5 249 210
```

后 4 个字节 `235 5 249 210` 是 ripemd160 得到的校验码。去掉后剩余的 33 个字节就是在 `crypto.hpp` 定义的 `public_key` 类型中 `data` 的数据。