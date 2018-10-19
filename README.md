# webdriver-jssdk v0.0.2

# 介绍

本项目是webdriver的基于nodejs的jssdk库。

# 安装

```
npm install webdriver-jssdk --save
```

# 使用

```
var webdriver = require('webdriver-jssdk')

// 配置参数
var options = {
    appid: '',
    accesskey: '',
    secretkey: '',
    noticeCallback: noticeCallback,
    connectStateCallback: connectStateCallback
}
// 开始连接
webdriver.connect(options)
```

# 接口

## connect

```
webdriver.connect(options)
```

## disconnect

```
webdriver.disconnect(appid)
```

## write

```
webdriver.write(appid, pageid, wid, name, sid, value)
```

## showPage

```
webdriver.showPage(appid, curpageid, targetpageid, sid)
```

## showMessage

```
webdriver.showMessage(appid, pageid, msgtype, title, message, duration, sid)
```

# 链接

[帮助中心](http://help.webdriver.top/v2/guide/js.html)

# 作者

[webdriver](http://www.webdriver.top)

# 版权

Copyright (c) 2018 MeiXuan, [www.webdriver.top](http://www.webdriver.top)