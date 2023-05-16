<template>
    <section class="content">
        <template v-if='modules.length'>
            <div class="module"  v-for="(item,index) in modules" @click="go(item)"  :key='index'>
                <div class="left">
                    <img :src='item.picUrl'/>
                </div>
                <div class="right">
                    <span>{{item.name}}</span> 
                    <!-- <i class="fa fa-angle-right" aria-hidden="true"></i>  -->
                    <van-icon name="arrow" color="#ccc" />
                </div>
            </div>
        </template>
        <van-empty image-size="200" v-if="!loading && modules.length===0">
            <div slot="image" class="custom-empty">
                <img src="../assets/search-empty.png" />
                <div class="label">暂无内容</div>
            </div>
        </van-empty>
        
    </section>
</template>
<script>
import { items } from '../../../api/articleApi'

import { Empty, Icon, Toast } from 'vant'
export default {
    components:{
        [Empty.name]: Empty,
        [Icon.name]: Icon
    },
    beforeRouteEnter(to, from, next) {
        to.meta.routerTransition = "router-slide-right";
        if (to.query.back == 1 && !sessionStorage.getItem('firstUrl')) {
            sessionStorage.setItem('firstUrl', to.path)
        }
        next(vm=>{
            vm.getData()
        })
    },
    data() {
        return {
            modules:[],
            loading:false
        }
    },
    methods: {
        getData(){
            this.loading=true
            items()
            .then(res=>{
                if(res.errcode==0){
                    this.modules=res.data
                }
                else{
                    Toast(res.message)
                }
            })
            .catch((err)=>{
                Toast(err)
            })
            .finally(()=>{
                this.loading=false
            })
        },
        go(item) {
            if (item.diyHomepage) { 
                if (!item.appId) {
                    Toast('缺少appId')
                    return
                }
                let agentId = process.env.VUE_APP_PUBLICITY_AGENT_ID
                if (item.independence && item.agentId) {
                    agentId = item.agentId
                }
                let path = location.pathname.split('/')
                path.splice(path.length - 2, 1, 'diy-mobile')
                let rediUrl = encodeURIComponent(`${location.origin + path.join('/')}?appId=${item.appId}`)
                let link=`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${window.localStorage.getItem('appId')}&redirect_uri=${rediUrl}&response_type=code&scope=snsapi_base&agentid=${agentId}&state=${agentId}#wechat_redirect`
                location.href = link
            } else {
                //this.$store.commit('publicity/setRowItems',item)
                sessionStorage.setItem('publicity_catg_name',item.name)
                this.$router.pushPage({name:'publicity-list',params:{id:item.id}})
            }
        }
    },
}
</script>
<style scoped lang="stylus">
.content{
    width:100%;
    padding-top:8px;
    .module {
        width:100%;
        box-sizing border-box;
        // height 60px
        display flex
        padding:0px 10px;
        align-items center
        // margin-bottom:5px;
        .left{
            width:40px;
            img{
                width:40px;
                min-width 40px;
                height 40px;
                border-radius: 6px;
            }
        }
        .right{
            position: relative;
            width:92%;
            height:50px;
            display flex;
            justify-content space-between;
            align-items center
            margin-left:19px;
            // border-bottom 1px solid #eee;
            height:60px;
            box-sizing border-box
            i{
                color:#C7C7CC;
                font-size:15px;
            }
            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height:1px;
                background-color: #eee;
                transform: scaleY(0.5);
            }
        }
       
    }
    .custom-empty {
        text-align: center;
        img {
            width: 200px ;
            box-sizing: border-box;
        }
    }
}
</style>
<style>
html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, embed, figure, figcaption, footer, header, menu, nav, output, ruby, section, summary, time, mark, audio, video, input {
  touch-action: pan-y pan-x;
}
</style>