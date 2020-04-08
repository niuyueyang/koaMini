const fs = require('fs');
const {promisify} = require('util');    //将函数promise化
const stat = promisify(fs.stat);    //用来获取文件的信息
const mime = require('mime');   //mime类型获取插件
const path = require('path');
let EventEmitter = require('events');

class Static extends EventEmitter{
    constructor() {
        super();
        this.path = null;
    }

    read(dir){
        return async (ctx, next) => {
            let pathname = this.path = ctx.path;
            // 请求文件的绝对路径
            let realPath = path.join(dir, pathname);
            //如果是文件则读取文件，并且设置好相应的响应头
            try{
                let statObj = await stat(realPath)
                //如果是文件则读取文件，并且设置好相应的响应头
                if(statObj.isFile()){
                    await ctx.setHeaders('Content-Type', mime.getType(realPath)+";charset=utf-8");
                    ctx.contentType = mime.getType(realPath)
                    ctx.body = fs.createReadStream(realPath)
                }
                else{
                    //如果不是文件，则判断是否存在index.html
                    let filename = path.join(realPath, 'index.html');
                    await stat(filename);
                    ctx.setHeaders('Content-Type', "text/html;charset=utf-8");
                    ctx.body = fs.createReadStream(filename);
                }
            }
            catch(e){
                await next();   //交给后面的中间件处理
            }
        }
    }
}

module.exports = Static;
