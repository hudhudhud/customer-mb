import request from '@/utils/auth_request'
/**
 * 标签列表
 * @returns 
 */
export function tags(itemId) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/faq/tags', {itemId})
}

/**
 * 分类列表
 * @returns 
 */
export function types(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/faq/types', data)
}

/**
 * 全部分类列表
 * @returns 
 */
export function allTypes(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/faq/allTypes', data)
}

/**
 * 根据分类id获取分类信息
 * @returns 
 */
export function typeInfo(id) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/diy/data/public/getType', {id, mode: 2})
}

/**
 * 新建问答
 * @returns 
 */
export function create(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/faq/create', data)
}

/**
 * 问答列表
 * @returns 
 */
export function questionList(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/faq/list', data)
}

/**
 * 分享计数
 * @returns 
 */
export function share(id) {
  return request.post(process.env.VUE_APP_MICROAPP_URL + '/outside/faq/share', {id})
}

/**
 * (取消)点赞
 * collected: 0取消 1收藏
 * @returns 
 */
export function approve(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/faq/approve', data)
}

/**
 * (取消)收藏
 * @returns 
 */
export function collect(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/faq/collect', data)
}

/**
 * 问答详情
 * @returns 
 */
export function detail(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/faq/detail', data)
}

/**
 * 回复问题
 * @returns 
 */
export function answerCreate(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/faq/answer/create', data)
}

/**
 * (取消)点赞 回答
 * @returns 
 */
export function answerApprove(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/faq/answer/approve', data)
}

/**
 * 最新问答
 * @returns 
 */
export function questionNew(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/diy/data/faq/latest', data)
}

/**
 * 热门问答
 * @returns 
 */
export function questionHot(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/diy/data/faq/popular', data)
}

/**
 * 收藏列表
 * @returns 
 */
export function collectList(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/faq/collect/list', data)
}

/**
 * 收藏列表-删除
 * @returns 
 */
export function collectReomove(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/faq/collect/remove', data)
}