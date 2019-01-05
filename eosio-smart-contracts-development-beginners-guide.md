# 程序员鼓励师系列：EOSIO 智能合约开发从入门到入定

> 作者: UMU @ MEET.ONE 实验室

## 常规入门流程

经典三步：

1. 了解区块链基本概念，了解 EOS 基本情况；

2. 看[官方开发者文档](https://developers.eos.io/eosio-cpp/docs)；

3. 开始愉快地写代码。

但是，有个很大的问题：开发语言居然是 C++！所以，鼓励师出场了……

## 这不是 C++，这不是 C++，这真是不是 C++

不信？我们就来试一试：

```
error: cannot use 'try' with exceptions disabled
        try {
        ^
```

智能合约的编译目标是 WASM 文件，最终要在 WASM 的 VM 里运行，比如 [wabt][wabt]，这和常规情况下使用原生 C++ 开发可执行程序、静态库、动态库等，有很大不同。

受限部分包括：

- 语言特性。比如上面举例的 try。

- 可调用外部函数。比如 CRT 的 rand 函数，再比如您想用 socket 自由通信……没门。

- 内存访问。这个比较难解释，后面再说。

如果您学过 Golang、Python、nodejs、Java 或其它相近语言，转到智能合约开发，可以说是轻而易举。理由如下：

1. 智能合约关注业务逻辑，和大部分脚本语言类似。

2. 智能合约有很强的约束范围，API 很有限，不会要求记忆大量知识。举个例子，它可以使用 boost，但也只是子集，无法使用完全的 boost。

3. 智能合约有很强的套路，代码是满满的既定格式。熟悉 Hello world，会用基本的命令行工具进行测试，最多只需要 2 天，就会发出“原来这么简单”的感叹。

## 【高级话题】关于 WASM

### 多语言支持

如果您学过 Golang、Rust 可能会注意到，它们可以编译成 WASM 文件。比如 Golang 的编译命令为：

```bash
GOOS=js GOARCH=wasm go build -o hello.wasm
```

但是找个 Hello world 编译一下，您可能会哭，产生的 WASM 文件有 2.3MB，就获得一个打印信息……（EOS 基本概念：RAM 挺贵的。）

虽然现状是 C++ 一枝独秀，但未来可能会有人开发专门的编译器支持 Golang、Rust 等语言开发 EOS 智能合约。

### WASM 逆向

[VSCode](https://code.visualstudio.com/) 安装插件后可以直接打开 WASM 文件，显示 WAST 代码，比如我们随便打开一个 hello.wasm，滚动到末尾，可能会看到以下两行：

```WebAssembly
  (data (i32.const 8192) "read\00")
  (data (i32.const 8197) "get\00malloc_from_freed was designed to only be called after _heap was completely allocated\00"))
```

下面我们写个 C++ 代码：

```cpp
const char* p = reinterpret_cast<const char*>(8192);
eosio::print(p);
```

以上代码，打印出 `read`。如果把 `8192` 改为 `8197`，则打印 `get`；改为 `8201`，打印 `malloc_from_freed was designed to only be called after _heap was completely allocated`。

这个例子可能吓倒大家，特别交代下，一般开发中，较难遇到逆向……只是想说明 WASM 的内存管理和常规 C++ 开发的可执行程序是不同的，后者把指针指向 8192，是 Process Working Set 的地址，通常来说去读这么低的地址，后果极可能是读异常，挂掉。

**划重点**：虽然你用 C++ 写代码，但编译后是 WASM 二进制编码，运行时使用 VM，受控性很强，降低了开发难度，也杜绝很多安全问题。

### 性能问题

为了讨好 Python 程序员，下面用 Python 来写个开平方运算，有这样的：

```Python
import math

print(math.sqrt(2.0))
```

也有这样的：

```Python
import numpy

print(numpy.sqrt(2.0))
```

他们有个共同点——很快……相对 C++ 写的！！有点难以理解？

Python 的 sqrt 函数，其实都是用 C 语言实现的，最终都是调用解释器里的本地代码，速度很快。

原生 C++ 写的本地程序，几乎肯定是比 Python 快的，但我们前面说过：智能合约的 C++ 不是常规的 C++，当它被编译成 WASM 后，我们去看 WAST 代码，会发现 sqrt 的实现整个被塞进 WASM 里，它最终要用 VM 来执行，当然没有 Python 解释器快了！

### 设计原则

打开任意 WASM 文件，可以看到里面很多 `(import` 开头的行，这些都是原生 C++ 实现的 API，它们的执行速度就是本地代码的速度，对应[官网 API 文档](https://eosio.github.io/eosio.cdt/modules.html)里的 API。

有前面的性能问题，我们不禁要问 EOS 为什么不多做点 API 来提高性能？这是因为维护少量 API 代价比较可控，数量一多就有版本问题，各节点可能因为版本不同步而无法达成共识。

另外，目前的 [wabt][wabt] 功能强大，性能也过得去，对于 sqrt 此类可能并不常用的数学函数，即使用原生 C++ 实现了，性能提升带来的好处，也无法平衡多版本可能带来的风险。

原则上，BP 之间快速达成共识，提升 TPS 才是更值得做的。

[wabt]:https://github.com/WebAssembly/wabt
