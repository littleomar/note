# webpack之polyfill

本文讲的是babel版本为7.4以后 @babel/polyfill被拆分为两部分 
```text
core-js/stable
regenerator-runtime/runtime
```
core-js这个包我们需要自己安装， regenerator-runtime则是作为@babel/preset-env的依赖自动安装
```shell
npm install core-js  # 默认安装3.x版本
```
## babel-loader为什么需要polyfill
从这个角度我们可以吧babel-loader的任务分为两部分

* 一种是对高级语法（es20**）进行转化语法糖之类的写法，箭头函数 async await转化为generator
* 另一种是对高级api的兼容 例如 Map Set内置对象 和generator Array.prototype.entries()等

第一种转化我们可以使用babel7之后的 @babel/preset-env包 这已经包含 es20** 但是排除 stage-x，对于api的实现我们则要用到polyfill

## polyfill的使用
@babel/preset-env中与polyfill有两个相关配置 targets和useBuiltIns，useBuiltIns配置作为主要影响，targets则作为辅助配置

#### useBuiltIns值为false
这个值配置最简单，设置为false之后babel-loader解析文件时候会忽略polyfill(core-js、regenerator-runtime)即会直接跳过下边的引入
```js
import "core-js/stable"
import "regenerator-runtime/runtime"
```
#### useBuiltIns值为"entry"
这个配置需要把polyfill手动引入
```js
import "core-js/stable"
import "regenerator-runtime/runtime"
```
babel-loader会根据targets配置来判断将来代码需要运行的环境需要哪些polyfill，也就是说不管我们的源文件中是否用到这些polyfill都会打包进去，targets作为唯一判断条件
#### useBuiltIns值为"usage"
这个配置我们不需要```import```任何polyfill它会根据targets自动引入源文件所需要的polyfill可见这个配置打包出来的文件最小
用usage的时候我们要在配置中指定core-js的版本 完整配置如下
```js
{
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    // chrome: 72
                    "ie": "8"
                },
                useBuiltIns: 'usage',
                corejs: {
                    version: '3.8', proposals: true
                }
            }]
    ]
}
```
这三种方式介绍完了，个人觉得在生产环境用usage的应该是最多的吧
但是这还有个弊端，这种打polyfill的方式是在你的文件当中直接实现一个辅助函数可以叫做helper，如果我们在很多文件中都使用了这个helper那么重复代码就会散落在各个文件中，打包体积也不不必要的变大有另外一种方法可以实现polyfill的功能同时可以解决代码重复问题

## babel-loader plugin [```@babel/plugin-transform-runtime```](https://babeljs.io/docs/en/babel-plugin-transform-runtime)
关于 ```@babel/plugin-transform-runtime```的配置代码如下
```js
{
    presets: [
        ['@babel/preset-env']
    ],
        plugins: [
        ["@babel/plugin-transform-runtime", {
            corejs: false
        }]
    ]
}
```
这个plugin使用时候我们只需关注corejs这个配置即可

|  corejs option   | Install command  | 说明  |
|  ----  | ----  |  ----  |
| ```false```  | ```npm install @babel/runtime```|  适用于production环境  |
| ```2```  |```npm install --save @babel/runtime-corejs2```|  |
| ```3```  |```npm install --save @babel/runtime-corejs3```|  |
*注：使用该plugin helper会按需加载但是targets会失效*



用这种方法会解决两个问题，一个就是我们上边提到的用requeir方式引入helper减少代码的重复率，另一个就是能够解决helper直接打到文件中成为不定导致全局污染的问题，但是我们需要注意的是，不建议将此plugin和 polyfill一起使用，这样会适得其反，增大打包体积或者引发其他问题




