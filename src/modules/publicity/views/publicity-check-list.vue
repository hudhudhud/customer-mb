<template>
  <div class="check-list">
    <div class="top-info">
      <van-dropdown-menu>
        <van-dropdown-item v-model.sync="currentInfoType" :options="infoType" />
      </van-dropdown-menu>
      <div class="pb-search">
        <div class="pb-search-div">
          <i class="fa fa-search search-icon" aria-hidden="true"></i>
          <input type="text" @input='getChangeInfo'  placeholder='请输入搜索内容' v-model="searchTxt">
          <i class="fa fa-times-circle close-icon" aria-hidden="true" v-if='searchTxt' @click='searchTxt="";getChangeInfo()'></i>
        </div>
        <div class="pb-search-text" @click="getChangeInfo()">搜索</div>
      </div>
    </div>
    <van-list
      v-model="loading"
      :finished="!hasMoreData"
      @load="loadMore"
      :error.sync="isError"
      error-text="请求失败，点击重新加载"
    >
      <div class="list">
        <div v-for="(item,i) in list" class="list-item" :key="i" >
          <div class='left-content' @click="goDetail(item)">
            <div class="left">
              <p><span class="title"><span>消息标题</span>：</span><span class="msg">{{item.title}}</span></p>
              <p v-if="currentInfoType=='article'"><span class="title"><span>文章标题</span>：</span><span class="msg">{{item.infoName}}</span></p>
              <p v-else-if="currentInfoType=='video'"><span class="title"><span>视频标题</span>：</span><span class="msg">{{item.infoName}}</span></p>
              <p><span class="title"><span>消息类型</span>：</span><span class="msg">{{item.msgType==1?'图文':'卡片'}}</span></p>
              <p>
                <span class="title"><span>发送方式</span>：</span>
                <span class="msg">{{item.type===0?'定时发送':'立即发送'}}<span v-if="item.type===0&&item.pushTime<nowDate" class="tip">(群发时间已过)</span></span>
              </p>
              <p v-if="item.type==0"><span class="title"><span>群发时间</span>：</span><span class="msg">{{item.pushTime}}</span></p>
              <p v-else-if="item.type==1"><span class="title"><span>创建时间</span>：</span><span class="msg">{{item.pushTime}}</span></p>
              <p><span class="title"><span>创建人</span>：</span><span class="msg">{{item.username}} {{item.userId}}</span></p>
            </div>
            <div class="right">
              <!-- <i class="fa fa-angle-right" aria-hidden="true"></i>  -->
            </div>
          </div>
          <div class="right-content">
            <el-button type="primary" @click="goApprove(5,item.id)" size="mini">通过</el-button>
            <el-button type="danger" @click="goApprove(4,item.id)" size="mini">驳回</el-button>
            <el-button @click="goPreview(item)" size="mini">预览</el-button>
          </div>
        </div>
      </div>
    </van-list>
    <van-empty image-size="200" v-if="!loading && list.length===0">
        <div slot="image" class="custom-empty">
            <img src="../assets/search-empty.png" />
            <div class="label">暂无内容</div>
        </div>
    </van-empty>
  </div>
</template>
<script>

import  { checkList, checkEdit } from '../../../api/articleApi'
import  { checkList as checkListVideo, checkEdit as checkEditVideo } from '../../../api/videoApi'
import {Button,MessageBox} from 'element-ui'
import { Empty, List, Toast } from 'vant'
import Vue from 'vue'
// import { InfiniteScroll } from 'mint-ui';
// Vue.use(InfiniteScroll);
import moment from 'moment'
import { DropdownMenu, DropdownItem } from 'vant';
export default {
  components: {
    [Button.name]:Button,
    [Empty.name]: Empty,
    [List.name]: List,
    [DropdownMenu.name]: DropdownMenu,
    [DropdownItem.name]: DropdownItem
  },
  data() {
    return {
      searchTxt:'',
      loading: false,
      list:[],
      isFirstLoad:true,//防止页面刷新之后返回不获取数据
      pageNum:1,
      pageSize:10,
      isBusy:false,
      hasMoreData:true,
      nowDate:moment().format("YYYY-MM-DD HH:mm"),
      currentInfoType:'article',
      infoType: [{
        text:'文章',
        value:'article',
      },{
        text:'视频',
        value:'video',
      }],
      dataFunc: {
        article:{
          checkList,
          checkEdit
        },
        video:{
          checkList:checkListVideo,
          checkEdit:checkEditVideo
        }
      },
      isError:false
    };
  },
  beforeRouteEnter(to, from, next) {
    to.meta.routerTransition="router-slide-right"
    next((vm)=>{
        if((from.name!=='publicity-check-detail' && from.name!=='publicity-preview' && from.name!=='video-preview')||vm.isFirstLoad||window.refresh){
          vm.currentInfoType = to.params.type
          vm.getData();
          vm.isFirstLoad=false
        }
    })
  },
  watch:{
    currentInfoType: {
      handler(val) {
        if(val) {
          this.getData()
        }
      },
      // immediate: true
    }
  },
  methods: {
    goPreview(item) {
      if (Number(item.infoSite) === 1) {
        if (item.infoContent) {
          window.location.href = item.infoContent
        }
      } else {
        if(this.currentInfoType === 'article'){
          this.$router.pushPage({ name:"publicity-preview",params:{id:item.infoId}});
        }
        else if(this.currentInfoType === 'video'){
          this.$router.pushPage({ name:"video-preview",params:{id:item.infoId}});
        }
      }
    },
    async goApprove(status,id){
      let msg = status==4?"确认驳回该推送？":"确认通过？"
      await MessageBox.confirm(msg, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          customClass:'elMessageBox'
        })
        await this.dataFunc[this.currentInfoType].checkEdit({ 
          id,
          status,
        })
        this.getData()
    },
    getData() {
      this.pageNum=1
      this.list=[]
      this.hasMoreData=true
      this.isBusy = false
      this.isError = false
      this.loadMore()
    },
    async loadMore() {
      if(!this.hasMoreData)return
      if(this.isBusy)return
      this.isBusy=true
      if(this.pageNum==1){
        this.loading=true
      }
      // else{
      //   this.$hips.indicator.show();
      // }
      try{
        const res = await this.dataFunc[this.currentInfoType].checkList({
             pageNum:this.pageNum,
             pageSize:this.pageSize,
             title:this.searchTxt
        })
          if(res.data&&res.data.list.length){
            if(this.pageNum==1){
              this.list = res.data.list
            }
            else{
              this.list.push(...res.data.list)
            }
            this.list.forEach(it=>{
                it.pushTime=moment(it.pushTime).format('YYYY-MM-DD HH:mm')
            })
            if(this.list.length==res.data.total){
              this.hasMoreData=false
            }
            else{
              this.pageNum++
            }
          }
          else{
            if(this.pageNum==1){
              this.list =[]
            }
            this.hasMoreData=false
          }
      }
      catch(e){
        this.isError = true
        Toast(e)
      }
      finally{
        this.loading=false
        // this.$hips.indicator.hide()
        this.isBusy=false
      }
    },
    goDetail(item){
      this.$router.pushPage({ name:"publicity-check-detail",params:{id:item.id,type:this.currentInfoType}});
    },
    getChangeInfo(){
      this.debounce(this.getData,500)()
    },
    // 防抖
    debounce(fn, wait) {    
      let self=this 
      return function() {        
        if(self.timerId !== null) clearTimeout(self.timerId);        
        self.timerId = setTimeout(fn, wait);    
      }
    },
  },
  activated(){  // keep-alive 组件激活时使用
    this.isBusy = false
  },
  deactivated () {  // keep-alive 组件停用时使用
    this.isBusy = true  
  },
};
</script>
<style scoped lang="stylus">
input::-webkit-input-placeholder { /* WebKit browsers */ 
    color:#999; 
} 

input:-moz-placeholder { /* Mozilla Firefox 4 to 18 */ 
    color:#999; 
} 

input::-moz-placeholder { /* Mozilla Firefox 19+ */ 
    color:#999; 
} 

input:-ms-input-placeholder { /* Internet Explorer 10+ */ 
    color:#999; 
} 
.check-list {
  width:100%;
  height:100%;
  .top-info{
    position:fixed;
    top:0;
    left:0;
    right:0;
    width:100%;
    height: 50px;
    display:flex;
    align-items: center;
    background-color: #F5F5FA;
  }
  .van-dropdown-menu{
    width:50px;    
    background-color: #F5F5FA;
    /deep/.van-dropdown-menu__bar{
      background-color: #F5F5FA;
      box-shadow:unset;
      .van-dropdown-menu__title{
        font-size:14px;
      }
      .van-dropdown-menu__title::after{
        // background-color:#999;
        border-color: transparent transparent #999 #999;
        opacity: 1;
      }
    }
    /deep/.van-dropdown-menu__title--active,/deep/.van-dropdown-item__option--active,/deep/.van-dropdown-item__option--active .van-dropdown-item__icon{
      color:var(--color)
    }
  }
  .pb-search {
    width:100%;
    box-sizing border-box    
    padding: 0 10px;
    display:flex;
    align-items center;
    justify-content space-between;
    .pb-search-div {
      width: calc(100% - 66px);
      position:relative;
      height:30px;
      input{
        box-sizing border-box;
        padding-left:25px;
        padding-right:10px;
        width:100%;
        height:30px;
        outline :none;
        border-radius:5px;
        font-size: 14px;
      }
      .search-icon{
        position:absolute;
        left:5px;
        top:6px;
        color:#999;
      }
      .close-icon{
        position:absolute;
        right:5px;
        top:6px;
        color:#999;
      }

    }
    .pb-search-text {
      width: 56px;
      height:30px;
      text-align: center;
      background-color:#409eff;
      border-radius: 4px;
      color: white;
      line-height: 30px;
      font-size: 13px;
    }
  }

  .list{
    width:95%;
    margin:auto;
    padding-top:50px;
    .list-item{
      display flex;
      align-items:center;
      justify-content space-between;
      padding:10px 0px;
      border-bottom: 1px solid #eee;
      .left-content{
        display flex;
        justify-content space-between;
        align-items:center;
        flex-grow:1;
        padding-right:10px;
        .left{
          font-size:13px;
          p{
            padding:5px 0;
          }
          .title{
            display:table-cell;
            color:#999;
            white-space: nowrap;
            width:68px;
            // display:inline-block;
            // text-align right;
            span {
              display: inline-block;
              width:56px;
              text-align: justify; 
              text-justify: distribute-all-lines; 
              text-align-last: justify;
            }
          }
          .msg{
            display:table-cell;
            line-height 1.5;
          }
          .tip{
            color:#F69115;
          }
        }
      }
      .right-content{
        // display flex;
        // flex-direction column;
        .el-button{
          display:block;
          &:not(:last-child){
            margin-bottom:10px;
          }
        }
        .el-button+.el-button{
          margin-left:0;
        }
      }
    }
  }
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
}
</style>
<style>
html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, embed, figure, figcaption, footer, header, menu, nav, output, ruby, section, summary, time, mark, audio, video, input {
  touch-action: pan-y pan-x;
}
.elMessageBox{
    width:300px;
}
</style>