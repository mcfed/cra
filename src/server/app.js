const Koa = require('koa');
const path = require('path');
const koaStatic = require('koa-static');
const ssrServerConfig = require('./ssrServerConfig.js')

// 实例化 koa
const app = new Koa();

const port = parseInt(process.env.PORT, 10) || 3002

// 静态资源
app.use(
  koaStatic(path.resolve(
    process.cwd(), 
    'node_modules',
    ssrServerConfig.package,
    ssrServerConfig.buildPath), {
    maxage: 365 * 24 * 60 * 1000,
    index: 'root' 
    // 这里配置不要写成'index'就可以了，因为在访问localhost:3030时，不能让服务默认去加载index.html文件，这里很容易掉进坑。
  })
);
const clientRouter=require('./clientRouter.js')

// 设置路由
app.use(clientRouter)
// app.listen(port)
app.listen(port, function() {
  console.log('服务器启动，监听 port： ' + port + '  running~');
});
