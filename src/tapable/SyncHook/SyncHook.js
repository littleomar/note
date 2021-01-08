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

module.exports = SyncHook