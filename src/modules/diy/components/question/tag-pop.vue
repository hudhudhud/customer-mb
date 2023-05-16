<template>
  <van-popup v-model="show" position="right">
    <div class="popup-wrap">
      <div class="list-box" :class="{'has-select': selectItems.length > 0}">
        <template v-for="item of computedList">
          <div class="item" :key="item.id">
            <i :class="['fa', item.checked ? 'fa-check-circle' : 'fa-circle-thin']" @click="onChange(!item.checked, item)"></i>
            {{item.name}}
          </div>
        </template>
      </div>
      
      <div class="popup-bottom">
        <div class="tag-list-wrap">
          <div class="tag-list">
            <div class="tag" v-for="item of selectItems" :key="item.id">{{item.name}} <i class="el-icon-close" @click="onDelSelect(item)"></i></div>
          </div>
        </div>
        
        <div class="btns-box">
          <div class="btn btn--cancel" @click="onClose">取消</div>
          <div class="btn btn--confirm" @click="onConfirm">确认<template v-if="selectItems.length">({{selectItems.length}})</template></div>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script>
import { Popup } from 'vant'
import { Checkbox, Tag } from 'element-ui'
import { tags } from '../../../../api/questionApi'
export default {
  components: {
    [Popup.name]: Popup,
    [Checkbox.name]: Checkbox,
    [Tag.name]: Tag,
  },
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    items: {
      type: Array,
      default() {
        return []
      }
    },
    itemId: {
      type: [Number, String],
      default: ''
    },
    tagList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      show: false,
      list: [],
      selectItems: []
    }
  },
  computed: {
    computedList() {
      return this.list.map(v => {
        if (this.selectItems.find(it => it.id == v.id)) {
          v.checked = true
        } else {
          v.checked = false
        }
        return v
      })
    }
  },
  watch: {
    value: {
      handler(v) {
        this.show = v
        if (v) {
          this.getTags()
        }
      },
      immediate: true
    },
    show(v) {
      this.$emit('input', v)
    },
    items: {
      handler(v) {
        this.selectItems = v
      },
      immediate: true
    }
  },
  methods: {
    getTags() {
      if (this.list.length > 0) return
      if (this.tagList.length > 0) {
        this.list = this.tagList
        return
      }
      tags(this.itemId).then(res => {
        if (res.errcode === 0) {
          this.list = res.data
        }
      })
    },
    onChange(val, item) {
      if (val) {
        this.selectItems.push(item)
      } else {
        this.selectItems = this.selectItems.filter(v => v.id != item.id)
      }
    },
    onDelSelect(item) {
      this.selectItems = this.selectItems.filter(v => v.id != item.id)
      this.list.forEach(v => {
        if (v.id == item.id) {
          v.checked = false
        }
      })
    },
    onClose() {
      this.show = false
    },
    onConfirm() {
      this.show = false
      this.$emit('confirm', this.selectItems)
    }
  }
}
</script>

<style lang="stylus" scoped>
.popup-wrap {
  position: relative;
  width:100vw;
  height: 100vh;
  padding: 0 15px;
  box-sizing:border-box;
  background-color: #fff;
  .list-box {
    height: calc(100% - 50px);
    overflow-y: auto;
    overflow-x: hidden;
    &.has-select {
      height: calc(100% - 50px - 41px);
    }
  }
  .item {
    display: flex;
    align-items: center;
    height: 40px;
    font-size: 14px;
    border-bottom: 1px solid #eee;

    i {
      font-size:16px;
      color:#999;
      margin-right: 5px;
    }
    i.fa-check-circle {
      color: var(--color);
    }

    span {
      flex-shrink: 0;
      min-width: 50px;
      text-align: right;
      font-size: 20px;
      color: #999;
    }
  }
  .popup-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    min-height: 50px;
    border-top: 1px solid #eee;
    box-shadow: 0 0 10px 2px rgba(0,0,0,0.05);
    display: flex;
    padding: 0 10px;
  }
  .tag-list-wrap {
    flex-grow: 1;
    height: 30px;
    padding: 10px 0 5px;
    // overflow-y: auto;
    // overflow-x: hidden;
    overflow hidden
  }
  .tag-list {
    display: flex;
    height: 40px;
    overflow: auto;
  }
  .tag {
    flex-shrink: 0;
    height: 28px;
    padding: 0 5px;
    margin-right: 5px;
    border: 1px solid var(--color);
    border-radius: 4px;
    line-height: 28px;
    font-size: 14px;
    color: var(--color);
  }
  .btns-box {
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;

    &:before {
      content: '';
      display: inline-block;
      width: 1px;
      height: 20px;
      background-color: #eee;
      margin-right: 10px;
    }

    .btn {
      min-width: 50px;
      height: 30px;
      padding: 0 5px;
      font-size: 13px;
      line-height: 30px;
      text-align: center;
      color: #666;
      border: 1px solid #eee;
      border-radius: 4px;
      background-color: #F2f2f2;
    }
    .btn--back, .btn--cancel {
      margin-right: 10px;
    }
    .btn--confirm {
      border: 1px solid var(--color);
      background-color: var(--color);
      color: #fff;
    }
  }
}
</style>