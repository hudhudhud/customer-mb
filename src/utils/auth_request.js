import axios from 'axios'
import { storage, cookieStorage } from '@/utils'
import { noAuthHttp } from './request'
import store from '../store'
import { Toast } from 'vant'
//默认 content-type json
const authedAxios = axios.create()
authedAxios.interceptors.request.use((request) => {
    // 添加自定义token
    request.headers["Authorization"] = store.state.userTicket
    return request
})
const authRequestJson = {
    get(url, data) {
        return new Promise((resolve, reject) => {
            authedAxios.get(url, data).then((response) => {
                resolve(response.data)
            })
            .catch((error) => {
                reject(error)
            })
        })
    },
    post(url, data,config) {
        return new Promise((resolve, reject) => {
            authedAxios.post(url, data,config).then((response) => {
                resolve(response.data)
            }).catch((error) => {
                reject(error)
            })
        })
    },
    //统一errcode判断
    post_auto(url, data,config) {
        return new Promise((resolve, reject) => {
            authedAxios.post(url, {...data},config)
            .then((response) => {
                if(response.data.errcode === 0){
                    resolve(response.data)
                }
                else{
                    if(response.data.errcode === 500){
                        Toast('系统异常！')
                    }
                    else {
                        Toast(response.data.message || '系统异常！')
                    }
                    reject(response.data)
                }
            }).catch((error) => {
                console.log(error)
                reject(error)
            })
        })
    },
    post_groupsend(url, data,config) {
        return new Promise((resolve, reject) => {
            authedAxios.post(url, {...data,appId:process.env.VUE_APP_TOKEN_APP_ID,source:1},config)
            .then((response) => {
                if(response.data.errcode === 0){
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

    getUserInfoInSSO(responseTicket){
        return new Promise((resolve, reject) => {
            noAuthHttp.getToken().then(tokenData=>{
                if(tokenData.errcode==0){
                    this.post(process.env.VUE_APP_SSO_URL + '/rest/ws/p/S008/GetWF/api/wrapper/getUserInfo', { 
                        responseTicket,
                        token: tokenData.data.token,
                        appId: process.env.VUE_APP_TOKEN_APP_ID
                    }, { headers: { 'Content-Type': 'application/json' }})
                    .then(result=>{
                        if(result != undefined && result.code === 0){
                            let user = result.data.userInfo
                            let userInfo = {
                              userId: user.userId,
                              userName: user.name,
                              mobile: user.mobilePhone,
                              gender: user.gender,
                              email: user.email,
                              avatar: user.headPic,
                              userTicket: result.data.userticket
                            }
                            userInfo.userId=userInfo.userId.toLowerCase()
                            store.commit('setUserInfo',userInfo)
                        }
                        resolve(result)
                    })
                    .catch(e=>{
                        reject(e)
                    })
                }
                else{
                    reject(e)
                }
            })
            .catch(e=>{
                reject(e)
            })
        })
    },
}

export default authRequestJson