<template>
  <div class="question-list-page" :style="{'padding-top': tags.length > 0 ? '100px' : '64px'}">
    <div class="header">
      <div class="search-wrap">
        <van-search v-model="searchTxt" placeholder="搜索" ref="search" @input="onSearch" @search="onSearch" style="flex-grow: 1;" />
        <div class="filter-btn" :style="{color: typeList.length > 0 ? '#108ee9' : '#999'}" @click="showType = true">
          <van-icon name="filter-o" />筛选
        </div>
      </div>
      <FilterSilderPop :list="tags" :itemId="tagId" @change="onChangeTag" />
      
      
    </div>

    <div class="sort-box">
      <span @click="showSort=true">{{sortName[sortType]}}&nbsp;&nbsp;<i class="fa fa-angle-down"></i></span>
      <div class="sort-list" v-show="showSort">
        <div class="sort-item" :class="{action: sortType==item.value}" v-for="item of sortList" :key="item.value" @click="onChangeSort(item)">{{item.name}}</div>
      </div>
    </div>
    <van-list  v-if="loading || list.length > 0" 
      v-model="loading"
      :finished="finished"
      :finished-text="list.length > 0 ? '没有更多了' : ''"
      :immediate-check="false"
      @load="onLoadMore"
    >
      <QuestionItem v-for="item of list" :key="item.id" :item="item" :isDetail="false" />
    </van-list>
    <empty v-if="!loading && list.length===0" />

    <type-pop v-model="showType" :itemId="$route.params.itemId" :multiple="true" :items="typeList" @confirm="onConfirmFilter" />

    <div class="bottom-box" @click="goCreate">
      <div class="input-box">我来提问</div>
      <div class="btn">提问</div>
    </div>
  </div>
</template>

<script>
import { Search, List, Icon } from 'vant'
import QuestionItem from '../../components/question/questionItem.vue'
import TypePop from '../../components/question/type-pop.vue'
import Empty from '@/components/empty'
import { tags, questionList, questionHot, typeInfo } from '../../../../api/questionApi'
import FilterSilderPop from '../../components/filter-slider-pop.vue'
export default {
  components: {
    [Search.name]: Search,
    [List.name]: List,
    [Icon.name]: Icon,
    Empty,
    QuestionItem,
    TypePop,
    FilterSilderPop,
  },
  data() {
    return {
      searchTxt: '',
      pageNum: 1,
      tags: [],
      tagId: '',
      list: [],
      finished: true,
      loading: true,
      showType: false,
      typeList: [],
      sortType: 'new',
      sortList: [{
        value: 'new',
        name: '按时间排序'
      }, {
        value: 'hot',
        name: '按热度排序'
      }],
      showSort: false
    }
  },
  computed: {
    sortName() {
      const obj = {}
      this.sortList.forEach(item => {
        obj[item.value] = item.name
      })
      return obj
    },
    getData() {
      let func = questionList
      if (this.sortType == 'hot') {
        func = questionHot
      }
      return func
    }
  },
  beforeRouteEnter(to, from, next) {
    to.meta.routerTransition="router-slide-right"
    next(async (vm) => {
      if (to.query.pageTitle) {
        vm.$utils.setDocumentTitle(to.query.pageTitle)
      }
      vm.$nextTick(()=>{
        vm.showType = false
      })
      if (from.name !== 'question-detail') {
        // 非问答详情页都要刷新
        vm.tagId = ''
        vm.list = []
        vm.pageNum = 1
        vm.sortType = to.query.type || 'new'
        vm.typeList = []
        // 链接中指定分类id
        if (to.query.typeId) {
          await vm.getTypeName(to.query.typeId)
        }
        vm.getTags()
        
        vm.getQuestionList()
      } else {
        if (vm.$store.state.diy.questionItem) {
          for (let i=0; i<vm.list.length; i++) {
            if (vm.list[i].id == vm.$store.state.diy.questionItem.id) {
              vm.$set(vm.list, i, vm.$store.state.diy.questionItem)
              return false
            }
          }
          vm.$store.commit('diy/setQuestionItem',null)
        }
      }
      wx.hideOptionMenu();
      wx.hideAllNonBaseMenuItem();
      wx.hideMenuItems({
          menuList: [
          "menuItem:share:appMessage",
          ]
      });
    })
  },
  beforeRouteLeave(to,from,next) {
    wx.hideOptionMenu();
    wx.hideAllNonBaseMenuItem();
    wx.hideMenuItems({
        menuList: [
        "menuItem:share:appMessage",
        ]
    });
    next()
  },
  async mounted() {
    // if (this.$route.query.typeId) {
    //   await this.getTypeName(this.$route.query.typeId)
    // }
    // this.getTags()
    // this.pageNum = 1
    // this.getQuestionList()
  },
  methods: {
    getTypeName(typeId) {
      this.typeList = []
      return typeInfo(Number(typeId)).then(res => {
        if (res.errcode === 0 && res.data.id) {
          this.typeList.push(res.data)
        }
      })
    },
    onChangeSort(item) {
      this.sortType=item.value;
      this.showSort=false;
      this.onSearch()
    },
    onConfirmFilter(items) {
      this.typeList = items
      this.onSearch()
    },
    onChangeTag(id) {

      this.tagId = id
      this.onSearch()
    },
    onSearch() {
      this.pageNum = 1
      this.list = []
      this.getQuestionList()
    },
    onLoadMore() {
      if (this.finished) return
      this.pageNum += 1
      this.getQuestionList()
    },
    getQuestionList() {
      this.getData({
        itemId: this.$route.params.itemId,
        content: this.searchTxt,
        tagIds: this.tagId,
        typeIds: this.typeList.map(item => item.id).join(),
        pageNum: this.pageNum,
        pageSize: 5,
      }).then(res => {
        this.loading = false
        if (res.errcode === 0) {
          if (this.pageNum == 1) {
            this.list = res.data.list
          } else {
            this.list = [...this.list, ...res.data.list]
          }
          this.finished = this.list.length >= res.data.total
        } else {
          this.finished = true
        }
      }).catch(() => {
        this.loading = false
        this.finished = true
      })
    },
    getTags() {
      tags(this.$route.params.itemId).then(res => {
        if (res.errcode === 0) {
          this.tags = res.data
        }
      })
    },
    goCreate() {
      this.$router.push('/question-create/'+this.$route.params.itemId)
    },
  }
}
</script>

<style lang="stylus" scoped>
.question-list-page {
  min-height: 100vh;
  padding-top: 100px;
  padding-bottom: 50px;
  box-sizing: border-box;
  background-color: #f6f6f6;
}
.header {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 11;
  width: 100%;
  border-bottom: 1px solid #eee;
  box-shadow: 0 0 10px 2px rgba(0,0,0,0.05);
  background-color: #fff;
  /deep/.van-field__left-icon {
    color: #c8cbd8;
    font-weight: 500;
  }
  /deep/.van-search__action {
    color: #3478F7;
  }
}
.search-wrap {
  display: flex;
  align-items: center;
  padding-right: 10px;

  /deep/.van-search {
    flex-grow: 1;
  }
}
.filter-btn {
  font-size: 14px;
  color: #999;
}
.tags-wrap {
  height: 32px;
  overflow-y: hidden;
}
.tag-list {
  display: flex;
  overflow: auto;
  height: 46px;
  padding-left: 10px;
  .tag {
    display: inline-block;
    min-width: 60px;
    height: 22px;
    padding: 0 5px;
    margin: 0 10px 10px 0px;
    border-radius: 4px;
    
    background-color: #accadf;
    background-color: rgb(245,245,245);
    
    font-size: 12px;
    line-height: 22px;
    text-align: center;
    color: #333;


    &.action {
      color: rgb(21,118,225);
      background-color: rgb(231,240,255);
      // background-color: var(--color); // css变量，变量设置在style/var.css
    }
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