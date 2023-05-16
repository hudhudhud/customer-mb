<template>
  <div class="publicity-list" >
    <template >
      <section :class="{header:true,noTab:!tabs.length}">
        <!-- <van-search v-model="searchTxt" placeholder="搜索" readonly input-align="center" @click="goSearch" /> -->
        <div class="search" @click="goSearch">
          <van-icon name="search" size="16px" style="font-weight:500;" />&nbsp;搜索
        </div>
        <van-tabs v-model="currentTab" swipeable :ellipsis="false" color="#2196f3" line-width="30" title-active-color="#333" @click="onClickTab" v-if="tabs.length > 0">
          <van-tab v-for="(item, index) of tabs" :title="item.name" :name="item.id" :key="index">
          </van-tab>
        </van-tabs>
        <div class="border-line"></div>
      </section>
        
      <div :class="{content:true,noTab:!tabs.length}">  
        <van-list  v-if="loading || list.length > 0 || filePath.length > 0" 
          v-model="loading"
          :finished="finished"
          :finished-text="list.length > 0 ? '没有更多了' : ''"
          :immediate-check="false"
          @load="onLoadMore"
        >
          <div style="background-color:#fff;padding-left:15px;" ref="scroll">
            <div class="breadcrumb" v-if="filePath.length > 0">
              <span
                v-for="(item, index) of filePath"
                :key="item.id"
                class="breadcrumb-item"
                :class="{current: index == filePath.length-1}"
                @click="onClickNav(index)"
              >
                <span >{{item.name}}</span>
                <van-icon v-if="index < filePath.length-1" name="arrow" color="#ccc" style="margin:0 2px;" />
              </span>
            </div>
            <div class="border-line"></div>
            <div v-if="list.length > 0">
              <template v-for="(item, index) of list">
                <div class="file-box" v-if="item.folder" :key="item.id" @click="onChangeFile(item)">
                  <img src="../assets/file.png" class="file-icon"/>
                  <div class="file-name">{{item.noticeTitle}}</div>
                  <van-icon name="arrow" color="#ccc" />
                </div>
                <div class="article-box" v-else :key="item.id" @click="goDetail(item)">
                  <!-- <img v-if="item.picUrl" :src="item.picUrl" class="pic-img" /> -->
                  <div class="article-content">
                    <div class="article-title">{{item.noticeTitle}}</div>
                    <div class="article-info">
                      <span>{{ item.createTime.split(' ')[0] }}</span>
                      <span class="article-num"><img src="../assets/eye.png" class="icon" /> {{ item.clickNum }}</span>
                    </div>
                  </div>
                </div>
                <div class="border-line" :key="index"></div>
              </template>
            </div>
            
            
          </div>
          <van-empty image-size="200" v-if="!loading &&list.length == 0">
            <div slot="image" class="custom-empty">
              <img src="../assets/search-empty.png" />
              <div class="label">暂无内容</div>
            </div>
          </van-empty>
        </van-list>
        <van-empty image-size="200" v-if="!loading && list.length===0 && filePath.length == 0">
            <div slot="image" class="custom-empty">
              <img src="../assets/search-empty.png" />
              <div class="label">暂无内容</div>
            </div>
          </van-empty>
      </div>
      <div class="collect-btn" @click="goCollectPath" v-if="showCollectBtn"><img src="../assets/collect.png" /></div>
    </template>
    
    <div class="back-btn pb" v-if="showBackBtn" @click="$router.forwardPage()"></div>
    
  </div>
</template>
<script>
import { types, articleList, itemName, typePath } from '../../../api/articleApi'
import { Search, Tabs, Tab, Icon, Empty, List, Loading } from 'vant'
import { setDocumentTitle } from "@/utils";

export default {
  components: {
    [Tabs.name]: Tabs,
    [Tab.name]: Tab,
    [Empty.name]: Empty,
    [Search.name]: Search,
    [Icon.name]: Icon,
    [List.name]: List,
    [Loading.name]: Loading,
  },
  data() {
    return {
      searchTxt:"",
      currentTab: '',
      loading: false,
      tabs: [],
      list:[],
      timerId:null,
      isFirstLoad:true,//防止页面刷新之后返回不获取数据
      showBackBtn: false,
      filePath: [],
      query: {
        pageNum: 1,
        pageSize: 20
      },
      finished: false,
      isOtherBack: false,
      scrollTop: 0,
      showCollectBtn: true
    };
  },
  beforeRouteEnter(to, from, next) {
      to.meta.routerTransition="router-slide-right"
      next(async (vm)=>{
        if(from.name=='publicity-index'||from.name=='diy-home'||vm.isFirstLoad){
          vm.currentTab=0;
          vm.list = []
          vm.tabs = []
          vm.filePath = []
          vm.isOtherBack = false
          vm.isFirstLoad=false
          
          let data = sessionStorage.getItem('listData')
          if (data) {
            data = JSON.parse(data)
            vm.currentTab = data.currentTab
            vm.filePath = data.filePath
            vm.isOtherBack = true
            vm.scrollTop = data.scrollTop
          } 
          vm.getTypes();
        }
        vm.showCollectBtn = to.query.nocollect != 1
        sessionStorage.removeItem('listData')
        // if(vm.$store.state.publicity&&vm.$store.state.publicity.rowItems){
        if(sessionStorage.getItem('publicity_catg_name') || to.query.pageTitle){
          setDocumentTitle(to.query.pageTitle || sessionStorage.getItem('publicity_catg_name'))
        }
        else{
          itemName(vm.$route.params.id)
          .then(res=>{
            if(res.errcode==0){
              setDocumentTitle(res.data.title)
              sessionStorage.setItem('publicity_catg_name',res.data.title)
            }
          })
        }
        if (to.query.back == 1 && !sessionStorage.getItem('firstUrl')) {
          sessionStorage.setItem('firstUrl', to.path)
        }

        vm.onShowBackBtn()
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
    sessionStorage.removeItem('listData')
    next()
  },
  methods: {
    onClickNav(index) {
      if (index == this.filePath.length - 1) return
      this.filePath = this.filePath.slice(0, index + 1)
      this.list = []
      this.query.pageNum = 1
      this.getList()
    },
    onChangeFile(item) {
      this.filePath.push({
        id: item.typeId,
        name: item.typeName,
      })
      this.list = []
      this.query.pageNum = 1
      this.getList()    
    },
    // 获取指定分类的路径
    getTypePath() {
      return typePath({
        itemId: this.$route.params.id,
        id: this.$route.query.typeId
      }).then(res => {
        if (res.errcode === 0) {
          this.filePath = res.data.slice(1)
          this.currentTab = res.data[0].id
        }
      })
    },
    // 获取分类
    getTypes() {
      this.loading = true
      types(this.$route.params.id).then(async (res) => {
        // setTimeout(() => {
          this.loading = false
        if(res.errcode==0){
          this.tabs=res.data
          if (res.data.length > 0) {
            this.currentTab = res.data[0].id
          } else {
            this.currentTab = this.$route.params.itemId
          }
          
          if (this.$route.query.typeId && !sessionStorage.getItem('listData')) {
            await this.getTypePath()
          }
          this.$nextTick(() => {
            this.query.pageNum = 1
            this.getList()
          })
          
        }
        // }, 2000)
        
      })
    },
    onLoadMore() {
      if (this.finished) return
      this.query.pageNum += 1
      this.getList()
    },
    // 获取文章列表（包含文件夹）
    getList() {
      let typeId = this.currentTab
      if (this.filePath.length > 0) {
        typeId = this.filePath[this.filePath.length - 1].id
      }
      this.loading = true
      articleList({
        ...this.query,
        itemId: this.$route.params.id,
        typeId
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
      })
    },
    // 点击tab
    onClickTab() {
      if (this.loading) return
      this.loading = true
      this.list = []
      this.filePath = []
      this.query.pageNum = 1
      this.getList()
    },
    // 防抖
    debounce(fn, wait) {    
        let self=this 
        return function() {        
            if(self.timerId !== null) clearTimeout(self.timerId);        
            self.timerId = setTimeout(fn, wait);    
        }
    },
    goDetail(item){
      if (Number(item.site) === 1 && Number(item.openTarget) === 1) {
        if (item.noticeContent) {
          const data = {
            currentTab: this.currentTab,
            filePath: this.filePath,
            scrollTop: document.documentElement.scrollTop||document.body.scrollTop
          }
          window.sessionStorage.setItem('listData', JSON.stringify(data))
          window.location.href = item.noticeContent
          // window.open(item.noticeContent,'_blank');
        }
        return
      }
      this.$router.pushPage({ name:"publicity-detail",params:{id:item.id}});
    },
    onShowBackBtn() {
      let route = this.$route
      let backUrl = sessionStorage.getItem('firstUrl')
      if (backUrl && route.path != backUrl) {
        this.showBackBtn = true
      } else {
        this.showBackBtn = false
      }
    },
    goCollectPath() {
      this.$router.push('/publicity-collect?itemIds=' + this.$route.params.id + '&type=article')
    },
    goSearch() {
      this.$router.push('/publicity-search/' + this.$route.params.id)
    }
  },
};
</script>
<style scoped lang="stylus">
  $searchHeight=54px;
  $tabHeight=44px
  .header{
    position:fixed;
    top:0;
    left:0;
    right:0;
    z-index 999;
    height:$searchHeight+$tabHeight;
    background-color: #fff;
    &.noTab{
      height:$searchHeight;
    }

    .search {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 34px;
      margin: 10px 12px;
      background-color: #f7f8fa;
      border-radius: 2px;
      font-size: 14px;
      color: #c8cbd8;
    }
  }
  .content{
      box-sizing border-box;
      height:100%;
      padding-top:$searchHeight+$tabHeight+10px;
      &.noTab{
         padding-top: $tabHeight+10px;
      }
  }
.back-btn {
  position: fixed;
  bottom: 50px;
  right: 10px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #2196f3;
  background-image: url('../../../assets/back.png');
  background-size: 30px 30px;
  background-position: center center;
  background-repeat: no-repeat;
}
.collect-btn {
  position: fixed;
  bottom: 80px;
  right: 10px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  box-shadow: 0px 0px 40px 0px rgba(71,71,71,0.21);
  img {
    width: 25px;
    height: 25px;
  }
}
.publicity-list {
  width:100%;
  height:100%;
  background-color: #f6f6f6;
  .breadcrumb {
    height:40px;
    // border-bottom:1px solid #ededed;
    background-color: #fff;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    
    font-size: 14px;
    line-height: 40px;
    color:#3478F7;
    .breadcrumb-item:last-child {
      padding-right:15px;
      
    }
    .current {
      color: #666;
    }
  }

  .border-line {
    width: 100%;
    height: 1px;
    background-color: #eee;
    transform: scaleY(0.5);
  }
  .file-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    padding-right: 10px;
    // border-bottom:1px solid #eee;
    background-color: #fff;

    .file-icon {
      width: 20px;
      height: 18px;
    }
    .file-name {
      width: calc(100% - 53px);
      font-size: 15px;
      color:#333;
      font-weight:bold;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .article-box {
    display: flex;
    align-items: center;
    min-height: 40px;
    padding: 17px 15px 20px 0;
    // border-bottom:1px solid #eee;

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
/deep/.van-tab {
  font-size: 14px;
  color:#999;
}
/deep/.van-tab.van-tab--active .van-tab__text {
  font-size: 16px;
  font-weight:bold;
  color:#333;
}


.list-item {
  width:100%;
  box-sizing:border-box;
  padding-left: 10px;
  height: 100%;
  .pb-item {
    padding:10px 0;
    border: 0 solid #eee;
    border-bottom-width: 1px;
    overflow: hidden;
    display:flex;
    justify-content:center;
    align-items:center;
    .left-content-left{
      width:90%;
      display:flex;
      flex-direction:column;
      .pb-item-title {
        font-size: 17px;
        line-height: 28px;
        font-weight: 500;
        white-space:nowrap;
        text-overflow:ellipsis;
        overflow:hidden;
        color:#333;
      }
      .pb-item-date,.pb-item-dep {
        height: 18px;
        line-height: 20px;
        font-size: 12px;
        color: #999999;
        margin-right: 10px;
      }
    }
  }
}

</style>
<style>
html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, embed, figure, figcaption, footer, header, menu, nav, output, ruby, section, summary, time, mark, audio, video, input {
  touch-action: pan-y pan-x;
}
</style>