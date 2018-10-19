/*
    此处模拟帮助中心的“简单示例”
    使用步骤：
    1. npm install   安装包
    2. node examples/index  运行
 */

var api = require('../main/api')

var Demo        = "5b4564eaab00093b641e99b5"
var Accesskey   = "a59836a11b76dda496bac68c"
var Secretkey   = "3dcc2142b326020d92b77b1c"
var HomePage    = "5b45b741aa4a3a3f5840d15b"
var SecondPage  = "5bbc30e769516e40e8366d17"
var Circle      =  "WDVZ6DE5OF"
var Button      =  "WDJTLFVEQQ111"
var Btn_Msg     =  "WDCIILJPWO"
var Btn_SwitchPage = "WDJTLFVEQQ"
var Btn_Back    =  "WDWLABJ5JW"
var Btn_Loadtree = "WDMX9ZQK4A"
var Tree        = "WDZVKY43OH"

// var Demo      =  "5bac9f2f4e75ea10dce3112e"
// var Accesskey =  "73e42c91e8b9729366edc509"
// var Secretkey =  "eacc59c115a30f9063a1c099"
// var HomePage  =  "5bac9f2f4e75ea10dce3112f"
// var SecondPage = "5bc02484729da30ec482a14b"
// var Circle    =  "WDDRC2MY6I"
// var Button    =  "WDDQ1K6N9I"
// var Btn_Msg   =  "WDEYSTMF30"
// var Btn_SwitchPage = "WDCH0NDOCH"
// var Btn_Back  =  "WDD07F4EGT"
// var Btn_Loadtree = "WDMX9ZQK4A"
// var Tree = "WDZVKY43OH"

//接收到组件值变通知
var noticeCallback = function(appid, pageid, wid, name, sid, value){
    console.log("----notice", wid, name, value)
    if(appid == Demo){
        // 首页
        if (pageid == HomePage) {
            // 改变背景颜色
            if(wid == Button && name == "out"){
                if(value == 1){
                    //接收到开关的“开”指令，此处的处理是：让圆的背景变为红色
                    api.write(Demo, HomePage, Circle, "bg", "0", "red");
                }else{
                    //接收到开关的“关”指令，此处的处理是：让圆的背景变为绿色
                    api.write(Demo, HomePage, Circle, "bg", "0", "green");
                }
            }
            // 发送消息
            else if(wid == Btn_Msg && name == "out"){
                api.sendMessage(Demo, HomePage, 'warning', '我的标题', '我的内容', 3, 0)
            }
            // 切换页面
            else if(wid == Btn_SwitchPage){            
                api.showPage(Demo, pageid, SecondPage, 0)
            }            
            // 加载树
            else if(wid == Btn_Loadtree){
                var treedata = [
                    {
                        "title":"root1",
                        "expand":true,
                        "children-key":"1",
                        "children":
                        [
                            {
                                "title":"child11",
                                "children-key":"2",
                                "nodeKey":1
                            },
                            {
                                "title":"child21",
                                "children-key":"3",
                                "nodeKey":2
                            }
                        ],
                        "nodeKey":0
                    }
                ]
                api.write(Demo, HomePage, Tree, "treedata", "0", treedata);
            }
        } 
        // 第二页
        else if (pageid == SecondPage) {
            // 返回首页
            if(wid == Btn_Back) {
                console.log("----back")
                api.showPage(Demo, pageid, HomePage, 0)
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
api.connect(options)
