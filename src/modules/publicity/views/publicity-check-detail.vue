<template>
  <div class="check-detail">
    <template v-if="detail&&!loading">
      <div class="content">
          <div v-if="detail.picUrl" class="pic-box"><div class="title">推送封面图：</div><img :src="detail.picUrl" class="pic-img"></div>
          <p><span class="title">消息标题：</span><span class="msg">{{detail.title}}</span></p>
          <p><span class="title">消息描述：</span><span class="msg">{{detail.description}}</span></p>
          <p v-if="currentInfoType==='article'"><span class="title">文章标题：</span><span class="msg">{{detail.infoName}}</span></p>
          <p v-else-if="currentInfoType==='video'"><span class="title">视频标题：</span><span class="msg">{{detail.infoName}}</span></p>
          <p><span class="title">消息类型：</span><span class="msg">{{detail.msgType==1?'图文':'卡片'}}</span></p>
          <p><span class="title">发送方式：</span><span class="msg">{{detail.type===0?'定时发送':'立即发送'}}</span><span v-if="detail.type===0&&detail.pushTime<nowDate" class="msg tip">(群发时间已过)</span></p>
          <p><span class="title">发送范围：</span><span class="msg">{{detail.receiveName}}</span></p>
          <p v-if="detail.type==0"><span class="title">群发时间：</span><span class="msg">{{detail.pushTime}}</span></p>
          <p v-else-if="detail.type==1"><span class="title">创建时间：</span><span class="msg">{{detail.pushTime}}</span></p>
          <p><span class="title" style="letter-spacing: 2px;">创建人：</span><span class="msg">{{detail.username}} {{detail.userId}}</span></p>
          <p><span class="title">审核状态：</span><span class="msg status-txt" :class="{wait:detail.status===3,no:detail.status===4,pass:detail.status===0||detail.status===2}">{{showStausTxt}}</span></p>
          <p><span class="title">原文预览：</span><span class="msg" style="color:#2196f3" @click="goPreview">预览详情</span></p>
      </div>
      <div class="btns" v-if="isCheckUser">  
        <el-button type="danger" @click="goApprove(4)" size="middle" :loading="btnLoading4">驳回</el-button>
        <el-button type="primary" @click="goApprove(5)" size="middle" :loading="btnLoading5">通过</el-button>
      </div>
    </template>
    <!-- <hips-page-status
    :content-init="loading"
    :content-empty="!loading && !detail">
      <div slot="empty" class="custom-empty">
        <img src="../assets/search-empty.png" />
        <div class="label">消息群发已删除</div>
      </div>
    </hips-page-status> -->
    <van-empty image-size="200" v-if="!loading && !detail">
        <div slot="image" class="custom-empty">
            <img src="../assets/search-empty.png" />
            <div class="label">消息群发已审核</div>
        </div>
    </van-empty>
    <!-- <div v-else class="status-txt" :class="{wait:detail.status==3,no:detail.status==4,pass:detail.status==5}">
       {{showStausTxt}}
    </div> -->
  </div>
</template>
<script>
import { setDocumentTitle } from "@/utils";
import { checkDetail, checkEdit } from '../../../api/articleApi'
import { checkDetail as checkDetailVideo, checkEdit as checkEditVideo } from '../../../api/videoApi'
import {Button,MessageBox} from 'element-ui'
import { Empty, Toast } from 'vant'
import moment from 'moment'

export default {
  components: {
    [Button.name]:Button,
    [Empty.name]: Empty,
  },
  data() {
    return {
      loading: false,
      btnLoading5:false,
      btnLoading4:false,
      detail:null,
      isCheckUser:false,
      showStausTxt:'',
      nowDate:moment().format("YYYY-MM-DD HH:mm"),
      currentInfoType:'article',
      dataFunc:{
        article:{
          checkDetail,
          checkEdit
        },
        video:{
          checkDetail:checkDetailVideo,
          checkEdit:checkEditVideo
        }
      }
    };
  },
  beforeRouteEnter(to, from, next) {
    to.meta.routerTransition="router-slide-right"
    next((vm)=>{
        vm.detail = {}
        vm.showStausTxt = ""
        if(from.name=="publicity-check-list"){
          vm.isCheckUser = true
        }
        else{
          vm.isCheckUser = false
        }
        vm.currentInfoType = vm.$route.params.type
        vm.getData()
        if (vm.currentInfoType == 'article') {
          setDocumentTitle('文章推送审核详情')
        } else if (vm.currentInfoType == 'video') {
          setDocumentTitle('视频推送审核详情')
        }
        
    })
  },
  methods: {
    goPreview() {
      if (Number(this.detail.infoSite) === 1) {
        if (this.detail.infoContent) {
          window.location.href = this.detail.infoContent
        }
      } else {
        if (this.currentInfoType === 'article') {
          this.$router.pushPage({ name:"publicity-preview",params:{id:this.detail.infoId}});
        }
        else if(this.currentInfoType === 'video'){
          this.$router.pushPage({ name:"video-preview",params:{id:this.detail.infoId}});
        }
      }
    },
    async getData() {
      try{
          this.loading=true
          const res = await this.dataFunc[this.currentInfoType].checkDetail(this.$route.params.id)
          if(res.errcode==0){
            this.detail = res.data
            if(this.detail){
              this.detail.pushTime = moment(this.detail.pushTime).format('YYYY-MM-DD HH:mm')
              if(this.detail.status===3){
                this.showStausTxt = '待审核'
              }
              else if(this.detail.status===4){
                this.showStausTxt = '已驳回'
              }
              else if(this.detail.status===0||this.detail.status===2){
                this.showStausTxt = '已通过'
              }
            }
            else{
              setDocumentTitle('\u200E')
            }
          }
      }
      catch(err){
        Toast(err)
      }
      finally{
        this.loading=false
        // this.$hips.indicator.hide();
      }
    },
    async goApprove(status){
      try{
        let msg = status==4?"确认驳回该推送？":"确认通过？"
        await MessageBox.confirm(msg, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          customClass:'elMessageBox'
        })
        if(status==4){
          this.btnLoading4 = true
        }
        else{
          this.btnLoading5 = true
        }
        const res = await this.dataFunc[this.currentInfoType].checkEdit({ 
          id:this.detail.id,
          status,
            // userId:this.$store.state.userInfo.userId
        })
        if(res.errcode==0){
          window.refresh = true //列表页需要刷新
          this.$router.replace('/publicity-check-list/'+this.currentInfoType) 
        }
      }
      catch(e){

      }
      finally{
        this.btnLoading4 = false
        this.btnLoading5 = false
      }
    },
  },
};
</script>
<style scoped lang="stylus">
.custom-empty {
  text-align: center;
  padding-top: 100px;

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
.check-detail {
  width:100%;
  height:100%;
  .content{
    padding:10px;
    p{
      padding:10px 0;
      font-size:14px;
      border-bottom 1px solid #eee
      .title{
        color:#999;
        display:table-cell;
        text-align right;
        width: 80px;
        text-align: right;
        white-space: nowrap;

        // text-align: justify; 
        // text-justify: distribute-all-lines; 
        // text-align-last: justify;
      }
      .msg{
        display:table-cell;
        line-height 2;
      }
      .tip{
        color:#F69115;
      }
    }
    .pic-box {
      padding-bottom: 10px;
      border-bottom 1px solid #eee
      .title {
        font-size: 15px;
        color: #333;
        line-height: 40px;
        font-weight: 500;
      }
    }
    .pic-img {
      width: 100%;
      // margin-top: 20px;
    }
  }
  .status-txt{
    // text-align center;
    // font-size:20px;
    // margin-top:20px;
    &.wait{
      color:#F69115
    }
    &.no{
      color:red;
    }
    &.pass{
      color:green
    }

  }
  .btns{
    text-align:center;
    padding-bottom: 20px;
  }
}
</style>
<style>
html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, embed, figure, figcaption, footer, header, menu, nav, output, ruby, section, summary, time, mark, audio, video, input {
  touch-action: pan-y pan-x;
}
</style>