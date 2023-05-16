<template>
  <div style="padding-bottom:56px;">
    <div class="bottom-fix">
      <div class="input-btn" @click="popupVisible=true" v-if="commentState"><i class="fa fa-pencil"></i>写评论...</div>
      <div class="btns">
        <div class="btn" @click="handleComment" v-if="commentState"><i class="fa fa-commenting-o"></i><span>{{commentTotal > 0 ? commentTotal:'评论'}}</span></div>
        <div class="btn" @click="$emit('praiseDetail')">
          <i class="fa fa-heart" aria-hidden="true" style="color:#4b77b0" v-if="count.praiseActive"></i>
          <i class="fa fa-heart-o" aria-hidden="true" v-else></i>
          <span>{{count.praise || '点赞'}}</span>
        </div>
        <div class="btn" @click="$emit('collect')" v-if="canCollect">
          <i class="fa fa-star" aria-hidden="true" style="color:#4b77b0" v-if="count.collectActive"></i>
          <i class="fa fa-star-o" aria-hidden="true" v-else></i>
          <span>{{count.collect || '收藏'}}</span>
        </div>
        <div class="btn" v-if="shareState" @click="handleShare"><i class="fa fa-share-square-o"></i><span>{{count.share || '转发'}}</span></div>
        <div class="btn" v-if="docId" @click="handleDownLoad"><i class="el-icon-download" style="font-size: 20px;"></i><span>下载</span></div>
      </div>
    </div>

    <!-- 评论弹框 -->
    <van-popup v-model="popupVisible" position="bottom" class="reply-pub" :modal='true' @close="inputContent = ''">
      <div class="header">
        <p class="title">发布评论</p>
        <i class="fa fa-angle-down" aria-hidden="true" @click="popupVisible=false"></i>
      </div>
      <div class="content part">      
        <div id="toolbar" style="text-align:left;">
          <span @click="linkPopVisible = true">插入链接</span>
        </div>
        <quill-editor v-model="inputContent" :options="editorOption" ref="quill-editor"/>
      </div>
      <!-- <div class="upload-img-list" v-if="tempSrcList.length">
        <div v-for="(tempSrc,i) of tempSrcList" :key="i" class="img-item">
            <i class="fa fa-times-circle close" aria-hidden="true" @click="removeImg(i)"></i>
            <img :src="tempSrc" />
        </div>
      </div> -->
      <div class="opera">
        <!-- <i class="fa fa-picture-o img-btn" aria-hidden="true" @click="addFile"></i> -->
        <van-button type="primary" class="pub" @click='commentAdd' :loading='btnLoading' :disabled='!inputContent'>发布</van-button>
      </div>
    </van-popup>
    <van-popup v-model="linkPopVisible" position="center" class="link-pop" :modal='false'  >
      <div class="line"><span class="left">链接文本：</span><el-input type="text" v-model="linkTitle"></el-input></div>
      <div class="line"><span class="left">链接地址：</span><el-input type="text" v-model="linkHref"></el-input></div>
      <div class="btns"> 
        <div class="btn cancel" @click="linkPopVisible=false">取消</div>
        <div class="btn sure" @click="addLinkEle">确定</div>
      </div>
    </van-popup>
    <van-list v-if="commentState && commentMode=='list'"
      v-model="loading"
      :finished="finished"
      :finished-text="commentList.length ? '已显示全部评论' : '暂无评论'"
      :immediate-check="false"
      @load="onLoad"
      :error.sync="isError"
      error-text="请求失败，点击重新加载"
    >
      <div style="padding-top:20px;padding-left:10px;font-size:14px;color:#8F8F8F">评论</div>
      <div class="comment-list">
        <CommentItem
          v-for="(item,index) of commentList"
          :key="index"
          :item="item"
          :can-replay="canReplay(item)"
          :commentState="commentState"
          :authorId="createBy"
          :mediaType="mediaType"
          :mediaId="mediaId"
          @replay="replay"
          @refresh="getCommentList"
        />
      </div>
    </van-list>

    <!-- iframe内嵌文章的评论列表 -->
    <van-popup v-model="showCommentList" position="bottom" class="comment-popup" :modal='true'>
      <div class="top-title">全部评论<van-icon name="cross" @click="showCommentList=false" /></div>
      <div class="popup-content">
        
        <van-list
          v-model="loading"
          :finished="finished"
          :finished-text="commentList.length ? '已显示全部评论' : '暂无评论'"
          :immediate-check="false"
          @load="onLoad"
          :error.sync="isError"
           error-text="请求失败，点击重新加载"
        >
          <CommentItem
            v-for="(item,index) of commentList"
            :key="index"
            :item="item"
            :can-replay="canReplay(item)"
            :commentState="commentState"
            :authorId="createBy"
            :mediaType="mediaType"
            :mediaId="mediaId"
            @replay="replay"
            @refresh="getCommentList"
          />
        </van-list>
        
      </div>
      <div class="popup-bottom"><div class="input-box" @click="popupVisible=true">写评论</div></div>
    </van-popup>
  </div>
</template>

<script>
import { commentList, commentApprove, commentUp, commentAdd, getDownLoadUrl } from '@/api/articleApi'
import { commentList as commentListVideo, commentApprove as commentApproveVideo, commentUp as commentUpVideo, commentAdd as commentAddVideo } from '@/api/videoApi'
import { List, Popup, Button, Icon} from 'vant'
import {Input} from 'element-ui'
import Replay from './replay.vue'
import CommentItem from './commentItem.vue'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import { quillEditor } from 'vue-quill-editor'
export default {
  components: {
    [List.name]: List,
    [Popup.name]: Popup,
    [Button.name]: Button,
    [Input.name]: Input,
    [Icon.name]:Icon,
    Replay,
    CommentItem,
    quillEditor
  },
  props: {
    mediaType:{
      type:String,
      default:'article'
    },
    mediaId: {
      type: [Number, String],
      default: ''
    },
    createBy: {
      type: String,
      default: ''
    },
    count: {
      type: Object,
      default() {
        return {}
      }
    },
    canCollect: {
      type: Boolean,
      default: true
    },
    commentState: { // 0 不可评论  1仅对文章评论  2可对文章评论可回复评论
      type: Number,
      default: 0
    },
    shareState: { // 0 不可分享  1可对外分享  2仅在企业内部分享
      type: Number,
      default: 2,
    },
    commentMode: {
      type: String,
      default: 'list'
    },
    docId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isError:false,
      loading: true,
      finished: false,
      commentList: [],
      commentTotal: 0,
      pageNum: 1,
      pageSize: 50,
      maxComment:10,
      popupVisible: false,
      inputContent: '',
      replayItem: null,
      btnLoading: false,
      linkPopVisible: false,
      linkTitle: '',
      linkHref: '',
      editorOption:{
          placeholder: '请输入评论内容',
          modules: {
              toolbar: '#toolbar',
          }
      },
      clickLoading: false,
      showCommentList: false,
      apiFunc:{
        article:{
          commentList,
          commentApprove,
          commentUp,
          commentAdd
        },
        video:{
          commentList:commentListVideo,
          commentApprove:commentApproveVideo,
          commentUp:commentUpVideo,
          commentAdd:commentAddVideo
        }
      }
    }
  },
  computed: {
    userId(){
      //当内容包含外链，从外链回来后，因为该页面不要求登录，即其meta.module没有配置，没有beforeEach重置$state,此时$store.state.userInfo为空，因此需要从缓存中取
      return this.$store.state.userInfo?this.$store.state.userInfo.userId:""
    },
    userTicket(){
      return this.$store.state.userInfo?this.$store.state.userInfo.userTicket:""
    },
    isAuthor(){
      return this.userId && this.createBy && this.createBy.toLocaleLowerCase() === this.userId.toLocaleLowerCase()
    }
  },
  mounted() {
    this.getCommentList()
  },
  methods: {
    handleComment(){
      this.showCommentList=true
    },
    // 是否能回复
    canReplay(item) {
      return this.commentState === 2
    },
    addLinkEle(){
      var Quill = require('quill/dist/quill.js')
      var Link = Quill.import('formats/link');
      class FileBlot extends Link {  // 继承Link Blot
        static create(value) {
          let node = undefined
          if (value&&!value.href){  // 适应原本的Link Blot
            node = super.create(value);  
          }
          else{  // 自定义Link Blot
            node = super.create(value.href);  
            node.setAttribute('download', true);  // 左键点击即下载
            node.innerText = value.innerText;
          }
          return node;
        }
      }
      FileBlot.blotName = 'link';
      FileBlot.tagName = 'A';
      Quill.register(FileBlot);

      let quill = this.$refs["quill-editor"].quill
      let index = quill.selection.savedRange.index
      quill.insertEmbed(index,"link",{href:this.linkHref,innerText:this.linkTitle},"api")
      this.linkPopVisible = false
    },
    // 回复
    replay($event,item,parentList){
      this.replayItem = item
      if(this.replayItem){
        this.$set(this.replayItem,'showName','')
        if(this.replayItem.userId.toLocaleLowerCase()===this.createBy.toLocaleLowerCase()){
          this.replayItem.showName="作者"
        }
        else{
          this.replayItem.showName = this.replayItem.username+''+this.replayItem.userId
        }
        if(!parentList){
          this.$set(item,"children",[])
          this.replayParentList = item.children
        }
        else{
          this.replayParentList = parentList
        }
      }
      this.inputContent = ''
      this.linkTitle = ''
      this.linkHref = ''
      this.linkPopVisible = false
      this.editorOption.placeholder = this.replayItem?`回复 ${this.replayItem.showName}`:'请输入评论内容'
      this.popupVisible = true
    },
    //点赞评论
    async praiseComment(item){
      if (this.clickLoading) return
      this.clickLoading = true
      try {
        await this.apiFunc[this.mediaType].commentApprove({
          id:item.id,
          approved:item.approved?0:1
        })
        this.clickLoading = false
        item.approved = !item.approved
        item.approve = Number(item.approve)
        item.approve += item.approved?1:-1
      }catch(e) {
        this.clickLoading = false
      }
    },
    //置顶评论
    async upComment(item){
      this.apiFunc[this.mediaType].commentUp({
        id:item.id,
        tipped:item.tipped===1?0:1
      }).then(res => {
        this.getCommentList()
      })
    },
    // 评论
    async commentAdd(){
      if(this.btnLoading)return
      this.btnLoading = true
      try{
        let params = {
          comment:this.inputContent
        }
        if(this.replayItem){
          params.pid = this.replayItem.id
          params.parentId = this.replayItem.id
        }
        const res = await this.apiFunc[this.mediaType].commentAdd(this.mediaId,params)
        if(!this.replayItem){
          this.commentList.push(res.data)
          this.commentTotal += 1
        }
        else{
          //嵌套时组装
          // if(!Array.isArray(this.replayItem.children)){
          //   this.$set(this.replayItem,"children",[])
          // }
          // this.replayItem.children.push(res.data)
          if (this.showCommentList || this.finished) {
             //展平时组装
          this.replayParentList.push(res.data)
          }
         
        }
        this.popupVisible = false
        this.replayItem = null
        this.inputContent = ''
      }
      catch(e){

      }
      finally{
        this.btnLoading = false
      }
    },
    // 展开收起
    commentToggle(item,val){
      this.$set(item,'toggle',val)
    },
    onLoad() {
      this.pageNum++
      this.loadMoreComment()
    },
    getCommentList(){
      this.finished=false
      this.pageNum = 1
      this.isError = false
      this.loadMoreComment()
    },
    async loadMoreComment(){
      if(this.finished)return
      this.loading = true
      try{
        const res = await this.apiFunc[this.mediaType].commentList(this.mediaId,{
          pageNum:this.pageNum,
          pageSize:this.pageSize,
        })
        this.loading = false
        if(res.errcode === 0){
          if(this.pageNum==1){
            this.commentList = res.data.list
          }
          else{
            this.commentList.push(...res.data.list)
          }
          this.commentTotal = res.data.total-''
          this.finished=this.commentList.length>=res.data.total
        } else {
          this.finished=true
        }
      }
      catch(e){
        this.isError = true
      }
      finally{
        this.loading = false
      }
    },
    handleShare() {
      this.$emit('share')
    },
    handleDownLoad() {
      getDownLoadUrl({
        id: this.mediaId,
        docId: this.docId
      }).then(res => {
        if (res.errcode === 0) {
          const a = document.createElement('a');
          a.style.display = 'none';
          a.download = this.docId
          a.href = res.message;
          a.click();
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.bottom-fix {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index:100;
  box-sizing: border-box;
  width: 100%;
  height: 56px;  // 高度56固定
  padding: 10px;
  border-top: 1px solid #ededed;
  background-color: #fff;

  display: flex;
  align-items: center;

  .input-btn {
    box-sizing: border-box;
    width: 36%;
    height: 100%;
    border-radius: 10px;
    background-color: #f1f1f1;
    color: #b4b4b4;
    padding-left: 10px;
    display: flex;
    align-items: center;
  }

  .btns {
    flex-grow: 1;
    display: flex;
    justify-content: space-around;
    height: 100%;
  }

  .btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    min-width: 30px;
    height: 100%;

    i {
      font-size: 18px;
      color: #333;
    }
    span {
      font-size: 13px;
      color: #333;
      font-family: PingFangSC-Regular,PingFang SC;
    }
  }
}
.more-comment{
  color:#4b77b0;
  font-size:12px;
  padding-left:10px;
  padding-top:10px;
}
.reply-pub{
    width:100%;
    min-height:200px;
    background-color:#fff;
    .header{
      margin:auto;
      width:90%;
      display:flex;
      justify-content space-between;
      align-items:center;
      height:40px;
      .title{
        font-size:13px;
      }
      i{
        font-size:18px;
      }
    }
    .opera{
        margin:auto;
        width:90%;
        height:40px;
        text-align: right;
        // display:flex;
        // justify-content space-between;
        // align-items center;
        box-sizing border-box;
        font-size:15px;
        .img-btn{
          color:#A7A4A4;
          font-size:18px;
        }
        .cancel{
        }
        .pub{
            display inline-block;
            height: 26px;
            margin-top: 7px;
            padding:5px 8px;
            text-align center;
            background-color:#108EE9;
            border-radius:5px;
            border:none;
            color:#fff;
            font-size:14px;
            font-weight 500;
            &[disabled]{
              background: #e0e0e0;
              color: #4C4A4A;
            }
        }
    }
    .upload-img-list{
      width:90%;
      margin:auto;
      margin-top:10px;
      display:flex;
      flex-wrap:wrap;
      .img-item{
        position:relative;
        width:60px;
        height:60px;
        margin:10px 10px 0 0;
        border-radius:5px;
        .close{
          position:absolute;
          right:3px;
          top:3px;
          font-size:15px;
          color:#898787;
        }
        img{
          width:60px;
          height:60px;
          border-radius:5px;
        }
      }
    }
    .content{
        // margin-top:20px
        text-align center;
        .el-textarea{
            width: 350px;
            textarea{
                width: 100%;
                border: 1px solid #EAEEEB;
                outline: none;
                font-size: 16px;
                padding:0 5px;
                box-sizing border-box
            }
        }
        
      #toolbar{
        width: 90%;
        margin: auto;
        height: 30px;
        border: 1px solid #ccc;
        border-bottom: none;
        box-sizing: border-box;
        line-height: 30px;
        color: #999;
        padding:0 10px;
      }
      .quill-editor{
          // margin-top:10px;
          width:90%;
          margin:auto;
          height:120px;
          /deep/.ql-container{
              width:100%;
              height:100%
              strong{
                  font-weight:bold;
                  *{
                      font-weight:bold;
                  }
              }
          }
          /deep/.ql-toolbar.ql-snow .ql-formats{
              margin-right:0;
          }
      }
    }
    /deep/.el-textarea{
        margin:auto;
        width:307px;
        padding:0;
    }
}

.link-pop{
  width:80%;
  height:150px;
  border-radius:10px;
  padding:10px;
  box-sizing:border-box;
  .line{
    display:flex;
    white-space:nowrap;
    align-items:center;
    font-size:14px;
    color:#333;
    margin-bottom:10px;
    .left{
      width:70px;
      text-align:right;
      flex-shrink:0;
    }
    /deep/.el-input__inner{
      flex-grow:1;
      height:30px;
      line-height:30px;
      outline:none;
      padding:0 5px;
      box-sizing:border-box;
    }

  }
  .btns{
    display:flex;
    text-align:center;
    justify-content:center;
    margin-top:20px;
    .btn{
      width:50px;
      height:30px;
      text-align:center;
      color:#fff;
      line-height:30px;
      border-radius:5px;
      &:not(:last-child){
        margin-right:10px;
      }
    }
    .sure{
      background-color:#108EE9;
    }
    .cancel{
      background-color:gray;
    }
  }
}

.comment-popup {
  border-radius: 10px 10px 0 0; 
  .top-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    border-bottom: 1px solid #eee;
    font-size: 16px;
    color:#333;
    font-weight: 500;
    line-height: 40px;
  }
  .popup-bottom {
    height: 40px;
    box-sizing: border-box;
    border-top: 1px solid #eee;
    padding: 5px 10px;
    .input-box {
      border-radius: 16px;
      background-color: #f6f6f6;
      font-size: 13px;
      color: #999;
      line-height: 30px;
      text-indent: 10px;
    }
  }
  .popup-content {
    min-height: 300px;
    max-height: 70vh;
    overflow: auto;
  }
}

.list-item{
  width:100%;
  box-sizing:border-box;
  padding:10px;
  
  .main-item{
    width:100%;
    display:flex;
    justify-content:space-between;
    align-items: flex-start;

    .left{
      width:80%;
      display:flex;
      .avatar{
        width:30px;
        height:30px;
        border-radius:5px;
        margin-right:10px;
        flex-shrink:0;
        flex-grow:0;
      }
      .user{
        font-size:13px;
        color:#999;
        margin-bottom:2px;
        .tipped-span{
          background-color:#4B77B0;
          color:#fff;
          padding:2px 5px
          border-radius:5px;
          font-size:12px;
        }
      }
      .comment{
        font-size:14px;
        line-height:1.5;
        word-break: break-all;
        max-width: 100%;
        a{
          color:blue;
        }
      }
    }
    .right{
      flex-shrink:0;
      flex-grow:0;
      display:flex;
      align-items: center;

      .replay-btn{
        color:#4b77b0;
        font-size:13px;
        margin-right:10px;
        white-space:nowrap;
        flex-shrink:0;
        flex-grow:0;
      }
      .praise-btn{
        font-size:13px;
        color:#999;
        i{
          width: 14px;
          margin-right:5px;
          font-size:16px;
        }
        flex-shrink:0;
        flex-grow:0;
        .font{
          margin-right:5px;
        }
      }
      .up-btn{
        margin-right:10px;
        color:#999;
        i{
          font-size:16px;
        }
        
        &.active{
          color:#4B77B0;
        }
      }
    }
  }
  .oth-item{
    margin-left:40px;
    border-left:1px solid #e4e4e4;
  }
}
</style>