# 为 EOSIO MongoDB 插件搭建高可用集群

> 作者: UMU @ MEET.ONE 实验室

## 选型

**系统：CentOS7。** 正像大部分国人喜欢用免费的 Windows 旗舰版，采用 RedHat 社区版，既有“企业级待遇”，又免费。实在是解决选择恐惧症必备良药……

**MongoDB：4.0.4。** 4.0 之前的版本不支持一些类型转换的函数，后期使用起来很麻烦。举个例子：

> [$toDate](https://docs.mongodb.com/manual/reference/operator/aggregation/toDate/#exp._S_toDate)
>
> New in version 4.0.

**文件系统：XFS。** 4.0 已经抛弃 [MMAPv1 Storage Engine](https://docs.mongodb.com/manual/core/mmapv1/#storage-mmapv1)，官方文档强烈建议 [
WiredTiger Storage Engine](https://docs.mongodb.com/manual/core/wiredtiger/#storage-wiredtiger) 和 XFS 配套使用。

> With the WiredTiger storage engine, using XFS is strongly recommended for data bearing nodes to avoid performance issues that may occur when using EXT4 with WiredTiger.

**副本数：1。** 数据可以很容易重新获取，丢失的代价不高，所以副本不是很重要（有钱请搞三副本）。另外，目前 nodeos 较常把数据弄脏，在它本身没高可用时，不宜对数据库投入太多成本。

**机器配置：某云服务器一台。** 16 Cores，256G RAM，启动盘 10G，额外八个 1T Disk。
```bash
# lsblk
NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sda      8:0    0   10G  0 disk 
└─sda1   8:1    0   10G  0 part /
sdb      8:16   0    1T  0 disk 
sdc      8:32   0    1T  0 disk 
sdd      8:48   0    1T  0 disk 
sde      8:64   0    1T  0 disk 
sdf      8:80   0    1T  0 disk 
sdg      8:96   0    1T  0 disk 
sdh      8:112  0    1T  0 disk 
sdi      8:128  0    1T  0 disk 
```
## 环境配置

### 1. 设置 SE Linux

安装过程中，若您需要 reboot 系统，则每次 reboot 之后都要做一次：
```bash
setenforce Permissive
```

### 2. 关闭 TPH
以下命令不是持久化改变，但比较容易说明改了啥，仅供参考：
```bash
echo never > /sys/kernel/mm/transparent_hugepage/enabled
echo never > /sys/kernel/mm/transparent_hugepage/defrag
```
根据 [Disable Transparent Huge Pages (THP)](https://docs.mongodb.com/manual/tutorial/transparent-huge-pages/index.html#red-hat-centos-7)，真正使用的是：
```bash
mkdir -p /etc/tuned/no-thp

echo '[main]
include=virtual-guest

[vm]
transparent_hugepages=never' > /etc/tuned/no-thp/tuned.conf

tuned-adm profile no-thp
```

### 3. TCP 优化
以下命令不是持久化改变，但比较容易说明优化了啥，仅供参考：
```bash
echo 120 > /proc/sys/net/ipv4/tcp_keepalive_time
echo 3 > /proc/sys/net/ipv4/tcp_fin_timeout
echo 3 > /proc/sys/net/ipv4/tcp_orphan_retries
```
真正使用的是：
```bash
FILE=/etc/sysctl.conf
cp $FILE ${FILE}_`date +%Y%m%d%H%M`

KEY=tcp_keepalive_time
VALUE=120

egrep "net.ipv4.$KEY" $FILE && sed -i -c "s/net\.ipv4\.$KEY.*/net\.ipv4\.$KEY = $VALUE/g" $FILE || echo "net.ipv4.$KEY = $VALUE" >> $FILE

VALUE=3
KEY=tcp_fin_timeout

egrep "net.ipv4.$KEY" $FILE && sed -i -c "s/net\.ipv4\.$KEY.*/net\.ipv4\.$KEY = $VALUE/g" $FILE || echo "net.ipv4.$KEY = $VALUE" >> $FILE

KEY=tcp_orphan_retries

egrep "net.ipv4.$KEY" $FILE && sed -i -c "s/net\.ipv4\.$KEY.*/net\.ipv4\.$KEY = $VALUE/g" $FILE || echo "net.ipv4.$KEY = $VALUE" >> $FILE

sysctl -p 2>/tmp/sysctl.tmp
```

## 安装步骤

### 1. 全局设置
```bash
PASSWORD=MEETONE_FAKE_PASSWORD

PREFIX=/disk
BIND_IP=10.140.0.10
D_PORT=17089
CS_PORT=17088
S_PORT=17087
NUM_SHARD=7
```

### 2. 防火墙例外
```bash
semanage port -a -t mongod_port_t -p tcp 17087-17095
```

### 3. 分区
```bash
yum install -y xfsprogs

function InitDisk {
  umount ${PREFIX}*
  sed -i "s:^LABEL=${PREFIX}:#LABEL=${PREFIX}:" /etc/fstab
  i=0
  for drv in {b..i}; do
    /sbin/parted /dev/sd"$drv" -s mklabel gpt mkpart primary 2048s 100%
    sleep 1
    mkfs.xfs -f -b size=4096 -d su=64k,sw=4,agcount=2000 /dev/sd"$drv"1
    xfs_admin -L ${PREFIX}$i /dev/sd"$drv"1
    mkdir -p ${PREFIX}$i
    echo "LABEL=${PREFIX}$i ${PREFIX}$i xfs rw,noatime,nodiratime,allocsize=16M,inode64,logbsize=256k,delaylog,nobarrier,nolargeio,swalloc 0 0" >> /etc/fstab

    i=$[i+1]
  done
  mount -a
}

InitDisk
```

### 4. 安装 MongoDB Community Edition
参考官网的安装文档：[Install MongoDB Community Edition on Red Hat Enterprise or CentOS Linux](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-red-hat/)
```bash
echo '[mongodb-org-4.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/4.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-4.0.asc' > /etc/yum.repos.d/mongodb-org-4.0.repo

yum install -y mongodb-org

echo 'exclude=mongodb-org,mongodb-org-server,mongodb-org-shell,mongodb-org-mongos,mongodb-org-tools' >> /etc/yum.conf
```

### 5. 初始化数据库目录
```bash
function InitDir {
  rm -rf ${PREFIX}0/mongod_conf_data ${PREFIX}0/mongo_log
  for ((i = 1; i <= $NUM_SHARD; ++i)); do
    rm -rf ${PREFIX}$i/mongo*
  done

  mkdir -p ${PREFIX}0/mongod_conf_data
  chown -R mongod. ${PREFIX}0/mongod_conf_data
  mkdir -p ${PREFIX}0/mongo_log
  chown -R mongod. ${PREFIX}0/mongo_log
  for ((i = 1; i <= $NUM_SHARD; ++i)); do
    mkdir -p ${PREFIX}$i/mongod_data
    chown mongod. ${PREFIX}$i/mongo*
  done
}

InitDir
```

### 6. 配置 MongoD 分片服务器
```bash
function CreateShardConfig {
  for ((i = 1; i <= $NUM_SHARD; ++i)); do
    echo "shardsvr=true
replSet=shard$i
bind_ip=127.0.0.1,$BIND_IP
port=$[D_PORT+i-1]
dbpath=${PREFIX}$i/mongod_data
logpath=${PREFIX}0/mongo_log/shard$i.log
pidfilepath=/var/run/mongodb/mongod_shard$i.pid
logappend=true
logRotate=reopen
fork=true
wiredTigerCacheSizeGB=10
#keyFile=/etc/mongodb-keyfile
#verbose=true
directoryperdb=true
wiredTigerDirectoryForIndexes=true" > /etc/mongod_shard$i.conf
    chown mongod. /etc/mongod_shard$i.conf
  done
}

function CreateShardService {
  for ((i = 1; i <= $NUM_SHARD; ++i)); do
    echo "[Unit]
Description=MongoD
After=network.target
Documentation=https://docs.mongodb.org/manual

[Service]
User=mongod
Group=mongod
Environment=\"OPTIONS=-f /etc/mongod_shard$i.conf\"
EnvironmentFile=-/etc/sysconfig/mongod
ExecStart=/usr/bin/mongod \$OPTIONS
ExecStartPre=/usr/bin/mkdir -p /var/run/mongodb
ExecStartPre=/usr/bin/chown mongod:mongod /var/run/mongodb
ExecStartPre=/usr/bin/chmod 0755 /var/run/mongodb
PermissionsStartOnly=true
PIDFile=/var/run/mongodb/mongod_shard$i.pid
Type=forking
# file size
LimitFSIZE=infinity
# cpu time
LimitCPU=infinity
# virtual memory size
LimitAS=infinity
# open files
LimitNOFILE=64000
# processes/threads
LimitNPROC=64000
# locked memory
LimitMEMLOCK=infinity
# total threads (user+kernel)
TasksMax=infinity
TasksAccounting=false
# Recommended limits for mongod as specified in
# http://docs.mongodb.org/manual/reference/ulimit/#recommended-settings

[Install]
WantedBy=multi-user.target" > /usr/lib/systemd/system/mongod_shard$i.service
  done

  systemctl daemon-reload
}

function InitShard {
  SH=/tmp/mongod_shard.sh
  echo "" > $FILE
  for ((i = 1; i <= $NUM_SHARD; ++i)); do
    PORT=$[D_PORT+i-1]
    echo "echo \"rs.initiate({_id: 'shard$i', members:[{_id: 0, host: '$BIND_IP:$PORT'}]})\" | mongo --host 127.0.0.1 --port $PORT" >> $SH
  done
  bash $SH
}

function CreateShardUser {
  JS=/tmp/mongod_shard.js

  echo "use admin;
db.createUser({ \"user\": \"MongoAdmin\", \"pwd\": \"${PASSWORD}\", \"roles\": [\"root\"]});
cfg = rs.conf();
cfg.members[0].priority = 10;
rs.reconfig(cfg);" > $JS

  for ((i = 1; i <= $NUM_SHARD; ++i)); do
    mongo --port $[CS_PORT+i-1] < $JS
  done
}

CreateShardConfig
CreateShardService
for ((i = 1; i <= $NUM_SHARD; ++i)); do systemctl restart mongod_shard$i.service; done
InitShard
CreateShardUser
```

### 7. 配置 MongDB Config Server
```bash
function CreateConfigServerConfig {
  FILE=/etc/mongod.conf

  echo "replSet=csReplSet
configsvr=true
bind_ip=127.0.0.1,$BIND_IP
port=$CS_PORT
dbpath=${PREFIX}0/mongod_conf_data
logpath=${PREFIX}0/mongo_log/config.log
pidfilepath=/var/run/mongodb/mongod.pid
logappend=true
logRotate=reopen
fork=true
#keyFile=/etc/mongodb-keyfile" > $FILE

  chown mongod. $FILE
}

function CreateConfigServerService {
  echo '[Unit]
Description=MongoCS
After=network.target
Documentation=https://docs.mongodb.org/manual

[Service]
User=mongod
Group=mongod
Environment="OPTIONS=-f /etc/mongod.conf"
EnvironmentFile=-/etc/sysconfig/mongod
ExecStart=/usr/bin/mongod $OPTIONS
ExecStartPre=/usr/bin/mkdir -p /var/run/mongodb
ExecStartPre=/usr/bin/chown mongod:mongod /var/run/mongodb
ExecStartPre=/usr/bin/chmod 0755 /var/run/mongodb
PermissionsStartOnly=true
PIDFile=/var/run/mongodb/mongod.pid
Type=forking
# file size
LimitFSIZE=infinity
# cpu time
LimitCPU=infinity
# virtual memory size
LimitAS=infinity
# open files
LimitNOFILE=64000
# processes/threads
LimitNPROC=64000
# locked memory
LimitMEMLOCK=infinity
# total threads (user+kernel)
TasksMax=infinity
TasksAccounting=false
# Recommended limits for mongod as specified in
# http://docs.mongodb.org/manual/reference/ulimit/#recommended-settings

[Install]
WantedBy=multi-user.target' > /usr/lib/systemd/system/mongod.service

  systemctl daemon-reload
}

CreateConfigServerConfig
CreateConfigServerService

systemctl restart mongod.service

sleep 5
echo "rs.initiate({_id: 'csReplSet', members:[{_id: 0, host: '$BIND_IP:$CS_PORT'}]})" | mongo --port $CS_PORT
echo "use admin;
db.createUser({ \"user\": \"MongoAdmin\", \"pwd\": \"${PASSWORD}\", \"roles\": [\"root\"]});" | mongo --port $CS_PORT
```

### 8. 配置 MongS
```bash
function CreateMongoSConfig {
  FILE=/etc/mongos.conf

  echo "configdb=csReplSet/$BIND_IP:$CS_PORT
bind_ip_all=true
port=17087
logpath=${PREFIX}0/mongos_log/mongos.log
pidfilepath=/var/run/mongodb/mongos.pid
logappend=true
logRotate=reopen
fork=true
#keyFile=/etc/mongodb-keyfile" > $FILE

  chown mongod. $FILE

  mkdir -p ${PREFIX}0/mongos_log
  chown -R mongod. ${PREFIX}0/mongos_log
}

function CreateMongoSService {
  echo '[Unit]
Description=MongoS
After=network.target
Documentation=https://docs.mongodb.org/manual

[Service]
User=mongod
Group=mongod
Environment="OPTIONS=-f /etc/mongos.conf"
EnvironmentFile=-/etc/sysconfig/mongod
ExecStart=/usr/bin/mongos $OPTIONS
ExecStartPre=/usr/bin/mkdir -p /var/run/mongodb
ExecStartPre=/usr/bin/chown mongod:mongod /var/run/mongodb
ExecStartPre=/usr/bin/chmod 0755 /var/run/mongodb
PermissionsStartOnly=true
PIDFile=/var/run/mongodb/mongos.pid
Type=forking
# file size
LimitFSIZE=infinity
# cpu time
LimitCPU=infinity
# virtual memory size
LimitAS=infinity
# open files
LimitNOFILE=64000
# processes/threads
LimitNPROC=64000
# locked memory
LimitMEMLOCK=infinity
# total threads (user+kernel)
TasksMax=infinity
TasksAccounting=false
# Recommended limits for mongod as specified in
# http://docs.mongodb.org/manual/reference/ulimit/#recommended-settings

[Install]
WantedBy=multi-user.target' > /usr/lib/systemd/system/mongos.service

  systemctl daemon-reload
}

function AddShards {
  FILE=/tmp/mongo_add_shards.js
  echo "use admin;" > $FILE
  for ((i = 1; i <= $NUM_SHARD; ++i)); do
    echo "db.runCommand({addshard:\"shard$i/$BIND_IP:$[D_PORT+i-1]\"});" >> $FILE
  done

  mongo --port $S_PORT < $FILE
}

CreateMongoSConfig
CreateMongoSService

systemctl restart mongos.service

AddShards
```

### 9. 【可选】配置 keyfile
```bash
function ConfigKeyfile {
  FILE=/etc/mongodb-keyfile
  openssl rand -base64 745 > $FILE
  chown mongod. $FILE
  chmod 600 $FILE

  grep -P '^#keyFile' /etc/mongod*.conf  &&  sed -i 's/#keyFile/keyFile/g' /etc/mongod*.conf

  grep -P '^#keyFile' /etc/mongos.conf  &&  sed -i 's/#keyFile/keyFile/g' /etc/mongos.conf
}

function RestartMongo {
  systemctl restart mongod.service
  for ((i = 1; i <= $NUM_SHARD; ++i)); do
    systemctl restart mongod_shard$i.service;
  done
  systemctl restart mongos.service
}

ConfigKeyfile
RestartMongo
```

### 10. 【可选】配置集合和创建索引
```mongo
use EOS
db.action_traces.createIndex({"act.account": 1, "_id":1},{background: true, sparse: true})
db.action_traces.createIndex({"act.name": 1, "_id":1},{background: true, sparse: true})
db.action_traces.createIndex({"act.data.receiver": 1, "_id":1},{background: true, sparse: true})
db.action_traces.createIndex({"act.data.from": 1, "_id":1},{background: true, sparse: true})
db.action_traces.createIndex({"act.data.to": 1, "_id":1},{background: true, sparse: true})
db.action_traces.createIndex({"act.data.name": 1, "_id":1},{background: true, sparse: true})
db.action_traces.createIndex({"act.data.voter": 1, "_id":1},{background: true, sparse: true})
db.action_traces.createIndex({"act.authorization.actor": 1, "_id":1},{background: true, sparse: true})
db.action_traces.createIndex({"act.account": 1, "block_time": 1, "_id":1},{"background": true, "sparse" : true})

sh.enableSharding("EOS")
sh.shardCollection("EOS.action_traces", {"_id" : 1},  true)
sh.shardCollection("EOS.transaction_traces", {"id" : "hashed"})
```

### 11. 【可选】安装 EOSIO 1.5
```bash
wget https://github.com/eosio/eos/releases/download/v1.5.0/eosio-1.5.0-1.el7.x86_64.rpm
rpm -ivh ./eosio-1.5.0-1.el7.x86_64.rpm --nodeps
```
