import login from '../views/login'
const module = 'diy'
const routes = [
  // {
  //   path: '/',
  //   name: 'diy-login',
  //   component: login,
  //   meta: {
  //     title: '',
  //     keepalive:false,
  //   },
  // },
  {
    path: '/diy-login',
    name: 'diy-login',
    component: login,
    meta: {
      title: '',
      keepalive:false,
    }
  },
  {
    path:'/diy-home/:id',
    name:'diy-home',
    component:()=>import ('../views/home'),
    meta: {
      title: '',
      waterMark: true,
      keepalive:false,
    }
  },
  {
    path:'/article-list/:itemId',
    name:'article-list',
    component:()=>import ('../views/articleList.vue'),
    meta: {
      title: '文章',
      // waterMark: true,
      keepalive:false,
      module,
    }
  },
  {
    path:'/question-list/:itemId',
    name:'question-list',
    component:()=>import ('../views/question/list.vue'),
    meta: {
      title: '问题',
      // waterMark: true,
      keepalive:true,
      module,
    }
  },
  {
    path:'/question-detail/:id',
    name:'question-detail',
    component:()=>import ('../views/question/detail.vue'),
    meta: {
      title: '问答详情',
      // waterMark: true,
      keepalive:false,
      module,
    }
  },
  {
    path:'/question-create/:itemId',
    name:'question-create',
    component:()=>import ('../views/question/create.vue'),
    meta: {
      title: '提问',
      // waterMark: true,
      keepalive:false,
      module,
    }
  },
  {
    path:'/video-list/:itemId',
    name:'video-list',
    component:()=>import ('../views/video/list.vue'),
    meta: {
      title: '视频列表',
      waterMark: true,
      keepalive:true,
      module,
    }
  },
  {
    path:'/video-detail/:id',
    name:'video-detail',
    component:()=>import ('../views/video/detail.vue'),
    meta: {
      title: '视频详情',
      waterMark: true,
      keepalive:false
    }
  },
  {
    path:'/video-preview/:id',
    name:'video-preview',
    component:()=>import ('../views/video/detail.vue'),
    meta: {
      title: '视频详情',
      waterMark: true,
      keepalive:false,
      module
    }
  }
]
export default routes
