<template>
  <div class="question-detail-page">
    <QuestionItem v-if="detail" :item="detail" :isDetail="true" style="border-bottom: 10px solid #f7f7f7;" />

    <van-list  v-if="loading || commentList.length > 0" 
      v-model="loading"
      :finished="finished"
      :finished-text="commentList.length > 0 ? '没有更多了' : ''"
      :immediate-check="false"
      @load="onLoadMore"
    >
      <comment v-for="item of commentList" :key="item.id" :item="item" />
    </van-list>

    <div class="bottom-box" v-if="detail && detail.status == 1" @click="show=true;">
      <div class="input-box">我来回答</div>
      <div class="btn">评论</div>
    </div>

    <EditorPop v-model="show" :placeholder="placeholder" :btn-loading="loading" @publish="onPublish" />
  </div>
</template>

<script>
import { List, Toast } from 'vant'
import QuestionItem from '../../components/question/questionItem.vue'
import Comment from '../../components/question/comment.vue'
import EditorPop from '@/components/editor-pop.vue'
import { answerCreate, detail } from '../../../../api/questionApi'

export default {
  components: {
    [List.name]: List,
    QuestionItem,
    Comment,
    EditorPop,
  },
  data() {
    return {
      detail: null,
      commentList: [],
      finished: true,
      loading: false,
      show: false,
      replyItem: null,
    }
  },
  computed: {
    placeholder() {
      if (this.replyItem) {
        return '回复 ' + this.replyItem.showName
      }
      return '请输入评论'
    }
  },
  beforeRouteLeave(to,from,next) {
    wx.hideOptionMenu();
    wx.hideAllNonBaseMenuItem();
    wx.hideMenuItems({
        menuList: [
        "menuItem:share:appMessage",
        ]
    });
    console.log('detail')
    this.$store.commit('diy/setQuestionItem',this.detail)
    next()
  },
  mounted() {
    // this.detail = JSON.parse(sessionStorage.getItem('question-item'))
    this.getDetail()
  },
  methods: {
    getDetail() {
      detail({ id: this.$route.params.id }).then(res => {
        if (res.errcode === 0) {
          this.detail = res.data
          this.commentList = res.data.answers
        }
      })
    },
    onLoadMore() {},
    async onPublish(e) {
      try {
        // this.replyItem=null
        this.loading = true
        let res = await answerCreate({
          faqId: this.$route.params.id,
          username: this.$store.state.userInfo ? this.$store.state.userInfo.userName : '',
          content: e.content,
          files: e.imgs
        })
        if (res.errcode === 0) {
          this.show = false
          this.commentList.unshift(res.data)
        } else {
          Toast(e.message || '出错拉~')
        }
      } catch(e) {
        Toast(e.message || '出错拉~')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.question-detail-page {
  padding-bottom: 50px;
}
.bottom-box {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  padding: 0 15px;
  border-top: 1px solid #eee;
  background-color: #fff;
  display: flex;
  align-items: center;

  .input-box {
    flex-grow: 1;
    height: 30px;
    border: 1px solid #eee;
    border-radius: 4px;
    font-size: 14px;
    line-height: 30px;
    text-indent: 10px;
    color: #999;
  }
  .btn {
    width: 60px;
    height: 30px;
    border-radius: 4px;
    margin-left: 10px;
    font-size: 14px;
    line-height: 30px;
    text-align: center;
    color: #fff;
    background-color: var(--color);
  }
}
</style>