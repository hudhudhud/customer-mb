<template>
  <div class="search-page" :style="{'padding-top': (types.length > 1 && searchTxt) ? '108px' : '64px'}">
    <div class="header">
      <van-search v-model="searchTxt" placeholder="搜索" ref="search" show-action @input="onSearch" @search="onSearch" @cancel="onCancel" />
      <van-tabs v-model="active" color="#108ee9" v-if="types.length > 1 && searchTxt" @change="onChangeTab">
        <van-tab title="文章" name="article" v-if="types.indexOf('article') > -1">
        </van-tab>
        <van-tab title="视频" name="video" v-if="types.indexOf('video') > -1">
        </van-tab>
        <van-tab title="问答" name="question" v-if="types.indexOf('question') > -1">
        </van-tab>
      </van-tabs>
    </div>
    <van-list v-if="loading || list.length > 0"
      v-model="loading"
      :finished="finished"
      :finished-text="list.length > 0 ? '没有更多了' : ''"
      :immediate-check="false"
      @load="onLoadMore"
    >
      <div :class="{'list-wrap-flex': active == 'video'}" :style="{'background-color':'#fff','padding-left':(active=='question' || active=='video') ? '0' : '15px'}">
        <template  v-for="item of list">
          <QuestionItem v-if="active == 'question'" :key="item.id" :item="item" />
          <VideoItem v-else-if="active == 'video'" :key="item.id" :item="item" />
          <div class="article-box"  :key="item.id" @click="goDetail(item)" v-else>
            <div class="article-content">
              <div class="article-title">{{item.noticeTitle}}</div>
              <div class="article-info">
                <span>{{ item.createTime.split(' ')[0] }}</span>
                <span class="article-num"><img src="../assets/eye.png" class="icon" /> {{ item.clickNum }}</span>
              </div>
            </div>
          </div>
        </template>

      </div>
    </van-list>
    <van-empty image-size="200" v-if="searchTxt && !loading && list.length == 0">
      <div slot="image" class="custom-empty">
        <img src="../assets/search-empty.png" />
        <div class="label">暂无内容</div>
      </div>
    </van-empty>
  </div>
</template>

<script>
import { articleSearch } from '../../../api/articleApi'
import { questionList } from '../../../api/questionApi'
import { videoList } from '../../../api/videoApi'
import { Search, Empty, List, Tabs, Tab } from 'vant'
import { setDocumentTitle } from "@/utils";
import QuestionItem from '@/modules/diy/components/question/questionItem.vue'
import VideoItem from '@/modules/diy/components/video/videoItem.vue'

export default {
  components: {
    [Search.name]: Search,
    [Empty.name]: Empty,
    [List.name]: List,
    [Tabs.name]: Tabs,
    [Tab.name]: Tab,
    QuestionItem,
    VideoItem,
  },
  data() {
    return {
      searchTxt: '',
      list: [],
      loading: false,
      timerId: null,
      pageNum: 1,
      pageSize: 20,
      finished: false,
      isFirstLoad: true,
      needScroll: false,
      types: [],
      active: 'article'
    }
  },
  computed: {
    func() {
      if (this.active == 'question') {
        return questionList
      }
      if (this.active == 'video') {
        return videoList
      }
      return articleSearch
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      setDocumentTitle(sessionStorage.getItem('publicity_catg_name'))
      if (vm.isFirstLoad || (from.name !== 'publicity-detail' && from.name !== 'video-detail' && from.name !== 'question-detail')) {
        vm.searchTxt = ''
        vm.list = []
        vm.finished = false
        vm.isFirstLoad=false
        vm.needScroll = false
        vm.pageNum = 1
        vm.$refs.search.querySelector('input').focus()

        if (to.query.type) {
          vm.types = to.query.type.split(',')
          vm.active = vm.types[0]
        } else {
          vm.types = []
          vm.active = 'article'
        }

        let data = sessionStorage.getItem('searchlistData')
        if (data) {
          data = JSON.parse(data)
          vm.searchTxt = data.searchTxt
          vm.needScroll = true
          vm.scrollTop = data.scrollTop
          vm.getData()
        }
      }
      sessionStorage.removeItem('searchlistData')
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
    sessionStorage.removeItem('searchlistData')
    next()
  },
  mounted() {
    this.$refs.search.querySelector('input').focus()
  },
  methods: {
    onCancel() {
      this.$router.back()
    },
    onChangeTab() {
      this.onSearch()
    },
    goDetail(item){
      if (Number(item.site) === 1 && Number(item.openTarget) === 1) {
        if (item.noticeContent) {
          const data = {
            searchTxt: this.searchTxt,
            scrollTop: document.documentElement.scrollTop||document.body.scrollTop
          }
          // 保存当前状态
          window.sessionStorage.setItem('searchlistData', JSON.stringify(data))
          window.location.href = item.noticeContent
          // window.open(item.noticeContent,'_blank');
        }
        return
      }
      this.$router.pushPage({ name:"publicity-detail",params:{id:item.id}});
    },
    onSearch() {
      this.list = []
      if (!this.searchTxt) {
        return
      }
      this.loading = true
      this.pageNum = 1
      this.debounce(this.getData, 500)()
    },
    // 防抖
    debounce(fn, wait) {    
      let self=this 
      return function() {        
        if(self.timerId !== null) clearTimeout(self.timerId);        
        self.timerId = setTimeout(fn, wait);    
      }
    },
    onLoadMore() {
      this.pageNum += 1
      this.getData()
    },
    getData() {
      this.loading = true
      let params = {
        itemId: this.$route.params.id,
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }
      if (this.active == 'question') {
        params.content = this.searchTxt.replace(/\s/g, '')
      } else if (this.active == 'video') {
        params.name = this.searchTxt.replace(/\s/g, '')
      } else {
        params.noticeTitle = this.searchTxt.replace(/\s/g, '')
      }
      this.func(params)
      .then(res => {
        this.loading = false
        if (res.errcode === 0) {
          if (this.pageNum == 1) {
            this.list = res.data.list
          } else {
            this.list = [...this.list, ...res.data.list]
          }
          this.finished = (this.pageNum * this.pageSize) >= res.data.total
          // 外链返回滚动到指定位置
          if (this.needScroll) {
            this.$nextTick(() => {
              window.scrollTo(0, this.scrollTop)
            })
            if (document.documentElement.scrollTop >= this.scrollTop || this.finished) {
              this.needScroll = false
            }
            
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
.search-page {
  min-height: 100vh;
  padding-top: 64px;
  box-sizing: border-box;
  background-color: #f6f6f6;
}
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  /deep/.van-field__left-icon {
    color: #c8cbd8;
    font-weight: 500;
  }
  /deep/.van-search__action {
    color: #3478F7;
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
.list-wrap-flex {
  display: flex;
  flex-wrap:wrap;
}
.article-box {
  display: flex;
  align-items: center;
  min-height: 40px;
  padding: 17px 15px 20px 0;
  border-bottom:1px solid #ededed;

  .pic-img {
    flex-shrink: 0;
    width: 120px;
    height: 88px;
    border-radius: 6px;
    margin-right: 10px;
  }
  .article-content {
    flex-grow: 1;
  }
  .article-title {
    font-size: 15px;
    font-weight: bold;
    color: #333333;
    line-height: 21px;
    display:-webkit-box;
    -webkit-box-orient:vertical;
    -webkit-line-clamp: 2;
    overflow:hidden;
  }
  .article-info {
    margin-top: 8px;
    font-size: 14px;
    color: #999;
  }
  .article-num {
    float: right
  }
  .icon {
    width: 14px;
  }
}

</style>