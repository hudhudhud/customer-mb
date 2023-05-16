import { cookieStorage } from "./index"
const USEKEY = 'user-info'
const TICKETKEY = 'userTicket'

export function getUserInfo() {  
	return cookieStorage.get(USEKEY)
}

export function setUserInfo(v) {  
	return cookieStorage.set(USEKEY, v)
}

export function removeUserInfo(){
  return cookieStorage.remove(USEKEY)
}

export function getUserTicket() {  
	return cookieStorage.get(TICKETKEY)
}

export function setUserTicket(v) {  
	return cookieStorage.set(TICKETKEY, v)
}

export function removeUserTicket(){
  return cookieStorage.remove(TICKETKEY)
}
