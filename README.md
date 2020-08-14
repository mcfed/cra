# crat

全局安装 `@mcf/cra`

```js
 npm install crat -g
```

全局安装 `create-react-app` 

```js
npm install create-react-app
```

运行crat

```js
mcfcra
```

## 版本号说明

### v0.2.0 新增渲染模版功能

### v0.2.1

- 修改模版默认路径，将其指定放到执行目录下的template文件夹中

- 新增ssr功能 

#### ssr用法

1. 在 `package.json` 中配置
```
{
    "scripts": {
        "ssr": "cross-env NODE_ENV=production mcfcra -s"
    },
    "ssrServerConfig": {
        "package": "app",        
        "buildPath": "dist"
    }
}
```
1. `package`是包名，要求导出`stroe`、`App`、`routerConfig`
2. `buildPath`是构建目录会设置为静态目录加载资源

4. 启动命令 `yarn ssr` 启动服务并监听3002端口

#### 全局变量使用

1. `ssrServer`  `Boolean` 类型，启动服务初始化为 `true`
2. `ssrServerRoute`  `String`  类型， 当前的 `SSR Server` 服务的请求路由