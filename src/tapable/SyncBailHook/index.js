// const { SyncBailHook } = require('tapable')
const SyncBailHook = require('./SyncBailHook.js')

class People {
    constructor() {
        this.hooks = {
            eat: new SyncBailHook(['name'])
        }
    }

    tap() {  // 注册监听函数
        this.hooks.eat.tap('eat zhushi', (name) => {
            console.log(`${name} eat zhushi`)
        })

        this.hooks.eat.tap('eat fruit', (name) => {
            console.log(`${name} eat fruit`)
            // return true
        })

        this.hooks.eat.tap('eat egg', (name) => {
            console.log(`${name} eat egg`)
        })
    }

    start() {  // 执行注册函数
        this.hooks.eat.call('chaochao')
    }
}

const p = new People()
p.tap()
p.start()