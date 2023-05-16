<template>
  <div>
    <textarea v-model="content" placeholder="请输入问题内容"/>
    <div style="padding-left:10px;">
      <div class="line" @click="showType=true">
        <div style="flex-shrink: 0;"><span class="required">*</span>选择问题分类：</div>
        <div style="display:flex;align-items: center;">
          <span v-if="type">{{type.name}}</span>
          <span v-else style="color:#999;">请选择</span>
          &nbsp;
          <i class="fa fa-angle-right"></i>
        </div>
      </div>
      <div class="line" @click="showTag=true" v-if="tagList.length > 0">
        <div style="flex-shrink: 0;"><span class="required">*</span>选择问题标签：</div>
        <div style="display:flex;align-items: center;">
          <span v-if="tags.length > 0">{{tagNames}}</span>
          <span v-else style="color:#999;">请选择</span>
          &nbsp;
          <i class="fa fa-angle-right"></i>
        </div>
      </div>
      <div class="line" @click="onChangeMember">
        <div style="flex-shrink: 0;">@提醒谁看：</div>
        <div style="display:flex;align-items: center;">
          <span v-if="invite.length > 0">{{inviteNames}}</span>
          <span v-else style="color:#999;">请选择</span>
          &nbsp;
          <i class="fa fa-angle-right"></i>
        </div>
      </div>
    </div>
    <div class="img-list">
      <template v-for="(item, index) of fileList">
        <div class="img-box" :key="index" v-if="item.status != 'fail'">
          <img :src="item.result.url" v-if="item.result" @click="handlePreview(item.result.url)" />
          
          <div class="loading" v-if="item.loading"><van-loading /></div>
          <i class="el-icon-error close-btn" v-else @click="onDelImg(item)"></i>
        </div>
      </template>
      <Upload :list="fileList" @change="handleUploadImg"><div class="upload-btn"><i class="el-icon-plus"></i></div></Upload>
    </div>
    <div class="submit-btn" @click="onPublish">发布问题</div>

    <type-pop v-model="showType" :itemId="$route.params.itemId" :multiple="false" @confirm="onConfirmType" />
    <tag-pop v-model="showTag" :itemId="$route.params.itemId" :tagList="tagList" @confirm="onConfirmTag" />

    <PreviewImg ref="preview" />
  </div>
</template>

<script>
import { DEL_FILE_URL } from '@/api/index'
import { create, tags } from '../../../../api/questionApi'
// import { Upload } from 'element-ui'
import { Loading } from 'vant'
import TypePop from '../../components/question/type-pop.vue'
import TagPop from '../../components/question/tag-pop.vue'
import PreviewImg from '@/components/previewImg.vue'
import { storage, isQW } from "@/utils";
import request from '@/utils/auth_request'
import Upload from '@/components/upload.vue'

export default {
  components: {
    [Loading.name]: Loading,
    TypePop,
    PreviewImg,
    TagPop,
    Upload
  },
  data() {
    return {
      showType: false,
      type: null,
      content: '',
      showTag: false,
      tags: [],
      invite: [], //邀请人(@成员)
      fileList: [],
      loading: false,
      isSave: false,
      tagList: [],
    }
  },
  computed: {
    tagNames() {
      return this.tags.map(item => item.name).join(',')
    },
    inviteNames() {
      return this.invite.map(item => item.name).join(',')
    },
    imgList() {
      const list = []
      this.fileList.forEach(item => {
        if (item.status == 'success') {
          if (item.result && item.result.fileId) {
            list.push(item.result)
          }
          
        }
      })
      return list
    }
  },
  beforeRouteEnter(to, from, next) {
    to.meta.routerTransition="router-slide-right"
    next(vm => {
      vm.isSave = false
      vm.fileList = []
      vm.content = ''
      vm.tags = []
      vm.type = null
      vm.invite = []
      vm.getTags()
    })
  },
  beforeRouteLeave(to,from,next) {
    if (!this.isSave && this.fileList.length > 0) {
      this.fileList.forEach(item => {
        this.onDelImg(item)
      })
    }
    next()
  },
  methods: {
    getTags() {
      tags(this.$route.params.itemId).then(res => {
        if (res.errcode === 0) {
          this.tagList = res.data
        }
      })
    },
    handleUploadImg(fileList) {
      this.fileList = fileList
    },
    onDelImg(item) {
      if (!item.result) return
      this.fileList = this.fileList.filter(v => v.result.fileId != item.result.fileId)
      request.post(DEL_FILE_URL,{fileId: item.result.fileId})
    },
    handlePreview(src) {
      console.log('预览', src)
      if (isQW()) {
        wx.previewImage({
          current: src, // 当前显示图片的http链接
          urls: this.imgList.map(item => item.url) // 需要预览的图片http链接列表
        })
      } else {
        this.$refs.preview.showPreview({
          current: src,
          imgList: this.imgList.map(item => item.url),
        })
      }
      
    },
    onConfirmType(v) {
      this.type = v[0]
    },
    onConfirmTag(v) {
      this.tags = v
    },
    onChangeMember() {
      try{
        const _this = this
        wx.invoke("selectEnterpriseContact", {
          "fromDepartmentId": 0,// 必填，表示打开的通讯录从指定的部门开始展示，-1表示自己所在部门开始, 0表示从最上层开始
          "mode": "multi",// 必填，选择模式，single表示单选，multi表示多选
          "type": ["user"],// 必填，选择限制类型，指定department、user中的一个或者多个
          "selectedDepartmentIds": [],// 非必填，已选部门ID列表。用于多次选人时可重入，single模式下请勿填入多个id
          "selectedUserIds": []// 非必填，已选用户ID列表。用于多次选人时可重入，single模式下请勿填入多个id
        },function(res){
          if (res.err_msg == "selectEnterpriseContact:ok"){
            if(typeof res.result == 'string'){
              res.result = JSON.parse(res.result) //由于目前各个终端尚未完全兼容，需要开发者额外判断result类型以保证在各个终端的兼容性
            }
                          
            _this.invite = res.result.userList; // 已选的成员列表
            // for (var i = 0; i < selectedUserList.length; i++){
            //   var user = selectedUserList[i];
            //   var userId = user.id; // 已选的单个成员ID
            //   var userName = user.name;// 已选的单个成员名称
            //   var userAvatar= user.avatar;// 已选的单个成员头像
            // }
          }
        });
      } catch(e) {
        console.log('微信js-sdk需要真机调试')
      }
    },
    onPublish() {
      if (!this.content) {
        window.Toast('请输入问题内容')
        return
      }
      if (!this.type) {
        window.Toast('请选择问题分类')
        return
      }
      if (this.tagList.length > 0 && this.tags.length == 0) {
        window.Toast('请选择问题标签')
        return
      }
      this.loading = true
      this.isSave = true
      create({
        itemId: this.$route.params.itemId,
        content: this.content,
        username: this.$store.state.userInfo.userName,
        typeId: this.type.id,
        tags: this.tags.map(item => {
          return {
            tagId: Number(item.id),
            name: item.name,
          }
        }),
        files: this.imgList,
        invite: this.invite.map(item => item.id).join(','),
        inviteName: this.invite.map(item => item.name).join(','),
      }).then(res => {
        this.loading = false
        if (res.errcode === 0) {
          window.Toast('发布成功')
          setTimeout(() => {
            this.$router.back()
          }, 1500)
        }
      }).catch(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
textarea {
  width: 100%;
  height: 150px;
  box-sizing: border-box;
  padding: 10px;
  border: none;
  border-bottom: 1px solid #eee;
}
.line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding-right: 10px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  color: #333;

  .required {
    color: red;
  }

  i {
    font-size: 18px;
    color: #999;
  }
}
.img-list {
  overflow: hidden;
  padding: 10px 0 0 10px;
  .upload-btn {
    float: left;
    width: 80px;
    height: 80px;
    border: 1px solid #eee;
    border-radius: 4px;
    font-size: 20px;
    color: #999;

    display: flex;
    align-items: center;
    justify-content: center;
  }
  .img-box {
    float: left;
    width: 80px;
    height: 80px;
    margin-right: 10px;
    margin-bottom: 10px;
    border-radius: 4px;
    position: relative;
    background-color: #000;

    .loading {
      position: absolute;
      top: 0;
      left: 0;
      width:100%;
      height:100%;
      background-color: rgba(255,255,255,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn {
      position: absolute;
      top: -4px;
      right: -4px;
      font-size: 18px;
      color: #999;
    }

    img {
      width: 100%;
      height: 100%;
    }
  }
}
.submit-btn {
  margin: 15px 10px;
  height: 40px;
  background-color: var(--color);
  font-size: 14px;
  line-height: 40px;
  text-align: center;
  color: #fff;
  border-radius: 4px;
}
</style>