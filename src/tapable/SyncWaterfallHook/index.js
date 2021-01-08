// const { SyncWaterfallHook } = require('tapable')
const SyncWaterfallHook = require('./SyncWaterfallHook.js')

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

    start() {  // 执行注册函数
        this.hooks.eat.call('chaochao')
    }
}

const p = new People()
p.tap()
p.start()