# EOSIO 从零开始到发币

## 目录
* [EOSIO 客户端的安装](#EOSIO-客户端的安装)
* [创建钱包](#创建钱包)
* [本地配置和运行测试环境](#本地配置和运行测试环境)
  * [安装智能合约编译工具 eosio.cdt](#安装智能合约编译工具-eosio.cdt)
  * [编译和部署系统相关合约](#编译和部署系统相关合约)
  * [创建和发行系统代币](#创建和发行系统代币)
  * [初始化系统合约](#初始化系统合约)  
* [发行自己的代币](#发行自己的代币)
* [如何连接主网](#如何连接主网)
* [总结](#总结)

## EOSIO 客户端的安装

macOS 为例：

```shell
brew tap eosio/eosio
brew install eosio
```

在终端上输入 `cleos`, 终端显示如下则表示安装成功。

```
~ git:(master) ✗ cleos
ERROR: RequiredError: Subcommand required
Command Line Interface to EOSIO Client
Usage: cleos [OPTIONS] SUBCOMMAND

Options:
  -h,--help                   Print this help message and exit
  -u,--url TEXT=http://127.0.0.1:8888/
                              the http/https URL where nodeos is running
  --wallet-url TEXT=unix:///Users/kay/eosio-wallet/keosd.sock
                              the http/https URL where keosd is running
  -r,--header                 pass specific HTTP header; repeat this option to pass multiple headers
  -n,--no-verify              don't verify peer certificate when using HTTPS
  --no-auto-keosd             don't automatically launch a keosd if one is not currently running
  -v,--verbose                output verbose errors and action console output
  --print-request             print HTTP request to STDERR
  --print-response            print HTTP response to STDERR

Subcommands:
  version                     Retrieve version information
  create                      Create various items, on and off the blockchain
  convert                     Pack and unpack transactions
  get                         Retrieve various items and information from the blockchain
  set                         Set or update blockchain state
  transfer                    Transfer tokens from account to account
  net                         Interact with local p2p network connections
  wallet                      Interact with local wallet
  sign                        Sign a transaction
  push                        Push arbitrary transactions to the blockchain
  multisig                    Multisig contract commands
  wrap                        Wrap contract commands
  system                      Send eosio.system contract action to the blockchain.
```

## 创建钱包

命令行：

```shell
cleos wallet create --to-console
```

执行完后的结果：

```
Creating wallet: default
Save password to use in the future to unlock this wallet.
Without password imported keys will not be retrievable.
"PW5JKQWnL8ufC8JWeAjteaL4u91Md2HSvedKwpW2Rvo8kzomsgmmj"
```

会自动创建一个名为 default 的钱包，钱包的密码是 `PW5JKQWnL8ufC8JWeAjteaL4u91Md2HSvedKwpW2Rvo8kzomsgmmj`, 这个需要妥善保管，用于解锁钱包。

**查看钱包**

```
➜  test git:(master) ✗ cleos wallet list
Wallets:
[
  "default *"
]
```

其中 `*` 表示目前解锁的钱包，说明可以使用存储在该钱包下的私钥账户经常链上操作。

**创建其他名字钱包**

当然也可以创建自定义名字的钱包：

```
➜  test git:(hello) ✗ cleos wallet create -n awesome --to-console 
Creating wallet: awesome
Save password to use in the future to unlock this wallet.
Without password imported keys will not be retrievable.
"PW5Ji38j4MqcrmmVcHu53YFcEGh3FG9yWoaDLBzoPUMceScYFugUt"
```

这里创建了一个叫 `awesome` 的钱包。

```
➜  ~ git:(master) ✗ cleos wallet list   
Wallets:
[
  "awesome *",
  "default *"
]
```

创建钱包时候没有指定路径的话，会在 `home` 根目录下创建 `eosio-wallet` 文件夹，存储钱包和私钥的相关信息，其目录结构如下：

```
➜  ~ git:(master) ✗ tree eosio-wallet 
eosio-wallet
├── awesome.wallet
├── config.ini
├── default.wallet
├── keosd.sock
└── wallet.lock

0 directories, 5 files
```
**导入私钥到钱包**

需要导入的私钥及其对应的公钥

```
private key:

5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3

public key:

EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV
```

为了方便，接下来文章中的账户都使用的是上述公私钥。

```
cleos wallet import --private-key 5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3

imported private key for: EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV
```

上述指令将会在 `default` 钱包中导入上述私钥，在实际的环境中最好是不要使用 `--private-key` 的明码的形式来导入私钥。

**关闭钱包**

```shell
cleos wallet lock_all
```

关闭所有钱包。默认情况下 15 分钟没有使用钱包的话会自动关闭，如果想修改时间长度的话可以修改 `config.ini` 中的 `unlock-timeout`。

**解锁钱包**

```shell
cleos wallet unlock -n awesome
```

会提示输入钱包的密码解锁对应钱包，`-n awesome` 不输入则解锁的是 `default` 默认钱包。

## 本地配置和运行测试环境

如果不想在本地搭建测试环境可以跳过该部分，或者在 [kylin](https://github.com/cryptokylin/CryptoKylin-Testnet) 上测试。
首先在根目录下创建一个叫 `test` 的文件夹，在文件夹底下创建一个叫 `config-dir` 的文件，需要配置一个 `config.ini ` 的文件，可以从 [EOISO 的 github 仓库下载](https://github.com/EOSIO/eos/blob/master/Docker/config.ini)。最后的目录结构如下：

```
➜  ~ git:(master) ✗ tree test
test
└── config-dir
    └── config.ini

1 directory, 1 file
```

运行以下命令：

```shell
nodeos --data-dir ./data-dir --config-dir ./config-dir --contracts-console -e --access-control-allow-origin='*'
```

```
.....
info  2019-05-28T03:26:33.064 thread-0  producer_plugin.cpp:744       plugin_startup       ] producer plugin:  plugin_startup() begin
info  2019-05-28T03:26:33.064 thread-0  producer_plugin.cpp:766       plugin_startup       ] Launching block production for 1 producers at 2019-05-28T03:26:33.064.
warn  2019-05-28T03:26:33.065 thread-0  transaction_context.cp:108    deadline_timer       ] Using polled checktime; deadline timer too inaccurate: min:6us max:1755us mean:401us stddev:527us
info  2019-05-28T03:26:33.066 thread-0  producer_plugin.cpp:778       plugin_startup       ] producer plugin:  plugin_startup() end
info  2019-05-28T03:26:33.505 thread-0  producer_plugin.cpp:1597      produce_block        ] Produced block 00000002541ce8cf... #2 @ 2019-05-28T03:26:33.500 signed by eosio [trxs: 0, lib: 0, confirmed: 0]
info  2019-05-28T03:26:34.005 thread-0  producer_plugin.cpp:1597      produce_block        ] Produced block 0000000301a75c22... #3 @ 2019-05-28T03:26:34.000 signed by eosio [trxs: 0, lib: 2, confirmed: 0]
info  2019-05-28T03:26:34.504 thread-0  producer_plugin.cpp:1597      produce_block        ] Produced block 00000004e65295bd... #4 @ 2019-05-28T03:26:34.500 signed by eosio [trxs: 0, lib: 3, confirmed: 0]
info  2019-05-28T03:26:35.004 thread-0  producer_plugin.cpp:1597      produce_block        ] Produced block 000000050d75f1cf... #5 @ 2019-05-28T03:26:35.000 signed by eosio [trxs: 0, lib: 4, confirmed: 0]
info  2019-05-28T03:26:35.503 thread-0  producer_plugin.cpp:1597      produce_block        ] Produced block 00000006eacaa58a... #6 @ 2019-05-28T03:26:35.500 signed by eosio [trxs: 0, lib: 5, confirmed: 0]
info  2019-05-28T03:26:36.004 thread-0  producer_plugin.cpp:1597      produce_block        ] Produced block 00000007e5e6cd3c... #7 @ 2019-05-28T03:26:36.000 signed by eosio [trxs: 0, lib: 6, confirmed: 0]
info  2019-05-28T03:26:36.503 thread-0  producer_plugin.cpp:1597      produce_block        ] Produced block 00000008a152e857... #8 @ 2019-05-28T03:26:36.500 signed by eosio [trxs: 0, lib: 7, confirmed: 0]
info  2019-05-28T03:26:37.005 thread-0  producer_plugin.cpp:1597      produce_block        ] Produced block 000000099e6d3d33... #9 @ 2019-05-28T03:26:37.000 signed by eosio [trxs: 0, lib: 8, confirmed: 0]
info  2019-05-28T03:26:37.501 thread-0  producer_plugin.cpp:1597      produce_block        ] Produced block 0000000a5f6a6b71... #10 @ 2019-05-28T03:26:37.500 signed by eosio [trxs: 0, lib: 9, confirmed: 0]
.....

```
出现上述信息，则说明本地测试环境正常运作。

```
➜  test git:(hello) ✗ cleos get info
{
  "server_version": "448287d5",
  "chain_id": "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f",
  "head_block_num": 604,
  "last_irreversible_block_num": 603,
  "last_irreversible_block_id": "0000025b18169f544d2c0165f39afc719f654eab48442489b417bba4eafa58cb",
  "head_block_id": "0000025cabb9f1c830ca7362ee1f62d928def769b00ee9c44ad4c8c95019527b",
  "head_block_time": "2019-05-28T03:32:12.500",
  "head_block_producer": "eosio",
  "virtual_block_cpu_limit": 365214,
  "virtual_block_net_limit": 1916544,
  "block_cpu_limit": 199900,
  "block_net_limit": 1048576,
  "server_version_string": "v1.7.3"
}
```

可以使用上述指令查看本地运行的 `eosio` 版本等信息。

本地默认运行是已经创建好 `eosio` 账户，查看该账户：

```
➜  test git:(hello) ✗ cleos get account eosio
created: 2018-06-01T12:00:00.000
privileged: true
permissions: 
     owner     1:    1 EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV
        active     1:    1 EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV
memory: 
     quota:       unlimited  used:      2.66 KiB  

net bandwidth: 
     used:               unlimited
     available:          unlimited
     limit:              unlimited

cpu bandwidth:
     used:               unlimited
     available:          unlimited
     limit:              unlimited
```

可以看到，`eosio` 账户的公钥正是我们前文中在 `default` 钱包中导入的私钥对应的公钥。

**创建系统相关的账户**

```shell
cleos create account eosio eosio.msig EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV
cleos create account eosio eosio.names EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV
cleos create account eosio eosio.ram EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV
cleos create account eosio eosio.ramfee EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV
cleos create account eosio eosio.stake EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV
cleos create account eosio eosio.token EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV
```

创建完账户后，需要下载系统相关合约。

在 `test` 目录下执行下面命令行下载合约。

```shell
git clone git@github.com:EOSIO/eosio.contracts.git
```

### 安装智能合约编译工具 eosio.cdt

macOS 为例：

```shell
brew tap eosio/eosio.cdt
brew install eosio.cdt
```

查看当前 `eosio.cdt` 版本:

```shell
eosio-cpp -version
```

### 编译和部署系统相关合约

先看一下 `test` 目录下的 `eosio.contract` 目录文件树：

```
➜  test git:(hello) ✗ tree eosio.contracts
eosio.contracts
├── CMakeLists.txt
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── build.sh
├── contracts
│   ├── eosio.msig
│   ├── eosio.system
│   ├── eosio.token
│   └── eosio.wrap
└── tests
```

`contracts` 文件下有 4 个系统合约相关文件: 

- `eosio.msig` : 多签相关的合约, 主网部署于 `eosio.msig` 上

- `eosio.system`: 系统合约, 用于创建账户、抵押 cpu 和 net、购买 ram 以及投票等等，主网部署于 `eosio` 账户上 

- `eosio.token`: 代币相关合约，提供创建、发布、销毁以及转账等代币操作，主网部署于 `eosio.token` 账户，主网 `EOS` 由该合约创建

- `eosio.wrap`: 超级权限相关，本地环境可以不使用

**编译 eosio.system 合约**

在 `eosio.system` 目录下执行：

```shell
eosio-cpp -contract=eosio.system -abigen ./src/eosio.system.cpp -o eosio.system.wasm -I=/usr/local/include/ -I=./include/ -I=../eosio.token/include
```

编译完后会在该目录下生成 `eosio.system.wasm` 和 `eosio.system.abi` 两个文件:

```
├── CMakeLists.txt
├── README.md
├── eosio.system.abi  *
├── eosio.system.wasm  *
├── include
└── src
```

**部署 eosio.system 合约**

合约部署在 `eosio` 账户上，在 `eosio.system` 目录下执行：

```
➜  eosio.system git:(master) ✗ cleos set contract eosio ../eosio.system
Reading WASM from /Users/kay/test/eosio.contracts/contracts/eosio.system/eosio.system.wasm...
Publishing contract...
executed transaction: c497a35c452972693eb4f8d2b96aa85dd4715586d769dc2db4424e4e8d855608  75072 bytes  8986 us
#         eosio <= eosio::setcode               {"account":"eosio","vmtype":0,"vmversion":0,"code":"0061736d010000000198033b60000060047f7f7f7f006005...
#         eosio <= eosio::setabi                {"account":"eosio","abi":"0e656f73696f3a3a6162692f312e310052086162695f686173680002056f776e6572046e61...
```

**编译和部署 eosio.token 合约**

**编译**

在 `eosio.token` 目录下执行：

```shell
eosio-cpp -contract=eosio.token -abigen ./src/eosio.token.cpp -o eosio.token.wasm -I=/usr/local/include/ -I=./include/
```

**部署**

合约部署在 `eosio.token` 账户下:

```
➜  eosio.token git:(master) ✗ cleos set contract eosio.token ../eosio.token
Reading WASM from /Users/kay/test/eosio.contracts/contracts/eosio.token/eosio.token.wasm...
Publishing contract...
executed transaction: 4ba2724ad4327aff3b83d04e154619a936684b82b65c63495f6605cc28caffcc  9592 bytes  1524 us
#         eosio <= eosio::setcode               {"account":"eosio.token","vmtype":0,"vmversion":0,"code":"0061736d0100000001bb011f60000060037f7e7f00...
#         eosio <= eosio::setabi                {"account":"eosio.token","abi":"0e656f73696f3a3a6162692f312e310008076163636f756e7400010762616c616e63...

```

### 创建和发行系统代币

使用 `eosio.token` 的 `create` action 创建本地测试网络系统代币 `EOS`, 发行者为 `eosio`

```shell
cleos push action eosio.token create '["eosio", "1000000000.0000 EOS"]' -p eosio.token
```

使用 `eosio.token` 的 `issue` action 发行可以流通的 `EOS` 的数量。

```shell
cleos push action eosio.token issue '["eosio", "1000000000.0000 EOS", "memo" ]' -p eosio
```

### 初始化系统合约

```shell
cleos push action eosio init '["0","4,EOS"]' -p eosio 
```

到此位置本地测试环境正式搭建完毕，可以愉快的开发合约和测试合约了。

## 发行自己的代币

**创建账户**

在发行代币之前，当然首先得有个 EOSIO 的账户：

```shell
cleos system newaccount eosio eosioawesome EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV --stake-net "1.0000 EOS" --stake-cpu "100.0000 EOS" --buy-ram "100.0000 EOS"
```

这里使用 `eosio` 账户创建 `eosioawesome` 并为其抵押了 1 EOS 的 NET 和 100 EOS 的 CPU，同时为其买了 100 EOS 的 RAM, 在实际的用于部署合约的话需要实现计算好需要消耗的 RAM。
以 1.6.x 版本的 eosio.token 合约，1.6.1 版本的 eosio.cdt 编译器为例：通过编译器生成的 eosio.token.wasm 文件大小是 25786 byte，eosio.token.abi 文件大小是 4426 byte，部署到主网需要消耗的 RAM 是：

```
.wasm * 10 + .abi
```

也就是 262286 byte。按目前主网的 RAM 价格1KB = 0.1348 EOS 计算，需要至少支付 35 EOS。

**部署合约**

可以使用 `eosio.token` 合约部署到 `eosioawesome` 账户来发币

```
cleos set contract eosioawesome ../eosio.token 
```

### action

**创建token (create)**

源码：

```c++
void token::create(name issuer, asset maximum_supply)
```

- `issuer`: 发行 token 的账户
- `maximum_supply`: 最大可发行量, 小数点后面表示精度。

命令行：

```shell
cleos push action eosioawesome create '["eosioawesome", "1000000000.0000 AWESOME"]' -p eosioawesome
```

- `-p`: 表示该 action 使用的账户权限 

创建完后会有个一个 `stat` 表，用于记录 token 的当前可流通量、总的可发行量以及可发行的账户：

```
➜  eosio.token git:(master) ✗ cleos get table eosioawesome AWESOME stat     
{
  "rows": [{
      "supply": "0.0000 AWESOME",
      "max_supply": "1000000000.0000 AWESOME",
      "issuer": "eosioawesome"
    }
  ],
  "more": false
}
```

- `supply`: 目前可流通的 token 数量
- `max_supply`: 最大可流通的 token 数量
- `issuer`: 空投或者发币的账户
- `more`: 是否还有未显示数据

`create` 创建了可以发行的token`AWESOME`，但是在市面上还不能流通，因为 `supply` 的值为 `0`，需要通过 `issue` 空投或发币来增加市面上可以流通的数量。

**空投或发币 (issue)**

源码：

```c++
void token::issue(name to, asset quantity, string memo)
```

命令行：

```shell
cleos push action eosioawesome issue '["eosioawesome", "100.0000 AWESOME","test"]' -p eosioawesome
```

通过命令行空投给 `eosioawesome` 账户空投了 `100.0000 AWESOME`，则当前可流通量 supply 增加了 `100.0000 AWESOME`，以下是查询结果：

```
➜  eosio.token git:(master) ✗  cleos get table eosioawesome AWESOME stat 
{
  "rows": [{
      "supply": "100.0000 AWESOME",
      "max_supply": "1000000000.0000 AWESOME",
      "issuer": "eosioawesome"
    }
  ],
  "more": false
}
```

`issue` 每发行一次会增加市面上可流通的 token 总数，`issue` 只能有 `issuer` 账户发起。空投需要开销较大的 RAM，不管是首次空投给新账户还是给自身，`issuer` 会为空投账户创建一张余额表 `accounts` 表，创建这张表会消耗 `240byte` 的 RAM。但是当用户使用 `transfer` action 来转账时会有 `128byte` 的 RAM 会返回给空投的账户，这 `128byte` 的 RAM 会由转帐的用户自己来支付，而 `112byte `则是空投账户的固定消耗，只有当用户 `close` 这个 token 时才会被完全释放，`close` 会在下文中提到。
查看被空投账户的余额表：

```
➜  eosio.token git:(master) ✗ cleos get table eosioawesome eosioawesome accounts
{
  "rows": [{
      "balance": "100.0000 AWESOME"
    }
  ],
  "more": false
}
```

这样的话 eosioawesome 口袋了相当于有了 100 块钱了，就可以买买买了，这就设计到转账 `transfer`。

**转账(transfer)**

源码：

```c++
void token::transfer( name    from,
                      name    to,
                      asset   quantity,
                      string  memo )
```

- `from`: 转出账户
- `to`: 收款账户
- `quantity`: 转出金额
- `memo`: 留言

```shell
cleos push action eosioawesome transfer '["eosioawesome","eosio","10.0000 AWESOME","hello eosio"]' -p eosioawesome
```

这里 `eosioawesome` 给 `eosio` 转了 `10.0000 AWESOME`，查看双方账户：

eosioawesome:

```
➜  eosio.token git:(master) ✗ cleos get table eosioawesome eosioawesome accounts                                  
{
  "rows": [{
      "balance": "90.0000 AWESOME"
    }
  ],
  "more": false
}
```

eosio:

```
➜  eosio.token git:(master) ✗ cleos get table eosioawesome eosio accounts                                                                
{
  "rows": [{
      "balance": "10.0000 AWESOME"
    }
  ],
  "more": false
}
```

**缩减可流通量(retire)**

源码：

```c++
void token::retire( asset quantity, string memo )
```

- `quantity`: 缩减数量
- `memo`: 留言

命令行：

```shell
cleos push action eosioawesome retire '["50.0000 AWESOME","for retire"]' -p eosioawesome
```

既然有增加流通量的 `issue`，自然也有缩减流通量的 action，上面的 `retire` 就是用于缩减当前流通量。缩减的前提是 `issuer` 账户的余额必须大于要缩减的数量。这里将回收 `50.0000 AWESOME` 来缩减当前可流通量。

查看 `eosioawesome` 余额表：

```
➜  eosio.token git:(master) ✗ cleos get table eosioawesome eosioawesome accounts
{
  "rows": [{
      "balance": "40.0000 AWESOME"
    }
  ],
  "more": false
}
```

`eosioawesome` 的余额从原来的 `90.0000 AWESOME` 减少为 `40.0000 AWESOME`。 

查看 `stat` 表：

```shell
cleos get table eosioawesome AWESOME stat
{
  "rows": [{
      "supply": "50.0000 AWESOME",
      "max_supply": "1000000000.0000 AWESOME",
      "issuer": "eosioawesome"
    }
  ],
  "more": false
}
```

可流通量 `supply` 从原来的 `100.0000 AWESOME` 减少为 `50.0000 AWESOME`。

**添加 token 余额表 (open)**

源码：

```c++
void token::open( name owner, const symbol& symbol, name ram_payer )
```

- `owner`：需要在创建 accounts 表的账户名
- `symbol`：token 的符号，包括精度，这里是 "4, AWESOME"
- `ram_payer`：为添加记录消耗 RAM 的账户

命令行：

```shell
cleos push action eosioawesome open '["eosio.token","4,AWESOME","eosioawesome"]' -p eosioawesome
```

`ram_payer` 账户和 `-p` 的账户名必须一致。在没有使用 `open` 前查看 `eosio.token` 的 `accounts` 表:

```shell
➜  eosio.token git:(master) ✗ cleos get table eosioawesome eosio.token accounts
{
  "rows": [],
  "more": false
}
```

使用命令行后：

```shell
➜  eosio.token git:(master) ✗ cleos get table eosioawesome eosio.token accounts
{
  "rows": [{
      "balance": "0.0000 AWESOME"
    }
  ],
  "more": false
}
```

上述命令行执行后 `eosioawesome` 会为 `eosio.token` 创建 `accounts` 表其中，相当于在银行开户了，而 `ram_payer` 也就是 `eosioawesome` 会为创建这条数据支付相应的 RAM 费用。

**删除 token 余额表 (close)**

源码：

```c++
void token::close( name owner, const symbol& symbol )
```

- `owner`: 需要删除余额表的账户名
- `symbol`: 需要删除余额表对应的 token

命令行：

```shell
cleos push action eosioawesome close '["eosio.token","4,AWESOME"]' -p eosio.token
```

`close` 相当于去银行销户，虽然开户 (open) 的时候由 `eosioawesome` 支付的 RAM 费用，但是 `close` 只能有其实际所有者才能执行该操作，这条命令执行后会将 `eosio.token` 账户中 token 为 `AWESOME` 的`accounts` 表删除，当然前提条件是 `balance` 值必须为 `0`，同时为该条 `balance` 记录支付 RAM 的 `eosioawesome` 账户会收回当时支付的 RAM。

执行后结果：

```shell
➜  eosio.token git:(master) ✗ cleos get table eosioawesome eosio.token accounts
{
  "rows": [],
  "more": false
}
```

## 如何连接主网

上述发币都是在本地测试环境中执行的，如果想在主网正式上线的话，只要在 cleos 后添加主网的全节点地址即使会广播到主网上：

例如：

```shell
cleos -u https://mainnet.meet.one set contract eosioawesome ../eosio.token
```

## 总结

eosio.token 合约已经相当成熟且经过了考验，毕竟在主网上使用，所以如果没有对自己发币账户有其他特殊要求的话，直接使用该合约部署到自己的发币账户是个省时省力省心的不二之选。
