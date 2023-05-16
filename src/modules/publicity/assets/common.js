// import $ from 'jquery'
import { storage,isPC } from "@/utils"
import { encryptUser } from '@/utils/encryptAlgorithm'
import otherAuthHttpJson from '@/utils/request_json'
import { noAuthHttp } from "@/utils/request";
import { Message } from 'element-ui'
import store from '@/store'
function  onUserCaptureScreen(appName){
    if(isPC())return
    try{
    // setTimeout(async() => {  
    wx.onUserCaptureScreen(async function(res) {
        console.log('用户截屏了')
        Message({
            message: '文章禁止截屏，本次截屏行为及截屏内容已录入安全审计平台，请严格保护公司机密',
            type: 'warning',
            customClass: 'el-message--custom'
        });

        let tempPageDom = document.body.cloneNode(true)
        Array.from(tempPageDom.querySelectorAll('script')).forEach(ele=>{
            ele.remove()
        })
        Array.from(tempPageDom.querySelectorAll('link')).forEach(ele=>{
            ele.remove()
        })
        Array.from(tempPageDom.querySelectorAll('img')).forEach(ele=>{
            ele.remove()
        })
        tempPageDom.querySelector('#shuiyin').remove()
        let userId = store.state.userInfo.userId
        let userName = store.state.userInfo.userName
        let timeNow = (new Date()).toLocaleString()
        let department = ''

        try{
          // 获取员工信息
            let result = await otherAuthHttpJson.get(process.env.VUE_APP_WXAPI_URL + '/yq/user/info',{params:{uid:userId}})
            if(result.errcode==0&&result.data){
                department = [result.data.first_dept_name,result.data.second_dept_name,result.data.third_dept_name,].join('-')
            }
        }
        catch(e){
            console.log('onUserCaptureScreen..err',e)
        }

        let showHtml = `
        <span>用户部门：${department};</span><br>
        <span>用户姓名：${userName};</span><br>
        <span>用户账号：${userId};</span><br>
        <span>截屏时间：${timeNow};</span><br>`

        showHtml+=`<span>截屏页面：文章详情</span><br>`
        showHtml+=` <span>详情：<br><br>${tempPageDom.innerHTML}</span>`
        appName = appName || sessionStorage.getItem('publicity_catg_name') || '宣传专栏'
        let defaultParams = {
            from:encryptUser(process.env.VUE_APP_CAPTURESCREEN_SENDMAIL),
            receive:encryptUser(process.env.VUE_APP_CAPTURESCREEN_RECEIVEMAIL?process.env.VUE_APP_CAPTURESCREEN_RECEIVEMAIL:userId+'@h3c.com'),
            copy:encryptUser(userId+'@h3c.com'),
            content:showHtml,
            subject:`用户${userId}在${appName}的截屏操作记录，请审计`,
            html: true, //是否是html
        }
        // 发送邮件
        otherAuthHttpJson.post(process.env.VUE_APP_WXAPP_URL + '/outside/email/send',defaultParams)
    })
// }, 5000);
    }
    catch(e){
        console.log('capture..error',e)
    }
}
function wxJsConfig(state) {
    if(isPC(false) || !state) return
    return noAuthHttp.wechartSDK(state,
        [
            "hideMenuItems",
            "hideOptionMenu",
            "openEnterpriseChat",
            "previewFile",
            "hideAllNonBaseMenuItem",
            "previewImage",
            "onMenuShareAppMessage",
            "shareWechatMessage",
            "onMenuShareTimeline",
            "shareAppMessage"
        ]).then(() => {
            wx.ready(function() {
                wx.hideOptionMenu();
                wx.hideAllNonBaseMenuItem();
                wx.hideMenuItems({
                  menuList: ["menuItem:refresh", "menuItem:setFont","menuItem:copyUrl"]
                });
            });
        })
}
export {onUserCaptureScreen, wxJsConfig}