<template>
  <div></div>
</template>

<script>
import { mapMutations } from "vuex"
import request from '@/utils/auth_request'
export default {
  name: 'userInfo',
  props: {
    responseTicket: {
      type: String,
      default: ''
    }
  },
  created() {
    this.getInfoHandler()
  },
  methods: {
     ...mapMutations({
      setDetailSearch: "setDetailSearch"
    }),
    async getInfoHandler() {
      await request.getUserInfoInSSO(this.responseTicket)
      this.$router.replace(decodeURIComponent(this.$route.query.redirect));
    },
  }
}
</script>