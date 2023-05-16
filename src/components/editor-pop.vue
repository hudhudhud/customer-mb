<template>
  <div>
    <van-popup v-model="popupVisible" position="bottom" class="reply-pub" :modal='true' @close="onClose">
        <div class="header">
        <p class="title">发布评论</p>
        <i class="fa fa-angle-down" aria-hidden="true" @click="popupVisible=false"></i>
        </div>
        <div class="content part">      
        <div id="toolbar" style="text-align:left;">
            <span @click="linkPopVisible = true">插入链接</span>
        </div>
        <quill-editor v-model="inputContent" :options="editorOption" ref="quill-editor"/>
        </div>
        <div class="upload-img-list" v-if="imgList.length && needImg">
          <div v-for="(img,i) of imgList" :key="i" class="img-item">
              <i class="fa fa-times-circle close" aria-hidden="true" @click="removeImg(i)"></i>
              <img :src="img.url" />
              <div class="loading-box" v-if="img.loading"><van-loading /></div>
              
          </div>
        </div>
        <div class="opera">
          <div>
            <Upload v-if="needImg && isUpload" :list="uploadImgList" @change="handleUploadImg"><i class="fa fa-picture-o img-btn" aria-hidden="true" ></i></Upload>
            <i class="fa fa-picture-o img-btn" aria-hidden="true" @click="addFile" v-if="needImg && !isUpload"></i>
          </div>
          
          <van-button type="primary" class="pub" @click='onSubmit' :loading='btnLoading' :disabled='!inputContent'>发布</van-button>
        </div>
    </van-popup>
    <van-popup v-model="linkPopVisible" position="center" class="link-pop" :modal='false'  >
      <div class="line"><span class="left">链接文本：</span><el-input type="text" v-model="linkTitle"></el-input></div>
      <div class="line"><span class="left">链接地址：</span><el-input type="text" v-model="linkHref"></el-input></div>
      <div class="btns"> 
        <div class="btn cancel" @click="linkPopVisible=false">取消</div>
        <div class="btn sure" @click="addLinkEle">确定</div>
      </div>
    </van-popup>
  </div>
</template>

<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import { quillEditor } from 'vue-quill-editor'
import { Popup, Button, Loading } from 'vant'
import { Input } from 'element-ui'
import { UPLOAD_URL, DEL_FILE_URL } from '@/api/index'
import Upload from './upload.vue'

export default {
  components: {
    [Popup.name]: Popup,
    [Button.name]: Button,
    [Loading.name]: Loading,
    [Input.name]: Input,
    quillEditor,
    Upload,
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    needImg: {
      type: Boolean,
      default: true
    },
    isUpload: { // 文件选择后是否直接上传；true上传  false不上传，点击发布返回文件对象
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default: ''
    },
    btnLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      editorOption:{
          placeholder: '请输入',
          modules: {
              toolbar: '#toolbar',
          }
      },
      popupVisible: false,
      inputContent: '',
      linkPopVisible: false,
      linkTitle: '',
      linkHref: '',
      uploadImgList: [],
      isSave: false,
    }
  },
  computed: {
    imgList(){
      let res = []
      if (this.isUpload) {
        this.uploadImgList.forEach(item => {
          if (item.status != 'fail') {
            let newItem = {...item}
            if (item.result) {
              newItem = {
                ...newItem,
                ...item.result,
              }
              
            }
            res.push(newItem)
          }
        })
      } else {
        this.uploadImgList.forEach(it=>{
          let tempUrl = window.URL.createObjectURL(it);
          res.push({
            url: tempUrl,
          })
        })
      }
      return res
    }
  },
  watch: {
    value: {
      handler(v) {
        this.popupVisible = v
        if (v) {
          this.isSave = false
        }
      },
      immediate: true
    },
    popupVisible(v) {
      this.$emit('input', v)
    },
    placeholder: {
      handler(v) {
        this.editorOption.placeholder = v || '请输入'
      },
      immediate: true
    }
  },
  methods: {
    onClose() {
      this.inputContent = ''
      if (!this.isSave && this.isUpload) {
        this.uploadImgList.forEach(item => {
          this.onDelImg(item)
        })
      }
      this.uploadImgList = []
    },
    onSubmit() {
      this.isSave = true
      this.$emit('publish', {
        content: this.inputContent,
        imgs: this.imgList
      })
    },
    // 插入链接
    addLinkEle(){
      var Quill = require('quill/dist/quill.js')
      var Link = Quill.import('formats/link');
      class FileBlot extends Link {  // 继承Link Blot
        static create(value) {
          let node = undefined
          if (value&&!value.href){  // 适应原本的Link Blot
            node = super.create(value);  
          }
          else{  // 自定义Link Blot
            node = super.create(value.href);  
            node.setAttribute('download', true);  // 左键点击即下载
            node.innerText = value.innerText;
          }
          return node;
        }
      }
      FileBlot.blotName = 'link';
      FileBlot.tagName = 'A';
      Quill.register(FileBlot);

      let quill = this.$refs["quill-editor"].quill
      let index = quill.selection.savedRange.index
      quill.insertEmbed(index,"link",{href:this.linkHref,innerText:this.linkTitle},"api")
      this.linkPopVisible = false
    },
    //添加文件图片
    addFile(){
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
          
          this.uploadImgList.push(...files)
      })
      ele.setAttribute('id','input-upload-temp')
      ele.setAttribute('style','opacity:0;margin-bottom:-9999px')
      document.body.appendChild(ele)
      ele.click()
    },
    // 删除图片
    removeImg(i){
      console.log('删除')
      if (this.isUpload) {
        this.onDelImg(this.uploadImgList[i])
      }
      this.uploadImgList.splice(i,1)
    },
    onDelImg(item) {
      this.$authRequest.post(DEL_FILE_URL,{fileId: item.fileId})
    },
    handleUploadImg(list) {
      this.uploadImgList = list
    }
  }
}
</script>

<style lang="stylus" scoped>
.reply-pub{
    width:100%;
    min-height:200px;
    background-color:#fff;
    .header{
      margin:auto;
      width:90%;
      display:flex;
      justify-content space-between;
      align-items:center;
      height:40px;
      .title{
        font-size:13px;
      }
      i{
        font-size:18px;
      }
    }
    .opera{
        margin:auto;
        width:90%;
        height:40px;
        text-align: right;
        display:flex;
        justify-content space-between;
        align-items center;
        box-sizing border-box;
        font-size:15px;
        .img-btn{
          color:#A7A4A4;
          font-size:18px;
        }
        .cancel{
        }
        .pub{
            display inline-block;
            height: 26px;
            padding:5px 8px;
            text-align center;
            background-color:#108EE9;
            border-radius:5px;
            border:none;
            color:#fff;
            font-size:14px;
            font-weight 500;
            &[disabled]{
              background: #e0e0e0;
              color: #4C4A4A;
            }
        }
    }
    .upload-img-list{
      width:90%;
      margin:auto;
      margin-top:10px;
      display:flex;
      flex-wrap:wrap;
      .img-item{
        position:relative;
        width:60px;
        height:60px;
        margin:10px 10px 0 0;
        border-radius:5px;
        .close{
          position:absolute;
          right:3px;
          top:3px;
          font-size:15px;
          color:#898787;
        }
        img{
          width:60px;
          height:60px;
          border-radius:5px;
        }
        .loading-box {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(255,255,255,0.6);

          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
    .content{
        // margin-top:20px
        text-align center;
        .el-textarea{
            width: 350px;
            textarea{
                width: 100%;
                border: 1px solid #EAEEEB;
                outline: none;
                font-size: 16px;
                padding:0 5px;
                box-sizing border-box
            }
        }
        
      #toolbar{
        width: 90%;
        margin: auto;
        height: 30px;
        border: 1px solid #ccc;
        border-bottom: none;
        box-sizing: border-box;
        line-height: 30px;
        color: #999;
        padding:0 10px;
      }
      .quill-editor{
          // margin-top:10px;
          width:90%;
          margin:auto;
          height:120px;
          /deep/.ql-container{
              width:100%;
              height:100%
              strong{
                  font-weight:bold;
                  *{
                      font-weight:bold;
                  }
              }
          }
          /deep/.ql-toolbar.ql-snow .ql-formats{
              margin-right:0;
          }
      }
    }
    /deep/.el-textarea{
        margin:auto;
        width:307px;
        padding:0;
    }
}

.link-pop{
  width:80%;
  height:150px;
  border-radius:10px;
  padding:10px;
  box-sizing:border-box;
  .line{
    display:flex;
    white-space:nowrap;
    align-items:center;
    font-size:14px;
    color:#333;
    margin-bottom:10px;
    .left{
      width:70px;
      text-align:right;
      flex-shrink:0;
    }
    /deep/.el-input__inner{
      flex-grow:1;
      height:30px;
      line-height:30px;
      outline:none;
      padding:0 5px;
      box-sizing:border-box;
    }

  }
  .btns{
    display:flex;
    text-align:center;
    justify-content:center;
    margin-top:20px;
    .btn{
      width:50px;
      height:30px;
      text-align:center;
      color:#fff;
      line-height:30px;
      border-radius:5px;
      &:not(:last-child){
        margin-right:10px;
      }
    }
    .sure{
      background-color:#108EE9;
    }
    .cancel{
      background-color:gray;
    }
  }
}
</style>