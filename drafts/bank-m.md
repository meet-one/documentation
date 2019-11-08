# bank.m 重构

## 合约改进

1. 支持多币、多链

  - 每种币的最低转账数量可配置

2. memo 改造，兼容旧格式

  - 旧格式：只有一个目标账号，存到 receiver 字段

  - 新格式：目标账号@链名 自定义内容

    * 链名有默认值，可配置。旧格式没有链名，采用默认值。存到 chain 字段。

    * 第一个空格之后全部都是自定义内容，存到 memo 字段。

    * 先找到**第一个空格**，如果没有空格，是旧格式；有则把 memo 分成两段，再从前一段找 @，没找到则使用默认链名。

  - 例子：

    * eosiomeetone

    * eosiomeetone@eos

    * eosiomeetone Hello world!

    * eosiomeetone@eos Hello world!

## 同步脚本改进

1. 支持多币、多链

  - 每个链名对应各自链 ID 和 URL

2. memo 改造，兼容旧格式

  - memo 字段值是空，则用 receiver 字段产生旧格式 memo

  - memo 字段值非空，则直接用 memo

3. 代码风格：npm-coding-style

4. 可配置项统一放在独立文件
