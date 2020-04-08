const Koa = require('./lib/application');
const Router = require('./lib/router');
const Static = require('./lib/static');
const View = require('./lib/views')
const path = require('path');
const router = new Router();
const app = new Koa();
const static = new Static();
const view = new View()
const querystring = require('querystring');

function parseData(ctx) {
    return new Promise((resolve, reject) => {
        try {
            let str = ''
            ctx.req.on('data', (data) => {
                str += data
            })
            ctx.req.addListener('end', () => {
                resolve(str)
            })
        } catch (err) {
            reject(err)
        }
    });
}

function parseUrl(url) {
    let obj = {}
    let arr = url.split('&')
    arr.forEach((e, i) => {
        let temparr = e.split('=')
        obj[temparr[0]] = decodeURI(temparr[1])
    });
    return obj
}

app.use((ctx,next)=>{
    ctx.res.setHeader('Access-Control-Allow-Origin', '*');
    //用于判断request来自ajax还是传统请求
    ctx.res.setHeader("Access-Control-Allow-Headers", "Content-Type,XFILENAME,XFILECATEGORY,XFILESIZE,content-type");
    //允许访问的方式
    ctx.res.setHeader('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
    //修改程序信息与版本
    ctx.res.setHeader('X-Powered-By', ' 3.2.1')
    //内容类型：如果是post请求必须指定这个属性
    ctx.res.setHeader('Content-Type', 'application/json;charset=utf-8')
    if(ctx.req.method == 'OPTIONS'){
        ctx.res.statusCode = 200;/*让options请求快速返回*/
    }
    next()
})


router.get('/home', (ctx, next) => {
    ctx.body = parseUrl(ctx.query);
    next();
})

router.get('/user', (ctx, next) => {
    ctx.setHeaders('token', 123)
    ctx.body = "user";
    next();
})

router.get('/admin', (ctx, next) => {
    ctx.body = "admin get";
    next();
})

router.post('/admin', async (ctx, next) => {
    // ctx.setHeaders('Access-Control-Allow-Origin', '*');
    ctx.body = await parseData(ctx);
    next();
})



// app.use(view.views(
//     path.join(__dirname, './views'),
//     {
//         map: { html: 'ejs' }
//     }
// ))
// app.use( async ( ctx ) => {
//     ctx.body = await view.render('index.ejs',{title:'hello koa2'});
// })


app.use(static.read(path.resolve(__dirname,'public')))
app.use(router.routes());
// app.use(view.views(
//     path.resolve(__dirname,'public'),
//     {
//         map: { html: 'ejs' }
//     }
// ));



router.get('/html',async (ctx,next)=> {
    await view.render(path.join(__dirname,'./views/index.ejs'),{title:'hello koa2'},ctx,next);
    next();
})
router.get('/html1',async (ctx,next)=> {
    await view.render(path.join(__dirname,'./views/index.ejs'),{title:'hello koa'},ctx,next);
    next();
})

app.listen(3000);



