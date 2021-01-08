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

module.exports = AsyncParallelHook