<template>
  <v-container fluid>
    <!-- 統計數字卡片 -->
    <v-row dense class="mb-4">
      <v-col cols="12" sm="4" v-if="userPosts.length">
        <v-card class="pa-4" elevation="3">
          <v-row align="center">
            <v-col>
              <div class="headline font-weight-bold">
                {{ animatedTotalPosts }}
              </div>
              <div class="caption grey--text">總貼文數</div>
            </v-col>
            <v-col class="d-flex justify-end">
              <v-icon size="36" color="primary">mdi-post-outline</v-icon>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4" v-if="userPosts.length">
        <v-card class="pa-4" elevation="3">
          <v-row align="center">
            <v-col>
              <div class="headline font-weight-bold">
                {{ animatedTotalClicks }}
              </div>
              <div class="caption grey--text">總點擊數</div>
            </v-col>
            <v-col class="d-flex justify-end">
              <v-icon size="36" color="success"
                >mdi-cursor-default-click-outline</v-icon
              >
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4" v-if="userPosts.length">
        <v-card class="pa-4" elevation="3">
          <v-row align="center">
            <v-col>
              <div class="headline font-weight-bold">
                {{ animatedTotalComments }}
              </div>
              <div class="caption grey--text">總留言數</div>
            </v-col>
            <v-col class="d-flex justify-end">
              <v-icon size="36" color="orange">mdi-comment-outline</v-icon>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- 圖表區 -->
    <v-row dense>
      <v-col cols="12" md="6" v-if="userPosts.length">
        <v-card
          class="pa-4 d-flex flex-column"
          elevation="3"
          style="height: 500px"
        >
          <v-card-title class="headline text-center">貼文分類統計</v-card-title>
          <v-divider class="my-2"></v-divider>
          <div
            class="d-flex justify-center align-center"
            style="flex: 1; width: 100%"
          >
            <pie-chart :posts="userPosts" />
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" v-if="userPosts.length">
        <v-card
          class="pa-4 d-flex flex-column"
          elevation="3"
          style="height: 500px"
        >
          <v-card-title class="headline text-center">留言統計</v-card-title>
          <v-divider class="my-2"></v-divider>
          <div
            class="d-flex justify-center align-center"
            style="flex: 1; width: 100%"
          >
            <bar-chart :posts="userPosts" />
          </div>
        </v-card>
      </v-col>

      <!-- 空狀態提示 -->
      <v-col cols="12" v-if="!userPosts.length">
        <v-card class="pa-4" outlined>
          <v-card-text class="text-center grey--text">
            您目前尚無貼文，請先新增文章。
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import productService from "@/services/article";
import PieChart from "@/components/charts/PieChart.vue";
import BarChart from "@/components/charts/BarChart.vue";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const userPosts = ref([]);
const products = ref([]);

// 動畫數字
const animatedTotalPosts = ref(0);
const animatedTotalClicks = ref(0);
const animatedTotalComments = ref(0);

// 計算總點擊數與總留言數
const totalPosts = computed(() => userPosts.value.length);
const totalClicks = computed(() =>
  userPosts.value.reduce((sum, post) => sum + (post.clickCount || 0), 0)
);
const totalComments = computed(() =>
  userPosts.value.reduce((sum, post) => sum + (post.commentCount || 0), 0)
);

// 動畫函式
const animateNumber = (target, setter, duration = 1000) => {
  let start = 0;
  const stepTime = 20;
  const stepCount = duration / stepTime;
  const increment = target / stepCount;
  const interval = setInterval(() => {
    start += increment;
    if (start >= target) {
      setter(target);
      clearInterval(interval);
    } else {
      setter(Math.floor(start));
    }
  }, stepTime);
};

// // 點擊文章增加 clickCount
// const incrementClick = (post) => {
//   post.clickCount = (post.clickCount || 0) + 1;
// };

// 監聽計算值變化，觸發動畫
watch(totalPosts, (newVal) =>
  animateNumber(newVal, (v) => (animatedTotalPosts.value = v))
);
watch(totalClicks, (newVal) =>
  animateNumber(newVal, (v) => (animatedTotalClicks.value = v))
);
watch(totalComments, (newVal) =>
  animateNumber(newVal, (v) => (animatedTotalComments.value = v))
);

onMounted(async () => {
  const { data } = await productService.get();

  products.value = data.articles.map((post) => ({
    ...post,
    commentCount: post.commentCount || 0,
    clickCount: post.clickCount || 0,
  }));

  // 過濾出登入使用者的貼文
  userPosts.value = products.value.filter(
    (p) => p.user.account === userStore.account
  );
});
</script>
<style scoped></style>

<route lang="yaml">
meta:
  layout: "admin"
  title: "資料紀錄"
  login: "login-only"
  admin: false
</route>
