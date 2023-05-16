import request from '@/utils/auth_request'
/**
 * 视频列表
 * @returns 
 */
export function videoList(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/video/list', data)
}
/**
 * 视频所有分类
 * @returns 
 */
export function videoAllTypes(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/video/allTypes', data)
}
/**
 * 视频所有标签
 * @returns 
 */
export function videoTags(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/video/tags', data)
}
/**
 * 最新视频
 * @returns 
 */
export function videoLatest(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/diy/data/video/latest', data)
}
/**
 * 最热视频
 * @returns 
 */
export function videoPopular(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/diy/data/video/popular', data)
}
/**
 * 视频单层分类
 * @returns 
 */
export function videoTypes(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + 'outside/video/types', data)
}
/**
 * 视频详情
 * @returns 
 */
export function videoDetail(id) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/video/detail', {id})
}
/**
 * 评论列表
 * @returns 
 */
export function commentList(videoId,data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/video/comment/list', {videoId,...data})
}
/**
 * 添加评论
 * @returns 
 */
export function commentAdd(videoId,data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/video/comment/add', {videoId,...data})
}

/**
 * 播放记录
 * @returns 
 */
export function videoPlay(data) {
  return request.post(process.env.VUE_APP_MICROAPP_URL + '/outside/video/play', data)
}
/**
 * 视频/(取消)点赞
 * @returns 
 */
export function videoApprove(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/video/approve', data)
}

/**
 * 视频/(取消)收藏
 * @returns 
 */
export function videoCollect(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/video/collect', data)
}
/**
 * 视频/分享
 * @returns 
 */
export function videoShare(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/video/share', data)
}
/**
 * 评论/(取消)点赞
 * @returns 
 */
export function commentApprove(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/video/comment/approve', data)
}
/**
 * 评论/(取消)置顶
 * @returns 
 */
export function commentUp(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/video/comment/tipped',  data)
}

/**
 * 视频/播放进度
 * @returns 
 */
export function videoProgress(data) {
  return request.post(process.env.VUE_APP_MICROAPP_URL + '/outside/video/progress',  data)
}

/**
 * 收藏/列表
 * @returns 
 */
export function collectList(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/video/collect/list',  data)
}


/**
 * 待审核列表
*/
export function checkList(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/video/check/list', data)
}
// 审核详情
export function checkDetail(id) {
  return request.post(process.env.VUE_APP_MICROAPP_URL + '/outside/video/check/detail', {id})
}
// 审核
export function checkEdit(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/video/check/edit', data)
}
/**
 * 审核视频预览
 * @returns 
 */
export function videoPreview(infoId) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/video/check/preview', {infoId})
}