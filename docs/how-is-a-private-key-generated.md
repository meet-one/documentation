## eosjs-ecc 是如何生成私钥的

### 生成 256 位的私钥

1. 通过 [randombytes](https://github.com/crypto-browserify/randombytes) 生成一个 32 字节的随机数。

2. 在 1 秒内进行 128 次浮点运算，通过衡量每一次运算的 CPU 速度变化生成一组随机数。

3. 通过 [randombytes](https://github.com/crypto-browserify/randombytes) 生成一个 101 字节的随机数。

4. 获取浏览器窗口大小 + 语言种类 + 历史记录长度 + mime 类型生成随机数。

5. 对上面 4 个随机数进行 SHA-256 hash，生成 32 字节的随机数。


### 将私钥转成 WIF 钱包导入格式(Wallet Import Format)

1. 假如我们通过上一步骤生成了一个全是 0 的 256 位的私钥，将其转换成 32 字节。

```
0000000000000000000000000000000000000000000000000000000000000000
```

2. 将 0x80 加在私钥前面用户方便识别这是一个私钥。

```
800000000000000000000000000000000000000000000000000000000000000000
```

3. 通过 SHA-256 对私钥进行 hash

```
ce145d282834c009c24410812a60588c1085b63d65a7effc2e0a5e3a2e21b236
```

4. 再次进行 SHA-256 hash

```
0565fba7ebf8143516e0222d7950c28589a34c3ee144c3876ceb01bfb0e9bb70
```

5. 取出前 4 个字节作为私钥的校验码

```
0565fba7
```

6. 将 4 个字节的校验码加入第二步的私钥结尾

```
8000000000000000000000000000000000000000000000000000000000000000000565fba7
```

7. 使用 [bs58](https://github.com/cryptocoinjs/bs58) 对生成的私钥进行 Base68 转换，最终生成的私钥为:

```
5HpHagT65TZzG1PH3CSu63k8DbpvD8s5ip4nEB3kEsreAbuatmU
```


[Wallet Import Format Specification (WIF)](https://developers.eos.io/keosd/docs/wallet-import-format-specification-wif)

