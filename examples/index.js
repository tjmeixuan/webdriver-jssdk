/*
    此处模拟帮助中心的“简单示例”
    使用步骤：
    1. npm install   安装包
    2. node examples/index  运行
 */

var webdriver = require('../main/api')

var Demo        = "5baca8e3d707693de4af92ac"
var Accesskey   = "ab67aa2cf58935f234e273e9"
var Secretkey   = "5da6d65beaa73b1222155d2f"
var HomePage    = "5baca8e3d707693de4af92ad"
var Circle      =  "WDMNQSHIOA"
var Button      =  "WDZMGGHWK6"

//接收到组件值变通知
var noticeCallback = function(appid, pageid, wid, name, sid, value){
    if(appid == Demo){
        // 首页
        if (pageid == HomePage) {
            // 改变背景颜色
            if(wid == Button && name == "out"){
                if(value == '1'){
                    //接收到开关的“开”指令，此处的处理是：让圆的背景变为红色
                    webdriver.write(Demo, HomePage, Circle, "bg", "0", "red");
                }else{
                    //接收到开关的“关”指令，此处的处理是：让圆的背景变为绿色
                    webdriver.write(Demo, HomePage, Circle, "bg", "0", "green");
                }
            }
        }
    }
}

//连接平台状态回调
var connectStateCallback = function(appid, state){
    //state = 1，表示连接成功；state = 0，表示连接失败
    //TODO 此处添加处理
    console.log("connect state", appid, state)
}

//连接平台
var options = {
    appid: Demo,
    accesskey: Accesskey,
    secretkey: Secretkey,
    noticeCallback: noticeCallback,
    connectStateCallback: connectStateCallback
}
webdriver.connect(options)