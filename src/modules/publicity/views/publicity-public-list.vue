<template>
  <div class="publicity-list" style="background-color: #f6f6f6;">
    <template>
      <section :class="{header:true,noTab:!tabs.length}">
        <van-search v-model="searchTxt" placeholder="请输入搜索内容" @input="getChangeInfo" @search="getChangeInfo" />
        <van-tabs v-model="currentTab" swipeable :ellipsis="false" color="#2196f3" line-width="30" title-active-color="#333" @change="getChangeInfo()" v-if='tabs.length'>
          <van-tab v-for="(item, index) of tabs" :title="item.name" :key="index" :name="item.id">
          </van-tab>
        </van-tabs>
      </section>
      <div :class="{content:true,noTab:!tabs.length}">
        <div class="list-item" v-if="!loading && list.length>0">
          <template v-for="item of list">
            <div class="article-box" :key="item.id" @click="goDetail(item)">
              <img v-if="item.picUrl" :src="item.picUrl" class="pic-img" />
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
        <van-empty image-size="200" v-if="!loading && list.length===0">
            <div slot="image" class="custom-empty">
                <img src="../assets/search-empty.png" />
                <div class="label">暂无内容</div>
            </div>
        </van-empty>
      </div>
    </template>
  </div>
</template>
<script>
import { Search, Tabs, Tab, Icon, Empty } from 'vant'

import { itemName, publicItems, publicList } from '../../../api/articleApi'

import moment from 'moment'

import Vue from 'vue';
import { Toast } from 'vant';

// Vue.use(Toast);

export default {
  components: {
    [Tabs.name]: Tabs,
    [Tab.name]: Tab,
    [Search.name]: Search,
    [Empty.name]: Empty,
  },
  data() {
    return {
      searchTxt:"",
      currentTab:"",
      loading: false,
      tabs: [],
      itemId:'',//栏目id
      list:[],
      timerId:null,
      isFirstLoad:true,//防止页面刷新之后返回不获取数据
    };
  },
  beforeRouteEnter(to, from, next) {
      to.meta.routerTransition="router-slide-right"
      next((vm)=>{
        vm.itemId = vm.$route.params.id
        vm.getItemName()
        if(from.name!=='publicity-detail'||vm.isFirstLoad){
          vm.searchTxt=''
          vm.dataInit();
          vm.isFirstLoad=false
        }
      })
  },
  methods: {
    getItemName(){
      itemName(this.itemId).then(res=>{
        if (res.errcode === 0) {
          document.title = res.data.title
        }
      })
    },
    async dataInit() {
      try{
          this.loading=true
          let res = await publicItems(this.itemId)
          if(res.errcode==0){
            this.tabs=res.data
            if(res.data.length){
              this.currentTab = this.$route.query.typeId ? this.$route.query.typeId : res.data[0].id
            }
            this.getRecordList()
          }
          else{
            Toast(res.message)
          }
      }
      catch(err){
        Toast(err.message || '程序出错了')
      }
      finally{
        this.loading=false
      }
    },
    getChangeInfo() {
      this.debounce(this.getRecordList,500)()
    },
    getRecordList() {
      this.list = []
      this.loading=true
      let params = {
        itemId:this.itemId,
        noticeTitle:this.searchTxt,
      }
      if (this.tabs.length) {
        params.typeId = this.currentTab
      }
      publicList(params)
      .then(res=>{
        if(res.errcode==0){
          this.list = res.data
          this.list.forEach(it => {
            it.createTime = moment(it.createTime).format('YYYY-MM-DD')
          })
        }
        else{
          Toast(res.message)
        }
      })
      .catch((err)=>{
        Toast(err)
      })
      .finally(()=>{
        this.loading=false
      })
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
      if (Number(item.site) === 1) {
        if (item.noticeContent) {
          window.location.href = item.noticeContent
        }
      } else {
        this.$router.pushPage('/publicity-detail/'+item.id);
      }
    },
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
    &.noTab{
      height:$searchHeight;
    }
  }
  .content{
      box-sizing border-box;
      height:100%;
      padding-top:$searchHeight+$tabHeight + 10px;
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
.publicity-list {
  width:100%;
  height:100%;
 .pb-search {
    width:100%;
    box-sizing border-box
    height: 50px;
    background-color: #F5F5FA;
    padding: 0 10px;
    display:flex;
    align-items center;
    justify-content space-between;
    .pb-search-div {
      width: 84%;
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
      width: 14%;
      height:30px;
      text-align: center;
      background-color:#4B77B0;
      border-radius: 4px;
      color: white;
      line-height: 30px;
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
.file-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding-right: 10px;
  border-bottom:1px solid #ededed;
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
.list-item {
  width:100%;
  box-sizing:border-box;
  padding-left: 10px;
  background-color: #fff;
}
</style>