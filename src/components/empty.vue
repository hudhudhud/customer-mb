<template>
  <div>
    <van-empty image-size="200">
      <div slot="image" class="custom-empty">
        <img src="../assets/search-empty.png" />
        <div class="label">{{text}}</div>
      </div>
    </van-empty>
  </div>
</template>

<script>
import { Empty } from 'vant'
export default {
  components: {
    [Empty.name]: Empty
  },
  props: {
    text: {
      type: String,
      default: '暂无内容'
    }
  }
}
</script>

<style lang="stylus" scoped>
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
    color: #999;
    padding: 10px 0;
  }
}
</style>