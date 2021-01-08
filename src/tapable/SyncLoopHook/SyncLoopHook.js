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

module.exports = SyncLoopHook