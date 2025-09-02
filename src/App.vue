<template>
  <v-app>
    <router-view />

    <div class="paw-trail-layer">
      <div
        v-for="(trail, index) in trails"
        :key="index"
        class="paw"
        :style="{
          top: trail.y + 'px',
          left: trail.x + 'px',
          opacity: trail.opacity,
          transform: `translate(-50%, -50%) rotate(${trail.angle}deg) scale(${trail.scale})`,
        }"
      >
        <img :src="trail.image" alt="paw" />
      </div>
    </div>
  </v-app>
</template>

<script>
import paw1 from "./assets/left.png";
import paw2 from "./assets/right.png";

function throttle(func, wait) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      func.apply(this, args);
    }
  };
}

export default {
  data() {
    return {
      trails: [],
      fadeAnimating: false,
      lastPos: null,
      imageIndex: 0,
      pawImages: [paw1, paw2],
    };
  },
  mounted() {
    this.throttledMouseMove = throttle(this.onMouseMove, 80);
    window.addEventListener("mousemove", this.throttledMouseMove);
    window.addEventListener("mouseleave", this.clearTrails);
  },
  beforeUnmount() {
    window.removeEventListener("mousemove", this.throttledMouseMove);
    window.removeEventListener("mouseleave", this.clearTrails);
  },
  methods: {
    onMouseMove(e) {
      const threshold = 50;
      const currentPos = { x: e.clientX, y: e.clientY };

      if (
        !this.lastPos ||
        Math.hypot(
          currentPos.x - this.lastPos.x,
          currentPos.y - this.lastPos.y
        ) > threshold
      ) {
        let moveAngle = 0;
        if (this.lastPos) {
          const dx = currentPos.x - this.lastPos.x;
          const dy = currentPos.y - this.lastPos.y;
          moveAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
        }

        const randomTilt = Math.random() * 20 - 10;
        const finalAngle = moveAngle + randomTilt;

        const image = this.pawImages[this.imageIndex];

        const stepOffset = 12;
        const rad = (moveAngle - 90) * (Math.PI / 180);
        const offsetX =
          Math.cos(rad) * (this.imageIndex === 0 ? -stepOffset : stepOffset);
        const offsetY =
          Math.sin(rad) * (this.imageIndex === 0 ? -stepOffset : stepOffset);

        // 隨機初始縮放 0.8~1
        const scale = 0.8 + Math.random() * 0.2;

        this.trails.push({
          x: currentPos.x + offsetX,
          y: currentPos.y + offsetY,
          opacity: 1,
          scale,
          angle: finalAngle,
          image,
        });

        if (this.trails.length > 20) {
          this.trails.shift();
        }

        this.imageIndex = (this.imageIndex + 1) % this.pawImages.length;
        this.lastPos = currentPos;

        this.startFade();
      }
    },
    startFade() {
      if (this.fadeAnimating) return;
      this.fadeAnimating = true;

      const fade = () => {
        this.trails = this.trails
          .map((t) => ({
            ...t,
            opacity: t.opacity - 0.03,
            scale: t.scale - 0.002, // 同步縮小
          }))
          .filter((t) => t.opacity > 0);

        if (this.trails.length > 0) {
          requestAnimationFrame(fade);
        } else {
          this.fadeAnimating = false;
        }
      };

      requestAnimationFrame(fade);
    },
    clearTrails() {
      this.trails = [];
      this.fadeAnimating = false;
      this.lastPos = null;
    },
  },
};
</script>

<style>
@media (min-width: 1920px) {
  .v-container {
    max-width: 1500px;
  }
}

#app .v-application {
  background-image: url("@/assets/pp2.jpg");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
}

.paw-trail-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  overflow: visible;
  z-index: 9999;
}

.paw {
  position: absolute;
  user-select: none;
  transform: translate(-50%, -50%);
}
</style>
