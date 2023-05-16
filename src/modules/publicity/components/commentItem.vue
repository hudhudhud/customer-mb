<template>
  <div class="list-item" v-if="item">
    <div class="main-item" >
      <div class="left">
        <div class="avatar" :style="`background-image:url(${item.avatar});background-size:cover;background-position:center;background-repeat:no-repeat;`"></div>
        <div class="info">
            <p class="user">{{item.username}} {{item.userId}}
              <span v-if="item.tipped===1" class="tipped-span">置顶</span>
            </p>
            <p class="comment" v-html ="item.comment"></p>
        </div>
      </div>
      <div class="right">
        <!--没有子评论时 作者或自身可以回复 -->
        <div @click="replay($event,item)" class="replay-btn" v-if="canReplay">回复</div>
        <!-- 作者可以置顶 -->
        <div class="up-btn" :class="{active:item.tipped===1}" v-if="userId&&isAuthor" @click="upComment(item)"><i class="fa fa-arrow-up" aria-hidden="true"></i></div> 
        <div class="praise-btn"   v-if="userId">
          <i aria-hidden="true" class="fa fa-thumbs-o-up" v-if="!item.approved" @click="praiseComment(item)"></i>
          <i class="fa fa-thumbs-up" style="color:#4B77B0;" aria-hidden="true" v-else @click="praiseComment(item)"></i>
          <template v-if="item.approve>0">
            <span>{{item.approve}}</span>
          </template>
        </div>
        <div class="praise-btn" v-else>
          <template v-if="item.approve>0">
            <span class="font">赞</span>
            <span>{{item.approve}}</span>
          </template>
        </div>
      </div>
    </div>
    <div class="oth-item" v-if="commentState===2&&item.children&&item.children.length">
      <template v-if="item.children.length<=maxComment||item.toggle">
        <replay v-for="(it,i) of item.children"  
          :key="i" 
          :item ="it"
          :mainCommentUserId="item.userId" 
          :isAuthor="isAuthor" 
          :authorId="authorId" 
          :userId="userId" 
          :canReplay="item.children.length==i+1"
          :parentItemList ="item.children"
          @praise="praiseComment" @replay="replay"/>
          <p v-if="item.children.length>maxComment&&item.toggle" @click="commentToggle(item,false)" class="more-comment">收起</p>
      </template>
      <template v-else>
        <replay v-for="(it,i) of item.children.slice(0,maxComment)"  
          :key="i" 
          :item ="it"
          :mainCommentUserId="item.userId" 
          :isAuthor="isAuthor" 
          :authorId="authorId" 
          :userId="userId" 
          :canReplay="item.children.length==i+1"
          :parentItemList ="item.children"
          @praise="praiseComment" @replay="replay"/>
          <p v-if="!item.toggle" @click="commentToggle(item,true)" class="more-comment">查看更多</p>
      </template>
    </div>
</div>
</template>

<script>
import { commentList, commentApprove, commentUp, commentAdd } from '../../../api/articleApi'
import Replay from './replay.vue'
import { storage } from "@/utils";
export default {
  components: {Replay},
  props: {
    item: {
      type: Object,
      default() {
        return null
      }
    },
    canReplay: {
      type: Boolean,
      default: false,
    },
    commentState: {
      type: Number,
      default: 0
    },
    authorId: {
      type: String,
      default: ''
    },
    articleId: {
      type: [Number, String],
      default: ''
    }
  },
  data() {
    return {
      maxComment: 10,
      loading: false,
    }
  },
  computed: {
    userId(){
      return this.$store.state.userInfo?this.$store.state.userInfo.userId:""
    },
    isAuthor(){
      return this.userId && this.authorId && this.authorId.toLocaleLowerCase() === this.userId.toLocaleLowerCase()
    }
  },
  methods: {
    // 展开收起
    commentToggle(item,val){
      this.$set(item,'toggle',val)
    },
    // 回复
    replay(event,item,parentList) {
      this.$emit('replay',event,item,parentList)
    },
    //点赞评论
    async praiseComment(item){
      if (this.loading) return
      this.loading = true
      try {
        await commentApprove({
          id:item.id,
          approved:item.approved?0:1
        })
        this.loading = false
        item.approved = !item.approved
        item.approve = Number(item.approve)
        item.approve += item.approved?1:-1
      }catch(e) {
        this.loading = false
      }
    },
    //置顶评论
    async upComment(item){
      commentUp({
        id:item.id,
        infoId:this.articleId,
        tipped:item.tipped===1?0:1
      }).then(res => {
        this.$emit('refresh')
        // this.getCommentList()
      })
    },
  }
}
</script>

<style lang="stylus" scoped>
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