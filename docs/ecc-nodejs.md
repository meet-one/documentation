# ECC Node.js

## 前情

上篇《[基于 ECC 的私钥转为公钥的过程](private-key-to-public-key.md)》讲到求椭圆曲线上的点时，用的是基于 Python 的 [SAGE][sage]。为了方便 Node.js 程序员理解和实现完整流程代码，本篇用 Node.js 库实现椭圆曲线点的计算。

## 用 Node.js 求椭圆曲线的点

库的选型考虑 [eosjs](https://github.com/EOSIO/eosjs) 用的 [ecurve](https://github.com/cryptocoinjs/ecurve) 和 [elliptic](https://github.com/indutny/elliptic)。

### 1. ecurve

```js
const ecurve = require('ecurve')
const BigInteger = require('bigi')

const k1 = ecurve.getCurveByName('secp256k1')
const pk = BigInteger.fromHex('d2653ff7cbb2d8ff129ac27ef5781ce68b2558c41a74af1f2ddca635cbeef07d')
const pub = k1.G.multiply(pk)
pub.affineX.toHex()
pub.affineY.isEven()
```

得到 x 值为 `c0ded2bc1f1305fb0faac5e6c03ee3a1924234985427b6167ca569d13df435cf`，y 为偶数，和 [SAGE][sage] 计算结果一样。

### 2. elliptic

流程基本一样，所以这里给出完整转换代码。

```js
#!/usr/bin/env node

/**
 * @author UMU618 <umu618@hotmail.com>
 * @copyright MEET.ONE 2019
 * @description Use block-always-using-brace npm-coding-style.
 */

'use strict'

const bsc = require('bs58check')
const ripemd160 = require('ripemd160')
const bs = require('bs58')
const elliptic = require('elliptic')
const BN = require('bn.js')

function encodePublicKey(payload) {
  const checksum = new ripemd160().update(payload).digest()

  return bs.encode(Buffer.concat([
    payload,
    checksum.slice(0, 4)
  ]))
}

function privateKeyToPublicKey(privateKey) {
  const buf = bsc.decode(privateKey)
  if (0x80 !== buf[0]) {
    throw new Error('Not a private key.')
  }
  const k1 = elliptic.curves.secp256k1
  const pvt = new BN(buf.slice(1), 'be')
  const pub = k1.g.mul(pvt)
  const y = pub.getY().isEven() ? 2 : 3
  return 'EOS' + encodePublicKey(Buffer.from([y].concat(pub.getX().toArray())))
}

const privateKey = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3'
const publicKey = privateKeyToPublicKey(privateKey)

console.log(privateKey)
console.log(publicKey)
```

# 代码

<https://github.com/UMU618/secp256k1-tools>

[sage]: https://sagecell.sagemath.org/
