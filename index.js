const Koa = require('koa');
const timeFormat = require('./utils/timeFormat')
const Request = require('request')
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
    console.log('request.path', request.path)
    // console.log('request.protocol', request.protocol)
    // console.log('ctx.req', ctx.req)
    // console.log('ctx.request', ctx.request)


	const { path } = ctx.request

	// 路由判断
	if ( path === '/github/user/lexmin' ) {
		console.log('获取个人信息')
		ctx.set('x-your-path', 'success')

		const requestPromise = new Promise((resolve, reject)=>{
			Request({
				url: 'https://api.github.com/users/lexmin0412',
				method: "GET",
				json: true,
				headers: {
					"content-type": "application/json",
					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36"
				}
			}, function(error, response, body) {
				console.log('github api返回结果', body);
				// if (!error && response.statusCode == 200) {
				// 	console.log(body) // 请求成功的处理逻辑
				// }
				resolve(body)
			});
		})
		const result = await requestPromise
		ctx.body = result
		console.log('结果结果', result);
	}

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
	ctx.set('Access-Control-Allow-Origin', '*')  // 允许跨域
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

    ctx.response.set('test', 123)
});


app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
});

// 可同时监听多个端口
app.listen(3002)
