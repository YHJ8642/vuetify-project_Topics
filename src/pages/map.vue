<template>
  <v-container>
    <div>
      <!-- 搜尋地址欄 -->
      <v-text-field
        v-model="searchAddress"
        label="搜尋地址"
        ref="addressInput"
        @keyup.enter="selectPlace"
        append-icon="mdi-magnify"
        @click:append="selectPlace"
        class="mb-4 elevation-1 rounded-lg"
        outlined
        dense
        hide-details
        density="comfortable"
        color="primary"
        style="background-color: #ffffff"
      />

      <GoogleMap
        :api-key="googleMapsApiKey"
        :libraries="['places']"
        style="width: 100%; height: 500px"
        :center="center"
        :zoom="15"
        @click="addMarker"
      >
        <Marker
          v-for="(m, i) in markers"
          :key="i"
          :options="{
            position: m.position,
            label: {
              text: m.comments?.length.toString(),
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
            },
            title: m.address || '未命名地址',
          }"
          @click="openCommentDialog(i)"
        />

        <!-- 留言 Dialog -->
        <v-dialog v-model="commentDialog" max-width="500px">
          <v-card class="pa-4 rounded-xl elevation-2">
            <v-card-title class="text-h6 font-weight-bold">
              標籤留言
              <div
                v-if="activeMarker !== null"
                class="text-caption grey--text mt-1"
              >
                {{
                  markers[activeMarker]?.address ||
                  `${markers[activeMarker]?.position.lat.toFixed(5)}, ${markers[
                    activeMarker
                  ]?.position.lng.toFixed(5)}`
                }}
              </div>
            </v-card-title>

            <v-card-text>
              <div
                v-if="activeComments.length"
                style="max-height: 420px; overflow-y: auto"
              >
                <v-list>
                  <v-list-item
                    v-for="(c, idx) in activeComments"
                    :key="idx"
                    :prepend-avatar="`https://api.dicebear.com/9.x/thumbs/png/seed=${c.user}`"
                    class="hoverable"
                    @click="handleCommentClick(c, idx)"
                    :style="{
                      borderRadius: '8px',
                      backgroundColor: '#f9f9f9',
                      padding: '8px 16px',
                      marginBottom: '8px',
                    }"
                  >
                    <v-list-item-content>
                      <v-list-item-title
                        class="font-weight-bold"
                        :style="{ color: getUserColor(c.user) }"
                      >
                        {{ c.user }}
                        <span class="text-caption grey--text ml-2">{{
                          new Date(c.createdAt).toLocaleString()
                        }}</span>
                      </v-list-item-title>
                      <v-list-item-subtitle
                        class="text-body-2"
                        :style="{ color: getUserColor(c.user) }"
                      >
                        {{ c.content }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </div>
              <div v-else class="text-center grey--text">目前沒有留言</div>

              <v-textarea
                v-model="newComment"
                label="新增留言"
                rows="1"
                auto-grow
                class="mt-2"
                outlined
                dense
                :style="{
                  borderRadius: '8px',
                  backgroundColor: '#f5f5f5',
                }"
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn text @click="closeCommentDialog" class="text--primary"
                >關閉</v-btn
              >
              <v-btn
                v-if="
                  activeMarker !== null &&
                  markers[activeMarker].owner === userName
                "
                color="red"
                @click="deleteMarker"
              >
                刪除標籤
              </v-btn>
              <v-btn color="primary" @click="addComment">送出留言</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </GoogleMap>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { GoogleMap, Marker } from "vue3-google-map";
import { useUserStore } from "@/stores/user";
import { v4 as uuidv4 } from "uuid";

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const userStore = useUserStore();
const userName = userStore.isLoggedIn ? userStore.account : null;

const center = ref({ lat: 25.033964, lng: 121.564468 });
const markers = ref([]);
const activeMarker = ref(null);

const commentDialog = ref(false);
const newComment = ref("");
const activeComments = ref([]);
const searchAddress = ref("");
const addressInput = ref(null);
let autocomplete = null;

const userColors = {};
function getUserColor(user) {
  if (!userColors[user]) {
    const color = `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
    userColors[user] = color;
  }
  return userColors[user];
}

function waitForGoogleMaps() {
  return new Promise((resolve) => {
    if (window.google?.maps?.places) {
      resolve();
    } else {
      const interval = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    }
  });
}

onMounted(async () => {
  const saved = localStorage.getItem("markers");
  markers.value = saved ? JSON.parse(saved) : [];

  await waitForGoogleMaps();

  // ✅ 自動補上 address（僅針對沒 address 的舊資料）
  const geocoder = new google.maps.Geocoder();
  const updates = markers.value.map((m) => {
    return new Promise((resolve) => {
      if (!m.address) {
        geocoder.geocode({ location: m.position }, (results, status) => {
          if (status === "OK" && results[0]) {
            m.address = results[0].formatted_address;
          } else {
            m.address = `${m.position.lat.toFixed(5)}, ${m.position.lng.toFixed(
              5
            )}`;
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  });

  await Promise.all(updates);
  saveMarkers();

  if (addressInput.value) {
    autocomplete = new google.maps.places.Autocomplete(
      addressInput.value.$el.querySelector("input")
    );
    autocomplete.addListener("place_changed", selectPlace);
  }
});

function addMarker(event) {
  if (!userName) {
    alert("請先登入才能新增標籤");
    return;
  }

  const lat = event.latLng.lat();
  const lng = event.latLng.lng();
  const confirmAdd = window.confirm("確定要在這個位置新增標籤嗎？");
  if (!confirmAdd) return;

  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ location: { lat, lng } }, (results, status) => {
    let address = "";
    if (status === "OK" && results[0]) {
      address = results[0].formatted_address;
    } else {
      address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }

    markers.value.push({
      position: { lat, lng },
      address,
      comments: [],
      owner: userName,
    });

    saveMarkers();
  });
}

function openCommentDialog(index) {
  activeMarker.value = index;
  activeComments.value = markers.value[index].comments || [];
  commentDialog.value = true;
}

function closeCommentDialog() {
  commentDialog.value = false;
  newComment.value = "";
  activeComments.value = [];
  activeMarker.value = null;
}

function saveMarkers() {
  localStorage.setItem("markers", JSON.stringify(markers.value));
}

function addComment() {
  if (!userName) {
    alert("請先登入才能留言");
    return;
  }
  if (!newComment.value.trim()) return;

  const comment = {
    id: uuidv4(),
    user: userName,
    content: newComment.value,
    createdAt: new Date().toISOString(),
  };
  markers.value[activeMarker.value].comments.push(comment);
  newComment.value = "";
  saveMarkers();
}

function deleteComment(idx) {
  if (activeMarker.value === null) return;
  markers.value[activeMarker.value].comments.splice(idx, 1);
  activeComments.value = markers.value[activeMarker.value].comments;
  saveMarkers();
}

function handleCommentClick(comment, idx) {
  if (comment.user !== userName) return;

  const confirmed = window.confirm("確定要刪除這則留言嗎？");
  if (confirmed) {
    deleteComment(idx);
  }
}

function deleteMarker() {
  if (activeMarker.value === null) return;

  const marker = markers.value[activeMarker.value];
  if (marker.owner !== userName) {
    alert("你不是這個標籤的建立者，無法刪除");
    return;
  }

  markers.value.splice(activeMarker.value, 1);
  closeCommentDialog();
  saveMarkers();
}

function selectPlace() {
  if (!userName) {
    alert("請先登入才能新增標籤");
    return;
  }

  if (!autocomplete) return;
  const place = autocomplete.getPlace();
  if (!place.geometry) {
    alert("找不到該地址，請確認輸入是否正確");
    return;
  }

  const lat = place.geometry.location.lat();
  const lng = place.geometry.location.lng();
  const address =
    place.formatted_address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

  const confirmAdd = window.confirm(`確定要在 ${address} 建立標籤嗎？`);
  if (!confirmAdd) return;

  markers.value.push({
    position: { lat, lng },
    address,
    comments: [],
    owner: userName,
  });

  center.value = { lat, lng };
  saveMarkers();
  searchAddress.value = "";
}

watch(markers, saveMarkers, { deep: true });
</script>

<style scoped>
@media (max-width: 600px) {
  .v-container {
    padding-left: 10px;
    padding-right: 10px;
  }

  .v-text-field {
    margin-top: 20px;
  }
}

.hoverable {
  cursor: pointer;
  transition: background-color 0.2s;
}
.hoverable:hover {
  background-color: #f5f5f5;
}
/* 全局按鈕樣式 */
.v-btn {
  border-radius: 12px;
  box-shadow: none;
  transition: background-color 0.3s ease;
}

.v-btn:hover {
  background-color: #007bff !important;
  color: white !important;
}
.v-dialog {
  border-radius: 16px !important;
}
.v-card {
  background-color: #ffffff !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1) !important;
}

.text--primary {
  color: #007bff !important;
}

.text--secondary {
  color: #6c757d !important;
}
</style>

<route lang="yaml">
meta:
  # 標題
  title: "地圖互動"
  # 有沒有登入都能看
  login: ""
  # 不是管理員也能看
  admin: false
</route>
