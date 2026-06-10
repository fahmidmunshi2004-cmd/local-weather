import { createRouter, createWebHistory } from "vue-router";

import AboutView from "@/views/AboutView.vue";
import DashboardView from "@/views/DashboardView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: DashboardView,
    },
    {
      path: "/about",
      name: "about",
      component: AboutView,
    },
  ],
});

export default router;
