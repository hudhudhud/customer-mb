<template>
  <div class="article-detail-page">
    <template v-if='detail && detail.site === 0'>
      <div class="publicity-detail">
        <div class="title">{{detail.noticeTitle}}</div>
        <div class="info">
          <span style='margin-right:5px;'>{{detail.createTime}}</span>
          <span class="info__item" style='margin-right:5px;'>{{detail.itemName}}</span>
          <span>{{detail.author}}</span>
          <div class="read">阅读 <span class="num">{{detail.clickNum}}</span></div>
        </div>
        <div class="content" v-html="detail.noticeContent"></div>
      </div>
      
    </template>
    <template  v-if="iframeUrl">
      <div style="display:none;" ref="docInfo"></div>
      <iframe :src="iframeUrl" class="iframe-wrap"></iframe>
    </template>
    <Comment v-if="!isPreview && userId && detail && detail.id"
      mediaType="article"
      :mediaId="$route.params.id"
      :createBy="detail.createBy"
      :count="count"
      :comment-state="detail.commentable"
      :share-state="detail.share"
      :can-collect="isCanCollect"
      :comment-mode="commentMode"
      :docId="docId"
      @praiseDetail="praiseDetail"
      @collect="handleCollect"
      @share="handleShare"
    />

    <van-empty v-if="!loading && !detail">
      <div slot="image" class="custom-empty">
        <img src="../assets/search-empty.png" />
        <div class="label" v-if="errMsg">{{errMsg}}</div>
        <div class="label" v-else>文章已删除</div>
      </div>
    </van-empty>
    <PreviewImg ref="preview" />
  </div>
</template>

<script>
import { collect, detail, readSituation, approve, share, IdocUrl, detailPreview, getDownLoadUrl } from '../../../api/articleApi'
import { storage ,setDocumentTitle, isQW } from "@/utils";
import moment from 'moment'
import $ from "jquery"
import { Empty, Toast } from 'vant'
import Comment from '@/components/comment'
import PreviewImg from '../../../components/previewImg.vue'

import {onUserCaptureScreen,wxJsConfig} from '../assets/common'

export default {
  components:{
    [Empty.name]: Empty,
    Comment,
    PreviewImg,
  },
  beforeRouteEnter(to, from, next) {
    to.meta.routerTransition="router-slide-right"
    next(async vm => {
      if (to.name == 'publicity-preview') {
        vm.isPreview = 1
      }
     
      vm.userActiveTime = Date.now()
      vm.userIsActive = true
      wx.hideOptionMenu();
      wx.hideAllNonBaseMenuItem();
      wx.hideMenuItems({
          menuList: [
          "menuItem:share:appMessage",
          ]
      });
      vm.errMsg = ''
      vm.detail = {}
      vm.readStartTime=null
      await vm.getData()
      // if(vm.userId&&vm.detail){
      //   vm.getCommentList()
      // }
      vm.wxImgView() 
      if(vm.timeId){
        clearInterval(vm.timeId)
      }
      vm.inputContent = ''
      vm.btnLoading = false
      vm.popupVisible = false
      vm.linkPopVisible = false
      if(vm.readStartTime&&vm.userId&&process.env.VUE_APP_BUILD !== "dev"){
        vm.timeId=setInterval(() => {
          let notMoveTime = Date.now() - vm.userActiveTime
          //超过1个小时不操作，就不在记录停留时间
          if(notMoveTime<=1000*60*60){
            readSituation({
              id: vm.detail.id,
              readStartTime: vm.readStartTime
            })
          }
          else{
            vm.userIsActive = false
            clearInterval(vm.timeId)
          }
        }, 2000);
      }
      vm.$nextTick(()=>{
        vm.audioAppendDownloadEle()
        vm.audioAppendAudioSpeedEle()
      })

      //截屏日志
      onUserCaptureScreen(sessionStorage.getItem('publicity_catg_name'))
    });
  },
  beforeRouteLeave(to,from,next){
      wx.hideOptionMenu();
      wx.hideAllNonBaseMenuItem();
      wx.hideMenuItems({
          menuList: [
          "menuItem:share:appMessage",
          ]
      });
      next()

      $('.publicity-detail .content audio').each((i,audio)=>{
        audio.pause()
      })
      $('.publicity-detail .content .notice_audio_wrap').each((i,wrapper)=>{
        wrapper.classList.remove('notice_audio_status_play')
      })
      $('audio').each((i,audio)=>{
        audio.currentTime=0
        audio.pause()
        //audio.remove()
      })
      $('.publicity-detail .content').find('.notice_audio_progress_handle').css('left', 0 * 100 + '%');
      $('.publicity-detail .content').find('.notice_audio_length_current').html(this.transTime(0));

      if(this.timeId){
        clearInterval(this.timeId)
      }
      let ele = document.querySelector('.publicity-detail')
      if(ele){
        ele.removeEventListener('click',this.imgFunc)
      }

  },
  data() {
    return {
      detail:null,
      loading:false,
      startTime:null,
      timeId:null,
      replayParentList:[],
      isBusy:false,
      userIsActive:true,
      userActiveTime:null,      
      errMsg:'',
      showBackBtn: false,
      count: {
        comment: 0,
        praise: 0,
        praiseActive: false,
        collect: 0,
        collectActive: false,
        share: 0
      },
      isCanCollect: true,
      isPreview: 0,
      optionLoading: false,
      iframeUrl: '',
    };
  },
  mounted(){
    this.onShowBackBtn()
    this.$nextTick(()=>{
      this.userActiveTime = Date.now() 
      document.body.ontouchstart =this.recordUserActive    
      document.body.onkeydown = this.recordUserActive  
      document.body.onscroll = this.recordUserActive  
      document.body.onclick = this.recordUserActive  
    })
  },
  computed:{
    userId(){
      return this.$store.state.userInfo?this.$store.state.userInfo.userId:""
    },
    userTicket(){
      return this.$store.state.userInfo?this.$store.state.userInfo.userTicket:""
    },
    isAuthor(){
      return this.userId && this.detail.createBy && this.detail.createBy.toLocaleLowerCase() === this.userId.toLocaleLowerCase()
    },
    commentMode(){
      return (this.detail && this.detail.site > 0) ? 'popup' : 'list'
    },
    docId() {
      if (this.userId && this.detail && this.detail.site == 2 && this.detail.downloadable) {
        return this.detail.noticeContent
      }
      return ''
    }
  },
  methods: {
    onShowBackBtn() {
      let route = this.$route
      let backUrl = sessionStorage.getItem('firstUrl')
      if (backUrl && route.path != backUrl) {
        this.showBackBtn = true
      } else {
        this.showBackBtn = false
      }
    },
    getData(){
      this.loading=true
      let getFunc = detail
      if (this.isPreview === 1) {
        getFunc = detailPreview
      }
      return getFunc(this.$route.params.id)
      .then(async (res)=>{
          if(res.errcode==0){
            if (!sessionStorage.getItem('publicity_catg_name')) {
              sessionStorage.setItem('publicity_catg_name', res.data.itemName)
            }
            
              if(res.data&&res.data.share !== 1&&!this.userId){//不可对外分享
                this.detail = null
                this.errMsg="该文章不可在企微外部打开"
                return
              }

              if (res.data.share > 0 && this.$utils.getQueryByName('state') && isQW()) {
                try {
                  await wxJsConfig(this.$utils.getQueryByName('state'))
                } catch(e) {
                  console.log(e)
                }
              }

              if (res.data && res.data.itemName) {
                setDocumentTitle(res.data.itemName)
              } else {
                setDocumentTitle('\u200E')
              }

              if (Number(res.data.site) == 1) {
                if (res.data.noticeContent) {
                  if (res.data.openTarget == 1) {
                    window.location.replace(res.data.noticeContent)
                    return
                  } else {
                    this.iframeUrl = res.data.noticeContent
                  }
                } else {
                  this.detail = null
                  this.errMsg="文章外链为空"
                }
              }
              if (Number(res.data.site) == 2) {
                if (res.data.noticeContent) {
                  this.getCloudUrl(res.data.noticeContent, true)
                  // this.$router.replace(`/publicity-iframe?articleId=${this.$route.params.id}&docId=${res.data.noticeContent}`)
                } else {
                  this.detail = null
                  this.errMsg="文章云文档文件为空"
                }
              }
              
              res.data.site = Number(res.data.site)
              this.detail=res.data
              if(this.detail){
                this.detail.createTime = moment(this.detail.createTime).format('YYYY-MM-DD')
                this.readStartTime=this.detail.readStartTime
                //对外分享
                if(res.data.share == 1){
                  const _this = this
                  wx.ready(function() {
                    // 重新权签成功后执行，解决跳到外链返回后偶现分享按钮显示失败问题和分享朋友圈标题设置失败问题
                    wx.showOptionMenu();
                    wx.showAllNonBaseMenuItem();
                    _this.shareApp(res.data)
                  });
                  
                  this.shareApp(res.data)
                }
                // //对内分享，企业微信转发
                // else if(res.data.share == 2){
                //   wx.showMenuItems({
                //       menuList: [
                //       "menuItem:share:appMessage",
                //       ]
                //   });
                //   this.shareApp(res.data)
                // }
              }
              
              this.count = {
                share: this.detail.shareNum,
                praise: this.detail.approve,
                praiseActive: this.detail.approved,
                collect: this.detail.collectNum,
                collectActive: this.detail.collected
              }
              
              this.$nextTick(() => {
                this.bindCloudEvent()
                this.audioInit()
              })
          }
          else{
            this.detail = null
            this.errMsg=res.message
            setDocumentTitle('\u200E')
            // Toast(res.msg)
          }
      })
      .catch((err)=>{
        Toast(err || '系统异常')
      })
      .finally(()=>{
          this.loading=false
      })
    },
    shareApp(data){
      const _this = this
      let rediUrl=encodeURIComponent(`${location.origin+location.pathname}?toPath=publicity-detail/`+this.$route.params.id+`&share=${data.share===1}`)
      let link=`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${window.localStorage.getItem('appId')}&redirect_uri=${rediUrl}&response_type=code&scope=snsapi_base&agentid=${process.env.VUE_APP_PUBLICITY_AGENT_ID}&state=${process.env.VUE_APP_PUBLICITY_AGENT_ID}#wechat_redirect`
      wx.onMenuShareAppMessage({
          title: data.noticeTitle, // 分享标题
          desc: "来自【"+data.itemName+"】", // 分享描述
          link: link, // 分享链接；在微信上分享时，该链接的域名必须与企业某个应用的可信域名一致
          imgUrl: this.detail.imgUrl, // 分享封面
          success: function () {
              // 用户确认分享后执行的回调函数
            _this.shareCount()
          },
          cancel: function () {
              // 用户取消分享后执行的回调函数
          }
      });
      //转发到微信，链接路由丢失，打不开链接！！
      let outUrl=`${location.origin+location.pathname}#/publicity-detail/${this.$route.params.id}`
      // if(wx&&wx.invoke){
      // wx.invoke(
      //   "shareWechatMessage", {
      //       title: this.detail.noticeTitle, // 分享标题
      //       desc: "来自【"+this.detail.itemName+"】", // 分享描述
      //       link: outUrl, // 分享链接
      //       imgUrl:  this.detail.imgUrl, // 分享封面
      //   }, function(res) {
      //       if (res.err_msg == "shareWechatMessage:ok") {
      //       }
      //   }
      // );
      //}
      wx.onMenuShareTimeline({
          title:this.detail.noticeTitle, // 分享标题
          link: outUrl, // 分享链接
          imgUrl:  this.detail.imgUrl, // 分享封面
          success: function () {
              // 用户确认分享后执行的回调函数
              _this.shareCount()
          },
          cancel: function () {
              // 用户取消分享后执行的回调函数
          }
      });
    },
    handleShare() {
      let rediUrl=encodeURIComponent(`${location.origin+location.pathname}?toPath=publicity-detail/`+this.$route.params.id+`&share=${this.detail.share===1}`)
      let link=`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${window.localStorage.getItem('appId')}&redirect_uri=${rediUrl}&response_type=code&scope=snsapi_base&agentid=${process.env.VUE_APP_PUBLICITY_AGENT_ID}&state=${process.env.VUE_APP_PUBLICITY_AGENT_ID}#wechat_redirect`
      let options = {
          link:link,
          title:this.detail.noticeTitle,
          desc:"来自【"+this.detail.itemName+"】",
          imgUrl:this.detail.imgUrl
      }
      const _this = this
      wx.ready(function(){
        wx.invoke(
        "shareAppMessage", 
        options,
        function(res) {
          if (res.err_msg == "shareAppMessage:ok") {
            _this.shareCount()
          }
        }
      ); 
      })
          
    },
    // 分享计数
    shareCount() {
      share(this.$route.params.id).then(() => {
        this.count.share += 1
      })
    },
    wxImgView(){
      let ele = document.querySelector('.publicity-detail')
      if(ele){
        ele.addEventListener('click',this.imgFunc)
      }
    },
    imgFunc(e){
         let self = this
         if(e.target.tagName=='IMG'){
          // 图片父元素是a标签，并且a标签有超链接或者绑定云文档时不打开图片
          if (e.target.parentElement && e.target.parentElement.tagName=="A" && (e.target.parentElement.href || e.target.parentElement.getAttribute('fileid'))) return
            let urls=[]
            let imgEles = document.querySelectorAll('.publicity-detail img')
            if(imgEles.length){
              Array.from(imgEles).forEach(it=>{
                urls.push(it.src)
              })
            }
            // this.$refs.preview.showPreview({
            //   imgList: urls,
            //   current: e.target.src
            // })
            // return
            // if(self.userId&&wx&&wx.previewImage){
            if(self.userId&&isQW() && wx.previewImage){
              wx.previewImage({
                current: e.target.src, // 当前显示图片的http链接
                urls: urls // 需要预览的图片http链接列表
              })
            }
            else{
              this.$refs.preview.showPreview({
                imgList: urls,
                current: e.target.src
              })
            }
        } 
        //跳轻学堂登录，开发文档：https://www.qingxuetang.com/open/doc/h5
        // else if(e.target.tagName=="A"&&e.target.href.indexOf('qingxuetang')>-1&&this.userId){
        //   e.preventDefault()
        //   let params = [
        //     {key:'appId',value:'qxtcorp949662'},
        //     {key:'authCorpId',value:'p31250'},
        //     {key:'empNo',value:this.userId},
        //     {key:'nonce',value:Date.now()},
        //     {key:'openId',value:this.userId},
        //     {key:'signType',value:1},
        //     {key:'timestamp',value:Date.now()},
        //   ]
        //   let md5 = require('md5')
        //   let sign = md5([...params,{key:'appSecret',value:'f8139fdda73ae30a6a6e1b3d4e366eba'}].map(it=>{return `${it.key}=${it.value}`}).join('&')).toUpperCase()
        //   params.push({key:'sign',value:sign})
        //   console.log(params)
        //   let qingxuetangURL = 'https://www.qingxuetang.com/passport/tp/v2/thirdLogin?'+params.map(it=>{return `${it.key}=${it.value}`}).join('&')
        //   location.href = qingxuetangURL
        // }
    },
    audioInit(){
      let v_this = this
      $('.publicity-detail .content').on('click','.notice_audio_wrap',async function(e){
          let self=this
          let hasId = self.getAttribute('data-id')
          let audio = $(document.body).find('audio[data-id='+hasId+']')[0] || $(self).find('audio')[0]
          if(!audio){
            let id = Date.now()
            self.setAttribute("data-id",id)
            if(e.target.classList.contains('notice_audio_switch')||e.target.classList.contains('notice_audio_switch_icon')){
              $(self).find('.notice_audio_progress_loading').css('display','block')
            }
            audio = document.createElement('audio')
            audio.setAttribute("data-id",id)
            let source= document.createElement('source')
            audio.appendChild(source)
            let wwaudio = $(this).find('wwaudio')[0]
            source.setAttribute('src',wwaudio.getAttribute('data-src'))
            document.body.appendChild(audio)
            await (new Promise((res,rej)=>{
              audio.onloadedmetadata=function(){
                  console.log('completed.......')
                  res()
              }
            }))
          }
          // 监听音频播放时间并更新进度条          
          audio.ontimeupdate=null
          audio.ontimeupdate= function () {
            if($(self).find('.notice_audio_progress_loading').css('display')!=='none'){
              $(self).find('.notice_audio_progress_loading').css('display','none')
            }
            v_this.updateProgress(audio,self);
          }
          if(e.target.classList.contains('notice_audio_switch')||e.target.classList.contains('notice_audio_switch_icon')){
            if (audio.paused) {
              audio.play()
              this.classList.add('notice_audio_status_play')
            }
            else{
              audio.pause()
              this.classList.remove('notice_audio_status_play')
              if(audio.currentTime>0){
                $(self).find('.notice_audio_progress_handle').css('display','')
              }
              else{
                $(self).find('.notice_audio_progress_handle').css('display','none')
              }
            }
          }

          let dot = $(this).find('.notice_audio_progress_handle')[0]
          dot.ontouchstart = function (e) {
            if (!audio.paused || audio.currentTime != 0) {
                var oriLeft = dot.offsetLeft;
                var mouseX = e.clientX || e.touches[0].clientX;
                var maxLeft = oriLeft; // 向左最大可拖动距离
                var maxRight = $(self).find('.notice_audio_progress')[0].offsetWidth - oriLeft; // 向右最大可拖动距离

                // 禁止默认的选中事件（避免鼠标拖拽进度点的时候选中文字）
                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    e.returnValue = false;
                }

                // 禁止事件冒泡
                if (e && e.stopPropagation) {
                    e.stopPropagation();
                } else {
                    window.event.cancelBubble = true;
                }

                // 开始拖动
                document.ontouchmove = function (e) {
                    var length = (e.clientX || e.touches[0].clientX) - mouseX;
                    if (length > maxRight) {
                        length = maxRight;
                    } else if (length < -maxLeft) {
                        length = -maxLeft;
                    }
                    var pgsWidth = $(self).find('.notice_audio_progress').width();
                    var rate = (oriLeft + length) / pgsWidth;
                    audio.currentTime = audio.duration * rate;
                    // console.log('ontouchmove....',length,rate,audio.duration,audio.duration * rate,audio.currentTime)
                    v_this.updateProgress(audio,self,true);
                };

                // 拖动结束
                document.ontouchend = function () {
                    document.ontouchmove = null;
                    document.ontouchend = null;
                };
            }
          };
      })
    },
    audioAppendDownloadEle(){
      let self = this
      document.querySelectorAll('.notice_audio_wrap').forEach((audio,i)=>{
        let wwaudio = $(audio).find('wwaudio')[0]
        if(!wwaudio)return
        let url = wwaudio.getAttribute('data-src')
        let name = $(audio).find('.notice_audio_title').text()

        let div = $('<div class="download-btn"><i style="font-size:23px;" class="fa fa-arrow-circle-o-down" aria-hidden="true"></i></div>')
        //获取音频文件大小，用来预览
        let strAry = url.split('&')
        let size = ''
        for(let str of strAry){
          let s = str.split('=')
          if(s[0]=="fileSize"){
            size = s[1]-''
            break
          }
        }
        //有大小才可以下载
        if(size){
          let item = {url, name, size}
          div.on('click',function(){
            self.previewAudio(item)
          })
          $(audio).append(div)
        }
      })
    },
    audioAppendAudioSpeedEle(){
      let self = this
      document.querySelectorAll('.notice_audio_wrap').forEach(async (audioWrap,i)=>{
      //   let hasId = audioWrap.getAttribute('data-id')
      //   let audio = $(document.body).find('audio[data-id='+hasId+']')[0] || $(audioWrap).find('audio')[0]
      //   if(!audio){
      //     let id = Date.now()
      //     audioWrap.setAttribute("data-id",id)
      //     audio = document.createElement('audio')
      //     audio.setAttribute("data-id",id)
      //     let source= document.createElement('source')
      //     audio.appendChild(source)
      //     let wwaudio = $(audioWrap).find('wwaudio')[0]
      //     source.setAttribute('src',wwaudio.getAttribute('data-src'))
      //     document.body.appendChild(audio)
      //     await (new Promise((res,rej)=>{
      //       audio.onloadedmetadata=function(){
      //           console.log('completed.......')
      //           res()
      //       }
      //     }))
      //   }

        //倍速数据
        let speedList = [{name:'2.0X',val:2,toast:'2.0倍速'},{name:'1.5X',val:1.5,toast:'1.5倍速'},{name:'1.25X',val:1.25,toast:'1.25倍速'},{name:'倍速',val:1,toast:'1倍速'},{name:'0.75X',val:0.75,toast:'0.75倍速'}]
        //倍速弹框元素
        let popSpeed=$('<div style="display:none" class="pop-speed"></div>')
        speedList.forEach(it=>{
          //倍速项按钮
          let speedEle = $('<p class="speed-item">'+it.name+'</p>')
          speedEle.on('click',()=>{
            //找到音频元素设置其播放速度,（点倍速按钮时，已经生成audio元素，因此已经可以找到音频文件） 
            let audioId = $(speedEle).parents('.notice_audio_wrap').attr('data-id')
            let audioPlain = $(document.body).find('audio[data-id='+audioId+']')[0]
            audioPlain.playbackRate = it.val
            //设置按钮显示为当前倍速文字
            speedEle.parents('.audio_speed').find('.txt')[0].innerText = it.name
            //高亮选中的倍速
            Array.from(popSpeed.find('.speed-item')).forEach(el=>{
              $(el).removeClass('active-item')
            })
            speedEle.addClass('active-item')
            //弹窗提示
            Toast('已切换为'+it.toast)
            // self.$utils.toast.show('已切换为'+it.toast,'','middle',2000)
          })
          popSpeed.append(speedEle)
        })
        
        //倍速按钮元素
        let divBtn = $('<div class="audio_speed"><span class="txt">倍速</span></div>')
        divBtn.append(popSpeed)
        divBtn.on('click',()=>{
          if(popSpeed.attr('style')==''){
            popSpeed.attr('style','display:none')
          }
          else{
            popSpeed.attr('style','')
          }
        })
        $(audioWrap).find('.notice_audio_desc').append(divBtn)
      })
      
      $('body').on('click',(e)=>{
          //点击其他地方，关闭速度弹框
          if(!$(e.target).hasClass('audio_speed')&&!$(e.target).parents('.audio_speed').length){
            Array.from($('.pop-speed')).forEach(it=>{
              $(it).attr('style','display:none')
            })
          }
      })
    },

    /**
     * 更新进度条与当前播放时间
     * @param {object} audio - audio对象
     */
    updateProgress(audio,self,out) {
      if(audio.currentTime >= audio.duration){
        $(self).find('.notice_audio_progress_handle').css('left', 0 * 100 + '%');
        $(self).find('.notice_audio_length_current').html(this.transTime(0));
        self.classList.remove('notice_audio_status_play')
        return
      }
      var value = audio.currentTime / audio.duration;
      $(self).find('.notice_audio_progress_handle').css('left', value * 100 + '%');
      if(out){
        console.log('updateProgress...',audio.currentTime,audio.duration,value* 100)
      }
      $(self).find('.notice_audio_length_current').html(this.transTime(audio.currentTime));
    },
    /**
     * 音频播放时间换算
     * @param {number} value - 音频当前播放时间，单位秒
     */
    transTime(value) {
      var time = "";
      var h = parseInt(value / 3600);
      value %= 3600;
      var m = parseInt(value / 60);
      var s = parseInt(value % 60);
      if (h > 0) {
          time = this.formatTime(h + ":" + m + ":" + s);
      } else {
          time = this.formatTime(m + ":" + s);
      }
      return time;
    },
    /**
     * 格式化时间显示，补零对齐
     * eg：2:4  -->  02:04
     * @param {string} value - 形如 h:m:s 的字符串 
     */
    formatTime(value) {
        var time = "";
        var s = value.split(':');
        var i = 0;
        for (; i < s.length - 1; i++) {
            time += s[i].length == 1 ? ("0" + s[i]) : s[i];
            time += ":";
        }
        time += s[i].length == 1 ? ("0" + s[i]) : s[i];

        return time;
    },
    //点赞
    async praiseDetail(){
      if (this.optionLoading) return
      this.optionLoading = true
      try {
        const res = await approve({
          id:this.detail.id,
          approved: this.detail.approved ? 0 : 1
        })

        this.detail.approved = !this.detail.approved
        this.detail.approve+= this.detail.approved?1:-1
        this.count.praise = this.detail.approve
        this.count.praiseActive = this.detail.approved
        this.optionLoading = false
        Toast({
          message: this.detail.approved ? '点赞成功' : '已取消点赞',
          position: 'bottom',
        });
      } catch(err) {
        this.optionLoading = false
      }
      
    },
    // 收藏
    handleCollect() {
      if (this.optionLoading) return
      this.optionLoading = true
      collect({
        id: this.detail.id,
        collected: this.count.collectActive ? 0 : 1
      }).then(res => {
        this.optionLoading = false
        if (res.errcode === 0) {
          if (this.count.collectActive) {
            this.count.collect -= 1
            this.count.collectActive = false
          } else {
            this.count.collect += 1
            this.count.collectActive = true
          }
          Toast({
            message: this.count.collectActive ? '收藏成功' : '已取消收藏',
            position: 'bottom',
          });
        }
      }).catch(() => {
        this.optionLoading = false
      })
    },
    //超过1个小时不操作，就不在记录停留时间
    async recordUserActive(e){
      this.userActiveTime = Date.now()
      // console.log('active',e)
      if(!this.userIsActive){
        this.userIsActive = true
        await this.getData()
        if(this.readStartTime&&this.userId&&process.env.VUE_APP_BUILD !== "dev"){
          if(this.timeId){
            clearInterval(this.timeId)
          }
          this.timeId=setInterval(() => {
            let notMoveTime = Date.now() - this.userActiveTime
            if(notMoveTime<=1000*60*60){
              readSituation({
                id: this.detail.id,
                readStartTime:this.readStartTime
              })
            }
            else{
              this.userIsActive = false
              clearInterval(this.timeId)
            }
          }, 2000);
        }
      }
    },
    previewAudio(item){
      // let url = item.url // 'http://fviewer.h3c.com/file/down?appid=istage&fileId=1615459236088_0470'
      // let res = await this.$requestJson.get(url,{},{},true)
      // let size = res.headers['content-length']-''
      // console.log(2222,size)
      console.log('preview...',item)
      wx.previewFile({
        url:item.url,
        name:item.name+'.mp3',
        size:item.size
      })
    },
    // 绑定云文档事件
    bindCloudEvent() {
      // let ele = document.getElementsByClassName('note-editer-cloud-file')
      let ele = document.querySelector('.publicity-detail')
      if(ele){
        ele.addEventListener('click', this.handleCloud)
      }
    },
    // 云文档事件处理
    handleCloud(e) {
      let nodeA = null
      if (e.target.tagName=='SPAN' && e.target.className == 'note-editer-cloud-file-download' && e.target.getAttribute('fileid')) {
        this.handleDownLoad(e.target.getAttribute('fileid'))
        return
      }
      if (e.target.tagName=='A') {
        nodeA = e.target
      } else if(e.target.parentElement.tagName=="A") {
        nodeA = e.target.parentElement
      }
      if(nodeA && nodeA.className == 'note-editer-cloud-file'){
        if (e.preventDefault) {
          e.preventDefault()
        } else {
          e.returnValue = false
        }
        const docId = nodeA.getAttribute('fileid')
        this.getCloudUrl(docId, false, nodeA.getAttribute('target') == '_blank')
      }
    },
    // 云文档下载
    handleDownLoad(docId) {
      if (!this.userId) {
        this.$toast('登录后可下载')
        return
      }
      getDownLoadUrl({
        id: this.detail.id,
        docId: docId
      }).then(res => {
        if (res.errcode === 0) {
          const a = document.createElement('a');
          a.style.display = 'none';
          a.download = docId
          a.href = res.message;
          a.click();
        }
      })
    },
    getCloudUrl(docId, isIframe, isNewWindow) {
      if (!docId) return
        Toast.loading({
          message: '加载中...',
          forbidClick: true,
          duration: 0
        });
        IdocUrl({
          id: this.$route.params.id,
          docId,
        }).then(res => {
          Toast.clear()
          if (res.errcode === 0) {
            if (isIframe) {
              this.iframeUrl = res.message
              this.$nextTick(() => {
                if (this.iframeUrl) {
                  this.$refs.docInfo.innerText='云文档Id:' + docId
                }
              })
            } else {
              sessionStorage.setItem('docUrl', res.message)
              this.$router.push('/publicity-iframe?title=' + this.detail.itemName)
              // if (isQW()) {
              //   window.location.href = res.msg
              // } else {
              //   window.open(res.msg,isNewWindow ? '_blank' : '_self');
              // }
            }
          } else {
            if (isIframe) {
              this.detail = null
              this.errMsg=res.message
            } else {
              Toast(res.message)
            }
          }
        }).catch(() => {
          Toast.clear()
        })
    }
  },
  activated(){  // keep-alive 组件激活时使用
    this.isBusy = false
  },
  deactivated () {  // keep-alive 组件停用时使用
    this.isBusy = true  
  },
}
</script>

<style lang="stylus" scoped>
/deep/.van-empty__image {
  width: 90vw;
}
.iframe-wrap {
  width: 100vw;
  height: calc(100vh - 56px);
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
  }
}
.article-detail-page {
  min-height: 100vh;
  background-color: #f2f2f2;
}
.publicity-detail{
  width:100%;
  box-sizing border-box
  padding: 20px 15px 15px;
  line-height:25px;
  background-color:#fff;
  padding-bottom:10px;
  // min-height:100vh;
  .title{
    text-align left;
    font-size:20px;
    line-height: 28px;
    font-weight: bold;
  }
  .info{
    display: flex;
    align-items: center;
    color:#999;
    text-align left;
    font-size:14px;
    line-height: 25px;
    margin-top: 10px;
    span {
      display: inline-block;
    }
  }
  .info__item {
    display: inline-block;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .read {
    float: right;
    flex-grow: 1;
    text-align: right;
  }
  /deep/iframe {
    max-width:100%;
  }
}
.line {
  margin: 0 10px;
  border-top: 1px solid #eee;
}
/deep/a {
  color: #2a6496;
  cursor: pointer;
}
</style>

<style lang="stylus">
.el-message--custom {
  min-width: 300px;
}
.publicity-content{
  width:100%;
  background-color:#f2f2f2;
  min-height:100%;
  .page-status{
   .custom-empty {
      text-align: center;
      img {
        width: 200px !important;
        box-sizing: border-box;
      }
    }
  }
}
.publicity-detail{
  // width:100%;
  // box-sizing border-box
  // padding: 24px;
  // line-height:25px;
  // background-color:#fff;
  // padding-bottom:10px;
  // min-height:100vh;
  // .title{
  //   text-align left;
  //   font-size:23px;
  // }
  // .info{
  //   color:#999;
  //   text-align left;
  //   font-size:14px;
  //   margin-top: 10px;
  // }
  .content{
    margin-top:10px;
    *{
      box-sizing:border-box;
    }
  }
  img{
    width: 100% !important;
  }
  video{
    width:100%  !important;
    border-radius: 5px;
    object-fit: cover;
  }
  b,strong{
    font-weight bold;
  }

    //音频样式
  .notice_audio_wrap,.notice_audio_wrap *{user-select:none;}
  .notice_audio_wrap{display:flex;align-items:center;width:100%;box-sizing:border-box;padding:5px 15px;border:1px solid #D1D1D1;border-radius:5px;-webkit-tap-highlight-color:rgba(0,0,0,0)}
  .notice_audio_wrap .download-btn{color:#0082EF;margin-left:10px;flex-shrink:0;}
  .notice_audio_switch{width:50px;height:50px;margin-right:10px;flex-shrink:0;}
  .notice_audio_switch .notice_audio_switch_icon{width:100%;height:100%;display:block;background-image:url(../assets/stop.png);background-size:50px 50px;}
  .notice_audio_info{flex-grow:1}
  .notice_audio_info .notice_audio_title{font-size:16px;line-height:28px;margin-bottom:4px;word-break: break-all}
  .notice_audio_info .notice_audio_desc{font-size:12px;margin-top:5px;color:#A6AAB3;position:relative;}
  .notice_audio_info .notice_audio_desc .audio_speed{position: absolute;left: 50%;top:0;transform: translateX(-50%);z-index:100}
  .notice_audio_info .notice_audio_desc .pop-speed{left: 0;top: 100%;position: absolute;background-color:rgba(0,0,0,0.7); color:#fff;border-radius:10px;width:60px;font-size:14px;line-height:2;text-align:center;}
  .notice_audio_info .notice_audio_desc .pop-speed .speed-item:first-child{border-top-left-radius:10px;border-top-right-radius:10px}
  .notice_audio_info .notice_audio_desc .pop-speed .speed-item:last-child{border-bottom-left-radius:10px;border-bottom-right-radius:10px}
  .notice_audio_info .notice_audio_desc .pop-speed .speed-item.active-item{background-color:#0082ef}
  .notice_audio_info .notice_audio_desc .notice_audio_length_total{float:right}
  .notice_audio_info .notice_audio_progress_wrap{z-index:99;height:2px;margin-right:7px;position:relative;outline:0;-webkit-tap-highlight-color:rgba(0,0,0,0)}
  .notice_audio_info .notice_audio_progress{z-index:99;height:100%;background-color:#ebebeb;position:relative;width:100%;padding-left:7px;-webkit-box-sizing:initial!important;box-sizing:initial!important}
  .notice_audio_info .notice_audio_progress_inner{background-color:#0082ef;height:100%;position:absolute;top:0;left:0;z-index:1}
  .notice_audio_info .notice_audio_progress_handle{z-index:100;position:absolute;width:14px;height:14px;border-radius:50%;background-color:rgba(0,130,239,.15);top:50%;margin-top:-7px;margin-left:-3.5px;cursor:pointer;outline:0;-webkit-tap-highlight-color:rgba(0,0,0,0)}
  .notice_audio_info .notice_audio_progress_handle:before{content:" ";width:8px;height:8px;border-radius:50%;background-color:#0082ef;position:absolute;left:50%;top:50%;margin-top:-4px;margin-left:-4px}
  .notice_audio_info .notice_audio_progress_loading{position:absolute;top:0;bottom:0;left:0;right:0;overflow:hidden;display:none}
  .notice_audio_status_stop .notice_audio_progress_handle,.notice_audio_wrap.notice_audio_status_play .notice_audio_progress_handle{display:block!important}
  .notice_audio_info .notice_audio_progress_loading_inner{position:absolute;top:0;bottom:0;left:0;-webkit-animation:slidein 6s linear infinite normal;animation:slidein 6s linear infinite normal;width:200%;max-width:none!important;background-image:-webkit-repeating-linear-gradient(105deg,#d9d9d9,#d9d9d9 2px,#ebebeb 2px,#ebebeb 4px);background-image:-o-repeating-linear-gradient(105deg,#d9d9d9,#d9d9d9 2px,#ebebeb 2px,#ebebeb 4px);background-image:repeating-linear-gradient(-15deg,#d9d9d9,#d9d9d9 2px,#ebebeb 2px,#ebebeb 4px)}
  .notice_audio_info .notice_audio_progress_buffer{position:absolute;top:0;left:0;bottom:0;background-color:#d9d9d9}
  .notice_audio_wrap.notice_audio_status_play .notice_audio_switch_icon{background-image:url(../assets/play.png);background-size:50px 50px}

}
</style>
<style lang="stylus" scoped>
table, caption, tbody, tfoot, thead, tr, th, td{
  border:1px solid;
}
 th {
  text-align: left;
}
 .table {
  width: 100%;
  margin-bottom: 20px;
}
 .table > thead > tr > th,
 .table > tbody > tr > th,
 .table > tfoot > tr > th,
 .table > thead > tr > td,
 .table > tbody > tr > td,
 .table > tfoot > tr > td {
  padding: 8px;
  line-height: 1.428571429;
  vertical-align: top;
  border-top: 1px solid #dddddd;
}
 .table > thead > tr > th {
  vertical-align: bottom;
  border-bottom: 2px solid #dddddd;
}
 .table > caption + thead > tr:first-child > th,
 .table > colgroup + thead > tr:first-child > th,
 .table > thead:first-child > tr:first-child > th,
 .table > caption + thead > tr:first-child > td,
 .table > colgroup + thead > tr:first-child > td,
 .table > thead:first-child > tr:first-child > td {
  border-top: 0;
}
 .table > tbody + tbody {
  border-top: 2px solid #dddddd;
}
 .table .table {
  background-color: #ffffff;
}
 .table-condensed > thead > tr > th,
 .table-condensed > tbody > tr > th,
 .table-condensed > tfoot > tr > th,
 .table-condensed > thead > tr > td,
 .table-condensed > tbody > tr > td,
 .table-condensed > tfoot > tr > td {
  padding: 5px;
}
 .table-bordered {
  border: 1px solid #dddddd;
}
 .table-bordered > thead > tr > th,
 .table-bordered > tbody > tr > th,
 .table-bordered > tfoot > tr > th,
 .table-bordered > thead > tr > td,
 .table-bordered > tbody > tr > td,
 .table-bordered > tfoot > tr > td {
  border: 1px solid #dddddd;
}
 .table-bordered > thead > tr > th,
 .table-bordered > thead > tr > td {
  border-bottom-width: 2px;
}
 .table-striped > tbody > tr:nth-child(odd) > td,
 .table-striped > tbody > tr:nth-child(odd) > th {
  background-color: #f9f9f9;
}
 .table-hover > tbody > tr:hover > td,
 .table-hover > tbody > tr:hover > th {
  background-color: #f5f5f5;
}
 table col[class*="col-"] {
  float: none;
  display: table-column;
}
 table td[class*="col-"],
 table th[class*="col-"] {
  float: none;
  display: table-cell;
}
 .table > thead > tr > td.active,
 .table > tbody > tr > td.active,
 .table > tfoot > tr > td.active,
 .table > thead > tr > th.active,
 .table > tbody > tr > th.active,
 .table > tfoot > tr > th.active,
 .table > thead > tr.active > td,
 .table > tbody > tr.active > td,
 .table > tfoot > tr.active > td,
 .table > thead > tr.active > th,
 .table > tbody > tr.active > th,
 .table > tfoot > tr.active > th {
  background-color: #f5f5f5;
}
 .table > thead > tr > td.success,
 .table > tbody > tr > td.success,
 .table > tfoot > tr > td.success,
 .table > thead > tr > th.success,
 .table > tbody > tr > th.success,
 .table > tfoot > tr > th.success,
 .table > thead > tr.success > td,
 .table > tbody > tr.success > td,
 .table > tfoot > tr.success > td,
 .table > thead > tr.success > th,
 .table > tbody > tr.success > th,
 .table > tfoot > tr.success > th {
  background-color: #dff0d8;
  border-color: #d6e9c6;
}
 .table-hover > tbody > tr > td.success:hover,
 .table-hover > tbody > tr > th.success:hover,
 .table-hover > tbody > tr.success:hover > td,
 .table-hover > tbody > tr.success:hover > th {
  background-color: #d0e9c6;
  border-color: #c9e2b3;
}
 .table > thead > tr > td.danger,
 .table > tbody > tr > td.danger,
 .table > tfoot > tr > td.danger,
 .table > thead > tr > th.danger,
 .table > tbody > tr > th.danger,
 .table > tfoot > tr > th.danger,
 .table > thead > tr.danger > td,
 .table > tbody > tr.danger > td,
 .table > tfoot > tr.danger > td,
 .table > thead > tr.danger > th,
 .table > tbody > tr.danger > th,
 .table > tfoot > tr.danger > th {
  background-color: #f2dede;
  border-color: #ebccd1;
}
 .table-hover > tbody > tr > td.danger:hover,
 .table-hover > tbody > tr > th.danger:hover,
 .table-hover > tbody > tr.danger:hover > td,
 .table-hover > tbody > tr.danger:hover > th {
  background-color: #ebcccc;
  border-color: #e4b9c0;
}
 .table > thead > tr > td.warning,
 .table > tbody > tr > td.warning,
 .table > tfoot > tr > td.warning,
 .table > thead > tr > th.warning,
 .table > tbody > tr > th.warning,
 .table > tfoot > tr > th.warning,
 .table > thead > tr.warning > td,
 .table > tbody > tr.warning > td,
 .table > tfoot > tr.warning > td,
 .table > thead > tr.warning > th,
 .table > tbody > tr.warning > th,
 .table > tfoot > tr.warning > th {
  background-color: #fcf8e3;
  border-color: #faebcc;
}
 .table-hover > tbody > tr > td.warning:hover,
 .table-hover > tbody > tr > th.warning:hover,
 .table-hover > tbody > tr.warning:hover > td,
 .table-hover > tbody > tr.warning:hover > th {
  background-color: #faf2cc;
  border-color: #f7e1b5;
}
@media (max-width: 767px) {
   .table-responsive {
    width: 100%;
    margin-bottom: 15px;
    overflow-y: hidden;
    overflow-x: scroll;
    -ms-overflow-style: -ms-autohiding-scrollbar;
    border: 1px solid #dddddd;
    -webkit-overflow-scrolling: touch;
  }
   .table-responsive > .table {
    margin-bottom: 0;
  }
   .table-responsive > .table > thead > tr > th,
   .table-responsive > .table > tbody > tr > th,
   .table-responsive > .table > tfoot > tr > th,
   .table-responsive > .table > thead > tr > td,
   .table-responsive > .table > tbody > tr > td,
   .table-responsive > .table > tfoot > tr > td {
    white-space: nowrap;
  }
   .table-responsive > .table-bordered {
    border: 0;
  }
   .table-responsive > .table-bordered > thead > tr > th:first-child,
   .table-responsive > .table-bordered > tbody > tr > th:first-child,
   .table-responsive > .table-bordered > tfoot > tr > th:first-child,
   .table-responsive > .table-bordered > thead > tr > td:first-child,
   .table-responsive > .table-bordered > tbody > tr > td:first-child,
   .table-responsive > .table-bordered > tfoot > tr > td:first-child {
    border-left: 0;
  }
   .table-responsive > .table-bordered > thead > tr > th:last-child,
   .table-responsive > .table-bordered > tbody > tr > th:last-child,
   .table-responsive > .table-bordered > tfoot > tr > th:last-child,
   .table-responsive > .table-bordered > thead > tr > td:last-child,
   .table-responsive > .table-bordered > tbody > tr > td:last-child,
   .table-responsive > .table-bordered > tfoot > tr > td:last-child {
    border-right: 0;
  }
   .table-responsive > .table-bordered > tbody > tr:last-child > th,
   .table-responsive > .table-bordered > tfoot > tr:last-child > th,
   .table-responsive > .table-bordered > tbody > tr:last-child > td,
   .table-responsive > .table-bordered > tfoot > tr:last-child > td {
    border-bottom: 0;
  }
}
.back-btn {
  position: fixed;
  bottom: 50px;
  right: 10px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #2196f3;
  background-image: url('../../../assets/back.png');
  background-size: 30px 30px;
  background-position: center center;
  background-repeat: no-repeat;
}
</style>
<style lang='stylus'>
html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, embed, figure, figcaption, footer, header, menu, nav, output, ruby, section, summary, time, mark, audio, video, input {
  touch-action: pan-y pan-x;
}
 .quill-editor{
  .ql-snow .ql-tooltip::before {
    content: "链接地址:" !important;
  }
  .ql-snow .ql-tooltip a.ql-action::after {
    content: '编辑'  !important;
  }
  .ql-snow .ql-tooltip.ql-editing a.ql-action::after {
    content: '保存' !important;
  }
  .ql-snow .ql-tooltip a.ql-remove::before {
    content: '移除' !important;
  }
}
</style>