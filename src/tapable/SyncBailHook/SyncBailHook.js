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

module.exports = SyncBailHook