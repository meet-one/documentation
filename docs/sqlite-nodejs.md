# SQLite Node.js

> 作者: UMU @ MEET.ONE 实验室

## 1. 选型

[mapbox](https://github.com/mapbox) / [sqlite3](https://github.com/mapbox/node-sqlite3): Asynchronous, non-blocking SQLite3 bindings for Node.js

安装：

```shell
yarn add sqlite3
```

## 2. 常见操作

### 创建数据库

```js
const path = require('path')
const sqlite = require('sqlite3')

const dbPath = path.join(__dirname, 'test.db')
const db = new sqlite.Database(dbPath)

const sqls = ['CREATE TABLE test(
  id CHAR(64) NOT NULL PRIMARY KEY CHECK(LENGTH(id) == 64),
  timeStamp INTEGER NOT NULL,
  state INTEGER NOT NULL DEFAULT 0)'
  , 'CREATE INDEX index_id ON txs(id)'
  , 'CREATE INDEX index_timeStamp ON txs(timeStamp)'
  , 'CREATE INDEX index_state ON txs(state)'
]

db.serialize(() => {
  for (let sql of sqls) {
    db.run(sql, (err) => {
      if (err) {
        console.error(err)
      } else {
        console.log('SQL executed.')
      }
    })
  }
})

db.close()
```

### 插入数据

```js
const items = [
  { hash: 'D141925E39814FB5256615A1A94EC82B7043D983F68423D8C149A2AE360B623C'
    , ts: 1563273661316, state: 0 }
  , { hash: '2E9F26F5D0A73AE5DAFC8A1C22264725972AA997A22522A906D8CD7E225096ED'
    , ts: 1563273661317, state: 1 }
  , { hash: '0FF5F5F5E96664939D07D94975342D71F824747EFECE1D24FDDBB3B29DD91DCB'
    , ts: 1563273661318, state: 0 }
]

db.serialize(() => {
  const stmt = db.prepare("INSERT INTO test VALUES (?, ?, ?)")
  for (const item of items) {
    stmt.run(item.hash, item.ts, item.state, (err) => {
        if (err) {
          console.error(err)
        } else {
          console.log('INSERT', item.hash)
        }
      })
  }
  stmt.finalize()
})
```

### 查询

```js
db.serialize(() => {
  db.each("SELECT * FROM test WHERE state=0", (err, row) => {
    if (err) {
      console.error('SELECT state=0 error:', err)
    } else {
      // do something here
    }
  }, (err, count) => {
    // do something here
  })
})
```

### 更新

```js
db.run("UPDATE test SET state=1 WHERE state=0", (err) => {
    if (err) {
      console.error('UPDATE txs error:', err)
    } else {
      console.log('UPDATE state to 1')
    }
  })
```

## 3. 参考

<http://www.sqlitetutorial.net/sqlite-nodejs/>
