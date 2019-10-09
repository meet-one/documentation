# Nodejs 实现监控告警

> 作者: UMU @ MEET.ONE 实验室
> 支持我们，请投票给 rex.m

## 钉钉

1. 选择要接受通知的群，群设置 - 群机器人 - 添加机器人；

2. 复制 webhook URL，记为 webhook_url；

3. 发送通知的代码：

```nodejs
const fetch = require('node-fetch')

fetch(webhook_url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    "msgtype": "text",
    "text": {"content": text}
  })
}).then(function(res) {
  if (res.ok) {
    console.log('Dingtalk message sent!')
  } else {
   console.log('status = ' + res.status)
  }
})
```

## Telegram

1. 添加 [@BotFather](https://telegram.me/BotFather)，发送 /newbot 命令，随提示逐步建立一个机器人，得到这个机器人的 token，记为 bot_token。

2. 选择要接受通知的 Group 或 Channel，按以下任一方式取得 chat_id：

(1) 转发 Group 或 Channel 内的消息到 [@getidsbot](https://telegram.me/getidsbot)

(2) 通过 Web 版查看 Group 或 Channel 的 URL 中，p 参数 的值。

- 如果是 Group，chat_id 为把 g 前缀替换为负号的负整数。比如 `p=g268787210`，则 `chat_id = '-268787210'`

- 如果是 Channel，chat_id 为 _ 前部分，并把 c 前缀替换为 -100 的负整数。比如 `p=c1383705039_968667419389618100`，则 `chat_id = '-1001383705039'`

3. 发送通知的代码：

```
const TelegramBot = require('node-telegram-bot-api')
const bot = new TelegramBot(bot_token, {polling: false})

bot.sendMessage(chat_id, text)
```
