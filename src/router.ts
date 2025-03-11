import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import AppContainerView from './views/AppContainerView.vue';
import WikiListTab from './components/tabs/WikiListTab.vue';
import StockListTab from './components/tabs/StockListTab.vue';
import NumberGeneratorTab from './components/tabs/NumberGeneratorTab.vue';
import StockGeneratorTab from './components/tabs/StockGeneratorTab.vue';
import StorageTab from './components/tabs/StorageTab.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AppContainerView,
    meta: {
      viewMode: StockListTab,
    },
    children: [
      {
        path: 'stock',
        redirect: '/',
        meta: {
          viewMode: StockListTab,
        },
      },
      {
        path: 'wiki',
        component: AppContainerView,
        meta: {
          viewMode: WikiListTab,
        },
      },
      {
        path: 'numgen',
        component: AppContainerView,
        meta: {
          viewMode: NumberGeneratorTab,
        },
      },
      {
        path: 'stockgen',
        component: AppContainerView,
        meta: {
          viewMode: StockGeneratorTab,
        },
      },
      {
        path: 'storage',
        component: AppContainerView,
        meta: {
          viewMode: StorageTab,
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
