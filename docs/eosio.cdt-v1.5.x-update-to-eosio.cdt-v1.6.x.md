# eosio.cdt v1.5.x 更新 v1.6.x

此次版本的更新，提供自动化、调试工具、新功能来创建更加友好的智能合约开发体验。此次更新的亮点有以下几点：

## 1. 自动生成调度程序

在 `1.5.x` 及之前的版本中，在编写智能合约需要手动为每个 Action 添加调度器也就是常用的 EOSIO_DISPATCH 宏。`1.6.x` 之后版本根据合约中 `[[eosio::action]]`, `[[eosio::on_ontify]]` 属性自动生成调度程序，当然用户还是可以使用之前的宏以及 `apply` 方法自定义。

## 2. 通知处理的高级支持

`1.6.x` 之前版本需要合约开发者自己编写 `apply` 的调度器来监听指定合约的特定 ACTION 并做出相应的处理。`1.6.x` 为合约开发者量身定制了一套新的通知处理器 `[[eosio::on_notify(<code account>::<action name>)]]` , 非常方便合约开发者的使用。通知处理器会接收来自指定合约账户的特定 ACTION 的通知。当然如果想要接收所有合约的特定 ACTION 的通知（比如接收所有的 `transfer` ), 这时候只要 `<code account>` 设置成通配符 `*` 就可以了。

接收指定合约的特定 ACTION:

1.6.x 版本:

```c++
[[eosio::on_notify("eosio.token::transfer")]] 
void on_transfer(eosio::name from, eosio::name to, eosio::asset quantity, 
                 std::string memo){
  // code
}
```

`on_transfer` 的参数和 `eosio.token` 的 `transfer` 方法参数一致。只有当某个账户使用 `eosio.token` 的 `transfer` 给合约账户转账时才会出发 `on_transfer` 方法。

接收任意合约的特定 ACTION:

```c++
[[eosio::on_notify("*::transfer")]] 
void on_transfer(eosio::name from, eosio::name to, eosio::asset quantity,
                 std::string memo){
  //code
}
```

这样，不管合约接收来之某种代币的转账都会触发 `on_transfer` 方法。

以下是 1.5.x 版本:

```c
void on_transfer(eosio::name from, eosio::name to, eosio::asset quantity,
                 std::string memo){
 // code
}
extern "C" void apply(capi_name receiver, capi_name code, capi_name action){
  if (code == "eosio.token"_n.value && action == "transfer"_n.value) {
      eosio::datastream<const char*> ds =
          eosio::datastream<const char*>(nullptr, 0);
      eosio::execute_action(eosio::name(receiver), eosio::name(code),
                            &contranct_name::on_transfer);
}
```

此外，提供了来两个新钩子(hook): `pre_dispatch` 和 `post_dispatch`。

`pre_dispatch`: 在运行 `action` 之前触发 `pre_dispatch` 进行一些预先的验证。

`post_dispatch`: 当未能匹配任何 `eosio::on_notify` 通知处理程序时触发。 

## eosiolib 分区

C API 不再适用于基于 C++ 开发的合约。如果想用继续使用 C API 则需要使用 C 来构建智能合约，但是会失去自动生成调度程序的功能以及 C++ 接口。

`eosiolib` 库的文件被分成了 3 个部分：`capi`(.h 头文件)、`contracts`(.hpp 文件)、`core`(.hpp 文件)：
- `capi`：只适用于纯 C 开发的智能合约，包含10个头文件
- `contracts`：适用于 C++ 开发的智能合约，包含11个头文件
- `core`：适用于任何模式的使用eosio-cpp进行编译的智能合约，包含14个头文件

详细目录变更可查看[《Upgrading guides》](https://eosio.github.io/eosio.cdt/1.6.0/upgrading/1.5-to-1.6.html)

## 已知 bug

目前发现的以下 release v1.6.1 版本的 `bug`:

1. 合约不能没有 ACTION, 所以不管有用没用都得加一个。

错误信息：
```
**wasm-ld: error: fatal failure: contract with no actions and trying to create dispatcher**
```

2. 想用使用通配符 `*` 类型的通知处理 `[[eosio::on_notify("*::<action name>")]]` 则必须要同时写一个明确的通知处理 `[[eosio::on_notify("<code account>::<action name>")]]`

错误信息：
```
error: else expression without matching if
000035b: error: OnElseExpr callback failed 
```

3. 使用 `eosio::check_transaction_authorization` 时会有警告信息，主要是应为没有 retrun 值的原因。

不过以上已知问题在 1.6.1_fix 分支下已经被修复，所以在使用 v1.6.1 时需要注意。