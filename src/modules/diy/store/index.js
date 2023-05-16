import { createGetter, createMutations } from '@/store/utils'

let state = {
    questionItem: null
}

export default {
    namespaced: true,
    state,
    getters: createGetter(state),
    mutations: createMutations(state)
}
