<template>
  <iframe :src="url" style="width:100vw;height:100vh;"></iframe>
</template>

<script>
import { storage ,setDocumentTitle, isQW } from "@/utils";
export default {
  data() {
    return {
      url: ''
    }
  },
  beforeRouteEnter(to, from, next){
    next(vm => {
      vm.url = sessionStorage.getItem('docUrl') || ''
      setDocumentTitle(to.query.title)
    })
  },
  beforeRouteLeave(to,from,next){
    sessionStorage.removeItem('docUrl')
    next()
  }
}
</script>