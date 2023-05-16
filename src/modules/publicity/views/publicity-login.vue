<template>
  <div class="login">
    <van-loading type="spinner" style="text-align:center" />{{msg}}
  </div>
</template>

<script>
import { Loading, Dialog, Toast } from 'vant'
// import { mapGetters } from "vuex";
import { storage, isPC, isQW } from "@/utils";
import { noAuthHttp } from "@/utils/request";
import Request from "@/utils/request";
// import Request from "@/utils/request";
import { SSOLOGIN,ENCODE_UID } from '../api/index'

export default {
  data(){
    return {
      msg:''
    }
  },
  async mounted() {
    if (process.env.VUE_APP_BUILD === "dev") {
      if(isPC()) {
        this.ssoLoginPC()
        return
      }
      let userInfo = {
        userId: "sys4610",
        userName: '石立红',
        mobile: "18768199898",
        userTicket: "ogE0aBoNDgQV2xwh/GYsoIm5Me8V0HXaQCvGPm5PanU="
      }
      //开发环境将域账号加密传参
      let res = await Request.post(ENCODE_UID, {"empNumber":userInfo.userId},
        {
          headers:{
            'sysid':`UniTask`,
            'syspwd': `password`
          }
        })
      userInfo.userTicket  = res.encode
      this.$store.commit('setUserInfo',userInfo)
      this.$router.replacePage("publicity-index");
      return;
    }
    if(!isQW()) {
      //不需要登录可对外转发的文章
      // let searchObj = this.getLocationSearch();
      // if(searchObj&&searchObj.toPath&&searchObj.toPath.indexOf('publicity-detail')>-1&&searchObj.share=="true"){
      //   this.$router.replacePage(searchObj.toPath);
      //   return
      // }
      let toPath = this.$utils.getQueryByName('toPath')
      if(toPath&&toPath.indexOf('publicity-detail')>-1&&this.$utils.getQueryByName('share')=="true"){
        this.$router.replacePage(toPath);
        return
      }
      this.ssoLoginPC()
      return
    }
    // this.msg = '1'
    let goPath = '/publicity-index'
    // let searchObj = this.getLocationSearch();
    if (this.$utils.getQueryByName('toPath')) {
      goPath = this.$utils.getQueryByName('toPath')
    }
    // if(searchObj && searchObj.toPath){//从外链进来
    //   goPath = searchObj.toPath
    // } 
    else {
      goPath = '/publicity-index'
    }
    // this.msg='2' + goPath
    if (window.sessionStorage.getItem("userTicket") === null) {
      try{
        // this.msg = '3'
        let res = await noAuthHttp.login({state:this.$utils.getQueryByName('state'),code:this.$utils.getQueryByName('code')})
      }
      catch(err){
        // this.msg='4' + err
        Toast(JSON.stringify(err))
        return
      };
    }
    // this.msg='2'
    try {
      this.wxJsConfig();
      let self = this
      let timmer = setTimeout(() => {
        // self.msg='3-4 定时器'
        wx.hideOptionMenu();
        wx.hideAllNonBaseMenuItem();
        wx.hideMenuItems({
          menuList: ["menuItem:refresh", "menuItem:setFont","menuItem:copyUrl"]
        });
        self.$router.replace(goPath);
      },3000)
      wx.ready(function() {
        clearTimeout(timmer)
        // self.msg='3-2'+goPath
        wx.hideOptionMenu();
        wx.hideAllNonBaseMenuItem();
        wx.hideMenuItems({
          menuList: ["menuItem:refresh", "menuItem:setFont","menuItem:copyUrl"]
        });
        if(goPath && self.$route.name == 'publicity-login'){
          // 仅在登录页跳转，解决文章详情页重新权签后执行页面跳转
          self.$router.replace(goPath);
        }
      });
      wx.error(function(res){
        clearTimeout(timmer)
        // self.msg='3-3'
        self.$router.replace(goPath);
      });
    }catch(err) {
      // this.msg='4'
      this.$router.replace(goPath);
    }
  },
  watch: {
    $route(to, from) {}
  },
  methods: {
    // ...mapGetters(["getLocationSearch"]),
    /**
     * 企业微信权签
     * */
    wxJsConfig() {
        // let searchObj = this.getLocationSearch();
        noAuthHttp.wechartSDK(this.$utils.getQueryByName('state'),
        [
          "hideMenuItems",
          "hideOptionMenu",
          "openEnterpriseChat",
          "previewFile",
          "hideAllNonBaseMenuItem",
          "previewImage",
          "onMenuShareAppMessage",
          "shareWechatMessage",
          "onMenuShareTimeline",
          "shareAppMessage"
        ]).then(res=>{
          storage.set('appId',res.data.appid)
          resolve()
        }).catch(() => {
          reject()
        })
    },
    ssoLoginPC(){
      let mainUrl = location.origin+location.pathname + '#/publicity-userInfo'
      if(this.$route.query&&this.$route.query.redirect){//未登陆跳转
        mainUrl+='?redirect='+encodeURIComponent(this.$route.query.redirect)
      }
      else {
        mainUrl+='?redirect='+encodeURIComponent('publicity-index')
      }
      // mainUrl = encodeURIComponent(mainUrl)
      noAuthHttp.get(SSOLOGIN,{params:{mainUrl}}).then(res => {
       window.location.replace(res.data.data.target)
      }).catch(()=>{})
    }
  },
  components: {
    [Loading.name]: Loading
  }
};
</script>

<style scoped lang="stylus">
.login {
  display: flex;
  justify-content: center;
  padding-top: 50px;
}
</style>
<style>
html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, embed, figure, figcaption, footer, header, menu, nav, output, ruby, section, summary, time, mark, audio, video, input {
  touch-action: pan-y pan-x;
}
</style>