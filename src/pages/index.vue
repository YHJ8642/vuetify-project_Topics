<template>
  <v-container>
    <!-- 工具列 -->
    <v-row align="center" class="mb-4" justify="space-between">
      <v-col
        cols="12"
        md="6"
        class="search-container"
        style="padding-right: 25px"
      >
        <v-text-field
          v-model="search"
          density="comfortable"
          flat
          hide-details
          placeholder="搜尋貼文"
          prepend-inner-icon="mdi-magnify"
          variant="solo"
          @update:model-value="resetFeed"
        />
      </v-col>
      <v-col
        class="d-flex justify-end align-center"
        cols="12"
        md="6"
        style="padding-right: 25px"
      >
        <v-select
          v-model="selectedCategory"
          density="comfortable"
          :items="['全部', ...categoryOptions]"
          variant="outlined"
          @update:model-value="resetFeed"
          hide-details
          style="
            background-color: white;
            height: 49px;
            opacity: 0.7;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          "
        />
        <v-select
          v-model="selectedSort"
          class="ml-2"
          density="comfortable"
          item-title="text"
          item-value="key"
          :items="sortOptions"
          variant="outlined"
          @update:model-value="resetFeed"
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

    <!-- 載入中 -->
    <div v-if="loading && visiblePosts.length === 0" class="loading-overlay">
      <v-progress-circular color="primary" indeterminate size="48" />
    </div>

    <!-- 提示與貼文列表 -->
    <div v-else style="position: relative">
      <transition name="fade">
        <v-alert
          v-if="filteredProducts.length === 0 && !loading"
          border="start"
          class="mb-6"
          color="teal"
          prominent
          style="width: 100%"
          type="info"
          variant="tonal"
        >
          <v-icon start>mdi-information-outline</v-icon>
          沒有符合條件的貼文
        </v-alert>
      </transition>

      <transition name="fade">
        <v-row v-if="visiblePosts.length > 0" style="width: 100%">
          <v-col
            v-for="post in visiblePosts"
            :id="`post-${post._id}`"
            :key="post._id"
            cols="12"
            md="6"
            lg="4"
          >
            <v-card class="pa-0" elevation="2" style="position: relative">
              <!-- 顯示前三名標籤圖示 -->
              <template v-if="topCommentIds.includes(post._id)">
                <v-icon
                  v-if="topCommentIds.indexOf(post._id) === 0"
                  color="#FFD700"
                  size="50"
                  style="position: absolute; top: 8px; right: 8px"
                  class="mdi-crown"
                  >mdi-crown</v-icon
                >
                <v-icon
                  v-if="topCommentIds.indexOf(post._id) === 1"
                  color="#C0C0C0"
                  size="50"
                  style="position: absolute; top: 8px; right: 8px"
                  class="mdi-crown silver"
                  >mdi-crown</v-icon
                >
                <v-icon
                  v-if="topCommentIds.indexOf(post._id) === 2"
                  color="#B87333"
                  size="50"
                  style="position: absolute; top: 8px; right: 8px"
                  class="mdi-crown bronze"
                  >mdi-crown</v-icon
                >
              </template>

              <!-- 作者資訊 -->
              <v-card-title class="d-flex align-center">
                <v-list>
                  <v-list-item
                    :prepend-avatar="`https://api.dicebear.com/9.x/thumbs/png/seed=${post.user.account}`"
                  />
                </v-list>
                <div>
                  <div class="font-weight-bold">
                    {{ post.user.account || "匿名用戶" }}
                  </div>
                  <div class="text-caption grey--text">
                    {{ new Date(post.createdAt).toLocaleString() }}
                  </div>
                </div>
              </v-card-title>

              <!-- 文章標題 -->
              <v-card-subtitle
                @click="
                  openDialog(post);
                  incrementClick(post);
                "
                class="text-h6"
                style="cursor: pointer; color: #26a69a"
              >
                {{ post.title }}
              </v-card-subtitle>

              <!-- 內容預覽 -->
              <v-card-text class="pa-0">
                <v-img
                  v-if="post.image"
                  class="post-image"
                  cover
                  :src="post.image"
                  style="cursor: zoom-in"
                  @click="
                    openImageDialog(post.image);
                    incrementClick(post);
                  "
                />
                <div class="text-body-2 pa-4">
                  {{ truncatedText(post.content) }}
                </div>
              </v-card-text>

              <!-- 按鈕 -->
              <v-divider />
              <v-card-actions>
                <v-btn
                  icon
                  :loading="favoriteLoading[post._id]"
                  @click="toggleFavorite(post)"
                >
                  <v-icon
                    :color="
                      userStore.isLoggedIn && isFavorite(post._id)
                        ? 'red'
                        : undefined
                    "
                  >
                    {{
                      userStore.isLoggedIn && isFavorite(post._id)
                        ? "mdi-heart"
                        : "mdi-heart-outline"
                    }}
                  </v-icon>
                </v-btn>

                <v-badge
                  v-if="post.commentCount > 0"
                  :content="post.commentCount"
                  color="primary"
                  overlap
                  bordered
                >
                  <v-btn icon @click="openCommentDialog(post)">
                    <v-icon>mdi-comment-outline</v-icon>
                  </v-btn>
                </v-badge>

                <v-btn v-else icon @click="openCommentDialog(post)">
                  <v-icon>mdi-comment-outline</v-icon>
                </v-btn>

                <v-btn icon>
                  <v-icon>mdi-share-outline</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </transition>
    </div>

    <!-- 無限滾動觸發點 -->
    <div ref="loadMoreTrigger" class="text-center py-4">
      <v-progress-circular
        v-if="loading && visiblePosts.length > 0"
        color="primary"
        indeterminate
      />
    </div>

    <!-- 文章詳細資訊 Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="headline title-wrap">{{
          selectedPost?.title
        }}</v-card-title>
        <v-card-text>
          <div>
            <strong>來源:</strong> {{ selectedPost?.location || "無來源資訊" }}
          </div>
          <div>
            <strong>文章:</strong>
            <div>{{ selectedPost?.description || "無描述" }}</div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="closeDialog">關閉</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 圖片放大 Dialog -->
    <v-dialog v-model="imageDialog" max-width="800px">
      <v-card>
        <v-img class="w-100" cover :src="selectedImage" />
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="imageDialog = false">關閉</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 留言 Dialog -->
    <v-dialog v-model="commentDialog" max-width="500px">
      <v-card>
        <v-card-title class="headline"
          >{{ selectedCommentsPost?.title }} 的留言</v-card-title
        >
        <v-card-text>
          <div v-if="comments.length" class="comment-list">
            <v-list>
              <v-list-item
                v-for="(comment, index) in comments"
                :prepend-avatar="`https://api.dicebear.com/9.x/thumbs/png/seed=${
                  comment.user.account || 'anonymous'
                }`"
                :key="index"
                :style="{
                  backgroundColor: getUserColor(comment.user.account),
                  padding: '8px',
                  borderRadius: '8px',
                  marginBottom: '4px',
                }"
              >
                <v-list-item>
                  <div>
                    <v-list-item-title class="font-weight-bold">
                      {{ comment.user.account || "匿名用戶" }}
                      <span
                        class="text-caption grey--text"
                        style="margin-left: 8px"
                        >{{
                          new Date(comment.createdAt).toLocaleString()
                        }}</span
                      >
                    </v-list-item-title>
                    <v-list-item-subtitle>{{
                      comment.content
                    }}</v-list-item-subtitle>
                  </div>
                </v-list-item>

                <v-list-item-action
                  v-if="userStore?.account === comment.user.account"
                  class="ml-auto d-flex align-center justify-end"
                  style="min-width: auto; padding: 0"
                >
                  <v-btn
                    @click="deleteComment(comment, index)"
                    style="
                      padding: 0;
                      min-width: auto;
                      height: auto;
                      background: transparent;
                      border: none;
                    "
                  >
                    <v-icon size="25" color="red">mdi-delete</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </div>
          <div v-else class="text-center grey--text">目前沒有留言</div>

          <v-textarea
            v-model="newComment"
            label="新增留言"
            rows="1"
            auto-grow
            class="mt-4"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="closeCommentDialog">關閉</v-btn>
          <v-btn color="primary" @click="addComment">送出</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useSnackbar } from "vuetify-use-dialog";
import productService from "@/services/article";
import commentService from "@/services/comment";
import { useFavoriteStore } from "@/stores/favorite";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const createSnackbar = useSnackbar();
const favoriteStore = useFavoriteStore();
const userStore = useUserStore();

const products = ref([]);
const search = ref("");
const selectedCategory = ref("全部");
const selectedSort = ref("commentCount_desc");

const categoryOptions = [
  "時事",
  "美食",
  "服裝",
  "家居用品",
  "娛樂",
  "玩具",
  "食品",
  "寵物",
  "音樂",
  "運動",
  "其他",
];

const sortOptions = [
  {
    text: "最熱門話題",
    key: "commentCount_desc",
    sortKey: "commentCount",
    direction: -1,
  },
  {
    text: "最新貼文",
    key: "createdAt_desc",
    sortKey: "createdAt",
    direction: -1,
  },
  {
    text: "最舊貼文",
    key: "createdAt_asc",
    sortKey: "createdAt",
    direction: 1,
  },
  { text: "名稱", key: "title_asc", sortKey: "title", direction: 1 },
];
const incrementClick = async (post) => {
  post.clickCount = (post.clickCount || 0) + 1;
  try {
    await productService.update(post._id, { clickCount: post.clickCount });
  } catch (err) {
    console.error("更新點擊數失敗", err);
  }
};

const ITEMS_PER_LOAD = 6;
const visibleCount = ref(ITEMS_PER_LOAD);
const loading = ref(true);

const dialog = ref(false);
const selectedPost = ref(null);

const imageDialog = ref(false);
const selectedImage = ref(null);

const favoriteLoading = ref({});

// ====== 留言功能 ======
const commentDialog = ref(false);
const selectedCommentsPost = ref(null);
const comments = ref([]);
const newComment = ref("");

const openCommentDialog = async (post) => {
  selectedCommentsPost.value = post;
  commentDialog.value = true;
  try {
    const { data } = await commentService.getComments(post._id);
    comments.value = (data.comments || []).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    post.commentCount = comments.value.length;
  } catch (err) {
    console.error(err);
    createSnackbar({ text: "無法取得留言", snackbarProps: { color: "red" } });
  }
};

const closeCommentDialog = () => {
  commentDialog.value = false;
  selectedCommentsPost.value = null;
  newComment.value = "";
  comments.value = [];
  router.replace({ query: {} });
};

const addComment = async () => {
  if (!newComment.value.trim())
    return createSnackbar({
      text: "請輸入留言內容",
      snackbarProps: { color: "orange" },
    });
  if (!userStore.isLoggedIn) {
    createSnackbar({
      text: "請先登入才能留言",
      snackbarProps: { color: "orange" },
    });
    router.push("/login");
    return;
  }

  try {
    await commentService.addComment(selectedCommentsPost.value._id, {
      content: newComment.value,
    });
    createSnackbar({ text: "留言已送出", snackbarProps: { color: "green" } });
    const { data } = await commentService.getComments(
      selectedCommentsPost.value._id
    );
    comments.value = (data.comments || []).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    newComment.value = "";

    // 更新貼文留言數
    const idx = products.value.findIndex(
      (p) => p._id === selectedCommentsPost.value._id
    );
    if (idx !== -1) products.value[idx].commentCount = comments.value.length;
    updateTopCommentIds();
  } catch (err) {
    console.error(err);
    createSnackbar({ text: "留言失敗", snackbarProps: { color: "red" } });
  }
};

const deleteComment = async (comment, index) => {
  if (!userStore.isLoggedIn) {
    createSnackbar({
      text: "請先登入才能刪除留言",
      snackbarProps: { color: "orange" },
    });
    router.push("/login");
    return;
  }

  try {
    await commentService.deleteComment(
      selectedCommentsPost.value._id,
      comment._id
    );
    comments.value.splice(index, 1);

    const idx = products.value.findIndex(
      (p) => p._id === selectedCommentsPost.value._id
    );
    if (idx !== -1) products.value[idx].commentCount = comments.value.length;
    updateTopCommentIds();

    createSnackbar({ text: "留言已刪除", snackbarProps: { color: "green" } });
  } catch (err) {
    console.error(err);
    createSnackbar({ text: "刪除留言失敗", snackbarProps: { color: "red" } });
  }
};

const topCommentIds = ref([]);
const updateTopCommentIds = () => {
  topCommentIds.value = products.value
    .slice()
    .sort((a, b) => b.commentCount - a.commentCount)
    .slice(0, 3)
    .map((p) => p._id);
};

// ====== 文章操作 ======
const truncatedText = (text) =>
  !text ? "" : text.length <= 100 ? text : text.slice(0, 100) + "...";

const openDialog = (post) => {
  selectedPost.value = post;
  dialog.value = true;
};
const closeDialog = () => {
  dialog.value = false;
  selectedPost.value = null;
};
const openImageDialog = (img) => {
  selectedImage.value = img;
  imageDialog.value = true;
};

const filteredProducts = computed(() => {
  const sortOption = sortOptions.find((opt) => opt.key === selectedSort.value);
  return products.value
    .filter((post) => {
      const searchLower = search.value.toLowerCase();
      const matchesSearch =
        post.title?.toLowerCase().includes(searchLower) ||
        post.user?.account?.toLowerCase().includes(searchLower);
      const matchesCategory =
        selectedCategory.value !== "全部"
          ? Array.isArray(post.category) &&
            post.category.includes(selectedCategory.value)
          : true;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (!sortOption) return 0;
      const { sortKey, direction } = sortOption;
      if (["createdAt", "updatedAt"].includes(sortKey))
        return direction > 0
          ? new Date(a[sortKey]) - new Date(b[sortKey])
          : new Date(b[sortKey]) - new Date(a[sortKey]);
      return direction > 0
        ? a[sortKey] > b[sortKey]
          ? 1
          : -1
        : a[sortKey] < b[sortKey]
        ? 1
        : -1;
    });
});

const visiblePosts = computed(() =>
  filteredProducts.value.slice(0, visibleCount.value)
);

const getProducts = async () => {
  try {
    loading.value = true;
    const { data } = await productService.get();
    products.value = data.articles.map((post) => ({
      ...post,
      commentCount: post.commentCount || 0,
    }));
    updateTopCommentIds();
  } catch (err) {
    console.error(err);
    createSnackbar({
      text: "無法載入貼文資料",
      snackbarProps: { color: "red" },
    });
  } finally {
    loading.value = false;
  }
};

const isFavorite = (postId) => favoriteStore.isFavorite(postId);

const toggleFavorite = async (post) => {
  if (!userStore.isLoggedIn) {
    createSnackbar({
      text: "請先登入才能使用收藏功能",
      snackbarProps: { color: "orange" },
    });
    router.push("/login");
    return;
  }
  if (favoriteLoading.value[post._id]) return;

  favoriteLoading.value[post._id] = true;
  try {
    await favoriteStore.toggleFavorite(post);
    const isFav = favoriteStore.isFavorite(post._id);
    createSnackbar({
      text: isFav ? "已加入收藏" : "已移除收藏",
      snackbarProps: { color: isFav ? "green" : "blue" },
    });
    userStore.setFavorites(
      Array.isArray(favoriteStore.favorites)
        ? favoriteStore.favorites.length
        : 0
    );
  } catch (err) {
    console.error(err);
    createSnackbar({ text: "收藏操作失敗", snackbarProps: { color: "red" } });
  } finally {
    favoriteLoading.value[post._id] = false;
  }
};

// 無限滾動
const loadMoreTrigger = ref(null);
let observer = null;
const setupInfiniteScroll = () => {
  observer = new IntersectionObserver(
    (entries) => {
      if (
        entries[0].isIntersecting &&
        !loading.value &&
        visibleCount.value < filteredProducts.value.length
      ) {
        loading.value = true;
        setTimeout(() => {
          visibleCount.value += ITEMS_PER_LOAD;
          loading.value = false;
        }, 500);
      }
    },
    { rootMargin: "0px 0px 200px 0px" }
  );
  if (loadMoreTrigger.value) observer.observe(loadMoreTrigger.value);
};

// 搜尋或篩選重置顯示數量，但不跳回第一則
const resetFeed = () => {
  visibleCount.value = Math.min(ITEMS_PER_LOAD, filteredProducts.value.length);
};

const getUserColor = (username) => {
  if (!username) return "#e0e0e0";
  let hash = 0;
  for (let i = 0; i < username.length; i++)
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${hash % 360},60%,85%)`;
};

const logout = () => {
  userStore.logout();
  favoriteStore.favorites = [];
};
const route = useRoute();

onMounted(async () => {
  await getProducts();
  if (userStore.isLoggedIn) {
    await favoriteStore.fetchFavorites();
    userStore.setFavorites(
      Array.isArray(favoriteStore.favorites)
        ? favoriteStore.favorites.length
        : 0
    );
  } else userStore.setFavorites(0);
  setupInfiniteScroll();
  if (route.query.id && route.query.showComments) {
    const target = products.value.find((p) => p._id === route.query.id);
    if (target) {
      openCommentDialog(target);
    }
  }
});
watch(
  [() => route.query, filteredProducts, visiblePosts],
  async ([query, posts, vPosts]) => {
    if (query.id && query.showComments && posts.length > 0) {
      const idx = posts.findIndex((p) => p._id === query.id);
      if (idx !== -1) {
        // 強制顯示該文章
        if (visibleCount.value < idx + 1) {
          visibleCount.value = idx + 1;
          await nextTick();
        }
        const target = posts[idx];
        openCommentDialog(target);

        // 等待 DOM 出現再滾動
        let tryCount = 0;
        const scrollToCard = () => {
          const el = document.getElementById(`post-${target._id}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          } else if (tryCount < 10) {
            tryCount++;
            setTimeout(scrollToCard, 100);
          }
        };
        scrollToCard();
      }
    }
  },
  { immediate: true }
);
watch([search, selectedCategory, selectedSort], resetFeed);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.title-wrap {
  white-space: normal;
  overflow-wrap: break-word;
}
.v-container {
  padding-top: 30px;
}

.v-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.v-card-subtitle {
  font-weight: 500;
  color: #26a69a;
}

.v-progress-circular {
  background-color: rgba(0, 0, 0, 0.12);
}

.v-row {
  margin-bottom: 20px;
}

.v-card-text {
  color: #555;
  padding: 16px;
  line-height: 1.5;
}

.post-image {
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  object-fit: cover;
  max-height: 200px;
}

.v-card-title {
  padding: 16px;
  font-weight: 600;
  font-size: 1.2rem;
}

.text-body-2 {
  padding: 16px;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.v-img {
  border-radius: 8px;
  transition: transform 0.3s ease-in-out;
}
.v-img:hover {
  transform: scale(1.05);
}
.search-container .v-text-field {
  background-color: #ffffff;
  opacity: 0.7;
  border-radius: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
  width: 97.5%;
}

.v-select {
  border-radius: 8px;
  margin-right: 10px;
  max-width: 250px;
}

.v-btn:hover {
  transform: scale(1.05);
}

.v-dialog {
  border-radius: 8px;
  background-color: rgba(235, 227, 227, 0.5);
}

.v-dialog .v-card {
  padding: 20px;
}

.v-dialog .v-card-title {
  font-size: 1.25rem;
  font-weight: 500;
  color: #333;
}

.v-btn:active .mdi-heart {
  transform: scale(1.2);
}

.v-btn .mdi-heart {
  transition: transform 0.2s ease-in-out;
}

.mdi-crown {
  box-shadow: 0 0 8px rgba(255, 223, 0, 0.7);
  border-radius: 50%; /* 圓形 */
  animation: shineGold 1.5s infinite alternate;
  transition: transform 0.2s ease-in-out;
}

.mdi-crown.silver {
  box-shadow: 0 0 8px rgba(192, 192, 192, 0.7);
  border-radius: 50%;
  animation: shineSilver 1.5s infinite alternate;
}

.mdi-crown.bronze {
  box-shadow: 0 0 8px rgba(184, 115, 51, 0.7);
  border-radius: 50%;
  animation: shineBronze 1.5s infinite alternate;
}

@keyframes shineGold {
  0% {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(255, 223, 0, 0.6);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(255, 223, 0, 1);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(255, 223, 0, 0.6);
  }
}

@keyframes shineSilver {
  0% {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(192, 192, 192, 0.6);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(192, 192, 192, 1);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(192, 192, 192, 0.6);
  }
}

@keyframes shineBronze {
  0% {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(184, 115, 51, 0.6);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(184, 115, 51, 1);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(184, 115, 51, 0.6);
  }
}
.loading-overlay {
  position: fixed; /* 固定在螢幕上 */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex; /* 使用 flex 居中 */
  align-items: center;
  justify-content: center;
  background: transparent; /* 確保背景透明，不會有灰格子 */
  z-index: 9999; /* 確保蓋在最上面 */
}
.custom-select {
  background-color: #ffffff;
  opacity: 0.9;
  border-radius: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.custom-select:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
}

.custom-select input {
  font-size: 16px; /* 調整字體大小 */
  color: #1f2937; /* 深灰字 */
}
.comment-list {
  max-height: 300px; /* 超過這個高度就捲動 */
  overflow-y: auto;
  padding-right: 8px; /* 避免捲軸壓到內容 */
}
</style>
<route lang="yaml">
meta:
  # 標題
  title: "首頁"
  # 有沒有登入都能看
  login: ""
  # 不是管理員也能看
  admin: false
</route>
