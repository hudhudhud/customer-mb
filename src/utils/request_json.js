import axios from 'axios'
// @ts-ignore
import { isEmpty, storage} from '@/utils'
import { Toast } from 'vant'
//默认 content-type json
let otherAuthAxios = axios.create()
otherAuthAxios.interceptors.request.use(
    (config) => {
        return config
    },
    (error) => {
        // Do something with request error
        console.log(error) // for debug
        return Promise.reject(error)
    }
)
otherAuthAxios.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        // Do something with request error
        console.log(error) // for debug
        return Promise.reject(error)
    }
)
const requestJson = {   
    get(url, data) {
        return new Promise((resolve, reject) => {
            otherAuthAxios.get(url, data).then((response) => {
                resolve(response.data)
            })
            .catch((error) => {
                reject(error)
            })
        })
    },
    post(url, data,config) {
        return new Promise((resolve, reject) => {
            otherAuthAxios.post(url, data,config).then((response) => {
                resolve(response.data)
            }).catch((error) => {
                reject(error)
            })
        })
    },
    put(url, data) {
        return new Promise((resolve, reject) => {
            otherAuthAxios.put(url, data).then((response) => {
                resolve(response.data)
            }).catch((error) => {
                reject(error)
            })
        })
    },
    put_auto(url, data) {
        return new Promise((resolve, reject) => {
            otherAuthAxios.put(url, data).then((response) => {
                if(response.data.errcode === 0||response.data.statusCode==200){
                    resolve(response.data)
                }
                else{
                    if(response.data.errcode === 500){
                        Toast('系统异常！')
                    }
                    else {
                        Toast(response.data.message)
                    }
                    reject(response.data)
                }
            }).catch((error) => {
                console.log(error)
                reject(error)
            })
        })
    },
    delete_auto(url, data) {
        return new Promise((resolve, reject) => {
            otherAuthAxios.delete(url, data).then((response) => {
                if(response.data.errcode === 0||response.data.statusCode==200){
                    resolve(response.data)
                }
                else{
                    if(response.data.errcode === 500){
                        Toast('系统异常！')
                    }
                    else {
                        Toast(response.data.message)
                    }
                    reject(response.data)
                }
            })
            .catch((error) => {
                reject(error)
            })
        })
    },
    //统一errcode判断
    get_auto(url, data) {
        return new Promise((resolve, reject) => {
            otherAuthAxios.get(url, data).then((response) => {
                if(response.data.errcode === 0||response.data.statusCode==200){
                    resolve(response.data)
                }
                else{
                    if(response.data.errcode === 500){
                        Toast('系统异常！')
                    }
                    else {
                        Toast(response.data.message)
                    }
                    reject(response.data)
                }
            }).catch((error) => {
                console.log(error)
                reject(error)
            })
        })
    },
    post_auto(url, data,config) {
        return new Promise((resolve, reject) => {
            otherAuthAxios.post(url, {...data},config)
            .then((response) => {
                if(response.data.errcode === 0||response.data.statusCode==200){
                    resolve(response.data)
                }
                else{
                    if(response.data.errcode === 500){
                        Toast('系统异常！')
                    }
                    else {
                        Toast(response.data.message)
                    }
                    reject(response.data)
                }
            }).catch((error) => {
                console.log(error)
                reject(error)
            })
        })
    },
}

export default requestJson