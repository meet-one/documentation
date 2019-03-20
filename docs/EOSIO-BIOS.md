EOSIO主网启动流程

启动前准备工作：

1. EOSIO出块节点社区选出50(暂定)个技术大佬，从这50名大佬中再随机选出22名成立Go-Live团队。
2. Go-Live团队成员相互之间需要建立起高度安全的VPN连接，以防止DDOS等网络攻击。
3. EOS的ICO将于2018-06-02晚上10点结束，届时以太坊上的EOS将被冻结。同时EOS持仓地址快照的扫描工作会马上开始，将会把以太坊所有的EOS持仓地址及持仓数量归纳到一个csv文件中。扫描程序的代码已开源(https://github.com/EOSIO/genesis)
4. Go-Live团队开始验证csv文件，需要有22名中的15名验证通过。
5. 一旦csv文件验证通过，Go-Live团队将会随机选出一名成员为启动节点。

第一阶段：启动

1. 被选中的启动节点基于以太坊快照csv文件启动EOSIO主网，且创建第一个区块。
2. 安装EOSIO核心智能合约。
3. 连接21个ABP(Appointed Block Producers )，ABP由Go-Live其余21名成员组成。ABP将会组成用于EOS第一次选举的网络。
4. 启动节点将系统权限分配给21个ABP，抹除自己所有的权限，断开EOS网络连接。(启动节点在EOS主网正式出块10轮以后才允许竞选)

第二阶段：投票

1. 21个ABP根据以太坊快照csv验证EOS当前的系统账户和余额。
2. 候选节点开始连接EOS网络竞选出块节点。
3. EOS持有者开始投票。
4. 21个ABP将会被选举出来的21个出块节点替代。ABP跟启动节点一样，EOS主网正式出块10轮以后才允许竞选。

参考资料: [https://medium.com/eosio/bios-boot-eosio-blockchain-2b58b8a978a1](https://medium.com/eosio/bios-boot-eosio-blockchain-2b58b8a978a1)
