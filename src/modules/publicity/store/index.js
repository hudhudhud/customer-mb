import { createGetter, createMutations } from '@/store/utils'

let state = {
    rowItems: {},//行数据
    redirectUrl: '', // 第三方跳转链接
    receiveDate: {
        name: '',
        phoneNumber: '',
        itemid: '',
        fileData: '',
        isThree: true
    }
}

export default {
    namespaced: true,
    state,
    getters: createGetter(state),
    mutations: createMutations(state)
}
