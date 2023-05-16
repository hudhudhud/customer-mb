import request from '@/utils/auth_request'
/**
 * 栏目列表
 * @returns 
 */
export function items() {
  return request.post(process.env.VUE_APP_MICROAPP_URL + '/outside/item/item', {oid: 1})
}
/**
 * 根据id获取栏目名称
 * @returns 
 */
export function itemName(id) {
  return request.post(process.env.VUE_APP_MICROAPP_URL + '/outside/item/item/id', {id})
}
/**
 * 栏目分类
 * itemId 栏目id
*/
export function types(itemId) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/article/type', { itemId })
}

/**
 * 获取当前分类的完整路径（用于pc端配置跳转链接可以指定分类）
 * 参数 itemId 栏目id
 * 参数 id 分类id
*/
export function typePath(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/article/typePath', data)
}

/**
 *文章列表（包含文件夹即分类）
 * itemId 栏目id
 * typeId  栏目分类id
*/
export function articleList(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/article/list', data)
}
// 文章搜索
export function articleSearch(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/article/query', data)
}
// 文章详情
export function detail(id) {
  return request.post(process.env.VUE_APP_MICROAPP_URL + '/outside/article/detail', { id })
}
// 文章预览详情
export function detailPreview(infoId) {
  return request.post(process.env.VUE_APP_MICROAPP_URL + '/outside/article/check/preview', { infoId })
}
//更新文章阅读时间
export function readSituation(data) {
  return request.post(process.env.VUE_APP_MICROAPP_URL + '/outside/article/situation', data)
}
//文章点赞
export function approve(data) {
  return request.post(process.env.VUE_APP_MICROAPP_URL + '/outside/article/approve', data)
}
//文章分享
export function share(id) {
  return request.post(process.env.VUE_APP_MICROAPP_URL + '/outside/article/share', {id})
}
// 文章收藏
export function collect(data) {
  return request.post(process.env.VUE_APP_MICROAPP_URL + '/outside/article/collect', data)
}

// 收藏列表
export function collectList(data) {
  return request.post(process.env.VUE_APP_MICROAPP_URL + '/outside/article/collect/list', data)
}


// 评论列表
export function commentList(infoId,data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/article/comment/list', {infoId,...data})
}
// 点赞评论
export function commentApprove(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/article/comment/approve', data)
}
// 置顶评论
export function commentUp(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/article/comment/tipped', data)
}
// 添加评论
export function commentAdd(infoId,data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/article/comment/add', {infoId,...data})
}


/**
 * 待审核列表
*/
export function checkList(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/article/check/list', data)
}
// 审核详情
export function checkDetail(id) {
  return request.post(process.env.VUE_APP_MICROAPP_URL + '/outside/article/check/detail', {id})
}
// 审核
export function checkEdit(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/article/check/edit', data)
}

// 获取云文档链接
export function IdocUrl(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/article/idoc/url', data)
}


/**
 * 技服情报局-栏目分类
*/
export function technicalItems() {
  return request.get(process.env.VUE_APP_MICROAPP_URL + '/outside/article/public/technical/items')
}
//技服情报局-栏目分类
export function technicalList(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/article/public/technical/list', data)
}


//热门文章（浏览次数最多）
export function articleHot(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/diy/data/article/popular', data)
}
//最新文章
export function articleNew(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/diy/data/article/latest', data)
}
//星标文章
export function articleStar(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/diy/data/article/star', data)
}

/**
 * 公共文章-栏目分类
*/
export function publicItems(id) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/article/public/public/items', { id })
}
//公共文章-列表
export function publicList(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/article/public/public/list', data)
}

//下载云文档
export function getDownLoadUrl(data) {
  return request.post_auto(process.env.VUE_APP_MICROAPP_URL + '/outside/article/idoc/download/url', data)
}