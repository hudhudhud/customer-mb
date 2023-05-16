<template>
  <van-popup v-model="popupVisible" position="right" :closeOnClickModal='false' :modal='showModal' safe-area-inset-top>
    <div class="search-content" >
      <div class="list" :class='{chooseMutiple:selectItems.length}'>
        <div v-for='(it,i) of list'  :key='i' class="item" @click="getDeptList(it)">
          <div class="left">
            <van-checkbox v-model='it.checked' @click.stop="checkStateChange(it)" @click.native.stop>
            </van-checkbox>
            <span class="txt main">{{it.name}}</span>
          </div>
          <div style='width:20%;text-align:right;padding-right:20px;color:#BEBEBE;' v-if="allList.filter(item=>item.parentId==it.id).length">
            <i class="fa fa-angle-right" aria-hidden="true"></i>
          </div>
        </div>
        <div class="tip-txt" v-if='!loading&&(!list||!list.length)'>
          <p>没有相关数据</p>
        </div>
      </div>
      <div class="bottom-fix">
        <div class="select-items">
          <van-tag v-for="(item,i) in selectItems" :key="i" closeable style='margin-right:5px' @close='item.checked=false;checkStateChange(item)' effect="plain">
            {{item.name}}
          </van-tag>
        </div>
        <div class='btns' >
          <van-button type="default" @click='back' v-if='path.length>1'>返回上一层</van-button>
          <van-button type="default" @click='popupVisible=false'>取消</van-button>
          <van-button type="primary" @click="confirmPop">确认</van-button>
        </div>
      </div>
    </div>
  </van-popup>
</template>
<script>
import { Popup, Button, Tag, Checkbox } from 'vant'
// import {videoAllTypes} from '@/api/videoApi'
export default {
  components:{
    [Tag.name]:Tag,
    [Popup.name]:Popup,
    [Button.name]:Button,
    [Checkbox.name]:Checkbox,
  },
  props:{
    dataList:{
      type:Array,
      default(){
        return []
      }
    },
    value:{
      type:Boolean,
      default:false,
    },
    chooseMutiple:{
      type:Boolean,
      defalut:false
    },
    typeId:{
      type:String,
      default:''
    }
  },
  watch:{
    value:{
      handler(v){
        this.popupVisible=v
      },
      immediate:true,
    },
    popupVisible(v){
      if(v){
        this.showModal = false
      }
      this.$emit('input',v)
    },
    dataList:{
      handler(v){
        this.initData()
      },
      deep:true,
      immediate:true,
    },
    typeId:{
      handler(v){
        this.initData()
      },
      immediate:true,
    }
  },
  computed: {
    // selectItems(){
    //   return this.allList.filter(it=>it.checked)
    // }
  },
  data(){
    return {
      list:[],//显示在页面上的list
      allList:[],//所有点击过的所有部门信息，用于过滤checked对象
      popupVisible:false,
      path:[],//暂存点击部门列表路径，用于返回时直接获取
      loading:false,
      showModal:false,
      selectItems:[]
    }
  },
  methods:{
    initData(){
      this.path=[]
      this.allList = this.$utils.deepClone(this.dataList)
      this.list = this.allList.filter(it=>it.parentId==0)
      this.path.push(0)
      // 初始选择类别
      this.$nextTick(()=>{
        if(this.allList.length && this.typeId){
          let findType = this.allList.find(it =>it.id===this.typeId)
          if (findType) {
            findType.checked=true
            this.checkStateChange(findType)
          }
        }
      })
    },
    confirmPop(){
      this.$emit('confirm',this.selectItems)
      this.popupVisible=false
    },
    getDeptList(item){
      let children = this.allList.filter(it=>it.parentId==item.id)
      if (children.length) {
        this.list = children
        this.path.push(item.id)
      }
      else {//没下级时，点击直接选中
        item.checked = !item.checked
        this.checkStateChange(item)
      } 
    },
    checkStateChange (item){
      if(!this.chooseMutiple){
        if(item.checked){
          this.allList.forEach(it=>this.$set(it, 'checked', false))
          this.$set(item, 'checked', true)
          this.selectItems = [item]
        }
        else {
          this.selectItems = []
        }
      }
    },
    back(){
      this.path.pop()
      let parentId = this.path[this.path.length-1]
      this.list = this.allList.filter(it=>it.parentId == parentId)
    }
  },
}
</script>
<style scoped lang='stylus'>
.search-content{
  width:100vw;
  height:100vh;
  padding:10px 15px;
  padding-right:0;
  box-sizing border-box;
  position:relative;
  overflow: hidden;
  .list{
    overflow-y: auto;
    height calc(100vh - 40px - 10px)
    // &.chooseMutiple{
    //   height calc(100vh - 40px - 10px - 50px)
    // }
    overflow-y:auto;
    box-sizing border-box;
    .item{
      display:flex;
      justify-content space-between;
      align-items:center;
      padding:10px 0;
      cursor pointer;
      border-bottom:1px solid #F8F7F7;
      .left{
        display:flex;
        align-items: center;
      }
    }
    .van-checkbox{
      height: auto
      display:flex;
      align-items:center;
      margin-right:10px;
      /deep/.van-checkbox__icon{
        padding:5px 0;
        height:auto;
        word-break: break-all;
      }
      /deep/.van-icon{
        width:17px;
        height:17px;
        &:before{
          position:absolute;
          top:-2px;
          left:0;
        }
      }
    }
    p.txt{
      white-space pre-wrap;
      padding:2px 0;
    }
    .main{
      font-size:16px;
      font-weight: 500;
      color:#333;
      white-space: pre-wrap;
      flex-grow:1;
    }
    .label{
      font-size:12px;
      color: #999;
    }
    .tip-txt{
      text-align center;
    }
    .cell{
      padding:10px 0;
    }
  }
  .bottom-fix{
    position:absolute;
    right:0;
    left:0;
    bottom:0;
    // box-shadow: 0 -2px 0 0 rgba(16,5,77,.09)
    border-top:1px solid #F4F5F5;
    background-color:#fff;
    z-index:2;
    display:flex;
    justify-content: space-between;
    align-items: center;
  }
  .select-items{
    display:flex;
    width:100%;
    overflow-x auto;
    height:50px;
    align-items:center;
    padding-left:5px;
    box-sizing border-box;
    min-width:1px;
    .van-tag{
      background: #ECF5FF;
      color:#fff;
      padding:5px 8px;
      color:#409EFF;
    }
    white-space: nowrap;
  }
  .btns{
    display:flex;
    align-items:center;
    justify-content:right;
    justify-self:right;
    flex-shrink:0;
    height:40px;
    .van-button{
      font-size: 14px;
      height: 30px;
      border:none;
      &.van-button--default{
        border:1px solid #E1E1E1;
      }
      &.van-button--primary{
        background-color:var(--color)
      }
      margin-right:10px;
    }
  }
}
</style>