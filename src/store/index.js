import Vue from 'vue'
import Vuex from 'vuex'
import { setUserTicket, setUserInfo, removeUserInfo, removeUserTicket } from '@/utils/auth'
// const requireFun = require.context('@/modules', true, /^\.\/.*\/store\/.*\.js$/)
// console.log('1', requireFun)
// requireFun.keys().forEach((file)=>{
//     console.log(file)
// })
let modules = {}
if (process.env.VUE_APP_BUILD === 'dev') {
    modules = {
        diy: require('@/modules/diy/store').default,
        publicity: require('@/modules/publicity/store').default,
    }
} else {
    if (process.env.VUE_APP_TARGET) {
        let ary = process.env.VUE_APP_TARGET.split('-')
        let moduleName = ''
        ary.map((item, index) => {
            if (index > 0) {
                item = item.replace(item.charAt(0), item.charAt(0).toUpperCase())
            }
            moduleName += item
        })
        modules[moduleName] = require(`@/modules/${process.env.VUE_APP_TARGET}/store`).default
    } else {
        modules = {
            diy: require('@/modules/diy/store').default,
            publicity: require('@/modules/publicity/store').default,
        }
    }
    
}

Vue.use(Vuex)

let store = new Vuex.Store({
	modules,
	state: {
		userInfo: null,
		userTicket: ''
	},
	mutations: {
		setUserInfo: (state, value) => {
			state.userInfo = value
			state.userTicket = value.userTicket
			setUserInfo(value)
			setUserTicket(value.userTicket)  
		},
		removeUserInfo(state){
			state.userInfo = null
			state.userTicket = ''
			removeUserInfo()
			removeUserTicket()
		}
	}
})

export default store


