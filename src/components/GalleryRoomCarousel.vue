<template>
  <div class="relative w-full h-screen bg-filter">
    <div ref="container" class="w-full h-full touch-pan-y"></div>
      <PreviousIcon @click="prev" class="absolute left-[5%] top-1/2 -translate-y-1/2 w-[7vh] cursor-pointer" />
      <NextIcon @click="next" class="absolute right-[5%] top-1/2 -translate-y-1/2 w-[7vh] cursor-pointer" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import * as THREE from "three";
import CabinetWatson from "@/images/GalleryRoom/CabinetWatson.png";
import CenterLibraryTable from "@/images/GalleryRoom/CenterLibraryTable.png";
import ConsoleTableGala from "@/images/GalleryRoom/ConsoleTableGala.png";
import DiningChairChloe from "@/images/GalleryRoom/DiningChairChloe.png";
import DinningChairSofia from "@/images/GalleryRoom/DinningChairSofia.png";
import PreviousIcon from "@/elements/PreviousIcon.vue";
import NextIcon from "@/elements/NextIcon.vue";

const container = ref(null);
let scene = null;
let camera = null;
let renderer = null;
let cards = [];
const activeIndex = ref(2);
let isDragging = false;
let startX = 0;
let dragDelta = 0;
let scrollUnits = 0;
let velocity = 0;
let lastPointerX = 0;
let lastPointerTime = 0;
let lastTime = 0;

function mod(i, n) {
  return ((i % n) + n) % n;
}

const props = defineProps({
  images: {
    type: Array,
    default: () => [
      { src: CabinetWatson, title: "CabinetWatson" },
      { src: CenterLibraryTable, title: "CenterLibraryTable" },
      { src: ConsoleTableGala, title: "ConsoleTableGala" },
      { src: DiningChairChloe, title: "DiningChairChloe" },
      { src: DinningChairSofia, title: "DinningChairSofia" },
      { src: DinningChairSofia, title: "DinningChairSofia" },
    ],
  },
  invertScroll: {
    type: Boolean,
    default: false,
  },
  dragMultiplier: {
    type: Number,
    default: 1.6,
  },
  swipeMultiplier: {
    type: Number,
    default: 1.3,
  },
  wheelMultiplier: {
    type: Number,
    default: 2.0,
  },
  cardGap: {
    type: Number,
    default: 3.5,
  },
  maxVisible: {
    type: Number,
    default: 5,
  },
});

const emit = defineEmits(["active-change"]);

function createCameraAndRenderer() {
  if (!container.value) return;
  const { clientWidth, clientHeight } = container.value;

  camera = new THREE.PerspectiveCamera(
    45,
    clientWidth / clientHeight,
    0.1,
    1000,
  );
  camera.position.z = 10;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(clientWidth, clientHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;

  container.value.appendChild(renderer.domElement);
}

function init() {
  scene = new THREE.Scene();

  createCameraAndRenderer();

  const loader = new THREE.TextureLoader();
  cards = [];

  const imgs = props.images || [];

  imgs.forEach((img) => {
    const texture = loader.load(img.src);
    texture.encoding = THREE.sRGBEncoding;

    const geometry = new THREE.PlaneGeometry(3.6, 4.6);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = {
      targetX: 0,
      targetZ: 0,
      targetYRot: 0,
    };
    scene.add(mesh);
    cards.push(mesh);
  });

  updatePositions();
}

function updatePositions() {
  if (!cards.length) return;

  const n = cards.length;
  const position = activeIndex.value - scrollUnits;
  const spread = props.cardGap ?? 4.2;
  const depth = -2.2;
  const rotation = -0.6;
  const maxVis = Math.max(1, Math.min(n, props.maxVisible ?? 5));
  const half = Math.floor(maxVis / 2);
  const center = mod(Math.round(position), n);

  cards.forEach((card, i) => {
    const raw = i - position;
    const diff = mod(raw + n / 2, n) - n / 2;
    const idxDiff = mod(i - center + n / 2, n) - n / 2;

    if (Math.abs(idxDiff) <= half) {
      card.userData.targetX = diff * spread;
      card.userData.targetZ = Math.abs(diff) * depth;
      card.userData.targetYRot = diff * rotation;
      const opacity = THREE.MathUtils.clamp(1 - Math.abs(diff) * 0.35, 0.15, 1);
      card.material.opacity = opacity;
      card.material.transparent = true;
      card.visible = true;
    } else {
      const side = idxDiff > 0 ? 1 : -1;
      card.userData.targetX = side * (spread * (half + 1) + 6);
      card.userData.targetZ = -10;
      card.userData.targetYRot = 0;
      card.material.opacity = 0;
      card.material.transparent = true;
      card.visible = false;
    }
  });
}

watch(activeIndex, (v) => emit("active-change", v));

function animate() {
  if (!renderer || !scene || !camera) return;
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt = lastTime ? (now - lastTime) / 1000 : 0;
  lastTime = now;

  if (!isDragging) {
    scrollUnits += velocity * dt;
    const damping = 6;
    velocity -= velocity * Math.min(1, damping * dt);
    if (Math.abs(velocity) < 0.001) velocity = 0;
    if (cards.length) {
      const n = cards.length;
      const position = activeIndex.value - scrollUnits;
      const newActive = mod(Math.round(position), n);
      if (newActive !== activeIndex.value) {
        const prevPosition = position;
        let shiftedActive = newActive;
        while (shiftedActive - prevPosition > n / 2) shiftedActive -= n;
        while (shiftedActive - prevPosition < -n / 2) shiftedActive += n;
        activeIndex.value = newActive;
        scrollUnits = shiftedActive - prevPosition;
      }
    }
  }

  updatePositions();
  const ease = 0.2;
  cards.forEach((card) => {
    const tx = card.userData.targetX ?? card.position.x;
    const tz = card.userData.targetZ ?? card.position.z;
    const tr = card.userData.targetYRot ?? card.rotation.y;

    card.position.x += (tx - card.position.x) * ease;
    card.position.z += (tz - card.position.z) * ease;
    card.rotation.y += (tr - card.rotation.y) * ease;
  });

  if (!isDragging && velocity === 0) {
    if (Math.abs(scrollUnits) > 0.001) scrollUnits *= 0.6;
    if (Math.abs(scrollUnits) < 0.001) scrollUnits = 0;
  }

  renderer.render(scene, camera);
}

function onResize() {
  if (!container.value || !camera || !renderer) return;
  const { clientWidth, clientHeight } = container.value;
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(clientWidth, clientHeight);
}

function onPointerDown(e) {
  if (!container.value) return;
  isDragging = true;
  startX = e.clientX;
  dragDelta = 0;
  lastPointerX = e.clientX;
  lastPointerTime = performance.now();
  velocity = 0;
  try {
    container.value.setPointerCapture?.(e.pointerId);
  } catch (e) {}
}

function onPointerMove(e) {
  if (!isDragging) return;
  const now = performance.now();
  const dt = Math.max(1, now - lastPointerTime);
  const dx = e.clientX - lastPointerX;
  const width = container.value?.clientWidth || window.innerWidth || 1;
  const dragMul = props.dragMultiplier ?? 1;
  velocity = (dx / width / (dt / 1000)) * dragMul;
  lastPointerX = e.clientX;
  lastPointerTime = now;

  dragDelta = e.clientX - startX;
  scrollUnits = (dragDelta / (container.value.clientWidth || 1)) * dragMul;
}

function onPointerUp(e) {
  if (!isDragging) return;
  isDragging = false;
  try {
    container.value.releasePointerCapture?.(e.pointerId);
  } catch (e) {}
  const width = container.value?.clientWidth || 0;
  const minSwipe = width * 0.02;
  if (Math.abs(dragDelta) < minSwipe) {
    scrollUnits = Math.round(scrollUnits);
    velocity = 0;
  } else {
    velocity *= props.swipeMultiplier ?? 1;
  }
}

function onWheel(e) {
  if (!container.value) return;
  e.preventDefault();
  const width = container.value.clientWidth || window.innerWidth || 1;
  const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
  const direction = props.invertScroll ? -1 : 1;
  const units = (-delta / width) * direction * (props.wheelMultiplier ?? 1);
  scrollUnits += units;
  velocity = -units * 8;
  lastTime = performance.now();
}

function prev() {
  if (!cards.length) return;
  const n = cards.length;
  const prevIndex = mod(activeIndex.value - 1, n);
  activeIndex.value = prevIndex;
  // ensure scrollUnits resets so updatePositions computes targets from the new active
  scrollUnits = 0;
  velocity = 0;
}

function next() {
  if (!cards.length) return;
  const n = cards.length;
  const nextIndex = mod(activeIndex.value + 1, n);
  activeIndex.value = nextIndex;
  scrollUnits = 0;
  velocity = 0;
}

onMounted(() => {
  if (!container.value) return;
  init();

  container.value.addEventListener("pointerdown", onPointerDown);
  container.value.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);
  window.addEventListener("resize", onResize);

  animate();
});

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
  window.removeEventListener("pointercancel", onPointerUp);

  if (container.value)
    container.value.removeEventListener("pointerdown", onPointerDown);
  if (container.value) container.value.removeEventListener("wheel", onWheel);

  if (renderer) {
    renderer.forceContextLoss();
    renderer.domElement && renderer.domElement.remove();
  }

  cards.forEach((c) => {
    try {
      c.geometry && c.geometry.dispose();
      if (c.material) {
        if (c.material.map) c.material.map.dispose();
        c.material.dispose();
      }
      scene && scene.remove(c);
    } catch (e) {}
  });
  cards = [];
});
</script>

<style scoped>
.bg-filter {
  backdrop-filter: blur(16px)
}
</style>