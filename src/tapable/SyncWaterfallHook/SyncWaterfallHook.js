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

module.exports = SyncWaterfallHook