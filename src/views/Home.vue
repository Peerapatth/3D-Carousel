<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat"
    :style="{ backgroundImage: `url(${homeBackground})` }"
  >
    <div class="-translate-y-10 md:-translate-y-12 flex flex-col items-center gap-4">
      <h1
        class="m-0 text-center font-arizonia text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.1] text-white drop-shadow-[0_8px_22px_rgba(0,0,0,0.45)]"
      >
        The Thailand Gallery
      </h1>
    </div>
    <div class="absolute bottom-[10%] flex flex-col items-center">
      <button
        type="button"
        @click="goToGallery"
        class="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(93.01deg,_rgba(207,179,151,0.6)_0%,_rgba(141,71,17,0.6)_100%)] px-8 py-3 text-base font-semibold tracking-[0.01em] text-white backdrop-blur-[6px] transition duration-200 ease-out hover:-translate-y-0.5 hover:brightness-110 hover:border-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        aria-label="Explore The Thailand Gallery"
      >
        <ExploreIcon class="h-5 w-5" />
        <span>Explore</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import homeBackground from "@/images/HomeBackground.jpg";
import ExploreIcon from "@/elements/ExploreIcon.vue";

const router = useRouter();

function goToGallery() {
  router.push({ name: "gallery-room" });
}
</script>
