// stores/favorite.js
import { defineStore } from "pinia";
import favoriteService from "@/services/favorite";

export const useFavoriteStore = defineStore("favorite", {
  state: () => ({
    favorites: [],
  }),
  actions: {
    async fetchFavorites() {
      try {
        const { data } = await favoriteService.getAll();
        this.favorites = data.favorites || [];
      } catch (error) {
        console.error("取得收藏失敗:", error);
        this.favorites = [];
      }
    },
    async toggleFavorite(post) {
      const favObj = this.favorites.find((f) => f.post?._id === post._id);
      console.log("toggleFavorite 開始:", {
        postId: post._id,
        favObj,
        currentFavorites: this.favorites.length,
      });

      if (favObj) {
        // 移除收藏 - 使用 favoriteId
        console.log("移除收藏:", favObj._id);
        await favoriteService.remove(favObj._id);
        this.favorites = this.favorites.filter((f) => f._id !== favObj._id);
        console.log("移除後的收藏數量:", this.favorites.length);
      } else {
        // 添加收藏 - 使用 postId
        console.log("添加收藏:", post._id);
        const { data } = await favoriteService.add(post._id);
        console.log("新增收藏回應:", data.favorite);
        this.favorites.push(data.favorite);
        console.log("添加後的收藏數量:", this.favorites.length);
      }

      // 強制觸發響應式更新
      this.favorites = [...this.favorites];
    },
    async removeFavorite(favoriteId) {
      await favoriteService.remove(favoriteId);
      this.favorites = this.favorites.filter((f) => f._id !== favoriteId);
    },
    isFavorite(postId) {
      return this.favorites.some((f) => f.post?._id === postId);
    },
  },
});
