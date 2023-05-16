<template>
  <div class="login">
    <span class="error-info" v-if="errorInfo">{{errorInfo}}</span>
  </div>
</template>

<script>
import {GET_HOME_PAGE} from '../api'
import { ENCODE_UID } from '@/api/index'
import { SSOLOGIN } from '@/api'
export default {
  data(){
    return {
      errorInfo:"",
      homePageId:''
    }
  },
  mounted() {
    this.errorInfo = ""
    this.$toast.loading('登录中...')
    if (process.env.VUE_APP_BUILD === "dev") {
      this.$store.commit('removeUserInfo')
      if(this.$utils.getQueryByName('appId')){
        this.getAppInfo().then(async appInfo=>{
          if (appInfo.appAuth) {
            let userInfo = {
              userId: "hys3032",
              userName: "hd"
            }
            //开发环境将域账号加密传参
            let res = await this.$requestJson.post(ENCODE_UID, {"empNumber":userInfo.userId},
            {
              headers:{
                'sysid':`UniTask`,
                'syspwd': `password`
              }
            })
            userInfo.userTicket  = res.encode
            this.$store.commit('setUserInfo', userInfo)
          }
          this.afterLogin()
        })
      }
      else{
        this.errorInfo = "获取页面出错：该微应用缺少appId参数！" 
      }
      return
    }
      
    this.$store.commit('removeUserInfo')
    // 视频分享链接
    if (!this.$utils.isQW()) {
      let toPath = this.$utils.getQueryByName('toPath')
      if(toPath&&toPath.indexOf('video-detail')>-1&&this.$utils.getQueryByName('share')=="true"){
        this.$router.replacePage(toPath)
        return
      }
    }

    // 有跳转链接（推送进），非diy页面不需要appId
    let toPath = this.$utils.getQueryByName('toPath')
    if (toPath && toPath.indexOf('diy-home') === -1) {
      try{
        this.goLogin()
      }
      catch(e){
        this.errorInfo = JSON.stringify(e)
      }
      finally{
        this.$nextTick(()=>{
          this.$toast.clear()
        })
      }
    }
    else {
      if(!this.$utils.getQueryByName('appId')) {
        this.errorInfo = "获取页面出错：该微应用缺少appId参数！" 
        return
      }
      this.getAppInfo()
      .then(appInfo=>{
        if (appInfo.appAuth) { //该应用需要登录
          this.goLogin()
        }
        else{
          this.afterLogin()
        }
      }).catch(e=>{
        this.errorInfo = JSON.stringify(e)
        return 
      })
      .finally(()=>{
        this.$nextTick(()=>{
          this.$toast.clear()
        })
      })
    }

    this.wxJsConfig();
    wx.ready(function() {
      wx.hideOptionMenu();
      wx.hideAllNonBaseMenuItem();
      wx.hideMenuItems({
        menuList: ["menuItem:refresh", "menuItem:setFont"]
      })
    })
  },
  methods: {
    /**
     * 企业微信权签
     * */
    wxJsConfig() {
      let state = this.$utils.getQueryByName('state')
      if(!state) return 
      this.$noAuthHttp.wechartSDK(this.$utils.getQueryByName('state'),
      ["hideMenuItems",
        "hideOptionMenu",
        "openEnterpriseChat",
        "previewFile",
        "hideAllNonBaseMenuItem",
        "previewImage",
        "onMenuShareAppMessage",
        "shareAppMessage",
        "selectEnterpriseContact",
      ]).then(res=>{
        this.$utils.storage.set('appId',res.data.appid)
      })
    },
    async goLogin(){
      let state = this.$utils.getQueryByName('state')
      let code = this.$utils.getQueryByName('code')
      if(this.$utils.isQW() && state && code){
        await this.$noAuthHttp.login({state,code})
        this.afterLogin()
      }
      else{
        this.ssoLoginPC()
      }
    },
    async getAppInfo(){
      let res = await this.$requestJson.post(GET_HOME_PAGE,{appId:this.$utils.getQueryByName('appId')})
      if (res.errcode ===0 ) {
        if(res.data&&res.data.id){
          this.homePageId = res.data.id
        }
        else{
          return Promise.reject("获取应用主页出错：请先设置该应用首页！")
        }
      }
      else {
        return Promise.reject("获取应用主页出错：" + res.data.message)
      }
      return res.data
    },
    async afterLogin(){
      try{
        if(this.$utils.getQueryByName('toPath')){//从外链进来
          this.$router.replace(this.$utils.getQueryByName('toPath'));
        }
        else if(this.$route.query&&this.$route.query.redirect){//未登陆跳转,现在只有文件转发的情况
          this.$router.replace(this.$route.query.redirect);
        }
        else {
          this.$router.replace('diy-home/' + this.homePageId);
        }
      }
      catch(e){
        this.errorInfo = "异常：" +e
      }
      finally{
        this.$nextTick(()=>{
          this.$toast.clear()
        })
      }
    },
    ssoLoginPC(){
      let mainUrl = location.origin+location.pathname+location.search + '#/publicity-userInfo'
      if(this.$route.query&&this.$route.query.redirect){//未登陆跳转
        mainUrl+='?redirect='+encodeURIComponent(this.$route.query.redirect)
      }
      else {
        mainUrl+='?redirect='+encodeURIComponent('diy-home/' + this.homePageId)
      }
      // mainUrl = encodeURIComponent(mainUrl)
      this.$noAuthHttp.get(SSOLOGIN,{params:{mainUrl}}).then(res => {
       window.location.replace(res.data.data.target)
      }).catch(()=>{})
    }
  },
  beforeRouteLeave(to,from,next){
    this.$nextTick(()=>{
      this.$toast.clear()
    })
    next()
  }
};
</script>

<style scoped lang="stylus">
.login {
  display: flex;
  justify-content: center;
  padding-top: 50px;
}
.error-info{
  padding:20px;
  font-size:14px;
  color:red;
  text-align: center;
}
</style>
