const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Builder.vue') },
      { path: '/builder', component: () => import('pages/Index.vue') }
    ]
  },

  // Always leave this as last one
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes