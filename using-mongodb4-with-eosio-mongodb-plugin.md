# 改进 EOSIO MongoDB 插件以兼容 MongoDB 4.0.4

## 问题描述

在前文《为 EOSIO MongoDB 插件搭建高可用集群》中，我们使用了 MongoDB 4.0.4，如果直接配套 EOSIO 1.5 版本，MongoDB 插件会经常报 generic server error，并导致 nodeos 进程退出。

## 原因

- EOSIO 1.5 指定的 MongoDB 版本是 3.6.3；

- MongoDB 4.0 的客户端需要 MongoDB C Driver 1.11.0，而 EOSIO 1.5 用的是 1.10.2。

> 参考：[Release Notes for MongoDB 4.0](https://docs.mongodb.com/manual/release-notes/4.0/#drivers)

## 改进方案

修改 eos/scripts/eosio_build_{SYS_NAME}.sh，其中 SYS_NAME 是系统名字，以 macOS 为例，应该改的是 eos/scripts/eosio_build_darwin.sh。

- 把 mongo-c-driver 版本改到足够高，比如 1.13.0，即把脚本里的下载链接 `https://github.com/mongodb/mongo-c-driver/releases/download/1.10.2/mongo-c-driver-1.10.2.tar.gz ` 改为 `https://github.com/mongodb/mongo-c-driver/releases/download/1.13.0/mongo-c-driver-1.13.0.tar.gz`

- 把 mongo-cxx-driver 版本改到足够高，比如 3.4.0，可以直接把脚本里的 `git clone https://github.com/mongodb/mongo-cxx-driver.git --branch releases/v3.3 --depth 1` 改为 `
git clone https://github.com/mongodb/mongo-cxx-driver.git --branch releases/stable --depth 1`

然后编译、安装 eos。

> 参考：
>
> [mongo-c-driver 1.13.0](https://github.com/mongodb/mongo-c-driver/releases/tag/1.13.0)
>
> [MongoDB C++11 Driver 3.4.0](https://github.com/mongodb/mongo-cxx-driver/releases/tag/r3.4.0)
