import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import GalleryRoom from "@/views/GalleryRoom.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/gallery",
      name: "gallery-room",
      component: GalleryRoom,
    },
  ],
});

export default router;