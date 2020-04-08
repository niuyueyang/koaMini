/*
*   非常简单，使用对象get访问器返回一个处理过的数据就可以将数据绑定到request上了，
*   这里的问题是如何拿到数据，由于前面ctx.request这一步，所以this就是ctx，
*   那this.req就是原生的req，再利用一些第三方模块对req进行处理就可以了，
*   源码上拓展了非常多，这里只举例几个，看懂原理即可。
    访问localhost:3000/abc?id=1

    /abc?id=1
    /abc?id=1
    /abc?id=1
    /abc?id=1
    /abc
    undefined
    undefined
*
* */
const url = require('url')
// noinspection JSAnnotator
let request = {
    get url() { // 这样就可以用ctx.request.url上取值了，不用通过原生的req
        return this.req.url
    },
    get path() {
        return url.parse(this.req.url).pathname
    },
    get query() {
        return url.parse(this.req.url).query
    },
    get method(){
        return this.req.method.toLowerCase()
    },
    get header(){
        return this.req.headers
    },
    get requestBody(){
        return this._body
    },
    set requestBody(val){
        this._body = val
    },
    // 。。。。。。
}
module.exports = request
