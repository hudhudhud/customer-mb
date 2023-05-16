import Vue from 'vue'
import Router from './router'

let routes = []
if (process.env.VUE_APP_BUILD === 'dev') {
    const mainRoute = {
        path: '/entrance',
        name: 'entrance',
        component: require('../entrance').default
    }
    routes.push(mainRoute)
    routes.push(
        ...require('@/modules/diy/router').default,
    )
    routes.push(
        ...require('@/modules/publicity/router').default,
    )
    if(process.env.VUE_APP_TARGET){
        routes.push(...require(`@/modules/${process.env.VUE_APP_TARGET}/router`).default)
    }

} else {
    if(process.env.VUE_APP_TARGET){
        routes.push(...require(`@/modules/${process.env.VUE_APP_TARGET}/router`).default)
    } else {
        routes.push(
            ...require('@/modules/diy/router').default,
        )
        routes.push(
            ...require('@/modules/publicity/router').default,
        )
    }
    // routes.push(...require(`@/modules/${process.env.VUE_APP_TARGET}/router`).default)
}

Vue.use(Router)

export default new Router({
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { x: 0, y: 0 }
        }
    }
})
