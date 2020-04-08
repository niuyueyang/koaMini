const path = require('path')
const EventEmitter = require('events');

/*
* 匹配<%=xx%>将其变成${xx}
  匹配<%xxxx%>将xxxx中的内容拼接起来变成一个函数字符串
  然后通过new Function函数字符串生成一个函数执行数据就会返回渲染后的字符串
* */

 class View extends EventEmitter{
     constructor() {
         super();
     }
     async render(paths,obj,ctx,next){
         function render(r, obj) {
             let head = `let str = ''\r\n`;
             //with可以将变量的上下文指向为obj，所以a => obj.a
             head += 'with(b){\r\n';
             let content = 'str+=`';
             //先将匹配<%=xx%>将其变成${xx}
             r = r.replace(/<%=([\s\S]*?)%>/g, function () {
                 var key = `${arguments[1]}`
                 return `${obj[key]}`;
             })
             //匹配<%xxxx%>将xxxx中的内容拼接起来变成一个函数主要逻辑
             content += r.replace(/<%([\s\S]*?)%>/g, function () {
                 return '`\r\n' + arguments[1] + "\r\n str+=`"
             });
             let tail = "`\r\n} \r\n return str";
             let fnStr = head+content+tail;
             let fn = new Function('b', fnStr);
             return fn(obj);
         }
         let realPath = paths;
         let {promisify} = require('util');
         let fs = require('fs');
         let read = promisify(fs.readFile);  //promise化
         let r = await read(realPath,'utf8');
         ctx.body = render(r, obj);
         return next()

     }
 }

module.exports = View;
