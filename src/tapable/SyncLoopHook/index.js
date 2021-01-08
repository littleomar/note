// const { SyncLoopHook } = require('tapable')
const SyncLoopHook = require('./SyncLoopHook.js')

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

    start() {  // 执行注册函数
        this.hooks.eat.call('chaochao')
    }
}

const p = new People()
p.tap()
p.start()