# wepack plugin核心之tapable

## tapable涉及事件钩子

```js
const {
	SyncHook,   // 同步钩子
	SyncBailHook,  // 同步带保险的钩子 从上往下执行，遇到回调返回的不是undefinde就停止执行
	SyncWaterfallHook,   // 同步瀑布流钩子  从上往下执行，上一个回调的返回值会作为下一个回调的参数传入
	SyncLoopHook,    // 同步循环钩子 回调会循环执行，当返回值为undefined时才会继续执行下一个回调
	AsyncParallelHook,  // 异步并行钩子
	AsyncParallelBailHook,
	AsyncSeriesHook,   // 异步串行钩子
	AsyncSeriesBailHook,
	AsyncSeriesWaterfallHook
 } = require("tapable");
```

接下来我们将围绕着这几个钩子函数的功能和实现原理分开进行介绍分析

首先我们实现一个class 接下来所有的钩子函数都在这个class上进行

```js
const { SyncHook } = require('tapable')
class People {
    constructor() {
        this.hooks = {
            eat: new Tapable钩子(['name'])   // 此处替换为各种钩子函数
        }
    }
    tap() {  // 注册监听函数
        this.hooks.eat.tap('eat zhushi', (name) => {
            console.log(`${name} eat zhushi`)
        })

        this.hooks.eat.tap('eat fruit', (name) => {
            console.log(`${name} eat fruit`)
        })
    }
    start() {  // 执行注册函数
        this.hooks.eat.call('chaochao')
    }
}

const p = new People()
p.tap()
p.start()
```
此处 钩子函数上的tap和call方法在各个钩子函数中可能不同，根据实际情况替代

## SyncHook

利用上述例子讲钩子函数进行替换

```js
class People {
    constructor() {
        this.hooks = {
            eat: new SyncHook(['name'])   // 此处替换为各种钩子函数
        }
    }
    ...
}
```
执行结果为
```js
chaochao eat zhushi
chaochao eat fruit
```

原理其实很简单 SyncHook这个类其实就是调用tap的时候将callback存在一个数组，call的时候依次执行这些回调， 实现原理如下：
```js
class SyncHook {
    constructor() {
        this.hooks = []
    }
    tap(arg, callback) {
        this.hooks.push(callback)
    }
    call(arg) {
        this.hooks.forEach(callback => {
            callback(arg)
        })
    }
}
```

## SyncBailHook

这个钩子函数是将回调依次执行如果遇到回调不返回undefined就停止执行

举🌰:

```js
class People {
    constructor() {
        this.hooks = {
            eat: new SyncBailHook(['name'])   // 此处替换为各种钩子函数
        }
    }
    tap() {  // 注册监听函数
        this.hooks.eat.tap('eat zhushi', (name) => {
            console.log(`${name} eat zhushi`)
        })

        this.hooks.eat.tap('eat fruit', (name) => {
            console.log(`${name} eat fruit`)
            return true
        })

        this.hooks.eat.tap('eat egg', (name) => {
            console.log(`${name} eat egg`)
        })
    }
    start() {  // 执行注册函数
        this.hooks.eat.call('chaochao')
    }
}
```
执行结果如下
```js
chaochao eat zhushi
chaochao eat fruit
```
遇到第二个回调返回非undefined值就停止执行，不再执行以下回调

其实原理与SyncHook大致相同就是在循环注册hooks时多一条判断条件，我们只需把上次callback执行返回记过记录下来作为判断条件即可，实现如下：
```js
class SyncBailHook {
    constructor() {
        this.hooks = []
    }

    tap(args, callback) {
        this.hooks.push(callback)
    }
    call(args) {
        let res, index = 0, len = this.hooks.length
        do {
            res = this.hooks[index](args)
        } while (res === undefined && ++index < len)
    }
}
```
## SyncWaterfallHook
这个钩子函数就是从上往下按顺序执行，并callback执行结果传递个下个回调函数， 看🌰
```js
class People {
    constructor() {
        this.hooks = {
            eat: new SyncWaterfallHook(['name'])
        }
    }

    tap() {  // 注册监听函数
        this.hooks.eat.tap('eat zhushi', (name) => {
            console.log(`${name} eat zhushi`)
            return 'xiaoli'
        })

        this.hooks.eat.tap('eat fruit', (resault) => {
            console.log(`${resault} eat fruit`)
            return 'zhanghua'
        })

        this.hooks.eat.tap('eat fruit', (resault) => {
            console.log(`${resault} eat egg`)
        })
    }
    ...
}
```
看下输出结果：
```js
chaochao eat zhushi
xiaoli eat fruit
zhanghua eat egg
```
实现原理，我们想到遍历数组时，如果用到上个元素的相关值我们可以使用reduce函数，这会使得SyncWaterfallHook的代码变得十分精简
```js
class SyncWaterfallHook {
    constructor() {
        this.hooks = []
    }
    tap(args, callback) {
        this.hooks.push(callback)
    }
    call(arg) {
        this.hooks.reduce((prev, curr) => curr(prev), arg)
    }
}
```
函数调用一行代码就能解决问题，是不是很简单
## SyncLoopHook
单个回调函数会循环执行，直到返回undefined时候才会跳出此次callback执行下一个callback，注意当回调函数返回非undefined时候它会连同此callback之前的回调一同执行，并不是只执行当前回调：
```js
class People {
    constructor() {
        this.hooks = {
            eat: new SyncLoopHook(['name'])
        }
        this.fruitIndex = 0
        this.eggIndex = 0
    }
    tap() {  // 注册监听函数
        this.hooks.eat.tap('eat zhushi', (name) => {
            console.log(`${name} eat zhushi`)
        })

        this.hooks.eat.tap('eat fruit', (name) => {
            console.log(`${name} eat fruit`)
            return ++this.fruitIndex <= 2 ? '没吃饱' : undefined
        })

        this.hooks.eat.tap('eat fruit', (name) => {
            console.log(`${name} eat egg`)
            return ++this.eggIndex <= 3 ? '没吃饱' : undefined
        })
    }
    ...
}
```

执行结果为：
```text
chaochao eat zhushi
chaochao eat fruit
chaochao eat zhushi
chaochao eat fruit
chaochao eat zhushi
chaochao eat fruit
chaochao eat egg
chaochao eat zhushi
chaochao eat fruit
chaochao eat egg
chaochao eat zhushi
chaochao eat fruit
chaochao eat egg
chaochao eat zhushi
chaochao eat fruit
chaochao eat egg
```
我们可以清楚看到当callback返回非undefined的时候它会连同此callback之前的回调一同执行，这个在实现起来稍微有点麻烦，我们可以想到可以写一个递归的方法去执行回调数组如果遇到返回非undefined则再次调用递归，为了优化代码，需要用es6的Array.prototype.every()方法如果返回false可以break循环适合当前场景
```js
class SyncLoopHook {
    constructor() {
        this.hooks = []
    }
    tap(arg, callback) {
        this.hooks.push(callback)
    }
    call(args) {
        this.repeatDo(this.hooks, args)
    }
    repeatDo(list, args) {
        list.every((item) => {
            const res = item(args)
            if (res !== undefined) this.repeatDo(list, args)
            return  res === undefined
        })
    }
}
```
同步的钩子说完了我么接下来说下异步钩子吧
## AsyncParallelHook
异步并行钩子，即注册的回调同时进行，完成后执行最终回调
🌰：
```js
class People {
    constructor() {
        this.hooks = {
            eat: new AsyncParallelHook(['name'])
        }
    }
    tap() {  // 注册监听函数
        this.hooks.eat.tapAsync('eat zhushi', (name, callback) => {
            setTimeout(() => {
                console.log(`${name} eat zhushi`)
                callback()
            }, 1000)
        })
        this.hooks.eat.tapAsync('eat fruit', (name, callback) => {
            setTimeout(() => {
                console.log(`${name} eat fruit`)
                callback()
            }, 500)
        })
    }

    start() {  // 执行注册函数
        this.hooks.eat.callAsync('chaochao', () => {
            console.log('eat finish')
        })
    }
}
```
执行结果：
```text
chaochao eat fruit
chaochao eat zhushi
eat finish
```
该钩子实现思路有回调和Promise两种方式，如下：
```js
class AsyncParallelHook {
    constructor() {
        this.hooks = []
    }
    tapAsync(arg, callback) {
        this.hooks.push(callback)
    }
    tapPromise(arg, callback) {
        this.hooks.push(callback)
    }
    callAsync(...args) {
        const cbLen = this.hooks.length
        let index = 0
        const finishCb = args.pop()
        this.hooks.forEach(item => {
            item(...args, () => {
                index++
                if (index === cbLen) finishCb()
            })
        })
    }
    promise(args) {
        return new Promise(resolve => {
            Promise.all(this.hooks.map(item => item(args))).then(resolve)
        })
    }
}
```
注意：如果用promise实现，钩子函数使用时也需要改变方法
## AsyncParallelBailHook







