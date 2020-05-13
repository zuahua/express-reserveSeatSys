### 介绍

- 基于 Express Node.js 框架
- 使用 bootstrap 3 CSS UI 插件
- 使用 jQuery 1.12.1
- 使用 art-template 模板引擎
- 使用 MySql 数据库

### 占座功能说明

- 登录
- 注册
- 重置密码
- 用户名修改
- 用户密码修改
- 占座
- 离开座位
- 当前用户占座信息
- 发布开会通知邮件
- 用户授权


### 添加座位接口

| 文件名/路径 | 方法 | 说明 |
| :-: | :-: | :-: |
| \views\seats-tpl.html |  | 前端渲染座位 |
| \modules\seat\seats.js | initSeats() | 初始化传入前端的座位数组，默认为 11 个座位 |

### 使用

先安装所有依赖

```shell
node install
```

运行

```shell
node app.js
```