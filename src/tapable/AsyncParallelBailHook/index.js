const { AsyncParallelBailHook } = require('tapable')
// const AsyncParallelHook = require('./AsyncParallelHook.js')

class People {
    constructor() {
        this.hooks = {
            eat: new AsyncParallelBailHook(['name'])
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
                callback(false, 1)
            }, 500)
        })
    }

    tapPromise() {  // 注册监听函数
        this.hooks.eat.tapPromise('eat zhushi', name => {
            return new Promise(resolve => {
                setTimeout(() => {
                    console.log(`${name} eat zhushi`)
                    resolve()
                }, 1000)
            })
        })
        this.hooks.eat.tapPromise('eat fruit', name => {
            return new Promise(resolve => {
                setTimeout(() => {
                    console.log(`${name} eat fruit`)
                    resolve()
                }, 500)
            })
        })
    }

    start() {  // 执行注册函数
        this.hooks.eat.callAsync('chaochao', () => {
            console.log('eat finish')
        })
    }

    startPromise() {  // 执行注册函数
        this.hooks.eat.promise('chaochao').then(() => {
            console.log('eat finish')
        })
    }
}

const p = new People()
p.tap()
p.start()

// p.tapPromise()
// p.startPromise()