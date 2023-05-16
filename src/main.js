import '@babel/polyfill'
import Es6Promise from 'es6-promise'
import Vue from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import 'font-awesome/css/font-awesome.min.css'
// import request from './utils/request'
import { noAuthHttp } from './utils/request'
import requestJson from './utils/request_json'
import authRequest from './utils/auth_request'
import * as utils from './utils/index'
import { Toast } from 'vant'
import 'vant/lib/index.css';
import 'element-ui/lib/theme-chalk/index.css';
import './style/var.css'
import { getUserInfo } from '@/utils/auth'

Es6Promise.polyfill()
Vue.config.productionTip = false
Vue.prototype.$authRequest = authRequest
Vue.prototype.$noAuthHttp = noAuthHttp
Vue.prototype.$requestJson = requestJson
Vue.prototype.$utils = utils
Vue.prototype.$toast = Toast
window.Toast = Toast
// @ts-ignore
router.beforeEach((to, from, next) => {
    //默认跳到登陆页
    if(!to.path||to.path=="/"){
        next({name:router.options.routes[0].name,replace: true})
    }
    if((!store.state.userInfo || !store.state.userInfo.userId)){
        let userInfo = getUserInfo()
        if(userInfo){
            store.commit('setUserInfo', userInfo)
        }
    }
    //判断是否需要登陆，若没登陆，自动跳到登陆页
    if(to.meta.module){
        if((!store.state.userInfo || !store.state.userInfo.userId) && to.name.indexOf('login') === -1){
            next({name:to.meta.module+"-login",query:{redirect:to.fullPath},replace: true})
        }
    }
    next()
})
// @ts-ignore
new Vue({
    router,
    store,
    render: (h) => h(App)
}).$mount('#app')