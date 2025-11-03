# Implementation Plan

- [x] 1. 创建项目结构和核心配置文件





  - 创建 HTML 文件作为应用入口
  - 创建 CSS 文件用于样式
  - 创建 JavaScript 模块文件结构
  - 添加 Pusher 和 Ably SDK 的 CDN 引用
  - _Requirements: 6.1, 6.2_

- [x] 2. 实现配置管理模块




  - [x] 2.1 实现 ConfigManager 类


    - 编写配置的读取和保存逻辑
    - 实现设备名称管理功能
    - 实现服务类型切换功能（Pusher/Ably）
    - 实现频道名称管理
    - _Requirements: 5.1, 5.2, 5.4, 6.3_
  
  - [x] 2.2 实现首次启动配置向导


    - 创建配置向导 UI
    - 实现设备名称输入和验证
    - 实现频道名称生成或输入
    - 保存初始配置到 LocalStorage
    - _Requirements: 5.1, 5.2_

- [x] 3. 实现本地存储模块




  - [x] 3.1 实现 StorageManager 类


    - 编写消息保存逻辑（限制 100 条）
    - 编写消息读取逻辑（按时间倒序）
    - 编写消息清除逻辑
    - 编写配置存储逻辑
    - _Requirements: 3.1, 3.2_

- [x] 4. 实现消息代理抽象层






  - [x] 4.1 定义 IMessageBroker 接口

    - 定义 connect、disconnect、subscribe、publish 方法签名
    - 定义连接状态回调接口
    - _Requirements: 6.1, 6.2_
  
  - [x] 4.2 实现 AblyBroker 类


    - 实现 Ably 连接逻辑
    - 实现频道订阅功能
    - 实现消息发布功能
    - 实现连接状态监听
    - 使用提供的 Ably API Key
    - _Requirements: 6.2, 4.1_
  
  - [x] 4.3 实现 PusherBroker 类


    - 实现 Pusher 连接逻辑
    - 实现频道订阅功能
    - 实现消息发布功能（使用 client events）
    - 实现连接状态监听
    - 使用提供的 Pusher 配置
    - _Requirements: 6.1, 4.1_
  
  - [x] 4.4 实现 BrokerFactory 工厂类


    - 根据配置创建对应的 Broker 实例
    - 实现服务切换逻辑
    - _Requirements: 6.3, 6.4_

- [x] 5. 实现消息管理模块






  - [x] 5.1 实现 MessageManager 类

    - 实现消息发送逻辑（生成 UUID、时间戳）
    - 实现消息接收处理逻辑
    - 集成 StorageManager 保存消息
    - 实现消息历史获取功能
    - _Requirements: 1.1, 2.1, 3.3_
  

  - [x] 5.2 实现消息发送确认机制

    - 发送成功后显示确认提示
    - 发送失败后显示错误提示
    - 失败时保留消息内容
    - _Requirements: 1.2, 1.3, 2.2, 2.3_

- [x] 6. 实现连接管理和重连机制





  - [x] 6.1 实现自动连接逻辑


    - 应用启动时自动连接到 Message Broker
    - 显示连接状态
    - _Requirements: 4.1, 4.4_
  

  - [x] 6.2 实现自动重连机制

    - 监听连接断开事件
    - 每 5 秒尝试重新连接
    - 连接恢复后显示提示
    - _Requirements: 4.2, 4.3_

- [x] 7. 实现桌面端用户界面




  - [x] 7.1 创建消息列表界面


    - 实现消息列表 HTML 结构
    - 实现消息项样式（区分发送和接收）
    - 实现时间戳和设备名称显示
    - 实现自动滚动到最新消息
    - _Requirements: 3.3, 3.4_
  
  - [x] 7.2 创建消息输入界面


    - 实现消息输入框
    - 实现发送按钮
    - 实现快捷键支持（Enter 发送）
    - _Requirements: 2.1_
  
  - [x] 7.3 创建状态栏和设置界面

    - 显示连接状态指示器
    - 创建设置按钮和设置面板
    - 实现设备名称修改功能
    - 实现服务切换功能（Pusher/Ably）
    - _Requirements: 4.4, 5.4, 6.3, 6.4_
  
  - [x] 7.4 实现桌面通知功能


    - 请求通知权限
    - 接收到新消息时显示桌面通知
    - 点击通知时聚焦应用窗口
    - _Requirements: 1.4_

- [x] 8. 实现移动端用户界面




  - [x] 8.1 创建响应式布局


    - 实现移动端适配的 CSS
    - 优化触摸交互
    - 实现移动端消息列表
    - _Requirements: 1.1, 2.1_
  
  - [x] 8.2 实现移动端推送通知


    - 配置 Service Worker
    - 实现推送通知订阅
    - 接收到新消息时显示推送通知
    - _Requirements: 2.4_
  

  - [x] 8.3 配置 PWA manifest

    - 创建 manifest.json 文件
    - 配置应用图标和名称
    - 配置启动模式和主题色
    - _Requirements: 2.1_

- [x] 9. 实现 UIController 集成所有模块



  - [x] 9.1 初始化应用


    - 加载配置
    - 创建 Broker 实例
    - 初始化 MessageManager
    - 加载历史消息
    - 建立连接
    - _Requirements: 4.1, 3.3_
  
  - [x] 9.2 绑定 UI 事件处理


    - 绑定发送按钮点击事件
    - 绑定输入框键盘事件
    - 绑定设置界面交互事件
    - _Requirements: 1.1, 2.1_
  
  - [x] 9.3 实现消息显示逻辑


    - 接收到消息时更新 UI
    - 发送消息时更新 UI
    - 显示消息发送状态
    - _Requirements: 1.1, 2.1, 3.3_

- [x] 10. 测试和优化




  - [x] 10.1 测试 Ably 消息收发功能


    - 测试桌面端到移动端消息发送
    - 测试移动端到桌面端消息发送
    - 测试消息显示和存储
    - _Requirements: 1.1, 2.1_
  
  - [x] 10.2 测试 Pusher 消息收发功能

    - 切换到 Pusher 服务
    - 测试消息收发功能
    - 验证服务切换正常工作
    - _Requirements: 6.1, 6.3, 6.4_
  
  - [x] 10.3 测试重连机制

    - 模拟网络断开
    - 验证自动重连功能
    - 验证连接状态显示
    - _Requirements: 4.2, 4.3_
  
  - [x] 10.4 测试通知功能

    - 测试桌面通知
    - 测试移动端推送通知
    - 验证通知权限请求
    - _Requirements: 1.4, 2.4_
