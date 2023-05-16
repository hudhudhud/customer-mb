<template>
  <div class="question" :class="{'is-list': !isDetail}" @click="!isDetail && goDetail()">
    <div class="question__top">
      <img class="question__user-avatar" :src="item.avatar" />
      <div>
        <div class="question__user-name">{{item.username}} {{item.userId}}</div>
        <div class="question__time">{{item.createTime}}</div>
      </div>
    </div>
    <div class="question__content" :class="{hidden: !isDetail}">
      <span class="invate" v-for="(name, index) of inviteName" :key="index">@{{name}}</span>
      {{item.content}}
    </div>
    <div class="question__imgs">
      <div class="question__img-wrap" v-for="(v, index) of imgList" :key="index" @click.stop="onPreview(v)">
        <div class="question__img" :style="{'background-image': 'url('+v.url+')'}"></div>
        <div class="question__more-img" v-if="index == 4 && moreNum > 0 && !isDetail">+{{moreNum}}</div>
      </div>
    </div>
    <div style="overflow: hidden;">
      <div class="question__type" style="margin-right: 10px;">
        <img src="../../../../assets/question/type.png" />
        {{item.typeName}}
      </div>
    </div>
    <div style="overflow: hidden;">
      <div class="question__tag" v-for="tag of item.tags" :key="tag.id">
        <img src="../../../../assets/question/tag.png" />
        {{tag.tagName}}
      </div>
    </div>
    <!-- <span class="question__num">浏览次数 {{item.viewTimes}}</span> -->
    <div class="question__bottom" v-if="showBtns">
      <div class="question__btn" @click.stop="handleShare"><i class="fa fa-share-square-o" style="font-size:14px;"></i>&nbsp;{{item.shareTimes ? item.shareTimes : '转发'}}</div>
      <div class="question__btn"><i class="fa fa-eye"></i>&nbsp;{{item.viewTimes ? item.viewTimes : '浏览'}}</div>
      <div class="question__btn"><i class="fa fa-commenting-o"></i>&nbsp;{{item.answerNum ? item.answerNum : '评论'}}</div>
      <div class="question__btn" @click.stop="handleCollect">
        <i class="fa fa-star action" v-if="item.collected"></i>
        <i class="fa fa-star-o" v-else></i>
        &nbsp;{{item.collectTimes || '收藏'}}
      </div>
      <div class="question__btn" @click.stop="userId && handleApprove()" >
        <template v-if="userId">
          <i class="fa fa-thumbs-up action" v-if="item.approved"></i>
          <i class="fa fa-thumbs-o-up" v-else></i>
          &nbsp;{{item.approveTimes || '点赞'}}
        </template>
        <template v-else>
          赞 {{item.approveTimes}}
        </template>
      </div>
    </div>

    <PreviewImg ref="preview" />
  </div>
</template>

<script>
import { approve, collect, share } from '../../../../api/questionApi'
import PreviewImg from '@/components/previewImg.vue'
export default {
  components: { PreviewImg },
  props: {
    item: {
      type: Object,
      default() {
        return {}
      }
    },
    isDetail: {
      type: Boolean,
      default: false
    },
    showBtns: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      loading: false
    }
  },
  computed: {
    userId(){
      return this.$store.state.userInfo?this.$store.state.userInfo.userId:""
    },
    imgList() {
      if (this.item && this.item.files) {
        if (this.isDetail) {
          return this.item.files
        }
        return this.item.files.slice(0, 5)
      }
      return []
    },
    moreNum() {
      if (this.item && this.item.files) {
        return this.item.files.length - this.imgList.length
      }
      return 0
    },
    inviteName() {
      let inviteArr = []
      if (this.item && this.item.invite) {
        inviteArr = this.item.inviteName.split(',')
      }
      return inviteArr
    }
  },
  methods: {
    handleShare() {
      console.log('share')
      // if (!this.isDetail) return
      let rediUrl=encodeURIComponent(`${location.origin+location.pathname}?toPath=question-detail/${this.item.id}`)
      let link=`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${window.localStorage.getItem('appId')}&redirect_uri=${rediUrl}&response_type=code&scope=snsapi_base&agentid=${this.$utils.getQueryByName('agentid')}&state=${this.$utils.getQueryByName('state')}#wechat_redirect`
      let options = {
          link:link,
          title:this.item.content,
          desc:"来自【"+this.item.itemName+"】的问答",
          imgUrl:this.item.files && this.item.files.length > 0 ? this.item.files[0].url : ''
      }
      const _this = this
      wx.ready(function(){
        wx.invoke(
          "shareAppMessage", 
          options,
          function(res) {
            if (res.err_msg == "shareAppMessage:ok") {
              // _this.shareCount()
              share(_this.item.id)
            }
          }
        ); 
      })
    },
    handleCollect() {
      if (this.loading) return
      this.loading = true
      collect({
        id: this.item.id,
        collected: this.item.collected ? 0 : 1
      }).then(res => {
        this.loading = false
        if (res.errcode === 0) {
          this.item.collected = !this.item.collected
          this.item.collectTimes += this.item.collected ? 1 : -1
          window.Toast({
            message: this.item.collected ? '收藏成功' : '已取消收藏',
          });
        } else {
          window.Toast({
            message: res.message || '出错啦~',
          });
        }
      }).catch(() => {
        this.loading = false
      })
    },
    handleApprove() {
      if (this.loading) return
      this.loading = true
      approve({
        id: this.item.id,
        approved: this.item.approved ? 0 : 1
      }).then(res => {
        this.loading = false
        if (res.errcode === 0) {
          this.item.approved = !this.item.approved
          this.item.approveTimes += this.item.approved ? 1 : -1
          window.Toast({
            message: this.item.approved ? '点赞成功' : '已取消点赞',
          });
        } else {
          window.Toast({
            message: res.message || '出错啦~',
          });
        }
      }).catch(() => {
        this.loading = false
      })
      
    },
    onPreview(v) {
      const imgList = this.item.files.map(item => item.url)
      this.$refs.preview.showPreview({
        imgList: imgList,
        current: v.url
      })
    },
    goDetail() {
      this.$router.push('/question-detail/' + this.item.id)
    }
  }
}
</script>

<style lang="stylus" scoped>
.question {
  position: relative;
  padding: 15px;
  background-color: #fff;
  overflow: hidden;

  &.is-list:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 15px;
    right: 15px;
    height: 1px;
    background-color: #eee;
  }
}
.question__top {
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  .question__user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 15px;
  }
  .question__user-name {
    font-size: 14px;
    line-height: 20px;
    font-weight: 500;
    color: #333;
  }
  .question__time {
    font-size: 13px;
    line-height: 20px;
    color: #999;
  }
}
.question__type, .question__tag {
  float left
  display: flex;
  align-items: center;
  padding: 0 10px;
  height: 22px;
  border-radius: 14px;
  margin-bottom: 10px;
  margin-right: 10px;
  font-size: 12px;
  color: #333;
  line-height: 22px;
  background-color: #f1f1f1;

  img {
    width: 14px;
    height: 14px;
    margin-right: 5px;
  }
}
.question__content {
  font-size: 15px;
  line-height: 25px;
  color: #333;

  margin-bottom: 10px;

  &.hidden {
    max-height: 75px;
    overflow: hidden;
    /* 三行显示省略号 */
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  .invate {
    font-size: 14px;
    color: var(--color);
    line-height: 25px;
  }
}
.question__imgs {
  display: flex;
  flex-flow: wrap;
  // margin-bottom: 10px;
  .question__img-wrap {
    position: relative;
    width: calc(20% - 8px);
    margin-right: 10px;
    margin-bottom: 10px;
    &:nth-child(5n) {
      margin-right: 0;
    }
    &:last-child {
      margin-right: 0;
    }
  }
  .question__img {
    width: 100%;
    padding-bottom: 100%;
    background-size: 100% 100%;
  }
  .question__more-img {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: #000;
    font-size: 14px;
    color: #fff;
    opacity: 0.5;
  }
}
.question__num {
  font-size: 14px;
  color: #999;
}
.question__bottom {
  display: flex;
  justify-content: space-around;
  padding-top: 15px;

  .question__btn {
    font-size: 15px;
    color: #999;

    .action {
      color: var(--color);
    }
  }
}
</style>