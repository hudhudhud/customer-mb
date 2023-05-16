<template>
  <div @click="addFile">
    <slot></slot>
  </div>
</template>

<script>
import { UPLOAD_URL, DEL_FILE_URL } from '@/api/index'
export default {
  props: {
    list: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      fileList: []
    }
  },
  watch: {
    fileList: {
      handler(v) {
        if (v.length > 0) {
          this.$emit('change', v)
        }
        
        // if (v.length > 0 && !v.find(it => it.loading)) {
        //   this.fileList = []
        // }
      },
      deep: true
    },
    list(v) {
      this.fileList = v
    }
  },
  methods: {
    //添加文件图片
    addFile(){
      console.log('123')
      let ele = document.querySelector('#input-upload-temp')
      if(ele){
          ele.remove()
      }
      ele = document.createElement('input')
      ele.setAttribute('type','file')
      ele.setAttribute('accept','image/*')
      ele.setAttribute('multiple','multiple')
      ele.addEventListener('change',(event)=>{
          let files = Array.from(event.target.files)
          console.log('file..change..',files)
          let ele = document.querySelector('#input-upload-temp')
          if(ele){
              ele.remove()
          }
          if(!files||!files.length)return
          event.target.value = ""
          
          files.forEach(item => {
            if (item.size > 10*1024*1024) {
              this.$toast('文件大小不能超过10M')
            } else {
              this.fileList.push({
                file: item,
                status: 'ready'
              })
            }
          })
          
          // this.fileList.push(...files.map(item => ({file:item, status: 'ready'})))
          this.handleUploadImg()
          
      })
      ele.setAttribute('id','input-upload-temp')
      ele.setAttribute('style','opacity:0;margin-bottom:-9999px')
      document.body.appendChild(ele)
      ele.click()
    },
    handleUploadImg() {
      this.fileList.forEach((item, index) => {
        if (item.status == 'ready') {
          this.$set(item, 'loading', true)
          this.$set(item, 'status', 'pending')
          const params = new FormData()
          params.append('file', item.file)
          this.$authRequest.post(UPLOAD_URL, params, {
            headers: {"Content-Type": "multipart/form-data"}
          }).then(res => {
            if (res.errcode === 0) {
              this.$set(item, 'result', res.data)
              this.$set(item, 'loading', false)
              this.$set(item, 'status', 'success')
            } else {
              this.$set(item, 'loading', false)
              this.$set(item, 'status', 'fail')
              this.$toast('文件上传失败')
            }
          }).catch(() => {
            this.$set(item, 'loading', false)
            this.$set(item, 'status', 'fail')
            this.$toast('文件上传失败')
          })
        }
        
      })
    }
  }
}
</script>