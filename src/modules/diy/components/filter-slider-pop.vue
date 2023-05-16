<template>
  <div>
    <div class="tags-wrap" :class="{open: open}" v-if="list.length > 0">
      <!-- <div class="tag-list" :class="{open: open, 'no-open': !open && showMore}" ref="list">
          <div class="tag-wrap" :id="'tag'+item.id" v-for="item of list" :key="item.id" @click="onChangeTag(item.id)" :ref="'tag' + item.id"><div class="tag" :class="{action: tagId == item.id}">{{item.name}}</div></div>
        
      </div> -->
      <van-tabs @click="onChangeTag" v-model="currentIndex" :class="{'has-more':showMore}" :swipe-threshold="2">
        <van-tab v-for="(item,index) of list" :key="item.id" :name="index">
          <template #title>
          <div class="tag" :class="{action: tagId == item.id}">{{item.name}}</div>
          </template>
        </van-tab>
      </van-tabs>
      <div class="tag-list open" v-if="showMore&&open">
        <div class="tag-wrap" :id="'tag'+item.id" v-for="(item,i) of list" :key="item.id" @click="onChangeTag(i)" :ref="'tag' + item.id"><div class="tag" :class="{action: tagId == item.id}">{{item.name}}</div></div>
        <div class="more-btn open" @click="trigger" v-if="showMore&&open">收起</div>
      </div>
      <div class="more-btn" @click="trigger" v-if="showMore&&!open">更多</div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'
import { Tab, Tabs } from 'vant';
export default {
  components:{
    [Tab.name]: Tab,
    [Tabs.name]: Tabs
  },
  props: {
    list: {
      type: Array,
      default() {
        return []
      }
    },
    itemId: ''
  },
  data() {
    return {
      tagId: '',
      open: false,
      showMore: false,
      clientWidth: 0,
      currentIndex:0
    }
  },
  watch: {
    list: {
      handler(v) {
        if (v.length > 0) {
          this.open = false
          this.$nextTick(() => {
            let ele = document.querySelector('.van-tabs__nav')
            if (ele) {
              this.showMore = ele.scrollWidth > ele.clientWidth
            }
            // this.clientWidth = this.$refs.list.clientWidth
          })
        }
      },
      deep: true,
      immediate: true
    },
    itemId: {
      handler(v) {
        this.tagId = v
      },
      immediate: true
    }
  },
  methods: {
    onChangeTag(index) {
      this.currentIndex = index
      let tagItem = this.list[index]
      let id = tagItem.id
      if (this.tagId == id) {
        this.tagId = ''
      } else {
        this.tagId = id
      }
      
      this.$emit('change', this.tagId)
    },
    trigger() {
      this.open = !this.open
      // if (!this.open && this.tagId) {
      //   this.$nextTick(() => {
      //     let left = this.$refs['tag' + this.tagId][0].offsetLeft
      //     if (left > this.clientWidth / 2) {
      //       this.$refs.list.scrollLeft = left - 10
      //     }
      //   })
        
      // }
    }
  }
}
</script>

<style lang="stylus" scoped>
.tags-wrap {
  position: relative;
  height: 32px;
  // overflow-y: hidden;
  &.open {
    height: auto;
  }
}
.more-btn {
  position: absolute;
  bottom: 0px;
  right: 0;
  height: 32px;
  padding: 0 5px;
  background-color: #fff;
  font-size: 12px;
  color: #999;
  line-height:25px;
  &.open{
    height:25px;
    background-image: linear-gradient(180deg,rgba(0,0,0,0) 0,rgba(0,0,0,.05) 99%);
  }
  
}
.tag-list {
  position:absolute;
  top:0;
  left:0;
  right:0
  display: flex;
  overflow: auto;
  padding-left: 10px;
  // white-space: nowrap;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  &.open {
    flex-wrap: wrap;
    // height: auto;
    max-height: 400px;
  }
  &.no-open {
    padding-right: 40px;
  }
  .tag-wrap {
    display: inline-block;
    flex-shrink: 0;
    padding: 0 10px 10px 0px;
  }
  .tag {
      display: inline-block;
      min-width: 60px;
      height: 22px;
      padding: 0 5px;
      
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

  /deep/.van-tabs{
     padding:0 10px;
     width:100%;
     box-sizing: border-box;
     &.has-more{
      width:calc(100% - 35px)
     }
     .tag {
      display: inline-block;
      min-width: 60px;
      height: 22px;
      padding: 0 5px;
      
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
    .van-tabs__line{
      display:none;
    }
    .van-tab{
      padding:0 10px 10px 0;
      flex:0 0 auto;
    }
    .van-tabs__nav--line{
      height:unset;
      padding-bottom:0;
    }
    .van-tabs__nav{
      background-color: unset;
    }
    .van-tabs__nav--line.van-tabs__nav--complete{
      padding:0;
    }
  }
</style>