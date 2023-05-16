<template>
    <section :comp-type="itemDef.type" class="home-page-list-item" :class="{'home-page-list-item--card': itemDef.style && itemDef.style.styleType == '卡片式'}" :style="compStyle"> 
      <page-title v-if="itemDef.title.show" :itemDef="itemDef.title" :slot-data="slotData" style="margin:0;background-color: transparent;" />
        <!-- <slot :slot-data="dataList"></slot> -->
        <div class="list-box" :class="{'list-box--card': itemDef.mode == 'cardList'}">
          <div
            v-for="(item, index) of dataList"
            :key="index" class="list-item" 
            :class="itemClass"
            @click="onClick($event,item)"
          >
            <van-image
              v-if="itemDef.mode == 'cardList'" 
              class="list-item__img" 
              :height="setting.picHeight"
              :src="item.img"
              fit="cover"
            />
            <van-image
              v-if="itemDef.mode == 'picTxtList' && setting.picAlign == 'left'" 
              class="list-item__img list-item__img--left" 
              :width="setting.picWidth"
              :height="setting.picHeight"
              :src="item.img"
              fit="cover"
            />
            <div style="flex-grow:1;" class="list-item-wrap">
              <div v-if="setting.showTitle" class="list-item__title">{{item[setting.titleKey]}}</div>
              <div
                v-for="option of setting.dataOption" 
                :key="option.key" 
                :class="[option.type == 'info' ? 'list-item__info' : 'list-item__abstract']"
              >
                <template v-if="option.type == 'info'" >
                  <span 
                    class="list-item__info__label" 
                    :style="{color: setting.label.color, 'text-align': setting.label.align, 'font-size': setting.label.fontSize + 'px',width: setting.label.width}"
                  >{{option.name}}</span>
                  <span 
                    :class="{'list-item__info__value': option.type == 'info'}"
                    :style="{color: setting.content.color,'text-align': setting.content.align, 'font-size': setting.content.fontSize + 'px', width: setting.content.width,}"
                  >{{item[option.key]}}</span>
                </template>
                
                <span v-else
                  :style="{
                    color: option.type == 'abstract' ? setting.abstractColor : '',
                  }"
                >{{item[option.key]}}</span>
              </div>
            </div>
            <van-image
              v-if="itemDef.mode == 'picTxtList' && setting.picAlign == 'right'" 
              class="list-item__img list-item__img--right" 
              :width="setting.picWidth"
              :height="setting.picHeight"
              :src="item.img"
              fit="cover"
            />
          </div>
        </div>
    </section>
</template>
<script>
import { Image } from 'vant'
import common from '../../../mixin/common'
import PageTitle from './page-title.vue'
export default {
    components: {
      [Image.name]: Image,
      PageTitle
    },
    props: ["itemDef","slotData"],
    data() {
      return {
        setting: {},
        // dataList: []
      }
    },
    mixins: [common],
    watch: {
      itemDef: {
        handler(val) {
          if (!val) return
          this.setting = val.modeSetting
          // this.getList()
        },
        immediate: true,
        deep: true
      },
      // slotData: {
      //   handler(val) {
      //     if (!val) return
      //     this.getList()
      //   },
      //   immediate: true,
      //   deep: true
      // }
    },
    computed: {
        dataList () {
            return (this.itemDef.isSlot && this.slotData) ? (this.slotData[this.itemDef.slotKey]) : (this.itemDef.dataList)
        },
        modeSetting() {
            return (this.itemDef && this.itemDef.modeSetting) ? this.itemDef.modeSetting : {}
        },
        itemClass() {
          if (this.itemDef) {
            if (this.itemDef.mode == 'picTxtList') {
              return ['list-item--pic']
            }
            if (this.itemDef.mode == 'cardList') {
              return ['list-item--card']
            }
          }
          return ['list-item--list']
        },
    },
    methods: {
      // async getList() {
      //   if (this.itemDef.isSlot) {
      //     this.dataList = this.slotData ? this.slotData[this.itemDef.slotKey] : []
      //   } else {
      //     if (typeof this.itemDef.dataList == 'string') {
      //       const func = window[this.itemDef.dataList]
      //       if (func && typeof func == 'function') {
      //         this.dataList = await func()
      //       }
      //     } else {
      //       this.dataList = this.itemDef.dataList
      //     }
      //   }
      // },
      onClick(e, item) {
        if (item.onClick) {
          this.toLink(item.onClick, {item})
        } else {
          if (this.itemDef.listClick && typeof this.itemDef.listClick == 'string') {
            const func = window[this.itemDef.listClick]
            if (func && typeof func == 'function') {
              func(item)
            }
          }
        }
      }
    }
}
</script>
<style lang="stylus" scoped>
.home-page-list-item {
  margin: 5px 0;
  background-color: #fff;
  border-style: solid;
  border-width: 0;
}
.home-page-list-item--card {
  margin: 5px 10px;
  border-radius: 8px;
  overflow hidden
}
.list-box {
  padding: 0 15px;
}
.list-box--card {
  display: flex;
  flex-wrap: wrap;
  padding-top: 15px;
}
.list-item {
  .list-item__title {
    font-size: 16px;
    color: #333;
    line-height: 22px;
    margin-bottom: 10px;
    max-height: 44px;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    overflow-wrap: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .list-item__abstract {
    font-size: 14px;
    line-height: 20px;
    margin-top: 5px;
    max-height: 40px;
    color: grey;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    overflow-wrap: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .list-item__info {
    display: flex;
    align-items: center;
    font-size: 14px;
    line-height: 2;
    
  }
  .list-item__info__label {
    flex-shrink: 0;
    width: 80px;
    color: #999;
    padding-right: 15px;
  }
  .list-item__info__value {
    flex-grow: 1;
    color: #333;
  }
  .list-item__img {
    flex-shrink: 0;
    width: 110px;
    height: 90px;
    border-radius: 6px;

    &.list-item__img--left {
      margin-right: 15px;
    }
    &.list-item__img--right {
      margin-left: 15px;
    }
  }
}
.list-item--list {
  border-bottom: 1px solid #eee;
  padding: 15px 0;
  &:last-child {
    border-bottom: none;
  }
}
.list-item--pic {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding: 15px 0;
  &:last-child {
    border-bottom: none;
  }
}
.list-item--card {
  overflow: hidden;
  width: calc(50% - 8px);
  margin-bottom: 16px;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0,5%);
  &:nth-child(2n - 1) {
    margin-right: 16px;
  }

  .list-item__img {
    display: block;
    width: 100%;
    height: 90px;
    border-radius: 0;
  }
  .list-item-wrap {
    padding: 12px 15px;
  }
  .list-item__title {
    font-size: 15px;
    margin-bottom: 5px;
  }
  .list-item__info {
    line-height: 1.5;
  }
  .list-item__info__label {
    width: 30%;
    font-size: 12px;
  }
  .list-item__info__value {
    font-size: 12px;
  }
}
.page-title {
  font-size: 14px;
  height:60px;
  background-color:#fff;
  display:flex;

}
</style>