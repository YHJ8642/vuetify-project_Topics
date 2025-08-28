<template>
  <v-card class="pa-4" outlined elevation="2" style="border-color: #009688; height: 300px;">
    <v-row no-gutters style="height: 100%;">
      <v-col cols="12" md="5" style="height: 100%;">
        <v-img :src="image" height="100%" contain />
      </v-col>

      <v-col
        cols="12"
        md="7"
        class="pl-4"
        style="height: 100%; display: flex; flex-direction: column;"
      >
        <h2 style="margin-bottom: 8px; color: #00796b; flex-shrink: 0;">
          <router-link :to="'/article/' + _id" class="text-decoration-none" style="color: inherit;">
            {{ title }}
          </router-link>
        </h2>

        <div
          class="text-subtitle-2 mb-2"
          style="color: #004d40; flex-shrink: 0;"
        >
          <span>分類：{{ category }}</span> |
          <span>地點：{{ location }}</span>
        </div>

        <div
          class="body-1 mb-0"
          style="color: #00695c; overflow-y: auto; flex-grow: 1; max-height: 100%;"
        >
          {{ description }}
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
defineProps(['_id', 'image', 'title', 'category', 'description', 'location'])
</script>
