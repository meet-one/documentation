# action 包装器 action_wrapper

> 支持我们，请投票给 rex.m

action_wrapper 是 action 的包装器, 方便自身或者其他合约嗲用声明的 action。在 action.hpp 中定义如下：

```c++
template <eosio::name::raw Name, auto Action>
struct action_wrapper {
  template <typename Code>
  constexpr action_wrapper(Code&& code,
                           std::vector<eosio::permission_level>&& perms)
      : code_name(std::forward<Code>(code)), permissions(std::move(perms)) {}

  template <typename Code>
  constexpr action_wrapper(Code&& code,
                           const std::vector<eosio::permission_level>& perms)
      : code_name(std::forward<Code>(code)), permissions(perms) {}

  template <typename Code>
  constexpr action_wrapper(Code&& code, eosio::permission_level&& perm)
      : code_name(std::forward<Code>(code)),
        permissions({1, std::move(perm)}) {}

  template <typename Code>
  constexpr action_wrapper(Code&& code, const eosio::permission_level& perm)
      : code_name(std::forward<Code>(code)), permissions({1, perm}) {}

  static constexpr eosio::name action_name = eosio::name(Name);
  eosio::name code_name;
  std::vector<eosio::permission_level> permissions;

  static constexpr auto get_mem_ptr() { return Action; }

  template <typename... Args>
  action to_action(Args&&... args) const {
    static_assert(detail::type_check<Action, Args...>());
    return action(permissions, code_name, action_name,
                  detail::deduced<Action>{std::forward<Args>(args)...});
  }
  template <typename... Args>
  void send(Args&&... args) const {
    to_action(std::forward<Args>(args)...).send();
  }

  template <typename... Args>
  void send_context_free(Args&&... args) const {
    to_action(std::forward<Args>(args)...).send_context_free();
  }
};
```

通过传递两个模版参数：action 的名字 以及 action 对应的函数引用来构造 action_wrapper。action_wrapper 内部的两个关键方法：send 和 to_action,  send 方法里面调用的是 to_action 会返回一个 action 对象，并调用 action 对象中的 send 方法将 action 对象序列化后通过系统函数 send_inline 发送出去。 
action 类的 send 方法：

```c++
void send() const {
  auto serialize = pack(*this);
  internal_use_do_not_use::send_inline(serialize.data(), serialize.size());
}
```

示例：

hello.hpp

```c++
#include <eosio/eosio.hpp>

CONTRACT hello : public eosio::contract {
 public:
  using eosio::contract::contract;
  ACTION hi(eosio::name user);
  ACTION sayhi(eosio::name user); 
};
using hi_action = eosio::action_wrapper<"hi"_n, &hello::hi>;
```

hello.cpp

```c++
#include "hello.hpp"

void hello::hi(eosio::name user){
  eosio::print("hi " + user.to_string());
}

void hello::sayhi(eosio::name user){
  hi_action act{get_self(), {user, "active"_n}};
  act.send(user);
  eosio::print("action_wrapper");
}
```

上述 hello.cpp 中，构造了 hi_action 类型的 act 对象，传入的两个参数分别是 code（action 所在合约）和 perms（执行 action 所使用的账户权限）。act.send() 中的参数对应 action_wrapper 包装的 action 所对应的参数，因此上述例子是对应 hi(eosio::name user).

执行结果:

```
cleos push action hello sayhi '["meetonetest1"]' -p meetonetest1                             
executed transaction: b9513ba66be19c9c4e6d077dc0eb89d29bc1bb03dd1436719ea23554c4ea8d97  104 bytes  417 us
#         hello <= hello::sayhi                 {"user":"meetonetest1"}
>> action_wrapper
#         hello <= hello::hi                    {"user":"meetonetest1"}
>> hi meetonetest1
```
