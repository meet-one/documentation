# pre_dispatch 和 post_dispatch

> 支持我们，请投票给 rex.m

## pre_dispatch 

在运行通知处理程序之前会触发 `pre_dispatch` 进行一些预先的验证，必须得有返回值，返回值为 bool 类型。如果需要提前退出, 则返回false。如果函数返回true，则调度程序会继续执行 ACTION 的操作或通知处理程序。

```c++
#include <eosio/eosio.hpp>

CONTRACT hello : public eosio::contract {
 public:
  using eosio::contract::contract;
  
  [[eosio::action]] void hi (eosio::name user) {
    eosio::print("hi ", user);
  }
};
extern "C" bool pre_dispatch(eosio::name receiver, eosio::name code, 
                             eosio::name action){
  print_f("pre_dispatch : % % %\n", receiver, code, action);
  return true;
}
```
将该合约部署到 hello 账户后，输入下面命令行：

```
cleos push action hello hi '["meetonetest1"]' -p hello
```

测试环境在本地可以通过查看打印的 log。

```
[(hello,hi)->hello]: CONSOLE OUTPUT BEGIN =====================
pre_dispatch : hello hello hi
hi meetonetest1
[(hello,hi)->hello]: CONSOLE OUTPUT END   =====================
```

从上面打印的 log 信息可以看出 pre_dispatch 是在 action 之前就执行了。
如果 pre_dispatch 返回值改为 false, 重新部署和运行结果：

```
[(hello,hi)->hello]: CONSOLE OUTPUT BEGIN =====================
pre_dispatch : hello hello hi

[(hello,hi)->hello]: CONSOLE OUTPUT END   =====================
```
对比发现，没有打印 hi action 中的信息。pre_dispatch 返回结果为 false，后续的 action 将不会被执行。

*注意*

使用 pre_dispatch 条件是必须需要有 action，没有 action 只有 `[[eosio::on_notify("")]]` 通知处理程序也是不被运行的，编译时会提示：

```
/usr/local/eosio.cdt/bin/wasm-ld: error: fatal failure: contract with no actions and trying to create dispatcher
```

## post_dispatch

当未能匹配任何 `[[eosio::on_notify("")]]` 通知处理程序时 post_dispatch 触发，没有返回值。

```c++
#include <eosio/eosio.hpp>

CONTRACT hello : public eosio::contract {
 public:
  using eosio::contract::contract;
  
  [[eosio::action]] void hi (eosio::name user) {
    eosio::print("hi ", user);
  }
  [[eosio::on_notify("eosio.token::transfer")]] void eos_transfer() {
    eosio::print("eos transfer");
  }
  [[eosio::on_notify("*::test")]] void on_test(){
    eosio::print("on test");
  }
};
extern "C" void post_dispatch(eosio::name receiver, eosio::name code, 
                             eosio::name action){
  print_f("post_dispatch : % % %\n", receiver, code, action);
}
```

部署合约到 hello 账户，给 hello 账户转 EOS：

```
cleos push action eosio.token transfer '["meetonetest1","hello","1.0000 EOS","test"]' -p meetonetest1

[(eosio.token,transfer)->hello]: CONSOLE OUTPUT BEGIN =====================
eos transfer
[(eosio.token,transfer)->hello]: CONSOLE OUTPUT END   =====================
```

post_dispatch 没有被触发。

当给 hello 转其他代币时候：

```
cleos push action eosiomeetone transfer '["meetonetest1","hello","1.0000 MEETONE","test"]' -p meetonetest1

[(eosiomeetone,transfer)->hello]: CONSOLE OUTPUT BEGIN =====================
post_dispatch : hello eosiomeetone transfer

[(eosiomeetone,transfer)->hello]: CONSOLE OUTPUT END   =====================
```

因为未能匹配到合约中有 `[[eosio::on_notify("eosiomeetone::transfer")]]` 通知处理程序所以触发 post_dispatch。

*注意*

和使用 pre_dispatch 一样 post_dispatch 合约必须要有 action，其次当然必须要有 `[[eosio::on_notify("")]]` 毕竟是配合它使用的。

```
  [[eosio::on_notify("*::test")]] void on_test(){
    eosio::print("on test");
  }
```

上述这个段代码看起来没什么用，其实真的没什么用，但是缺了又编译不过去，必须得有一个通配符 `*` 类型的通知处理程序。

- `个人观点`: 上面提到的 pre_dispatch 和 post_dispatch 注意点可能是目前 cdt v1.6.1 版本编译器的一个 bug 吧。