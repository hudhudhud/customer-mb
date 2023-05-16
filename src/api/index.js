const SSOLOGIN = process.env.VUE_APP_SSO_URL + '/rest/ws/p/S008/GetWF/api/wrapper/login' // sso单点登录
const GET_ADDRESSBOOK_ALL =  process.env.VUE_APP_WXAPP_BASE_URL + '/outside/sys/employee/get/addressbook' //获取全员通讯录
const ENCODE_UID = process.env.VUE_APP_SSO_URL + '/test/encodeData' //域账号加密
const UPLOAD_URL = process.env.VUE_APP_MICROAPP_URL + '/outside/file/upload' //文件上传
const DEL_FILE_URL = process.env.VUE_APP_MICROAPP_URL + '/outside/file/remove' //删除已上传文件
const TYPE_INFO_URL = process.env.VUE_APP_MICROAPP_URL + '/outside/diy/data/public/getType' //删除已上传文件
const COLLECT_LIST = process.env.VUE_APP_MICROAPP_URL + '/outside/diy/data/collect/latest' //最新收藏列表（包含文章、视频、问答）
export {
    SSOLOGIN,
    GET_ADDRESSBOOK_ALL,
    ENCODE_UID,
    UPLOAD_URL,
    DEL_FILE_URL,
    TYPE_INFO_URL,
    COLLECT_LIST,
}