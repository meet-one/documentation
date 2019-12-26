# ECDSA Node.js

> 支持我们，请投票给 rex.m

## 前情

上篇《[ECC Node.js](ecc-nodejs.md)》讲解椭圆曲线点的计算。本篇分析椭圆曲线签名算法。

## 代码

<https://github.com/UMU618/secp256k1-tools>

## 范例数据

已知，待签名数据为：

```js
const data = Buffer.from(
  // chainId
  'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906'
  // serializedTransaction
  + 'c0fbc75d000000000000000000000000'
  // sha256 of serializedContextFreeData
  + '0000000000000000000000000000000000000000000000000000000000000000', 'hex')
```

运行 `node ecc-sign.js`，信息摘要为：

```js
[
  204,  24,  57, 178,  84, 129,  31, 104,
   99,  30, 100, 210,   3,  38,  31, 168,
  138, 248, 252, 131, 196,  14, 203, 152,
   34, 152, 102, 149, 181,  94, 182, 148
]
```

签名为：

```js
Uint8Array [
   27,  36, 211, 214,  45,  20, 219,  85, 150,  70, 174,
  229, 131, 173,  20,  61,  37, 129, 232,  80,  19, 164,
   36, 249, 132,  56,  36,  74, 210,  34, 221,  98, 164,
   68,   6, 237,  42, 240, 227, 212,  33, 105, 239, 200,
   11,  59,  11, 148, 226,  85, 212, 106, 250, 155,  34,
   25, 101,  69, 159, 138, 157, 114,  44,  38, 202
]
```

签名的字符串形式为：`SIG_K1_Gg74ULRryVHxYZvMRLJgTrAZW6PZGC5SYfUiswtMJxBwfTTnGEnTejeWXopL2oSs8EZD7mqAC8mCps6VKq95Bgic9tGNHJ`

## 分析

数值全部使用 16 进制表示。

1. 范例使用的钥匙对

  - 签名私钥：5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3

  - k = `d2653ff7cbb2d8ff129ac27ef5781ce68b2558c41a74af1f2ddca635cbeef07d`

  - 对应的公钥：EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV

  - K = [`c0ded2bc1f1305fb0faac5e6c03ee3a1924234985427b6167ca569d13df435cf`, `eeceff7130fd352c698d2279967e2397f045479940bb4e7fb178fd9212fca8c0`]

2. 信息先用 sha256 算法计算摘要，范例中值为 h = `cc1839b254811f68631e64d203261fa88af8fc83c40ecb9822986695b55eb694`

3. 签名数据一共 65 字节，第一个字节 [27] 是 recoveryParam，使用前要先减去 27，它的一个作用是区别 y 坐标值的奇偶性，后面是两个 256bit 数，分别记为 x、s，x 是随机私钥 r 在椭圆曲线上的点 rG 的 x 坐标值，s = (h + k * x) / r。

  - x = `24d3d62d14db559646aee583ad143d2581e85013a424f98438244ad222dd62a4`
  - s = `4406ed2af0e3d42169efc80b3b0b94e255d46afa9b221965459f8a9d722c26ca`

  - **注意**：elliptic 库把本文的 x 记为 r，为了和算法保持一致，UMU 没有采用 elliptic 的标识方式。

4. 计算 rG = [`24d3d62d14db559646aee583ad143d2581e85013a424f98438244ad222dd62a4`, `bc336258d8f1789ad949773ef4abfe6a6e56c9dd77754e18869c7ab2801a4ae2`]

```js
const BN = require('bn.js')
const elliptic = require('elliptic')

const x = new BN('24d3d62d14db559646aee583ad143d2581e85013a424f98438244ad222dd62a4', 16, 'be')
console.log('x =', x.toString(16))

// (27 - 27) & 1 是偶数，取偶数的 y
const p_even = elliptic.curves.secp256k1.curve.pointFromX(x, false)
console.log('y_even = ', p_even.getY().toString(16))
// const p_odd = elliptic.curves.secp256k1.curve.pointFromX(x, true)
// console.log('y_odd  = ', p_odd.getY().toString(16))
```

5. 计算 hG/s + x * K/s

  - u1 = h/s = `b774bb6040cced0596626026679594b2b5478e6a5a8ba25b3411ed5360ea6bfa`

  - u2 = x/s = `5697dfd4caab3caa0ed315a97f99f1ad7bce1ce85e0be32c63847d1dd4be327a`

  - result = u1 * G + u2 * K = [`24d3d62d14db559646aee583ad143d2581e85013a424f98438244ad222dd62a4`, `bc336258d8f1789ad949773ef4abfe6a6e56c9dd77754e18869c7ab2801a4ae2`]，与 rG 一致，签名验证通过。

```js
const BN = require('bn.js')
const elliptic = require('elliptic')

const k1 = elliptic.curves.secp256k1
const h = new BN('cc1839b254811f68631e64d203261fa88af8fc83c40ecb9822986695b55eb694', 16)
const s = new BN('4406ed2af0e3d42169efc80b3b0b94e255d46afa9b221965459f8a9d722c26ca', 16)
// u1 = h/s
const sinv = s.invm(k1.n)
const u1 = h.mul(sinv).umod(k1.n)
u1.toString(16)

const x = new BN('24d3d62d14db559646aee583ad143d2581e85013a424f98438244ad222dd62a4', 16)
// u2 = x/s
const u2 = x.mul(sinv).umod(k1.n)
u2.toString(16)

const k = new BN('d2653ff7cbb2d8ff129ac27ef5781ce68b2558c41a74af1f2ddca635cbeef07d', 16)
const K = k1.g.mul(k)
const result = k1.g.mulAdd(u1, K, u2)  // k1.g.mul(u1).add(K.mul(u2))
result.getX().toString(16)
result.getY().toString(16)
```

## 数学原理

参考：[椭圆曲线加密和签名算法](https://blog.csdn.net/gao131360144/article/details/79978516)

hG/s + xK/s = hG/s + x(kG)/s = (h + xk)G/s = r(h + xk)G / (h + kx) = rG
