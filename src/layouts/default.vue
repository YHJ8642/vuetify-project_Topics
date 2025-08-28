<template>
  <v-app-bar style="padding: 0 11.5%">
    <img
      alt="Logo"
      class="mr-2"
      src="@/assets/logo.png"
      style="height: 32px; width: 32px"
    />
    <v-app-bar-title class="d-flex align-center"
      >痕跡 <span class="sub-title">無名客的無名小站</span></v-app-bar-title
    >

    <!-- 漢堡按鈕（小螢幕顯示） -->
    <v-app-bar-nav-icon class="d-md-none" @click="drawer = !drawer" />

    <!-- 大螢幕選單 -->
    <template v-for="item of navItems ?? []" :key="item?.to">
      <v-btn
        v-if="item && item.show"
        :to="item.to"
        variant="text"
        class="d-none d-md-flex"
      >
        <v-icon
          class="mr-1"
          :color="$route.path === item.to ? 'primary' : 'grey'"
          >{{ item.icon }}</v-icon
        >
        {{ item.title }}
        <v-badge
          v-if="item.to === '/favorite' && user.favoriteTotal > 0"
          color="red"
          :content="user.favoriteTotal"
          floating
        />
      </v-btn>
    </template>

    <v-btn
      v-if="user.isLoggedIn"
      prepend-icon="mdi-logout"
      @click="logout"
      class="d-none d-md-flex"
      >登出</v-btn
    >
  </v-app-bar>

  <!-- 側邊選單（小螢幕） -->
  <v-navigation-drawer v-model="drawer" temporary class="d-md-none">
    <v-list>
      <v-list-item
        v-for="item in navItems.filter((i) => i.show)"
        :key="item.to"
        :to="item.to"
        link
      >
        <v-icon class="mr-2">{{ item.icon }}</v-icon>
        <span>{{ item.title }}</span>
        <v-badge
          v-if="item.to === '/favorite' && user.favoriteTotal > 0"
          color="red"
          :content="user.favoriteTotal"
          floating
        />
      </v-list-item>

      <v-list-item v-if="user.isLoggedIn" @click="logout">
        <v-icon class="mr-2">mdi-logout</v-icon>
        <span>登出</span>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
  <v-main>
    <router-view :key="$route.fullPath" />
  </v-main>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useSnackbar } from "vuetify-use-dialog";
import userService from "@/services/user";
import { useUserStore } from "@/stores/user";

const user = useUserStore();
const createSnackbar = useSnackbar();
const router = useRouter();
const drawer = ref(false);

const navItems = computed(() => {
  const isLoggedIn = !!user?.isLoggedIn;
  return [
    { title: "首頁", to: "/", icon: "mdi-home", show: true },
    { title: "登入/註冊", to: "/login", icon: "mdi-login", show: !isLoggedIn },
    {
      title: "收藏",
      to: "/favorite",
      icon: "mdi-bookmark-box-multiple",
      show: isLoggedIn,
    },
    { title: "地圖", to: "/map", icon: "mdi-map", show: isLoggedIn },
    { title: "管理", to: "/admin", icon: "mdi-cog", show: isLoggedIn },
  ];
});
const logout = async () => {
  try {
    await userService.logout();
  } catch (error) {
    console.error(error);
  }
  user.logout();
  router.push("/");
  createSnackbar({
    text: "登出成功！",
    snackbarProps: { color: "green" },
  });
};
</script>
<style>
.logo-img {
  width: 30px;
  height: 30px;
  position: relative;
}
.sub-title {
  font-size: 14px;
  color: grey;
  margin-left: 8px;
}
</style>
