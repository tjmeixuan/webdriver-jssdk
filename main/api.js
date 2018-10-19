var _ = require('lodash');
var mqtt = require('mqtt');
var crypto = require('crypto');

const MQTT_PORT_S = 8104;

function api(){
    this.clients = [
        // {
        //     serverip: '',
        //     appid: '',
        //     accesskey: '',
        //     secretkey: '',
        //     mqttclient: null,
        //     mqttstate: false,
        //     notice_callback: null,
        //     connectstate_callback: null,
        // }
    ],
    this.values = [
        {
            // appid: '',
            // pageid: '',
            // wid: '',
            // name: '',
            // value: ''
        }
    ]
}
module.exports = new api();

api.prototype.makeSign = function(appid, accesskey, secretkey, strnow){
    var md5 = crypto.createHash("md5");    
    md5.update(appid + accesskey + secretkey + strnow);
    var str = md5.digest('hex');
    var res = str.toUpperCase();  //32位大写
    return res
}


//连接应用
api.prototype.connect = function(options) {
    if (!options || !options.appid || options.accesskey || options.secretkey) {
        throw new Error('[webdriver-jssdk] error options');
    }

    var serverip = options.serverip || '';
    var appid = options.appid;
    var accesskey = options.accesskey;
    var secretkey = options.secretkey;
    var noticeCallback = options.noticeCallback;
    var connectStateCallback = options.connectStateCallback;

    var t = this;
    t.disconnect(appid)
    var client = {
        serverip: serverip,
        appid: appid,
        accesskey: accesskey,
        secretkey: secretkey,
        mqttclient: null,
        mqttstate: false,
        notice_callback: noticeCallback,
        connectstate_callback: connectStateCallback
    }
    t.clients.push(client)
    
    var strnow = Date.now()
    var sign = t.makeSign(appid, accesskey, secretkey, strnow)

    var options = {
        username: accesskey,
        password: sign,
        keepalive: 60,
        // protocolId: 'MQTT',
        // protocolVersion: 4,
        reconnectPeriod: 5000,
        connectTimeout: 30 * 1000,
        clean: true,
        clientId: appid + "|md5|" + strnow
    };
    var ip = 'mqtt.webdriver.top'
    if(serverip !== ''){
        ip = serverip
    }
    var mqtt_server_url = 'tls://' + ip + ':' + MQTT_PORT_S
    options.rejectUnauthorized = false

    client.mqttclient = mqtt.connect(mqtt_server_url, options);
    if(client.mqttclient != null){
        client.mqttclient.on('connect', function () {
            client.mqttstate = true;
            var topic = ['v1', appid, '+', '+', '+', '+', 'notice'].join('/'); 
            client.mqttclient.subscribe(topic);
            if(client.connectstate_callback){
                client.connectstate_callback(client.appid, true)
            }
        });
        //开始重联时触发
        client.mqttclient.on('reconnect', function(){
            client.mqttstate = false;
        });
        //连接断开时触发
        client.mqttclient.on('close', function(){
            client.mqttstate = false;
            if(client.connectstate_callback){
                client.connectstate_callback(client.appid, false)
            }
        });
        //掉线时触发
        client.mqttclient.on('offline', function(){
            client.mqttstate = false;
            if(client.connectstate_callback){
                client.connectstate_callback(client.appid, false)
            }
        });
        //连接失败或解析错误时触发
        client.mqttclient.on('error', function(){
            client.mqttstate = false;
            if(client.connectstate_callback){
                client.connectstate_callback(client.appid, false)
            }
        });
        client.mqttclient.on('message', function (topic, message) {
            var strtopic = topic.toString();
            if (strtopic.indexOf('/') < 0) return;
            var tps = strtopic.split('/');
            if(tps == null)  return;
            var len = tps.length;
            if(len !== 7)  return;
            var lastitem = tps[len - 1];
            
            if(lastitem == "notice"){
                var topic_parsed = {
                    ver: tps[0],
                    appid: tps[1],
                    pageid: tps[2],
                    wid: tps[3],
                    name: tps[4],
                    sid: tps[5],
                    cmd: tps[6],
                }
                if(client.notice_callback){
                    client.notice_callback(
                        topic_parsed.appid,
                        topic_parsed.pageid,
                        topic_parsed.wid,
                        topic_parsed.name,
                        topic_parsed.sid,
                        message.toString()
                    );
                    //缓存最新值
                    t.values = t.values.filter(function(o){
                        return !(o.appid == topic_parsed.appid && o.pageid == topic_parsed.pageid && o.wid == topic_parsed.wid && o.name == topic_parsed.name)
                    })
                    t.values.push({
                        appid: topic_parsed.appid,
                        pageid: topic_parsed.pageid,
                        wid: topic_parsed.wid,
                        name: topic_parsed.name,
                        value: message.toString()
                    })
                }
            }
        });
    }
}

//断开应用连接
api.prototype.disconnect = function(appid){
    var t = this
    var client = _.find(t.clients, function(c){
        return c.appid == appid
    })
    if(client){
        if(client.mqttclient){
            client.mqttclient.close();
            client.mqttclient = null;
        }
        client.mqttstate = false;
    }
    t.clients = t.clients.filter(function(c){
        return c.appid != appid
    })
}

//向页面发送消息提示
api.prototype.sendMessage = function(appid, pageid, type, title, message, duration, sid){
    var t = this
    var client = _.find(t.clients, function(c){
        return c.appid == appid
    })
    if(client && client.mqttclient && client.mqttstate){
        var topic = ['v1', appid, pageid, '0', 'message', sid, 'write'].join('/');
        var payload = type + "|" + title + "|" + message + "|" + duration
        client.mqttclient.publish(topic, payload);
    }
}

//写页面组件变量
api.prototype.write = function(appid, pageid, wid, name, sid, value){
    var t = this
    var client = _.find(t.clients, function(c){
        return c.appid == appid
    })
    if(client && client.mqttclient && client.mqttstate){
        var topic = ['v1', appid, pageid, wid, name, sid, 'write'].join('/');
        var strpayload = value

        if (typeof value !== 'string') {
            strpayload = JSON.stringify(value)
        }
        client.mqttclient.publish(topic, strpayload);
        //缓存最新值
        t.values = t.values.filter(function(o){
            return !(o.appid == appid && o.pageid == pageid && o.wid == wid && o.name == name)
        })
        t.values.push({
            appid: appid,
            pageid: pageid,
            wid: wid,
            name: name,
            value: strpayload
        })
    }
}

api.prototype.read = function(appid, pageid, wid, name){
    var t = this
    var des = _.find(t.values, function(o){
        return o.appid == appid && o.pageid == pageid && o.wid == wid && o.name == name
    })
    if(des){
        return des.value
    }
}

//显示指定页面
api.prototype.showPage = function(appid, pageid, despageid, sid){
    var t = this
    var client = _.find(t.clients, function(c){
        return c.appid == appid
    })
    if(client && client.mqttclient && client.mqttstate && pageid && despageid){
        var topic = ['v1', appid, pageid, despageid, 'showpage', sid, 'write'].join('/');
        client.mqttclient.publish(topic, despageid);
    }
}