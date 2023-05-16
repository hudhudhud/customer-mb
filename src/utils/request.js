import axios from 'axios'
import { isEmpty, storage, cookieStorage } from '@/utils'
import qs from 'qs'
import store from '../store'
import { Toast } from 'vant'

// axios.defaults.timeout = process.env.VUE_APP_TIMEOUT

const noAuthAxios = axios.create()
const authedAxios = axios.create()
    // authedAxios.defaults.baseURL = process.env.VUE_APP_BASE_URL
    // 添加请求拦截器
authedAxios.interceptors.request.use((request) => {    
    return request
})

// 添加响应拦截器
authedAxios.interceptors.response.use((response) => {
    // 只将请求结果的data字段返回
    let result = response.data
    if (result.success) {
        return Promise.resolve(result)
    } else {
      Toast(result.message)
        return Promise.reject(result)
    }
}, (err) => {
    // 发生网络错误后会走到这里
    if (err) {
        console.log(err)
        Toast(err.message)
    }
})

//避免预请求发送，暂时注释
axios.defaults.headers.post['Content-Type'] ='application/x-www-form-urlencoded;charset=UTF-8'
noAuthAxios.interceptors.request.use(
    (config) => {
        if (config.method === 'post'&&config.headers['Content-Type']!=='multipart/form-data') {
            config.data = qs.stringify(config.data);
        }
        return config
    },
    (error) => {
        // Do something with request error
        console.log(error) // for debug
        Promise.reject(error)
    }
)

// 需要授权信息的http请求
const http = {
    get(url, data) {
        return new Promise((resolve, reject) => {
            authedAxios.get(url, data).then((response) => {
                    resolve(response)
                })
                .catch((error) => {
                    reject(error)
                })
        })
    },
    post(url, data, config) {
      console.log(url)
        return new Promise((resolve, reject) => {
            authedAxios.post(url, data, config).then((response) => {
                resolve(response)
            }).catch((error) => {
                reject(error)
            })
        })
    }
}

// 无需授权的http请求
const noAuthHttp = {
        get(url, data) {
            return new Promise((resolve, reject) => {
                noAuthAxios.get(url, data).then((response) => {
                        resolve(response)
                    })
                    .catch((error) => {
                        reject(error)
                    })
            })
        },
        post(url, data,config) {
            return new Promise((resolve, reject) => {
                noAuthAxios.post(url, data,config).then((response) => {
                    resolve(response.data)
                }).catch((error) => {
                    reject(error)
                })
            })
        },

        login(searchObj) {
            return new Promise((resolve, reject) => {
               this.getToken().then((res) => {
                    if (res.errcode==0) {
                        noAuthAxios.post(`${process.env.VUE_APP_LOGIN_BASE_URL_WS}/common/getuserinfo`, {
                            appid: 'workflow',
                            token: res.data.token, 
                            wxappkey:searchObj.state,
                            wxcode: searchObj.code, //前端获取code
                            clienttype: 'WX',
                            needdetail: true, //只需要userid，不需要电话头像等信息时，传入false
                            source:1,//1表示新华三 2表示方舟
                        }).then((r) => {
                            r=r.data
                            if (r.errcode==0) {
                                let user = r.data
                                let userInfo={
                                    userId: user.userid,
                                    userName: user.username,
                                    mobile: user.mobile,
                                    gender: user.gender,
                                    email: user.email,
                                    avatar: user.avatar,
                                    telephone: user.telephone,
                                    userTicket: user.userticket
                                }
                                userInfo.userId=userInfo.userId.toLowerCase()
                                store.commit('setUserInfo',userInfo)
                                resolve(r)
                            } else {
                                reject({
                                    msg: r.message
                                })
                            }
                        }, (e) => {
                            reject(e)
                        })
                    } else {
                        reject({
                            msg: res.message
                        })
                    }
                }).catch((err) => {
                    console.log(err);
                    reject(err)
                })
            })
        },

        getToken() {
            return new Promise((resolve, reject) => {
                noAuthAxios.post(`${process.env.VUE_APP_LOGIN_BASE_URL_WS}/common/gettoken`, {
                    appid: process.env.VUE_APP_TOKEN_APP_ID,
                    appsecret: process.env.VUE_APP_TOKEN_APP_SECRET
                }).then((result) => {
                    resolve(result.data)
                })
            })
        },
        /* *企业微信权签 * */
        wechartSDK(agentid,jsApiList,isAlert=true){
            return new Promise((resolve, reject) => {
                noAuthAxios.post(`${process.env.VUE_APP_LOGIN_BASE_URL_WS}/common/getwxjssdkconfig`, {
                    url: location.href.split("#")[0],
                    agentid,
                    source:1,//1新华三 2方舟 
                })
                .then((res) => {
                    res=res.data
                    if (res.errcode == 0) {
                        let config = {};
                        config.beta = true;
                        config.debug = false;
                        config.appId = res.data.appid;
                        config.timestamp = res.data.timestamp;
                        config.nonceStr = res.data.noncestr;
                        config.signature = res.data.signature;
                        config.jsApiList = jsApiList
                        wx.config(config);
                        resolve(res)
                    }
                    else{
                        if(isAlert){
                            alert("jssdk权签失败，原因:" + res.message);
                        }
                    }
                })
                .catch(e => {
                    if(isAlert){
                        alert(e.message);
                    }
                    console.log(e);
                });
            })
        },
    }


export { noAuthHttp }

export default http