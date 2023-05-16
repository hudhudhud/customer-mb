import PbLogin from '../views/publicity-login'
let module='publicity'
let route = [
    {
        path: '/publicity-login',
        name: 'publicity-login',
        component: PbLogin,
        meta: {
            title: "正在登录...",
            keepalive: false,
            module,
        }
    },
    {
        path: '/publicity-index',
        name: 'publicity-index',
        component: ()=>import('../views/publicity-index'),
        meta: {
            title: "宣传专栏",
            keepalive:true,
            module,
        }
    },
    {
        path: '/publicity-list/:id',
        name: 'publicity-list',
        component: ()=>import('../views/publicity-list'),
        meta: {
            title: "",
            keepalive: true,
            module,
        }

    },
    {
        path: '/publicity-detail/:id',
        name: 'publicity-detail',
        component: ()=>import('../views/publicity-detail'),
        meta: {
            title: "",
            keepalive: false,
            waterMark:true
        }
    },
    {
        path: '/publicity-preview/:id',
        name: 'publicity-preview',
        component: ()=>import('../views/publicity-detail'),
        meta: {
            title: "",
            keepalive: false,
            waterMark:true
        }
    },
    {
        path: '/publicity-check-list/:type',
        name: 'publicity-check-list',
        component: ()=>import('../views/publicity-check-list'),
        meta: {
            keepalive: true,
            waterMark:true,
            title: "消息群发审核",
        }
    },
    {
        path: '/publicity-check-detail/:type/:id',
        name: 'publicity-check-detail',
        component: ()=>import('../views/publicity-check-detail'),
        meta: {
            title: "",
            keepalive: true,
            waterMark:true,
            title: "消息群发审核详情",
        }
    },
    {
        path: '/publicity-userInfo',
        name: 'publicity-userInfo',
        component: ()=>import('../views/userInfo'),
        meta: {
            title: '用户信息详情',
            waterMark: true,
        },
        props: (route) => ({ responseTicket: route.query.ResponseTicket })
    },
    {
        path: '/publicity-tech-list',
        name: 'publicity-tech-list',
        component: ()=>import('../views/publicity-tech-list'),
        meta: {
            title: "技服情报局",
            keepalive: true,
        }

    },
    {
        path: '/publicity-search/:id',
        name: 'publicity-search',
        component: ()=>import('../views/search'),
        meta: {
            title: "搜索",
            keepalive: true,
            waterMark: true,
        }

    },
    {
        path: '/publicity-collect',
        name: 'publicity-collect',
        component: ()=>import('../views/collect'),
        meta: {
            title: "我的收藏",
            keepalive: true,
            waterMark: true,
        }
    },
    {
        path: '/publicity-iframe',
        name: 'publicity-iframe',
        component: ()=>import('../views/iframe'),
        meta: {
            title: "",
            keepalive: false,
            waterMark: true,
        }
    },
    {
        path: '/publicity-public-list/:id',
        name: 'publicity-public-list',
        component: ()=>import('../views/publicity-public-list'),
        meta: {
            title: "公开的文章",
            keepalive: true,
        }

    },
]
export default route