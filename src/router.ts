// src/router.ts
import { createRouter, createWebHistory } from 'vue-router';
import tareasInterfaz from './layouts/tareasInterfaz.vue';

const routes = [
  {
    path: '/',
    name: 'tareasInterfaz',
    component: tareasInterfaz,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
