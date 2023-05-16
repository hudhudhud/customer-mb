<template>
  <van-popup v-model="show">
    <div class="popup-content" @click.stop="show=false">
      <!-- <van-icon name="cross" size="20" color="#fff" class="close-btn" /> -->
      <swiper ref="mySwiper" :options="swiperOptions">
        <swiper-slide v-for='(img,i) of imgList' :key='i'>
            <img class="img" :src="img" />
        </swiper-slide>
        <!-- <div class="swiper-pagination" slot="pagination"></div> -->
    </swiper>
    </div>
  </van-popup>
</template>

<script>
import { isQW, isPC } from "@/utils";
import { Popup, Icon } from 'vant'
import { swiper, swiperSlide } from "vue-awesome-swiper";
import 'swiper/dist/css/swiper.css'
export default {
  components: {
    [Popup.name]: Popup,
    [Icon.name]: Icon,
    swiper,
    swiperSlide,
  },
  data() {
    return {
      show: false,
      swiperOptions: {
        pagination: {
          el: '.swiper-pagination'
        },
      },
      imgList: [],
      currentIndex: 0
    }
  },
  methods: {
    showPreview(options) {
      const { imgList = [], current = '' } = options
      if (!imgList || !imgList.length) return
      
      if(!isPC() && isQW() && wx.previewImage){
        wx.previewImage({
          current: current, // 当前显示图片的http链接
          urls: imgList // 需要预览的图片http链接列表
        })
      }
      else{
        this.currentIndex = 0
        imgList.forEach((item, index) => {
          if (item == current) {
            this.currentIndex = index
          }
        })
        this.swiperOptions.initialSlide = this.currentIndex
        this.imgList = imgList
        this.current = 0
        this.show = true
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.popup-content {
  position: relative;
  width: 100vw;
  height: 100vh;
  padding: 50px 0;
  box-sizing: border-box;
  background-color: #000;

  .img {
    display: block;
    max-width: 100%;
    max-height: 100%;
    margin: auto;
  }

  .close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
  }

  /deep/.swiper-slide {
    width: 100vw;
    height: calc(100vh - 100px);
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>