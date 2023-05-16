import Router from 'vue-router'

/**
 * 页面前进
 * */
Router.prototype.pushPage = function (param) {
    this.currentRoute.meta.pageInit = false
    // router-slide-left
    this.currentRoute.meta.routerTransition = 'router-slide-left'
    console.log("pushPage")
    this.push(param)
}

/**
 * 页面返回
 * @param nextReload 返回的页面是否需要刷新，默认false
 * @param pages 需要返回的页面数量(正数)
 * */
Router.prototype.forwardPage = function (nextReload = false, pages = 1) {
    this.currentRoute.meta.pageInit = nextReload
    // router-slide-right
    this.currentRoute.meta.routerTransition = 'router-slide-right'
    this.go(0 - pages)
}

/**
 * 页面替换
 * */
Router.prototype.replacePage = function (param) {
    this.currentRoute.meta.pageInit = false
    this.currentRoute.meta.routerTransition = ''
    this.replace(param)
}


export default Router
