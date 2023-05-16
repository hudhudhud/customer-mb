<template>
  <section class="video-list">
    <div class="top-bar">
      <div class="search-bar">
        <van-search v-model="searchStr" placeholder="搜索"/>
        <div @click='filterPopupVisible=true' class="filter-btn">
          <van-icon name="filter-o" />筛选
        </div>
      </div>
      <FilterSilderPop v-if="tags.length" :list="tags" @change="onChangeTag" :itemId="tagId"/>
    </div>
    <div class="content" :class="{'has-tag':tags.length>0}">
      <div class="sort-box">
        <span @click="showSort=true">{{sortName[sortType]}}&nbsp;&nbsp;<i class="fa fa-angle-down"></i></span>
        <div class="sort-list" v-show="showSort">
          <div class="sort-item" :class="{action: sortType==item.value}" v-for="item of sortList" :key="item.value" @click="onChangeSort(item)">{{item.name}}</div>
        </div>
      </div>
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
        v-model="loading"
        :finished="finished"
        finished-text=""
        :error.sync="isError"
        error-text="请求失败，点击重新加载"
        :immediate-check="false"
        @load="getData">
          <div class="list" :class="{card:$route.query.mode==='card'}">
            <VideoItem v-for='(item,i) of list' :key='i' :item="item" :mode="$route.query.mode"/>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
    <FilterPopup v-model="filterPopupVisible"  @confirm="filterSearch" :dataList="allTypes" :typeId="typeId"/>
    <Empty v-if="!loading && !list.length && !isError" />
  </section>
</template>
<script>
import {videoList, videoLatest, videoPopular, videoAllTypes, videoTags } from '@/api/videoApi'
import VideoItem from '../../components/video/videoItem'
import { Search, PullRefresh, List, Icon } from 'vant'
import FilterPopup from '../../components/video/filterPopup'
import Empty from '@/components/empty'
import FilterSilderPop from '../../components/filter-slider-pop.vue'
export default {
  components: {
    VideoItem,
    [Search.name]: Search,
    [PullRefresh.name]: PullRefresh,
    [List.name]: List,
    [Icon.name]:Icon,
    Empty,
    FilterPopup,
    FilterSilderPop
  },
  data() {
		return {
			loading: false,
			finished: false,
			refreshing: false,
			searchStr: '',
      tagId:'',
      type:'',
      itemId:'',
			list: [],
			pageNo: 1,
			pageSize: 10,
      typeId:'',
      isError:false,
      filterPopupVisible:false,
      firstLoad:true,

      sortType: 'new',
      sortList: [{
        value: 'new',
        name: '按时间排序'
      }, {
        value: 'hot',
        name: '按热度排序'
      }],
      showSort: false,
      tags: [],
      allTypes: []
		}
	},
  watch: {
		searchStr: {
			handler() {
        this.$utils.debounce(this.onRefresh, 300)()
			}
		}
	},
  computed:{
    sortName() {
      const obj = {}
      this.sortList.forEach(item => {
        obj[item.value] = item.name
      })
      return obj
    },
  },
  beforeRouteEnter(to,from,next){
		next(vm=>{ 
      vm.$nextTick(()=>{
        vm.filterPopupVisible = false
      })
      if (from.name !== "video-detail" || vm.firstLoad) {
        vm.sortType = to.query.type ? to.query.type : 'new'
        vm.itemId = to.params.itemId      
        vm.typeId = to.query.typeId
        videoAllTypes({itemId: vm.itemId}).then(res => {
          vm.allTypes = res.data
          // vm.setDocumentTitle()
        })
        vm.tagId = ""
        videoTags({itemId: vm.itemId}).then(res => {
          vm.tags = res.data
        })
        vm.onRefresh()
        vm.firstLoad = false
      }
      else {
        // vm.setDocumentTitle()
      }
      if (to.query.pageTitle) {
        vm.$utils.setDocumentTitle(to.query.pageTitle)
      }
		})
	},
	// beforeRouteUpdate (to, from, next) {
  //   console.log('uplate....')
  //   document.title = to.query.title ? to.query.title : '视频列表'
  //   this.type = to.query.type
  //   this.itemId = to.params.itemId
	//   this.onRefresh()
	// 	next()
	// },
  methods:{
		onRefresh() {
			this.finished = false
			this.loading = true
			this.pageNo = 1
			this.list = []
      this.isError = false
			this.getData()
		},
		getData() {
			this.refreshing = false    
      let getFunc = videoList
      if(this.sortType === 'new'){
        getFunc = videoLatest
      } else if(this.sortType === 'hot'){
        getFunc = videoPopular
      }
			getFunc({
        itemId:this.itemId,
        name: this.searchStr, 
        tagIds:this.tagId,
        typeIds:this.typeId,
				pageNum: this.pageNo,
				pageSize: this.pageSize,
			}).then(res => {
        if (Array.isArray(res.data.list)) {
          if (this.pageNo === 1) {
            this.list = res.data.list
          }
          else {
            this.list.push(...res.data.list)
          }
        }
        if (this.pageNo * this.pageSize >= res.data.total) {
          this.finished = true
        }
        else {
          this.pageNo++
        }
			})
      .catch((e)=>{
        this.isError = true
      }).finally(() => {
				this.loading = false
				this.refreshing = false
			})
		},
    filterSearch(items){
      if(items.length){
        this.typeId = items[0].id
      }
      else {
        this.typeId = ""
      }      
      this.onRefresh()
      this.setDocumentTitle()
    },
    onChangeSort(item) {
      this.sortType = item.value
      this.showSort = false
      this.onRefresh()
    },
    onChangeTag(id) {
      this.tagId = id
      this.onRefresh()
    },
    setDocumentTitle() {
      if (this.typeId) {
        let findType = this.allTypes.find(it => it.id === this.typeId)
        if(findType) {
          document.title = findType.name
        }
      }
      else {
        document.title = this.$route.query.title ? this.$route.query.title : '视频列表'
      }
    }
  }
}
</script>
<style lang="stylus" scoped>
.video-list{
  height:100%;
  background-color: #f6f6f6;
}
.top-bar{
  position:fixed;
  top:0;
  left:0;
  background-color: #fff;
  box-shadow: 0 0 10px 2px rgba(0,0,0,0.05);
  border-bottom: 1px solid #eee;
  z-index:11;
  width:100%;
}
.search-bar{
  /deep/.van-field__left-icon {
    color: #c8cbd8;
    font-weight: 500;
  }
  /deep/.van-search__action {
    color: #3478F7;
  }
  width:100%;
  display:flex;
  justify-content: space-between;
  align-items: center;
  .van-search{
    flex-grow:1;
  }
}
.sort-box {
  position: relative;
  height: 40px;
  padding: 0 15px;
  border-bottom: 1px solid #eee;
  background-color: #fff;
  font-size: 13px;
  line-height: 40px;
  color: #999;
  .sort-list {
    position: absolute;
    top: 100%;
    left: 15px;
    z-index: 10;
    // width: 100px;
    padding: 0 10px;
    border-radius: 4px;
    background-color: #fff;
    box-shadow: 0 0 10px 2px rgba(0,0,0,0.05);

    &:before {
      content: '';
      position: absolute;
      top: -10px;
      left: 10px;
      width: 0;
      height: 0;
      border-bottom: 5px solid #fff;
      border-top: 5px solid transparent;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
    }
  }
  .sort-item {
    height: 30px;
    font-size: 12px;
    line-height: 30px;
    color: #999;

    &.action {
      color: var(--color);
    }
  }
}
.filter-btn{
  font-size:14px;
  margin-right:10px;
  cursor:pointer;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #666;
  white-space:nowrap;
}
.content{
  width:100%;  
  box-sizing:border-box;
  padding-top:65px;
  &.has-tag{
     padding-top:100px;
  }
  padding-bottom:15px;
}
.list{
  padding:0 15px 15px 15px;
  display:flex;
  flex-wrap:wrap;
  background-color:#fff;
}
.list.card{
  padding:0 7.5px;
}
</style>