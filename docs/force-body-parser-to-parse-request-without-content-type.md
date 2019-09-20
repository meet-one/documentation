# 强制 body-parser 解析无 Content-Type 请求

> 作者: UMU @ MEET.ONE 实验室

## 需求

原版 EOS 历史 API 插件将数据都保存在内存，随着历史数据越来越多，内存消耗高达 T 级以上，使得这个插件失去实用性。于是出现很多替代产品，比如把数据同步到 MongoDB，然后用 Nodejs 对接 MongoDB 来实现 API 服务。

2019 年 3 月份，MEET.ONE 实现了一个基于 MongoDB 的 EOS 历史 API 服务。劣者将去掉 MongoDB 交互部分的框架开源于 [UMU618](https://github.com/UMU618)/[eos-history-api-service](https://github.com/UMU618/eos-history-api-service)。

## 测试

这个 API 服务的开发者是公司另一名 Web 全栈开发，他测试通过之后，劣者用 `cleos` 一试，立马 bug！调试后端代码，发现 req.body 不是一个 JSON 对象。

劣者立刻用 `tcpdump` 抓包，发现 `cleos` 发出去的包并无异常，body 就是一段 JSON 数据。

交流后，发现测试工具的差异：劣者是 C++ 开发，自然而然使用 `cleos` 测试，而 Web 全栈开发对 `cleos` 比较陌生，他们会选择 postman 或者自己写测试性客户端。比如：

```js
const request = require('request-json')
const client = request.createClient('http://127.0.0.1:8888/')

const json = {"id": "d5245026c757532ea3dd5b3a02a07620eb7238113d0a49cae5ebb93921a34135"};
client.post('/v1/history/get_transaction', json, function(err, res, body) {
  console.log(res.statusCode, body)
})
```

后来劣者写了一个简易的 Web 服务器，显示请求头。

```js
const http = require('http')

http.createServer(function (req, res) {
  let buffer = req.method + ' ' + req.url + ' ' + req.httpVersion
  console.log(buffer)
  res.write(buffer + '\r\n')
  for (let i = 0; i < req.rawHeaders.length; i += 2) {
    buffer = req.rawHeaders[i] + ': ' + req.rawHeaders[i + 1]
    console.log(buffer)
    res.write(buffer + '\r\n')
  }
  res.end()
}).listen(8888)
```

经对比，`cleos` 发的请求不带 Content-Type。`cleos` 是 EOSIO 的官方工具，使用者众多，若不支持它是不合理的，后端也不能要求客户端都带上 Content-Type。

## 调试

检查后端代码，其对 body 的解析是用 body-parser 完成的：

```js
app.use(bodyParser.json())
```

使用以下命令启动服务：

```bash
DEBUG=body-parser:* node app.js
```

发现有这样 2 行关键的调试信息：

```
  body-parser:json content-type undefined +0ms
  body-parser:json skip parsing +1ms
```

原来 body-parser 会检查 Content-Type，不符合它的预期，就不解析，于是 body 就不是 JSON 对象。

## 开发

### 暴力的解决方案

参考《[Express 解析 json 格式 post 数据](https://cnodejs.org/topic/54929c5561491ead0cc7bff2)》后，我们这样解决：

```js
// 显式调用 JSON.parse 强行解析
app.use((req, res, next) => {
  req.rawBody = ''
  req.on('data', (chunk) => {
    req.rawBody += chunk
  })
  req.on('end', () => {
    try {
      req.body = JSON.parse(req.rawBody)
    } catch (err) {
      req.body = null
    }
    next()
  })
})
```

但劣者认为以上方案比较不优雅，JavaScript 作为一门高级语言，我们希望更多专注于业务逻辑，尽量复用现有代码，少自己写工具性代码。下面探讨使用 body-parser 的解法。

### 优雅的解决方案

劣者希望能告诉 body-parser 遇到不传 Content-Type 依然当它是 JSON 去解析。于是这就得去看它的代码！我们从上面关键的调试信息入手，可以很快发现：

```js
    // determine if request should be parsed
    if (!shouldParse(req)) {
      debug('skip parsing')
      next()
      return
    }
```

而 shouldParse 是可以由传入的选项影响的：

```js
function json (options) {
  var opts = options || {}
  // 省略部分无关代码
  var type = opts.type || 'application/json'
  // 省略部分无关代码

  // create the appropriate type checking function
  var shouldParse = typeof type !== 'function'
    ? typeChecker(type)
    : type
  // 省略部分无关代码
}
```

于是最终的解决方案是：如果不传 Content-Type，当做 application/json；但如果有传，那得传对，否则也是不理。效果上，比之前无脑地当成 application/json，稍微好一些。实现上，则更优雅。代码如下：

```js
// Force body-parser to parse data as JSON
const bodyParser = require('body-parser')
const typeis = require('type-is')

app.use(bodyParser.json({ type: function(req) {
  if (undefined === req.headers['content-type']) {
    // cleos POST data without content-type
    return true
  } else {
    return Boolean(typeis(req, 'application/json'))
  }
}}))
```
（完）
