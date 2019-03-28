# 单例模式 (Multi_index singleton)

`singleton` 其实是 Multi_index DB 的一种特例，也是用于存储合约的数据状态，只是它的只能存储一条记录。

## 单例模式的定义

接下来以一些简单例子来说明，这里单例表中定义了两个变量：布尔类型的 `is_active`,以及 `uint64_t` 类型的 `play_times`，表结构如下：

```c++
struct [[eosio::table]] game {
  bool is_active;
  uint64_t play_times;
}
```

从结构可以看出，和通常的 `multi_index`相比，它少了 `primary_key`。其实是在 `singleton.hpp` 中自定义了 `primary_key`：

```c++
   template<name::raw SingletonName, typename T>
   class singleton
   {
      public:
      constexpr static uint64_t pk_value = static_cast<uint64_t>(SingletonName);
      struct row {
         T value;
         uint64_t primary_key() const { return pk_value; }
         EOSLIB_SERIALIZE( row, (value) )
      };
```

`pk_value` 的值是定义的表结构体名的 uint64_t 类型的值，在这里也就是 `"game"_n.value` 的值。而且单例模式表不存在 `secondary_key`。

## 实例化

实例化方式和 multi_index 相同：

```
typedef eosio::singleton<"game"_n, game> global;
```

```
global state(get_self(), get_self().value);
```

## 添加或更新数据

`singleton` 有专门的 `set` 方法来添加或更新数据。

添加或更新表中所有字段：

```c++
ACTION update(){
  // 实例化
  global state(get_self(), get_self().value);
  state.set({true, 2019}, get_self());
}
```

`set` 参数说明：
- `第一个参数`: 需要添加或更新的所有字段值。
- `第二个参数`: 添加或更新表的RAM支付账户。

更新表中某个字段：

```c++
ACTION update() {
  // 实例化
  global state(get_self(), get_self().value);
  auto states = state.get();
  states.is_active = false;
  state.set(states, get_self());
}
```

## 查找

其实在上文中已经有提到：

```c++
global state(get_self(), get_self().value);
auto states = state.get();
eosio::print(states.is_active);
eosio::print(states.play_times);
```

这就可以查询表中字段的具体数值了。

## 删除

remove方法用于数据的删除：

```c++
ACTION del(){
  global state(get_self(), get_self().value);
  state.remove();
}
```

上述完整例子的源码：

```c++
#include <eosiolib/eosio.hpp>
#include <eosiolib/singleton.hpp>

CONTRACT hello : public eosio::contract {
  using eosio::contract::contract;
 public:
  ACTION update() {
    // 实例化
    global state(get_self(), get_self().value); 
    // 添加或更新数据
    // state.set({true, 2019}, get_self());
    auto states = state.get();
    states.is_active = false;
    state.set(states, get_self());
  }
  ACTION del() {
    global states(get_self(), get_self().value);
    // 删除数据
    states.remove();
  }
  // 单例表结构
  TABLE game {
    bool is_active;
    uint64_t play_times;
  };

  typedef eosio::singleton<"game"_n, game> global;

};
EOSIO_DISPATCH(hello, (update)(del))
```

## 总结

`multi_index` 在存储多实例的情况下是非常实用的，但是在存储单个实例，比如一些全局的状态等，使用 `multi_index` 则显得有些复杂，此时 `singleton` 闪亮登场了。
