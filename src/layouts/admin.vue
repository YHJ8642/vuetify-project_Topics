<template>
  <v-app>
    <div
      style="
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        height: 70px;
        background: #fff;
      "
    >
      <v-container fluid style="position: relative">
        <v-app-bar app :elevation="0">
          <v-list>
            <v-list-item
              :prepend-avatar="`https://api.dicebear.com/9.x/thumbs/png/seed=${user.account}`"
              :title="!mobile ? user.account : ''"
            />
          </v-list>

          <!-- 功能選單 -->
          <v-spacer />
          <v-btn
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            variant="text"
            :prepend-icon="item.icon"
            :title="!mobile ? item.title : ''"
          >
            {{ item.title }}
          </v-btn>
        </v-app-bar>
      </v-container>
    </div>
    <!-- 主內容 -->
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from "vue";
import { useUserStore } from "@/stores/user";
import { useDisplay } from "vuetify";

const { mobile } = useDisplay();
const drawer = ref(true);

const user = useUserStore();
const navItems = [
  { title: "貼文管理", to: "/admin/articles", icon: "mdi-post" },
  { title: "資料紀錄", to: "/admin/DataRecord", icon: "mdi-database-clock" },
  { title: "首頁", to: "/", icon: "mdi-home" },
];
</script>
