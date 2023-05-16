export function wxChooseUser({mode='single',selectedUserIds=[]},cb){
    try {
        wx.invoke("selectEnterpriseContact", {
            "fromDepartmentId": 0,// 必填，表示打开的通讯录从指定的部门开始展示，-1表示自己所在部门开始, 0表示从最上层开始
            "mode": mode,// 必填，选择模式，single表示单选，multi表示多选
            "type": ["user"],// 必填，选择限制类型，指定department、user中的一个或者多个
            "selectedUserIds":selectedUserIds// 非必填，已选用户ID列表。用于多次选人时可重入，single模式下请勿填入多个id
        },function(res){
            if (res.err_msg == "selectEnterpriseContact:ok") {
                if(typeof res.result == 'string') {
                    res.result = JSON.parse(res.result) //由于目前各个终端尚未完全兼容，需要开发者额外判断result类型以保证在各个终端的兼容性
                }
                var selectedUserList = res.result.userList; // 已选的成员列表
                if(typeof cb == 'function'){
                    cb(selectedUserList)
                }
            }
        });
    } catch(e) {
        console.log('微信js-sdk需要真机调试')
    }
}

export function toLink(obj, router) {
    switch(obj.type) {
        case 'pageId':
            if (obj.isReplace) {
                router.replace({name: 'diy-page', params: {pageid: obj.action}})
            } else {
                router.push({name: 'diy-page', params: {pageid: obj.action}})
            }
            break
        case 'article':
            if (obj.isReplace) {
                router.replace({name: 'article-list', query: {id: obj.action}})
            } else {
                router.push({name: 'article-list', query: {id: obj.action}})
            }
            break
        case 'video':
            if (obj.isReplace) {
                router.replace({name: 'video-list', query: {id: obj.action}})
            } else {
                router.push({name: 'video-list', query: {id: obj.action}})
            }
            break
        case 'question':
            if (obj.isReplace) {
                router.replace({name: 'question-list', query: {id: obj.action}})
            } else {
                router.push({name: 'question-list', query: {id: obj.action}})
            }
            break
        case 'url':
            window.location.href = obj.action
            break
        case 'msg':
            window.Toast(obj.action)
            break 
    }
}