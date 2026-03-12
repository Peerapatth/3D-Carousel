<template>
  <div class="min-h-screen flex flex-col bg-image">
    <GalleryRoomCarousel class="relative" />
    <CloseIcon class="absolute bottom-[7%] left-1/2 transform -translate-x-1/2 w-[7vh] cursor-pointer" />
  </div>
</template>

<script setup>
import GalleryRoomCarousel from "@/components/GalleryRoomCarousel.vue";
import CloseIcon from "@/elements/CloseIcon.vue";
</script>

<style scoped>
.bg-image {
  background-image: url("@/images/GalleryRoom/GalleryRoomBackground.png");
  background-size: cover;
  background-position: center;
}
</style>
