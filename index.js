const Koa = require('koa');
const timeFormat = require('./utils/timeFormat')
const app = new Koa({
    proxy: true
});

// 在 ctx 上添加全局属性
app.context.startTime = new Date()

// logger

app.use(async (ctx, next) => {
    await next();

    // logger reqeust
    const request = ctx.request
    // console.log('request.path', request.path)
    // console.log('request.protocol', request.protocol)
    // console.log('ctx.req', ctx.req)
    // console.log('ctx.request', ctx.request)

    const rt = ctx.response.get('X-Response-Time');
    const traceId = ctx.response.get('x-trace-id');
    console.log(`request from ${ctx.request.host}, method: ${ctx.method}, url: ${ctx.url}, path: ${ctx.path}, cost time: ${rt}, traceId: ${traceId}, status: ${ctx.status}`);
});

// set response header

app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
    ctx.set('X-trace-id', Math.random())
    ctx.set('X-Server-Start-Time', `${timeFormat(ctx.startTime)}`)
    ctx.set('ETag', '123');
    ctx.cookies.set('testCookieName', 'testCookieValue')
});

// get app
app.use((ctx, next) => {
    // console.log('ctx', ctx)
    // console.log('app', app)
    next()
})

// response

app.use(async ctx => {
    console.log('ctx.fresh', ctx.fresh)
    if (ctx.fresh) {
        ctx.status = 304;
        return;
      }
    ctx.body = 'Hello World';
    ctx.response.set('test', 123)
});


app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
});

// 可同时监听多个端口
app.listen(3000);
app.listen(3001)
app.listen(3002)