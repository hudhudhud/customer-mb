<template>
<div class="list-item" :class="{'card':mode==='card'}" @click="goDetail">
  <div class="top-img" :style="`background-image:url(${item.coverPic})`">
  </div>
  <div class="bottom-info">
    <p class="title">{{item.name}}</p>
    <div class="bottom">
      <div class="left">
        <span v-if="item.editor">{{item.editor}} | </span><span>{{moment(item.createTime).format('YYYY-MM-DD')}}</span>
      </div>
      <div class="right">
        <span v-if="item.playTimes>0" class="right-click-num">
          <svg t="1675826214243" class="icon" viewBox="0 0 1027 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6939" width="15" height="15"><path d="M876.8 150.4H147.2C64 150.4 0 217.6 0 297.6V736c0 80 64 147.2 147.2 147.2h732.8c80 0 147.2-64 147.2-147.2V297.6C1024 217.6 960 150.4 876.8 150.4zM928 761.6c0 12.8-9.6 25.6-25.6 25.6H121.6c-12.8 0-25.6-9.6-25.6-25.6V272c0-12.8 9.6-25.6 25.6-25.6h780.8c12.8 0 25.6 9.6 25.6 25.6v489.6z m-284.8-272l-153.6-108.8c-22.4-16-60.8-25.6-73.6 12.8v252.8c22.4 16 54.4 25.6 73.6 9.6l153.6-108.8c19.2-16 19.2-41.6 0-57.6z" p-id="6940" fill="#8a8a8a"></path></svg>
          {{item.playTimes}}
        </span>
      </div>
    </div>
  </div>
</div>
</template>
<script>
import moment from 'moment'
export default {
  props: {
    item: {
      type: Object,
      default() {
        return {}
      }
    },
    mode:{
      type:String,
      default:'card',
    }
  },
  data(){
    return {
      moment,
    }
  },
  methods: {
    goDetail() {
      this.$router.pushPage({name:"video-detail",params:{id:this.item.id}});
    },
  }
}
</script>
<style lang="stylus" scoped>
//图片比例 172 / 97 = 1.7
//一行两个
.card{
  &.list-item{
    width:50%; // 164 //50%时图片的宽度
    padding:0 7.5px;
    padding-top:15px;
    box-sizing: border-box;
  }
}

//一行一个
.list-item{
  padding-top:15px;
  width:100%;
  .top-img{
    width:100%;
    max-width: 100%;
    padding-top: 56.39%; // 164* 97/172 /164 //50%时图片的宽度164 按图片比例算出高度，高度再除以宽度为百分比，保持图片比例
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-color: #efeff4;
    border-radius: 5px;
  }
  .bottom-info{
    padding-top:8px;
    box-sizing border-box;
    width:100%;
    .title{
      font-size: 14px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #333333;
      line-height:20px;
      //2行省略号
      overflow:hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      /* autoprefixer: ignore next */
      -webkit-box-orient: vertical;
    }
    .bottom{
      margin-top:5px;
      padding-bottom:8px;
      display:flex;
      justify-content: space-between;
      font-size: 12px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #999999; 
      line-height:17px;
      .right-click-num{
        display:flex;
        align-items: center;
        svg{
          margin-right:4px;
        }
      }
    }
  }
}
</style>