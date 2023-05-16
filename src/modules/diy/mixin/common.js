import {GET_HOME_PAGE} from '../api'
export default {
  computed: {
    compStyle() {
      if (this.itemDef && this.itemDef.style) {
        const style = this.itemDef.style
        let styleObj = {
          margin: `${style.marginTop}px ${style.marginRight}px ${style.marginBottom}px ${style.marginLeft}px`,
          'border-width': style.borderWidth,
          'border-color': style.borderColor || 'transparent',
          'box-shadow': `${style.boxShadowColor} ${style.boxShadow}`,
          'background-color': style.backgroundColor,
          'border-radius': style.borderRadius + 'px'
        }
        return styleObj
      }
      return {}
    },
  },
  methods: {
    /**
     * 跳转函数
     * @param {*} obj 跳转配置对象
     * @param {*} extend 扩展参数
     * extend参数包含的数据：
     * item 点击的数据项
     * query 路由对象query属性
     */
    toLink(obj, extend) {
      let routeObj = {
        query: (extend && extend.query) ? extend.query : {}
      }
      if (obj.pageTitle) {
        routeObj.query.pageTitle = obj.pageTitle
      }
      switch (obj.type) {
        case 'pageId':
          if (!obj.action) return
          routeObj = { ...routeObj, name: 'diy-home', params: { id: obj.action } }
          if (obj.isReplace) {
            this.$router.replace(routeObj)
          } else {
            this.$router.push(routeObj)
          }
          break
        case 'article':
          if (!obj.action) return
          routeObj = { ...routeObj, name: 'publicity-list', params: { id: obj.action } }
          routeObj.query.nocollect = 1
          if (obj.extend && obj.extend.typeId) {
            routeObj.query.typeId = obj.extend.typeId
          }
          if (obj.isReplace) {
            this.$router.replace(routeObj)
          } else {
            this.$router.push(routeObj)
          }
          break
        case 'articleDetail':
          if (obj.extend && obj.extend.detailId) {
            routeObj = { ...routeObj, name: 'publicity-detail', params: { id: obj.extend.detailId } }
            if (obj.isReplace) {
              this.$router.replace(routeObj)
            } else {
              this.$router.push(routeObj)
            }
          }
          break
        case 'video':
          if (!obj.action) return
          routeObj = { ...routeObj, name: 'video-list', params: { itemId: obj.action } }
          if (obj.extend && obj.extend.typeId) {
            routeObj.query.typeId = obj.extend.typeId
          }
          if (obj.isReplace) {
            this.$router.replace(routeObj)
          } else {
            this.$router.push(routeObj)
          }
          break
        case 'videoDetail':
          if (obj.extend && obj.extend.detailId) {
            routeObj = { ...routeObj, name: 'video-detail', params: { id: obj.extend.detailId } }
            if (obj.isReplace) {
              this.$router.replace(routeObj)
            } else {
              this.$router.push(routeObj)
            }
          }
          break
        case 'question':
          if (!obj.action) return
          routeObj = { ...routeObj, name: 'question-list', params: { itemId: obj.action } }
          if (obj.extend && obj.extend.typeId) {
            routeObj.query.typeId = obj.extend.typeId
          }
          if (obj.isReplace) {
            this.$router.replace(routeObj)
          } else {
            this.$router.push(routeObj)
          }
          break
        case 'questionDetail':
          if (obj.extend && obj.extend.detailId) {
            routeObj = { ...routeObj, name: 'question-detail', params: { id: obj.extend.detailId } }
            if (obj.isReplace) {
              this.$router.replace(routeObj)
            } else {
              this.$router.push(routeObj)
            }
          }
          break
        case 'collect':
          routeObj = {
            ...routeObj,
            name: 'publicity-collect',
            query: {
              itemIds: obj.action,
              type: (obj.extend && obj.extend.dataType) ? obj.extend.dataType.join() : ''
            }
          }
          if (obj.isReplace) {
            this.$router.replace(routeObj)
          } else {
            this.$router.push(routeObj)
          }
          break;
        case 'url':
          if (!obj.action) return
          if (obj.action.indexOf('https://') > -1 || obj.action.indexOf('http://') > -1) {
            window.location.href = obj.action
            
          } else {
            if (extend && extend.pageTitle) {
              if (obj.action.indexOf('?') > -1) {
                obj.action += `&pageTitle=${extend.pageTitle}`
              } else {
                obj.action += `?pageTitle=${extend.pageTitle}`
              }
            }
            
            if (obj.isReplace) {
              this.$router.replace(obj.action)
            } else {
              this.$router.push(obj.action)
            }
          }
          
          break
        case 'msg':
          if (!obj.action) return
          window.Toast(obj.action)
          break
        case "event":
          if (!obj.action) return
          if (typeof window[obj.action] === "function") {
            window[obj.action](extend ? extend.item : null)
          }
          break
        case "appId"://跳应用首页，提供应用id
        if (!obj.action) return
          this.$requestJson.post(GET_HOME_PAGE,{appId:obj.action}).then(res => {
            if (res.errcode===0) {
              let pageId = res.data.id
              if (obj.isReplace) {
                this.$router.replace({name: "diy-home", params: {id: pageId}})
              }
              else{
                this.$router.push({name: "diy-home", params: {id: pageId}})
              }
            }
            else{
              this.$toast( "获取应用首页出错：" + res.data.message)
            }
          })
          break
      }
    }
  }
}