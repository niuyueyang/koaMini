//context.js

let proto = {
};
function defineGetter(property,key){
    proto.__defineGetter__(key,function(){
        return this[property][key];
    })
}
function defineSetter(property,key){
    proto.__defineSetter__(key,function(val){
        this[property][key] = val;
    })
}

/*
* __defineGetter__方法可以将一个函数绑定在当前对象的指定属性上，当那个属性的值被读取时，
* 你所绑定的函数就会被调用，第一个参数是属性，第二个是函数，由于ctx继承了proto，
* 所以当ctx.url时，触发了__defineGetter__方法，所以这里的this就是ctx。这样，当调用defineGetter方法，就可以将参数一的参数二属性代理到ctx上了。
* */
defineGetter('request','url');  //ctx代理了ctx.request.url的get
defineGetter('request','path'); //ctx代理了ctx.request.path的get
defineGetter('request','query'); //ctx代理了ctx.request.query的get
defineGetter('request','method'); //ctx代理了ctx.request.method的get
defineGetter('request','header'); //ctx代理了ctx.request.header的get
defineGetter('response','body'); //ctx代理了ctx.response.body的get
defineSetter('response','body'); //ctx代理了ctx.response.body的set
defineGetter('response','contentType'); //ctx代理了ctx.response.contentType的get
defineSetter('response','contentType'); //ctx代理了ctx.response.contentType的set
defineGetter('response','render'); //ctx代理了ctx.response.render的get
defineSetter('response','render'); //ctx代理了ctx.response.render的set
defineGetter('request','requestBody'); //ctx代理了ctx.response.render的get
defineSetter('request','requestBody'); //ctx代理了ctx.response.render的set
module.exports = proto;
