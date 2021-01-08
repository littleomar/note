// const { SyncHook } = require('tapable')
const SyncHook = require('./SyncHook.js')

class People {
    constructor() {
        this.hooks = {
            eat: new SyncHook(['name'])
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