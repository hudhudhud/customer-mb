<template>
<section class="video-detail">
  <template v-if='detail&&detail.site===0'>
    <div class="detail">
      <p class="title">{{detail.name}}</p>
      <p class="info">
        <span style='margin-right:15px;'>{{detail.createTime}}</span>
        <span >{{detail.editor}}</span>
        <span v-if="detail.playTimes>0" class="click-count">
          <svg t="1675826214243" class="icon" viewBox="0 0 1027 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6939" width="15" height="15"><path d="M876.8 150.4H147.2C64 150.4 0 217.6 0 297.6V736c0 80 64 147.2 147.2 147.2h732.8c80 0 147.2-64 147.2-147.2V297.6C1024 217.6 960 150.4 876.8 150.4zM928 761.6c0 12.8-9.6 25.6-25.6 25.6H121.6c-12.8 0-25.6-9.6-25.6-25.6V272c0-12.8 9.6-25.6 25.6-25.6h780.8c12.8 0 25.6 9.6 25.6 25.6v489.6z m-284.8-272l-153.6-108.8c-22.4-16-60.8-25.6-73.6 12.8v252.8c22.4 16 54.4 25.6 73.6 9.6l153.6-108.8c19.2-16 19.2-41.6 0-57.6z" p-id="6940" fill="#8a8a8a"></path></svg>
          {{detail.playTimes}}
        </span>
      </p>
      <div class="tag-list">
        <van-tag v-for="item of detail.tags" :key="item.id">{{item.tagName}}</van-tag>
      </div>
      <div class="content">
        <img alt="" v-if="detail.useBackPic&&detail.backPic" :src="detail.backPic"/>
        <video controls ref="video-comp" class="video-js vjs-fluid vjs-big-play-centered" playsinline
          preload="auto" :poster="detail.coverPic">
          <source :src="detail.url" type="video/mp4">
        </video>
        <img alt="" v-if="detail.useBackPic&&detail.backPic2" :src="detail.backPic2"/>
      </div>
    </div>
  </template>
  <template v-if="iframeUrl">
    <iframe :src="iframeUrl" class="iframe-wrap"></iframe>
  </template>
  <van-loading v-else-if="loading"/>
  <van-empty v-else-if="!loading && !detail">
    <div slot="image" class="custom-empty">
      <img src="../../assets/search-empty.png" />
      <div class="label" v-if="errMsg">{{errMsg}}</div>
      <div class="label" v-else>视频已删除</div>
    </div>
  </van-empty>
  <!-- 评论 -->
  <Comment v-if="!isPreview && $store.state.userTicket && detail && detail.id && (detail.site !== 1 || detail.openTarget !==1)"
    mediaType="video"
    :mediaId="$route.params.id"
    :createBy="detail.createBy"
    :count="count"
    :comment-state="detail.commentable"
    :share-state="detail.share"
    :can-collect="true"
    :comment-mode="commentMode"
    @praiseDetail="operate(1)"
    @collect="operate(2)"
    @share="shareApp(false)"
  /> 
</section>
</template>
<script>
import {videoDetail, videoPreview, videoPlay, videoApprove, videoCollect, videoShare, videoProgress} from '@/api/videoApi'
import Videojs from 'video.js'
import 'video.js/dist/video-js.css'
import 'videojs-landscape-fullscreen'
import { Empty, Field,  Loading, Tag } from 'vant'
import moment from 'moment'
import Comment from '@/components/comment'
export default {
  components:{
    [Empty.name]: Empty,
    [Field.name]: Field,
    [Loading.name]:Loading,
    [Tag.name]:Tag,
    Comment
  },
  data(){
    return {
      loading:false,
      detail:{},
      pageNum:1,
      pageSize:20,
      timeId:null,
      videoId:null,
      videoPlayer:null,

      fileList:[],

      count:{},
      iframeUrl:'',
      isPreview:false
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (to.name == 'video-preview') {
        vm.isPreview = true
      }
      vm.init()
      wx.hideOptionMenu();
      wx.hideAllNonBaseMenuItem();
      wx.hideMenuItems({
        menuList: [
        "menuItem:share:appMessage",
        ]
      });
    });
  },
  beforeRouteLeave(to,from,next){
    try{
      wx.hideOptionMenu();
      wx.hideAllNonBaseMenuItem();
      wx.hideMenuItems({
        menuList: [
        "menuItem:share:appMessage",
        ]
      });
      if(this.timeId){
        clearInterval(this.timeId)
      }
      if(this.videoPlayer){
        if(!this.videoPlayer.paused()){
          this.videoPlayer.pause()
        }
        this.videoPlayer.dispose()
      }
    }
    finally{
      if(this.timeId){
        clearInterval(this.timeId)
      }
      next()
    }
  },
  computed:{
    commentMode(){
      return (this.detail && this.detail.site > 0) ? 'popup' : 'list'
    }
  },
  methods:{
    async init(){
      this.iframeUrl = ''
      this.detail = {}
      this.videoId = this.$route.params.id
      this.fileList = []
      this.btnLoading = false
      await this.getData()
      if(this.timeId){
        clearInterval(this.timeId)
      }
      if(this.detail && this.detail.id){
        this.videoWatch()
      }
    },
    async getData(){
      try{
        this.loading = true
        let getFunc = videoDetail
        if (this.isPreview) {
          getFunc = videoPreview
        }
        let res = await getFunc(this.videoId)
        if (res.errcode !== 0) {
          this.detail = null
          this.errMsg=res.message
          return
        }
        this.detail = res.data
        if(res.data && res.data.share !== 1 && !this.$store.state.userTicket){//不可对外分享
          this.detail = null
          this.errMsg="该视频不可在企微外部打开"
          return
        }

        if (res.data.share > 0 && this.$utils.getQueryByName('state') && this.$utils.isQW() && !this.$utils.isPC()) {
          await this.wxJsConfig()
        }
        
        if(res.data.share == 1){
          wx.showOptionMenu();
          wx.showAllNonBaseMenuItem();
          this.shareApp(true)
        }
          
        if (this.detail) {
          document.title = this.detail.name
          this.detail.createTime = moment(this.detail.createTime).format('YYYY-MM-DD')
          this.count = {
            share: this.detail.shareTimes,
            praise: this.detail.approveTimes,
            praiseActive: this.detail.approved,
            collect: this.detail.collectTimes,
            collectActive: this.detail.collected
          }
          if (this.detail.site === 1) { //外链
            if (this.detail.url) {
              if (this.detail.openTarget == 1) {
                window.location.replace(this.detail.url)
              } else { 
                this.iframeUrl = this.detail.url
              }
            } else {
              this.detail = null
              this.errMsg="视频外链为空"
            }
          }
        }
        else {
          document.title = '\u200E' //空占位符
        }
      }
      catch(err){
        console.log(111,err)
        // this.$toast(err)
        this.detail = null
        this.errMsg=err.message
      }
      finally{
        this.loading = false
      }
    },
    videoWatch(){
      let self = this
      let ele = this.$refs['video-comp']
      if(!ele)return 
      let isFirst = true
      // ele.playbackRate = 5 //调整倍速
      let player = Videojs(ele, {
        autoplay: false,//自动播放
        controls: true,//用户可以与之交互的控件
        loop:false,//视频一结束就重新开始
        muted:false,//默认情况下将使所有音频静音
        // aspectRatio:"16:9",//显示比率
        // fluid:true,
        playbackRates: [1,1.25,1.5]
      }, 
      function onPlayerReady() {          
        let steps=[2000,3000]
        let step=steps[0]
        let duration = 0
        this.on("timeupdate",function(){
          if(self.isPreview)return
          if (isFirst) {
            duration = Math.ceil(player.duration()); //以秒为单位
            if(self.detail.progress.currentPlayTime < duration && self.detail.progress.currentProgress < 100) {
              player.currentTime(self.detail.progress.currentPlayTime)//跳转到指定时间
            }
            console.log('duration:',duration)
          }
          isFirst = false
        });
        this.on("error",function(){});
        // this.on('timeupdate',function(){})
        this.on('play',async function(){
          if(self.isPreview)return
          step = steps[parseInt(Math.random()*10)%2] // 随机取心跳频率
          console.log('play....',step)
          //开启定时器
          self.timeId = setInterval(()=>{
            timeIdPostFunc()
          },step)
          if (!self.hasLogPlay) {
            videoPlay({id:self.videoId}).then(res => {
              if (res.errcode === 0) {
                self.hasLogPlay = true
                self.detail.playTimes += res.data.playTimes
              }
            })
          }
        })
        this.on('pause',function(){
          console.log('pause....')
          timeIdPostFunc()
          if(self.timeId){
            clearTimeout(self.timeId)
          }
        })
        this.on('ended',function(){
          console.log('ended....')
          timeIdPostFunc()
          if(self.timeId){
            clearTimeout(self.timeId)
          }
        })
        //心跳监控看视频时间
        let timeIdPostFunc = async ()=>{
          if(self.isPreview)return
          let currentTime = Math.ceil(player.currentTime())
          let currentProgress = Math.ceil(currentTime/duration*100)
          if(!currentProgress||!currentTime||!duration){
            return
          }
          console.log('currentTime:',currentTime,duration,currentProgress)
          // if(self.$store.state.userTicket){ //放开限制，便于后端在匿名时统计播放量
            videoProgress({videoId:self.videoId,currentProgress,currentPlayTime:currentTime})
          // }
        }
      })
      
      player.landscapeFullscreen({
        fullscreen: {
          enterOnRotate: true,
          exitOnRotate: true,
          alwaysInLandscapeMode: true,
          iOS: false
        }
      })
      this.videoPlayer = player
    },
    //转发
    shareApp(isFromApp){
      let appId = this.$utils.getQueryByName('appId')
      let agentId = this.$utils.getQueryByName('state')
      let rediUrl=encodeURIComponent(`${location.origin+location.pathname}?appId=${appId}&toPath=video-detail/`+this.$route.params.id+`&share=${this.detail.share===1}`)
      let link=`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${window.localStorage.getItem('appId')}&redirect_uri=${rediUrl}&response_type=code&scope=snsapi_base&agentid=${agentId}&state=${agentId}#wechat_redirect`
      let params = {
        title: this.detail.name, // 分享标题
        desc: this.detail.createTime+" "+this.detail.editor, // 分享描述
        link: link, // 分享链接；在微信上分享时，该链接的域名必须与企业某个应用的可信域名一致
        imgUrl:this.detail.coverPic, // 分享封面
      }
      let self = this
      if(isFromApp){
        wx.onMenuShareAppMessage({
          ...params,
          success: function () {
            // self.$utils.toast.show('转发成功！')
            self.operate(3)
          },
        });
        //转发到微信
        let outUrl=`${location.origin+location.pathname}#/video-detail/${this.$route.params.id}`
        wx.onMenuShareTimeline({
          title:this.detail.name, // 分享标题
          link: outUrl, // 分享链接
          imgUrl:  this.detail.coverPic, // 分享封面
          success: function () {
            // 用户确认分享后执行的回调函数
            self.operate(3)
          },
          cancel: function () {
            // 用户取消分享后执行的回调函数
          }
        });
      }
      else{
        wx.invoke(
          "shareAppMessage", 
          params,
          function(res) {
            if (res.err_msg == "shareAppMessage:ok") {
              self.operate(3)
            }
          }
        );
      }
    },
    async operate(type){
      // 操作类别: 1点赞; 2收藏; 3转发
      if (type==1) {
       await videoApprove({
        id:this.videoId,
        approved:!this.detail.approved ? 1 : 0
       })
       this.detail.approved = !this.detail.approved
       this.count.praiseActive = this.detail.approved
       this.count.praise += this.detail.approved ? 1 : -1
      }
      else if (type==2) {
        await videoCollect({
          id:this.videoId,
          collected:!this.detail.collected ? 1 : 0
        })
        this.detail.collected = !this.detail.collected
        this.count.collectActive = this.detail.collected
        this.count.collect += this.detail.collected ? 1 : -1
      }
      else if (type==3) { 
        await videoShare({
          id:this.videoId
        })
        this.detail.shareTimes ++
        this.count.share = this.detail.shareTimes
      }
    },
      /**
     * 企业微信权签
     * */
    wxJsConfig() {
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
      ])
      wx.ready(function() {
        wx.hideOptionMenu();
        wx.hideAllNonBaseMenuItem();
        wx.hideMenuItems({
          menuList: ["menuItem:refresh", "menuItem:setFont"]
        })
      })
    },
  }
}
</script>
<style lang="stylus">
// 视频组件样式
.video-js .vjs-time-control{display:block;}
.video-js .vjs-remaining-time{display: none;}
.video-js .vjs-control{width:3em;}
.video-js .vjs-time-control{ 
  min-width:unset;
  padding:unset;
}
.video-js.vjs-playing .vjs-tech {
  pointer-events: auto;
}
.video-js .vjs-control,
.video-js button,
.video-js *:focus{outline:none;}
.video-js .vjs-picture-in-picture-control{
  display:none;
}
.vjs-playback-rate .vjs-playback-rate-value {
  pointer-events: none;
  font-size: 1.2em;
  line-height: 2.5;
  text-align: center;
}
.vjs-poster{
  background-size: cover;
  background-color: #fff;
}
.video-js{
  background-color: #fff;
}
.overflow-hiden{
  overflow:hidden;
}
.elMessageBox{
  width:300px;
}
</style>
<style lang="stylus" scoped>
$bottom-btn-height=56px;
.video-detail{
  width:100%;
  // background-color:#f2f2f2;
  min-height:100%;
}
.iframe-wrap {
  width: 100vw;
  height: calc(100vh - 56px);
}
.detail{
  width:100%;
  box-sizing border-box
  padding: 20px 15px 15px;
  background-color:#fff;
  padding-bottom:10px;
  height:100%;
  .title{
    text-align left;
    font-size:20px;
    line-height:28px;
    font-family:PingFangSC-Regular,PingFang SC;//Microsoft YaHei;
    font-weight:bold;
  }
  .info{
    color:#999;
    text-align left;
    font-size:14px;
    margin-top: 10px;
    display:flex;
    align-items: center;
    .click-count{
      margin-left:15px;
      display:flex;
      align-items:center
      svg{
        margin-right:3px;
      }
    }
  }
  .tag-list{
    margin-top: 10px;
    .el-tag{
      margin-right:10px;
      margin-bottom:5px;
      height:unset;
      line-height:unset;
      padding:5px;
    }
  }
  .content{
    margin-top:10px;
    font-size:0;
  }
  img{
    width: 100% !important;
  }
  video{
    width:100%  !important;
    // object-fit: fill
    // border-radius: 5px;
    // object-fit: cover;
    max-height: calc(100vh - 200px);
  }
  b,strong{
    font-weight bold;
  }
}
.custom-empty {
  text-align: center;
  padding-top: 40px;

  img {
    width: 187px;
    box-sizing: border-box;
  }

  .label {
    font-size: 16px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    color: rgba(63, 63, 68, 1);
    padding: 10px 0;
    white-space: nowrap;
  }
}

/deep/.video-js .vjs-tech {
  position: static !important;
}
/deep/.video-js {
  height: auto !important;
  
  padding-top: 0 !important;
}
/deep/.video-js.vjs-fullscreen:not(.vjs-ios-native-fs) video {
  max-height: 100%;
}
</style>