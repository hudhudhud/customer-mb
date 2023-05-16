<template>
  <div class="comment">
    <div class="comment__left">
      <img :src="item.avatar" />
    </div>
    <div class="comment__right">
      <div class="comment__user">{{item.username}} {{item.userId}}</div>
      <div class="comment__content" v-html="item.content"></div>
      <div class="comment__img-list">
        <div class="comment__img"
          v-for="img of item.files"
          :key="img.fileId"
         :style="{'background-image': 'url(' + img.url + ')'}"
         @click="onPreview(img)"
        ></div>
      </div>
      <div class="comment__bottom">
        <div class="comment__time">{{item.createTime}}</div>
        <div>
          <!-- <span @click="handleReply">回复</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -->
          <span>
            <i aria-hidden="true" class="fa fa-thumbs-up" style="color:#108ee9;" @click="handleApprove" v-if="item.approved"></i>
            <i aria-hidden="true" class="fa fa-thumbs-o-up" @click="handleApprove" v-else></i>
            {{item.approveTimes}}
          </span>
        </div>
      </div>
    </div>

    <PreviewImg ref="preview" />
  </div>
</template>

<script>
import { answerApprove } from '../../../../api/questionApi'
import PreviewImg from '@/components/previewImg.vue'

export default {
  components: { PreviewImg },
  props: {
    item: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      loading: false
    }
  },
  methods: {
    handleReply() {
      this.$emit('reply', this.item)
    },
    async handleApprove() {
      if (this.loading) return
      this.loading = true
      try {
        let res = await answerApprove({
          id: this.item.id,
          approved: this.item.approved ? 0 : 1
        })
        if (res.errcode === 0) {
          this.item.approved = !this.item.approved
          this.item.approveTimes += this.item.approved ? 1 : -1
          if (this.item.approveTimes < 0) {
            this.item.approveTimes = 0
          }
          window.Toast({
            message: this.item.approved ? '点赞成功' : '已取消点赞',
          });
        }
      } catch(e) {
        window.Toast({
          message: e.message || '出错啦~',
        });
      } finally {
        this.loading = false
      }
      
    },
    onPreview(item) {
      const imgList = this.item.files.map(item => item.url)
      if (this.$utils.isQW()) {
        wx.previewImage({
          current: item.url, // 当前显示图片的http链接
          urls: imgList // 需要预览的图片http链接列表
        })
      } else {
        this.$refs.preview.showPreview({
          imgList: imgList,
          current: item.url
        })
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.comment {
  position: relative;
  display: flex;
  padding: 15px;
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 15px;
    right: 15px;
    height: 1px;
    background-color: #eee;
  }
}
.comment__left {
  flex-shrink: 0;
  margin-right: 10px;
  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
}
.comment__right {
  flex-grow: 1;
}
.comment__user {
  height: 40px;
  line-height: 40px;
  font-size: 15px;
  color: #333;
}
.comment__content {
  font-size: 14px;
  line-height: 22px;
  color: #666;

  /deep/a {
    color: var(--color);
  }
}
.comment__img-list {
  overflow: hidden;
}
.comment__img {
  float: left;
  width: calc(25% - 7.5px);
  padding-bottom: calc(25% - 7.5px);
  background-size: 100% 100%;
  margin-right: 10px;
  margin-top: 10px;
  &:nth-child(4n) {
    margin-right: 0;
  }
}
.comment__bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  font-size: 12px;
  color: #999;
}
</style>