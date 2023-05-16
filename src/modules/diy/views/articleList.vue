<template>
  <div class="article-list-page">
    <div class="header">
      <van-search v-model="searchTxt" placeholder="搜索" @input="onSearch" @search="onSearch" />
    </div>
    <van-list  v-if="loading || list.length > 0" 
      v-model="loading"
      :finished="finished"
      :finished-text="list.length > 0 ? '没有更多了' : ''"
      :immediate-check="false"
      @load="onLoadMore"
    >
      <div style="background-color:#fff;" ref="scroll">
        <div v-if="list.length > 0">
          <template v-for="item of list">
            <Article :item="item" :key="item.id" />
          </template>
        </div>
        
        
      </div>
      
    </van-list>
    <Empty v-if="!loading &&list.length == 0" />
  </div>
</template>

<script>
import { articleHot, articleNew, articleStar } from '@/api/articleApi'
import Article from '../components/article/articleItem.vue'
import Empty from '@/components/empty.vue'
import { Search, List } from 'vant'
import { setDocumentTitle } from '@/utils/index'
export default {
  components: {
    Article,
    Empty,
    [Search.name]: Search,
    [List.name]: List,
  },
  data() {
    return {
      query: {
        pageNum: 1,
        pageSize: 20
      },
      list: [],
      loading: false,
      finished: false,
      searchTxt: '',
      scrollTop: 0,
      isOtherBack: false,
    }
  },
  computed: {
    getDataFunc() {
      if (this.$route.query.type == 'new') {
        return articleNew
      }
      if (this.$route.query.type == 'hot') {
        return articleHot
      }
      if (this.$route.query.type == 'star') {
        return articleStar
      }
      return ''
    }
  },
  beforeRouteEnter(to, from, next) {
    to.meta.routerTransition="router-slide-right"
    next(vm => {
      if (sessionStorage.getItem('scrollTop') !== undefined) {
        vm.scrollTop = sessionStorage.getItem('scrollTop')
        sessionStorage.removeItem('scrollTop')
        vm.isOtherBack = true
      }

      if (to.query.pageTitle) {
        setDocumentTitle(to.query.pageTitle)
      }
      
      vm.query.pageNum = 1
      vm.getArticleList()
      // 隐藏企微菜单，防止外链返回后菜单隐藏失效问题
      wx.hideOptionMenu();
      wx.hideAllNonBaseMenuItem();
      wx.hideMenuItems({
          menuList: [
          "menuItem:share:appMessage",
          ]
      });
    })
  },
  methods: {
    onSearch() {
      this.loading = true
      this.pageNum = 1
      this.debounce(this.getArticleList, 500)()
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
      if (this.finished) return
      this.query.pageNum += 1
      this.getArticleList()
    },
    // 获取文章列表（不包含文件夹）
    getArticleList() {
      if (!this.$route.params.itemId) {
        window.Toast('未绑定数据源，请联系管理员！')
        return
      }
      if (!this.getDataFunc) {
        this.finished = true
        return
      }
      this.loading = true
      this.getDataFunc({
        itemId: this.$route.params.itemId,
        noticeTitle: this.searchTxt,
        ...this.query,
      }).then(res => {
        this.loading = false
        if (res.errcode == 0) {
          if (this.query.pageNum == 1) {
            this.list = res.data.list
          } else {
            this.list = [...this.list, ...res.data.list]
          }
          if (this.query.pageNum * this.query.pageSize >= res.data.total) {
            this.finished = true
          } else {
            this.finished = false
          }
          // 外链返回滚动到指定位置
          if (this.isOtherBack) {
            this.$nextTick(() => {
              window.scrollTo(0, this.scrollTop)
            })
            if (document.documentElement.scrollTop >= this.scrollTop || this.finished) {
              this.isOtherBack = false
            }
            
          }
          
        }
      }).catch(() => {
        this.loading = false
        this.finished = true
      })
    },
  }
}
</script>

<style lang="stylus" scoped>
.article-list-page {
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
  box-shadow: 0 0 10px 2px rgba(0,0,0,0.05)

  /deep/.van-field__left-icon {
    color: #c8cbd8;
    font-weight: 500;
  }
  /deep/.van-search__action {
    color: #3478F7;
  }
}
</style>