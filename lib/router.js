const querystring = require('querystring');
const util = require('util');
/*
* middles：存放中间件的容器，用来存放注册的中间件
  get(path,fn)：用来注册中间件，往middles中存放，由于是路由中间件这里多了一个参数path
  compose()：用来组合中间件，让路由中间件按顺序执行
  routes()：用来将koa-router中间件注册到app的中间件上，主要作用是调用路由中间件匹配请求的路径ctx.path
* */
class router{
    constructor(){
        this.middlewares = [];
    }

    /*
    * @desc get(path,fn)：用来注册中间件，往middles中存放，由于是路由中间件这里多了一个参数path
    * */
    get(path, fn, method='get'){
        let layer = {
            path,
            fn,
            method:method.toLowerCase()
        }
        // 处理/article/:id的路由
        if(path.includes(':')){
            let params = [];
            let reg = path.replace(/:([^\/]*)/g,function () {
                params.push(arguments[1]) // params = [id]
                return '([^\/]*)'   //返会字符串/article/([^\/]*)
            })
            //将返回的字符串变成正则，后面解析路由是会用到
            layer.reg = new RegExp(reg);//返回/\/article\/([^\/]*)/
            layer.params = params;
        }
        this.middlewares.push(layer);
    }

    post(path, fn, method='post'){
        let layer = {
            path,
            fn,
            method:method.toLowerCase()
        }
        this.middlewares.push(layer);
    }

    /*
    * @desc compose()：用来组合中间件，让路由中间件按顺序执行
    * @params lasts：匹配的路由集合
    * */
    compose(lasts,next,ctx){
        function dispatch(index){
            if(index === lasts.length) return next();
            let route = lasts[index];
            //将路径参数都取出来exp:id的值
            // let params = route.params;
            // let [, ...args] = pathname.match(route.reg);
            // ctx.request.params = params.reduce((memo, key, index) => {
            //     memo[key] = args[index],
            //     memo
            // }, {})
            //执行路由逻辑，next赋值为下一个路由逻辑
            route.fn(ctx, () => {
                dispatch(index+1)
            })
        }
        dispatch(0)
    }

    /*
    * @desc 用来将koa-router中间件注册到app的中间件上，主要作用是调用路由中间件匹配请求的路径ctx.path
    * */
    routes(){
        // ctx上下文next指的是koa中的next方法
        return async(ctx, next) => {
            let pathname = ctx.path;  // 请求的路径
            let lasts = this.middlewares.filter(route => {
                // 说明当前路由是一个路径参数
                if(route.reg) {
                    if(pathname === route.path && route.reg.test(pathname)){
                        console.log(1)
                        //路径参数匹配到了，添加进路由组
                        return true;
                    }
                    if ((pathname === route.path || route.method === 'all') && (route.pathname === pathname || route.p === '*')) {
                        console.log(2)
                        return true //路径是'/'或者'all'，添加进路由组
                    }
                    return false;
                }
                else{
                    // 常规类型
                    if(pathname === route.path && route.method === ctx.method){
                        return true;
                    }
                    // if(ctx.req.method=="OPTIONS") {
                    //     ctx.setHeaders('Access-Control-Allow-Origin', '*');
                    //     // ctx.setHeaders('Content-Type', 'application/json;charset=utf-8')
                    //     ctx.setHeaders("Access-Control-Allow-Headers", "Content-Type,XFILENAME,XFILECATEGORY,XFILESIZE,content-type");
                    //     ctx.res.statusCode = 200;/*让options请求快速返回*/
                    //     next()
                    // }
                    else{
                        next()
                    }
                }
            })

            // lasts是根据路由名字，方法筛选出来的唯一，数组里面只有一条数据
            this.compose(lasts, next, ctx);
        }
    }
}
module.exports = router;
