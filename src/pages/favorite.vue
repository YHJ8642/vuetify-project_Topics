<template>
  <v-container>
    <!-- 搜尋 + 篩選欄 -->
    <v-row class="mb-4" align="center" justify="space-between">
      <v-col cols="12" md="6" class="search-container">
        <v-text-field
          v-model="search"
          label="搜尋收藏"
          prepend-inner-icon="mdi-magnify"
          variant="solo"
          density="comfortable"
          flat
          hide-details
        />
      </v-col>

      <v-col class="d-flex justify-end align-center" cols="12" md="6">
        <v-select
          v-model="selectedCategory"
          :items="categories"
          variant="outlined"
          density="comfortable"
          :menu-props="{ maxHeight: '300' }"
          @click:clear="selectedCategory = '全部'"
          hide-details
          style="
            background-color: white;
            height: 49px;
            opacity: 0.7;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          "
        />
        <v-select
          v-model="sortOrder"
          :items="sortOptions"
          variant="outlined"
          density="comfortable"
          hide-details
          style="
            background-color: white;
            height: 49px;
            opacity: 0.7;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          "
        />
      </v-col>
    </v-row>

    <!-- 收藏卡片列表 -->
    <v-row v-if="displayedProducts.length > 0" ref="listContainer">
      <v-col
        v-for="item in displayedProducts"
        :key="item._id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        class="fade-in"
      >
        <v-card
          elevation="2"
          class="d-flex flex-column card-hover"
          @mouseenter="item.hover = true"
          @mouseleave="item.hover = false"
        >
          <v-img
            :src="item.image"
            height="180"
            class="cursor-pointer img-scale"
            @click="showImage(item.image)"
          />
          <v-card-title class="text-truncate text-center">{{
            item.title
          }}</v-card-title>
          <v-card-subtitle class="text-truncate">
            {{ formatCategories(item.category) }} - {{ item.location }}
          </v-card-subtitle>

          <!-- <v-card-text class="description-text" @click="showDescription(item.description)">
        {{ truncateText(item.description) }}
      </v-card-text> -->

          <!-- 懸停操作按鈕 -->
          <div v-if="item.hover" class="hover-actions">
            <v-btn
              small
              color="primary"
              @click="showDescription(item.description)"
            >
              <v-icon left>mdi-eye</v-icon>查看文章
            </v-btn>
            <v-btn small color="red" @click="removeFavorite(item._id)">
              <v-icon left>mdi-heart-off</v-icon>取消收藏
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 沒有收藏提示 -->
    <div v-else class="empty-state">
      <div class="text-center">
        <v-icon size="64" color="grey">mdi-heart-outline</v-icon>
        <p class="text-h6 text-grey mb-4">目前還沒有收藏</p>
        <v-btn color="primary" rounded to="/">
          <v-icon left>mdi-compass-outline</v-icon>
          去看看
        </v-btn>
      </div>
    </div>

    <!-- 載入中提示 -->
    <div v-if="loading" class="text-center my-4">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- 圖片放大 Dialog -->
    <v-dialog v-model="imageDialog.open" max-width="800px">
      <v-card>
        <v-img :src="imageDialog.src" class="w-100" cover />
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="imageDialog.open = false"
            >關閉</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 文章內容 Dialog -->
    <v-dialog v-model="descDialog.open" max-width="500px">
      <v-card>
        <v-card-title>文章內容</v-card-title>
        <v-card-text>{{ descDialog.text }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="descDialog.open = false"
            >關閉</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script setup>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
} from "vue";
import { useSnackbar } from "vuetify-use-dialog";
import favoriteService from "@/services/favorite";
import { useUserStore } from "@/stores/user";
const user = useUserStore();

const createSnackbar = useSnackbar();
const products = ref([]);
const search = ref("");
const selectedCategory = ref("全部");
const sortOrder = ref("最新收藏");
const pageSize = 12;
const currentPage = ref(1);
const loading = ref(false);

const sortOptions = ["最新收藏", "最舊收藏"];
const categories = ref(["全部"]);

// 過濾、排序後的收藏
const filteredProducts = computed(() => {
  let result = products.value;

  // 搜尋
  if (search.value) {
    const keyword = search.value.toLowerCase();
    result = result.filter((p) =>
      [p._id, p.title, p.description, p.location].some((field) =>
        String(field || "")
          .toLowerCase()
          .includes(keyword)
      )
    );
  }

  // 分類篩選
  if (selectedCategory.value && selectedCategory.value !== "全部") {
    result = result.filter((p) => {
      const postCategories = Array.isArray(p.category)
        ? p.category
        : [p.category];
      return postCategories.includes(selectedCategory.value);
    });
  }

  // 排序
  if (sortOrder.value === "最新收藏") {
    result = result.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  } else {
    result = result.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }

  return result;
});

const displayedProducts = ref([]);

const loadDisplayedProducts = () => {
  const start = 0;
  const end = currentPage.value * pageSize;
  displayedProducts.value = filteredProducts.value.slice(start, end);
};

const hasMore = computed(() => {
  return displayedProducts.value.length < filteredProducts.value.length;
});

function loadMore() {
  if (loading.value || !hasMore.value) return;
  loading.value = true;
  currentPage.value++;
  nextTick(() => {
    loadDisplayedProducts();
    loading.value = false;
  });
}

// 監聽滾動
const listContainer = ref(null);
function handleScroll() {
  if (!listContainer.value) return;
  const container = listContainer.value.$el || listContainer.value;
  const scrollBottom =
    container.scrollHeight - container.scrollTop - container.clientHeight;
  if (scrollBottom < 100) loadMore();
}

// 取得收藏列表
async function getProducts() {
  try {
    const { data } = await favoriteService.getAll();
    products.value = data.favorites.map((f) => ({
      ...f.post,
      favoriteId: f._id,
      hover: false,
    }));
    // 更新收藏數量到全域
    user.setFavorites(products.value.length);

    // 取得分類，不重複並包含全部
    const allCategories = products.value
      .flatMap((p) => (Array.isArray(p.category) ? p.category : [p.category]))
      .filter(Boolean);
    categories.value = ["全部", ...[...new Set(allCategories)]];

    loadDisplayedProducts();
  } catch (error) {
    createSnackbar({
      text: "無法載入收藏資料",
      snackbarProps: { color: "red" },
    });
  }
}

// 刪除收藏
async function removeFavorite(postId) {
  try {
    const fav = products.value.find((p) => p._id === postId);
    if (!fav) return;

    await favoriteService.remove(fav.favoriteId);
    products.value = products.value.filter((p) => p._id !== postId);
    loadDisplayedProducts();

    // 更新收藏數量
    user.setFavorites(products.value.length);

    createSnackbar({ text: "已取消收藏", snackbarProps: { color: "blue" } });
  } catch (error) {
    console.error(error);
    createSnackbar({ text: "取消收藏失敗", snackbarProps: { color: "red" } });
  }
}

// 監聽其他頁面更新
const handleFavoritesUpdated = () => getProducts();
onMounted(() => {
  getProducts();
  window.addEventListener("favoritesUpdated", handleFavoritesUpdated);
  window.addEventListener("scroll", handleScroll);
});
onBeforeUnmount(() => {
  window.removeEventListener("favoritesUpdated", handleFavoritesUpdated);
  window.removeEventListener("scroll", handleScroll);
});

// Dialog 管理
const imageDialog = ref({ open: false, src: "" });
function showImage(src) {
  imageDialog.value.src = src;
  imageDialog.value.open = true;
}

const descDialog = ref({ open: false, text: "" });
function showDescription(text) {
  descDialog.value.text = text || "(沒有文章)";
  descDialog.value.open = true;
}

// 文字截斷
function truncateText(text) {
  if (!text) return "";
  return text.length > 50 ? text.slice(0, 50) + "..." : text;
}
function formatCategories(category) {
  if (!category) return "";
  // 如果是陣列就 join，用逗號分隔；如果是字串就直接回傳
  return Array.isArray(category) ? category.join("、") : category;
}

// 搜尋或篩選變化時回到第一頁
watch([search, selectedCategory, sortOrder], () => {
  currentPage.value = 1;
  loadDisplayedProducts();
});
</script>

<style scoped>
/* 卡片漸入 */
.fade-in {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.5s forwards;
  animation-delay: calc(var(--v-col-index, 0) * 0.05s); /* 可以做延遲錯開效果 */
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 圖片懸停放大 */
.img-scale {
  transition: transform 0.3s ease;
}
.img-scale:hover {
  transform: scale(1.1);
}

/* 懸停按鈕 */
.card-hover {
  position: relative;
}

.hover-actions {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  transition: opacity 0.3s;
}

.description-text {
  cursor: pointer;
  color: #26a69a;
  text-decoration: underline;
}

.cursor-pointer {
  cursor: pointer;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh; /* 高度調整成你想要的置中效果 */
}
.v-container {
  padding-top: 30px; /* 增加上方的空間 */
}
.search-container .v-text-field {
  background-color: #ffffff;
  opacity: 0.7;
  border-radius: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
}
.v-row {
  margin-bottom: 20px;
}
.v-select {
  border-radius: 8px;
  margin-right: 10px;
  max-width: 250px;
}
</style>
<route lang="yaml">
meta:
  # 標題
  title: "我的收藏"
  # 有沒有登入都能看
  login: ""
  # 不是管理員也能看
  admin: false
</route>
