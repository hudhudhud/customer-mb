<template>
  <div class="collect-page" :style="{'padding-top': tabs.length > 1 ? '44px' : '1px'}">
    <div class="header" v-if="tabs.length > 1">
      <van-tabs
        v-model="currentTab" 
        swipeable 
        :ellipsis="false" 
        color="#2196f3" 
        line-width="30" 
        title-active-color="#333" 
        :style="tabsStyle"
        @change="onChangeTab"
      >
        <van-tab v-for="item of tabs" :title="item.text" :name="item.value" :key="item.value">
        </van-tab>
      </van-tabs>
    </div>
    <van-list v-if="loading || list.length > 0"
      v-model="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoadMore"
    >
      <div class="list-box">
        <template v-if="currentTab == 'article'">
          <div class="article-box" v-for="item of list" :key="item.id" @click="goDetail(item.info)" >
            <img :src="item.info.picUrl" v-if="item.info.picUrl" />
            <div>
              <div class="article__title">{{item.info.noticeTitle}}</div>
              <div class="article__info">
                <div class="article__tag" v-if="item.info.typeName">{{item.info.typeName}}</div>
                <div class="article__date">{{item.info.createTime.split(' ')[0]}}</div>
              </div>
            </div>
          </div>
        </template>
        <template v-if="currentTab == 'question'">
          <QuestionItem v-for="item of list" :key="item.id" :item="item.faq" :isDetail="false" :showBtns="false" style="margin: 10px 15px;border-radius: 8px;" />
        </template>
        <template v-if="currentTab == 'video'">
          <div class="list card" style="padding:0 7.5px;display:flex;flex-wrap:wrap;background-color:#fff">
            <VideoItem v-for="item of list" :key="item.id" :item="item.video" />
          </div>
        </template>
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
import { Tab, Tabs, List, Empty } from 'vant';
import { collectList as articles } from '../../../api/articleApi'
import { collectList as questions } from '../../../api/questionApi'
import { collectList as videos } from '../../../api/videoApi'
import QuestionItem from '@/modules/diy/components/question/questionItem.vue'
import VideoItem from '@/modules/diy/components/video/videoItem.vue'
export default {
  components: {
    [Tabs.name]: Tabs,
    [Tab.name]: Tab,
    [List.name]: List,
    [Empty.name]: Empty,
    QuestionItem,
    VideoItem
  },
  data() {
    return {
      defaultTabs: [{
        text: '文章',
        value: 'article'
      }, {
        text: '视频',
        value: 'video'
      }, {
        text: '问答',
        value: 'question'
      }],
      tabs: [],
      currentTab: 'article',
      pageNum: 1,
      pageSize: 20,
      list: [],
      loading: false,
      finished: false,
      isFirstLoad:true,
      scrollTop: 0,
      needScroll: false
    }
  },
  computed: {
    tabsStyle() {
      let width = 33 * this.tabs.length
      if (width > 100) {
        width = 100
      }
      return {
        width: width + '%',
        margin: '0 auto'
      }
    },
    func() {
      if (this.currentTab == 'question') {
        return questions
      }
      else if (this.currentTab == 'video') {
        return videos
      }
      return articles
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (vm.isFirstLoad || (from.name!=='publicity-detail' && from.name!=='question-detail' && from.name!=='video-detail')) {
        vm.isFirstLoad=false
        vm.needScroll = false
        vm.finished = false
        if (to.query.type) {
          vm.tabs = vm.defaultTabs.filter(item => {
            return to.query.type.indexOf(item.value) > -1
          })
          vm.currentTab = vm.tabs.length > 0 ? vm.tabs[0].value : 'article'
        } else {
          vm.tabs = vm.defaultTabs
          vm.currentTab = 'article'
        }
        vm.pageNum = 1
        let data = sessionStorage.getItem('collectlistData')
        if (data) {
          data = JSON.parse(data)
          vm.currentTab = data.currentTab
          vm.needScroll = true
          vm.scrollTop = data.scrollTop
        }
        vm.list = []
        vm.getList()
      }
      sessionStorage.removeItem('collectlistData')
      wx.hideOptionMenu();
      wx.hideAllNonBaseMenuItem();
      wx.hideMenuItems({
          menuList: [
          "menuItem:share:appMessage",
          ]
      });
    })
  },
  beforeRouteLeave(to,from,next){
    sessionStorage.removeItem('collectlistData')
    // this.tabs = []
    if (to.name!=='publicity-detail' && to.name!=='question-detail' && to.name!=='video-detail') {
      this.tabs = []
    }
    next()
  },
  methods: {
    goDetail(item){
      if (Number(item.site) === 1 && Number(item.openTarget) === 1) {
        if (item.noticeContent) {
          const data = {
            currentTab: this.currentTab,
            scrollTop: document.documentElement.scrollTop||document.body.scrollTop
          }
          window.sessionStorage.setItem('collectlistData', JSON.stringify(data))
          window.location.href = item.noticeContent
          // window.open(item.noticeContent,'_blank');
        }
        return
      }
      this.$router.pushPage({ name:"publicity-detail",params:{id:item.id}});
    },
    onChangeTab() {
      this.finished = false,
      this.pageNum = 1
      this.list = []
      this.getList()
    },
    onLoadMore() {
      if (this.finished) return
      this.pageNum += 1
      this.getList()
    },
    getList() {
      if (!this.func || !this.$route.query.itemIds) return
      this.loading = true
      this.func({
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        itemIds: this.$route.query.itemIds
      }).then(res => {
        this.loading = false
        if (res.errcode === 0) {
          if (this.pageNum == 1) {
            this.list = res.data.list
          } else {
            this.list = [...this.list, ...res.data.list]
          }
          this.finished = this.list.length >= res.data.total || res.data.list.length == 0
        }
        // 外链返回滚动到指定位置
        if (this.needScroll) {
          this.$nextTick(() => {
            window.scrollTo(0, this.scrollTop)
          })
          if (document.documentElement.scrollTop >= this.scrollTop || this.finished) {
            this.needScroll = false
          }
          
        }
      }).catch(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
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
.collect-page {
  min-height: 100vh;
  box-sizing: border-box;
  background-color: #f6f6f6;
}
.header {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  background-color: #fff;
  box-shadow: 0 0 10px 2px rgba(0,0,0,0.05);
}
/deep/.van-tab .van-tab__text {
  font-size: 14px;
  color:#999;
  font-weight: 500;
}
/deep/.van-tab.van-tab--active .van-tab__text {
  font-size: 16px;
  font-weight:bold;
  color:#333;
}
.article-box {
  display: flex;
  align-items: center;
  padding: 12px;
  margin: 10px 15px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0px 0px 24px 0px rgba(147,147,155,0.15);

  img {
    flex-shrink: 0;
    width: 120px;
    height: 88px;
    border-radius: 6px;
    margin-right: 10px;
  }

  .article__title {
    font-size: 16px;
    font-family: PingFang SC;
    font-weight: bold;
    color: #333333;
    line-height: 23px;
    margin-bottom: 5px;
    display:-webkit-box;
    -webkit-box-orient:vertical;
    -webkit-line-clamp: 2;
    overflow:hidden;
  }
  .article__info {
    display: flex;
    flex-wrap: wrap;
  }
  .article__tag {
    min-height: 17px;
    margin-right: 11px;
    margin-top: 5px;
    padding: 0 4px;
    border-radius: 9px;
    font-size: 11px;
    font-family: PingFang SC;
    font-weight: 500;
    color: #3478F7;
    line-height: 17px;
    background-color: rgba(52, 120, 247, .1);
  }
  .article__date {
    margin-top: 5px;
    font-size: 12px;
    font-family: PingFang SC;
    font-weight: 500;
    color: #999999;
    line-height: 17px;
  }
}
</style>