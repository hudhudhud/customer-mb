// @ts-ignore
import Cookies from 'js-cookie'

/**
 * 判断对象为空
 * @param v
 * @return {boolean}
 */
const isEmpty = (v) => {
    if (typeof v === 'undefined') {
        return true
    }
    if (v === undefined || v === 'undefined') {
        return true
    }
    if (v === null) {
        return true
    }
    if (v === '' || v === 'null') {
        return true
    }
    if (v === 0) {
        return true
    }
    switch (typeof v) {
			case 'string' :
				if (v.trim().length === 0) {
						return true
				}
				break
			case 'boolean' :
				if (!v) {
						return true
				}
				break
			case 'number' :
				if (v === 0) {
						return true
				}
				break
			case 'object' :
				return undefined !== v.length && v.length === 0
    }
    return false
}

/**
 * 手机号码是否正确
 * @param number 手机号码
 * @return Boolean
 * */
const isMobileNumber = (number) => {
	return /^(13[0-9]|14[579]|15[012356789]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/.test(number)
}

const storage = {
	get(key) {
		try {
			let t = window.localStorage.getItem(key)
			try {
				return JSON.parse(t)
			} catch (e) {
					return t
			}
		} catch (e) {
			console.log(e)
		}
	},
	set(key, val) {
		if (typeof val === 'object') {
				val = JSON.stringify(val)
		}
		window.localStorage.setItem(key, val)
	},
	remove(key){
		window.localStorage.removeItem(key)
	}
}

const cookieStorage = {
	get(key) {
		try {
			let t = Cookies.get(key) 
			try {
				return JSON.parse(t)
			} catch (e) {
				return t
			}
		} catch (e) {
			console.log(e)
		}
	},
	set(key, val, hour=10) {
		let str = val
		if(isObject(val)||isArray(val)){
				str = JSON.stringify(val)
		}
		let expires = new Date(Date.now() + hour * 60 * 60 * 1000)
		Cookies.set(key, str, { expires })
	},
	remove(key){
		Cookies.remove(key)
	}
}
const getFileType = function(ext){
    ext = ext.toLocaleLowerCase()
    let type = {
        'jpg':"image",
        'gif':"image",
        'png':"image",
        'txt':'txt',
        'xls':'excel',
        'xlsx':'excel',
        'doc':'doc',
        'docx':'doc',
        'pdf':'pdf'
    }
    return type[ext]?type[ext]:'txt'
}

const isObject = (v)=>{
    return Object.prototype.toString.call(v) =='[object Object]'
 }
const isArray = (v)=>{
	return Object.prototype.toString.call(v) =='[object Array]'
}
 
// containQW 是否包括企业微信pc端，默认包括
const isPC= (containQW=true)=>{  
     var userAgentInfo = navigator.userAgent;
     var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");  
     var flag = true;  
     for (var v = 0; v < Agents.length; v++) {  
         if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }  
     }  
    //需要排除企微客户端
    if(containQW===false){
        return flag && !isQW()
    }
     return flag;  
 }
 const isIOS= ()=> {
		var ua=navigator.userAgent.toLowerCase();
		// @ts-ignore
		if (ua.match(/iPhone\sOS/i) == "iphone os") {
				return true;
		} else {
				return false;
		}
 }
 //是否为企微
 export const isQW =()=>{
	return  /MicroMessenger/i.test(navigator.userAgent) && /wxwork/i.test(navigator.userAgent)
}
// 防抖
const debounce = function(fn, wait){
	let self = this
	return function() {        
			if(self.timerId !== null) clearTimeout(self.timerId);        
			self.timerId = setTimeout(fn, wait);    
	}
}
// 解析链接参数
const getQueryByName = (name,from = window.location.search) => {
	const queryNameRegex = new RegExp(`[?&]${name}=([^&]*)(&|$)`)
	const queryNameMatch = decodeURIComponent(from).match(queryNameRegex)   
	return queryNameMatch ? decodeURIComponent(queryNameMatch[1]) : '' // 防止中文或特殊符号被编码
}

/**
 * 动态修改 document title
 * @param title
 * */
const setDocumentTitle = (title) => {
	document.title = title || document.title
	let ifr = document.createElement('iframe')
	ifr.onload = function () {
			setTimeout(function () {
					ifr.remove()
			}, 0)
	}
	document.body.appendChild(ifr)
}
const deepClone= (aObject)=>{
	if (!aObject) {
			return aObject;
	}
	if(typeof aObject !=='object'){
			return aObject
	}
	let v;
	let bObject = Array.isArray(aObject) ? [] : {};
	for (let k in aObject) {
			//自身属性
			if(Object.prototype.hasOwnProperty.call(aObject,k)){
					v = aObject[k];
					if(v instanceof File){
							bObject[k] = v
					}
					else if(v instanceof Date) {
							bObject[k] = new Date(v)
					}
					else{
							bObject[k] = (typeof v === "object") ? deepClone(v) : v;
					}
			}
	}
	return bObject;
}
export {
	isEmpty,
	isMobileNumber,
	storage,
	getFileType,
	isPC,
	isIOS,
	isObject,
	debounce,
	getQueryByName,
	cookieStorage,
	setDocumentTitle,
	deepClone
}
