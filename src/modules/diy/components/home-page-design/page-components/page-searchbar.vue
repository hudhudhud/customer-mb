<template>
  <div :comp-type="itemDef.type" class="page-search" :class="{'page-search--card': itemDef.style && itemDef.style.styleType == '卡片式'}"  :style="style" @click="goSearch">
    <template v-if="itemDef.search">
      <div class="search-box" :style="boxStyle" >
        <i class="el-icon-search" :style="{color: itemDef.iconColor}"></i>&nbsp;
        <el-input
          :placeholder="itemDef.placeholder"
          v-model="value"
          :style="{color: itemDef.textColor}"
          clearable
          @input="onInput"
        >
        </el-input>
      </div>
      <div class="right" :class="[itemDef.btnType]" :style="btnStyle" @click="onClickBtn" v-if="itemDef.showBtn">{{itemDef.btnText}}</div>
    </template>
    <div class="no-search" :style="{'justify-content': itemDef.align == 'center' ? 'center' : 'flex-start'}" v-else>
      <i class="el-icon-search" :style="{color: itemDef.iconColor}"></i>&nbsp;
      <span :style="{color: itemDef.textColor}">{{itemDef.placeholder}}</span>
    </div>
  </div>
</template>
<script>
import { Input } from 'element-ui'
import common from '../../../mixin/common'
export default {
  props: ["itemDef"],
  components: {
    [Input.name]: Input
  },
  mixins: [common],
  data(){
    return {
      value: ''
    }
  },
  computed: {
    style() {
      let obj = this.compStyle
      if (this.itemDef) {
        obj.height = this.itemDef.height + 'px'
        
        if (this.itemDef.gap) {
          obj.padding = `${this.itemDef.gap.marginTop}px ${this.itemDef.gap.marginRight}px ${this.itemDef.gap.marginBottom}px ${this.itemDef.gap.marginLeft}px`
        }
        
      }
      return obj
    },
    boxStyle() {
      let style = {}
      if (this.itemDef) {
        style = {
          'background-color': this.itemDef.backgroundColor,
          'border-radius': this.itemDef.shape == 'round' ? this.itemDef.height/2 + 'px' : '4px',
        }
      }
      return style
    },
    btnStyle() {
      let style = {}
      if (this.itemDef) {
        if (this.itemDef.btnType == 'button') {
          style = {
            'background-color': this.itemDef.btnColor,
            'color': '#fff'
          }
        } else {
          style = {
            'color': this.itemDef.btnColor,
          }
        }
      }
      return style
    }
  },
  methods: {
    goSearch() {
      if (this.itemDef.search) return
      if (!this.itemDef.itemId) {
        this.$toast('未绑定搜索栏目，请联系管理员！')
        return
      }
      if (this.itemDef.dataType.length == 0) {
        this.$toast('未绑定搜索类型，请联系管理员！')
        return
      }
      if (this.itemDef.customLink) {
        this.toLink({query: {itemId: this.itemDef.itemId, type: this.itemDef.dataType.join()}})
      } else {
        this.$router.push({
          name: 'publicity-search',
          params: {id: this.itemDef.itemId},
          query: {type: this.itemDef.dataType.join()}
        })
      }
    },
    onInput() {
      if (this.itemDef.searchFunc) {
        const func = window[this.itemDef.searchFunc]
        if (func) {
          func()
        }
      }
    },
    onClickBtn() {
      if (this.itemDef.btnCallBack) {
        const callback = window[this.itemDef.btnCallBack]
        if (callback) {
          callback()
        }
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.page-search {
  font-size: 14px;
  line-height: 1;
  height:40px;
  background-color:#fff;
  display:flex;
  align-items: center;
  
  margin: 5px 0;
  border-style: solid;
  border-width: 0px;
  border-color: transparent;

  .no-search {
    flex-grow: 1;
    display:flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0 15px;
  }

  .search-box {
    flex-grow: 1;
    display:flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0 0 0 10px;
    border-radius: 4px;
    position: relative;

    .clear {
      position: absolute;
      top: 50%;
      right: 5px;
      transform: translateY(-50%);
      color: #999;
    }
    /deep/.el-input {
      height: 100%;
    }
    /deep/.el-input__inner {
      height: 100%;
      border: none;
      padding: 0 30px 0 0;
      background-color: transparent;
    }
    /deep/.el-input__suffix {
      display: flex;
      align-items: center;
      right: 0;
    }
  }

  input {
    flex-grow: 1;
    height: 100%;
    border: none;
    padding: 0;
    background-color: transparent;
  }

  .right {
    flex-shrink: 0;
    
    margin-left: 10px;
    

    &.button {
      min-width: 40px;
      height: 100%;
      padding: 0 5px;
      border-radius: 4px;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;

      font-size: 13px;
      color:#fff;
    }
  }
}
.page-search--card {
  margin: 5px 10px;
  border-radius: 8px;
}
</style>