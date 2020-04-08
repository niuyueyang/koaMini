let http = require('http');
let EventEmitter = require('events');
let context = require('./context');
let request = require('./request');
let response = require('./response');
let Stream = require('stream');
const fs = require('fs')

class koa extends EventEmitter {
    constructor(){
        super();
        this.middlewares = [];
        this.context = context;
        this.request = request;
        this.response = response;
        this.ctx = null;
    }
    use(fn){
        this.middlewares.push(fn);
    }
    createContext(req, res){
        const ctx = Object.create(this.context);
        // ctx.request为request.js里面this作了指向，this此时指向ctx
        const request = ctx.request = Object.create(this.request);
        const response = ctx.response = Object.create(this.response);


        // 请仔细阅读以下眼花缭乱的操作，后面是有用的
        /*
        * console.log(ctx.req.url)
          console.log(ctx.request.req.url)
          console.log(ctx.response.req.url)
          console.log(ctx.request.url)
          console.log(ctx.request.path)
          console.log(ctx.url)
          console.log(ctx.path)

          访问localhost:3000/abc

          /abc
          /abc
          /abc
          /undefined
          /undefined
          /undefined
          /undefined

          姿势多，不一定爽，要想爽，我们希望能实现以下两点：

          从自定义的request上取值、拓展除了原生属性外的更多属性，例如query path等。
          能够直接通过ctx.url的方式取值，上面都不够方便。
        * */
        ctx.req = request.req = response.req = req;
        ctx.res = request.res = response.res = res
        request.ctx = response.ctx = ctx;
        request.response = response;
        response.request = request;
        return ctx;
    }
    compose(middlewares, ctx){
        function dispatch(index) {
            if(index === middlewares.length){
                return Promise.resolve()
            }
            let middleware = middlewares[index];
            return Promise.resolve(middleware(ctx, () => {
                dispatch(index+1)
            }))
        }
        return dispatch(0)
    }

    handleRequest(req, res){
        res.statusCode = 404;
        let ctx = this.ctx = this.createContext(req, res);
        let fn = this.compose(this.middlewares, ctx);
        ctx.setHeaders = (key,val)=>{
            res.setHeader(key, val)
        }
        setTimeout(() =>{
            fn.then(() => {
                let body = ctx.body;
                if (Buffer.isBuffer(body) || typeof body === 'string'){
                    if(body.indexOf('<!DOCTYPE html>') != -1){
                        res.setHeader('Content-Type','text/html;charset=utf8')
                        res.setHeader("Access-Control-Allow-Headers", "Content-Type,XFILENAME,XFILECATEGORY,XFILESIZE,content-type");
                        res.setHeader('Access-Control-Allow-Origin','*')
                    }
                    else{
                        res.setHeader('Content-Type','text/plain;charset=utf8')
                        res.setHeader("Access-Control-Allow-Headers", "Content-Type,XFILENAME,XFILECATEGORY,XFILESIZE,content-type");
                        res.setHeader('Access-Control-Allow-Origin','*')
                    }
                    res.end(body);
                }
                else if (body instanceof Stream){
                    res.setHeader('Content-Type',''+ctx.contentType+';charset=utf8')
                    res.setHeader("Access-Control-Allow-Headers", "Content-Type,XFILENAME,XFILECATEGORY,XFILESIZE,content-type");
                    res.setHeader('Access-Control-Allow-Origin','*')
                    body.pipe(res);
                }
                else if(typeof body == 'object'){
                    res.setHeader('Content-Type','application/json;charset=utf8')
                    res.setHeader("Access-Control-Allow-Headers", "Content-Type,XFILENAME,XFILECATEGORY,XFILESIZE,content-type");
                    res.setHeader('Access-Control-Allow-Origin','*')
                    res.end(JSON.stringify(body));
                }
                else{
                    res.setHeader("Access-Control-Allow-Headers", "Content-Type,XFILENAME,XFILECATEGORY,XFILESIZE,content-type");
                    res.setHeader('Access-Control-Allow-Origin','*')
                    res.end('Not Found');
                }
            }).catch(err => {
                this.emit('error', err);
                res.statusCode = 500
                res.end('server error')
            })
        }, 20)

    }

    listen(...args){
        let server = http.createServer(this.handleRequest.bind(this));
        server.listen(...args);
    }
}

module.exports = koa;
