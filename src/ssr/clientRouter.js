const path = require('path');
const fs = require('fs');
const React = require('react');
const {renderToString} = require('react-dom/server');
const { matchPath } = require('react-router-dom');
const ssrServerConfig = require('./ssrServerConfig.js')
const { matchRoutes } = require('react-router-config');
const render = require('../render-template/render');

// 全局变量声明
global.ssrServer = true

// 解决客户端使用windows不存在的bug
require('./initJsDom.js')

const {
  store: clientStore,
  App,
  routerConfig
} = require(ssrServerConfig.package)

const indexPath = path.resolve(
  process.cwd(), 
  'node_modules',
  ssrServerConfig.package,
  ssrServerConfig.buildPath || 'dist', 
  ssrServerConfig.indexPath || 'index.html'
)
const replaceHtmlRootTag = (html) => {
  return html.replace('<div id="root"></div>', '<div id="root">{@&rootString@}</div>')
}
const html = replaceHtmlRootTag(fs.readFileSync(indexPath, 'utf-8'));

const getMatch=(routesArray, url)=>{
  return routesArray.some(router=>matchPath(url,{
    path: router.path,
    exact: router.exact,
  }))
}

const makeup = async (ctx,ssrStore,App,html)=>{
  return render(html, {
    rootString: renderToString(React.createElement(App)),
    initState: JSON.stringify(ssrStore.getState())
  })
}

const clientRouter=async(ctx, next) => {
  // 请求预处理 
  const branch = matchRoutes(routerConfig,ctx.req.url)
  const promises = branch.map(({route,match})=>{
    return route.thunk ? (route.thunk(clientStore)) : Promise.resolve(null)
  });
  await Promise.all(promises).catch(err=>console.log('err:',err))
  if(routerConfig && Array.isArray(routerConfig) && getMatch(routerConfig,ctx.req.url)) {
    // 全局路由声明
    global.ssrServerRoute = ctx.req.url

    // 合成
    ctx.body = await makeup(ctx,clientStore,App,html);
  }
  await next()
}

module.exports = clientRouter;

