<template>
  <v-container fluid class="h-100 pa-0">
    <div class="admin-bg d-flex align-center justify-center h-100">
      <v-card
        class="pa-12 text-center rounded-xl elevation-10 glass-card"
        max-width="1200"
      >
        <!-- 使用者頭像 -->
        <v-list-item class="usericon flex justify-center">
          <v-avatar size="100">
            <img
              :src="`https://api.dicebear.com/9.x/thumbs/png/seed=${user.account}`"
              alt="avatar"
            />
          </v-avatar>
        </v-list-item>

        <h1 class="text-h3 font-weight-bold mb-4">管理首頁</h1>

        <p class="text-body-1 text-grey-darken-1 mb-2">
          (☞ﾟヮﾟ)☞ 歡迎，<span class="font-weight-bold text-primary">{{
            user.account
          }}</span>
        </p>

        <p class="text-body-1 text-grey-darken-1 mb-2">
          上次登入時間：<span class="font-weight-medium">{{
            formattedLastLogin
          }}</span>
        </p>

        <p class="text-body-1 text-grey-darken-1 mb-6">
          現在時間：<span class="font-weight-medium">{{ currentTime }}</span>
        </p>

        <p class="text-body-1 text-grey-darken-1 mb-6">
          請選擇下方選項進行操作。
        </p>

        <!-- 功能卡片 -->
        <v-row dense justify="center">
          <v-col cols="12" sm="6" md="4">
            <v-card
              class="hover-card text-center feature-card"
              outlined
              rounded="lg"
              :to="'/admin/articles'"
              link
            >
              <v-icon size="50" color="primary" class="mb-3">mdi-post</v-icon>
              <div class="text-subtitle-1 font-weight-medium text-lg">
                貼文管理
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-card
              class="hover-card text-center feature-card"
              outlined
              rounded="lg"
              :to="'/admin/DataRecord'"
              link
            >
              <v-icon size="50" color="info" class="mb-3"
                >mdi-database-clock</v-icon
              >
              <div class="text-subtitle-1 font-weight-medium text-lg">
                資料紀錄
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-card
              class="hover-card text-center feature-card"
              outlined
              rounded="lg"
              :to="'/'"
              link
            >
              <v-icon size="50" color="success" class="mb-3">mdi-home</v-icon>
              <div class="text-subtitle-1 font-weight-medium text-lg">
                回首頁
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useUserStore } from "@/stores/user";

const user = useUserStore();

const formattedLastLogin = ref("");
if (user.lastLogin) {
  formattedLastLogin.value = new Date(user.lastLogin).toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const currentTime = ref("");
let timer = null;

const updateClock = () => {
  currentTime.value = new Date().toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

onMounted(() => {
  updateClock();
  timer = setInterval(updateClock, 1000);
});

onBeforeUnmount(() => {
  clearInterval(timer);
});
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border: 2px solid rgba(255, 255, 255, 0.4);
}
.feature-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  min-height: 200px; /* 統一高度 */
  transition: all 0.3s ease;
  cursor: pointer;
}
@media (max-width: 600px) {
  .feature-card {
    min-height: 140px; /* 手機時縮小卡片高度 */
    padding: 12px; /* 減少內距 */
  }

  .glass-card {
    padding: 16px !important; /* 卡片縮小內距 */
  }

  .usericon v-avatar {
    transform: scale(0.8); /* 頭像縮小 */
  }

  h1 {
    font-size: 1.5rem; /* 標題縮小 */
  }
}
.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.animate-icon {
  animation: zoomIn 0.6s ease;
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.6);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>

<route lang="yaml">
meta:
  layout: "user"
  title: "管理首頁"
  login: "login-only"
  admin: false
</route>
