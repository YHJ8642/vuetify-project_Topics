<template>
  <v-container>
    <!-- 非手機桌面版 -->
    <v-row v-if="!isMobile">
      <v-col cols="12">
        <v-card elevation="2">
          <!-- 工具列 -->
          <v-toolbar flat>
            <v-btn variant="outlined" @click="openDialog(null)">新增貼文</v-btn>
            <v-spacer />
            <v-text-field
              v-model="search"
              placeholder="搜尋貼文"
              prepend-inner-icon="mdi-magnify"
              variant="solo"
              hide-details
              dense
              style="max-width: 300px; opacity: 0.5"
            />
            <v-select
              v-model="filterCategory"
              :items="categoryOptions"
              placeholder="篩選分類"
              clearable
              hide-details
              dense
              style="max-width: 200px"
            />
            <v-select
              v-model="filterRelease"
              :items="[
                { label: '已發布', value: true },
                { label: '未發布', value: false },
              ]"
              item-title="label"
              item-value="value"
              placeholder="篩選發布"
              clearable
              hide-details
              dense
              style="max-width: 150px"
            />
          </v-toolbar>

          <!-- 資料表 -->
          <v-data-table
            :headers="headers"
            :items="filteredProducts"
            :items-per-page="10"
            class="elevation-1"
          >
            <template #[`item.image`]="{ value }">
              <v-img
                class="clickable-image"
                :src="value"
                width="120"
                @click="showImage(value)"
              />
            </template>

            <template #[`item.description`]="{ item }">
              <span
                class="description-text"
                @click="showDescription(item.description)"
              >
                {{
                  item.description.length > 50
                    ? item.description.slice(0, 50) + "..."
                    : item.description
                }}
              </span>
            </template>

            <template #[`item.release`]="{ value }">
              <v-icon v-if="value" color="green">mdi-check-circle</v-icon>
            </template>

            <template #[`item.action`]="{ item }">
              <v-tooltip bottom>
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon
                    color="primary"
                    @click="openDialog(item)"
                    style="width: 30px; height: 30px"
                  >
                    <v-icon size="x-small">mdi-pencil</v-icon>
                  </v-btn>
                </template>
                <span>編輯貼文</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon
                    color="red"
                    @click="deleteProduct(item._id)"
                    style="width: 30px; height: 30px"
                  >
                    <v-icon size="x-small">mdi-delete</v-icon>
                  </v-btn>
                </template>
                <span>刪除貼文</span>
              </v-tooltip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- 手機版卡片列表 -->
    <v-row v-else>
      <v-col cols="12">
        <!-- 手機版工具列 -->
        <v-card elevation="2" class="mb-4 pa-2">
          <v-btn variant="outlined" block @click="openDialog(null)"
            >新增貼文</v-btn
          >
          <v-text-field
            v-model="search"
            placeholder="搜尋貼文"
            prepend-inner-icon="mdi-magnify"
            variant="solo"
            hide-details
            dense
            class="mt-2"
          />
          <v-select
            v-model="filterCategory"
            :items="categoryOptions"
            placeholder="篩選分類"
            clearable
            hide-details
            dense
            class="mt-2"
          />
          <v-select
            v-model="filterRelease"
            :items="[
              { label: '已發布', value: true },
              { label: '未發布', value: false },
            ]"
            item-title="label"
            item-value="value"
            placeholder="篩選發布"
            clearable
            hide-details
            dense
            class="mt-2"
          />
        </v-card>
      </v-col>

      <v-col cols="12" v-for="item in filteredProducts" :key="item._id">
        <v-card outlined class="mb-2">
          <v-card-title>
            <v-img
              v-if="item.image"
              :src="item.image"
              max-height="150"
              cover
              class="mb-2 rounded"
              @click="showImage(item.image)"
            />
            <div class="w-full">
              <div class="card-title-ellipsis">
                <strong>{{ item.title }}</strong>
              </div>
              <div class="mt-1">
                <v-chip
                  v-for="c in item.category"
                  :key="c"
                  size="small"
                  color="primary"
                  class="ml-1"
                >
                  {{ c }}
                </v-chip>
              </div>
            </div>
          </v-card-title>

          <v-card-text>
            <div class="text-caption text-grey">
              🕒 {{ new Date(item.createdAt).toLocaleString() }}
            </div>
            <div class="mt-2 text-caption text-grey">
              📍 {{ item.location }}
            </div>
            <div
              class="text-truncate-2"
              @click="showDescription(item.description)"
            >
              {{ item.description || "(沒有文章)" }}
            </div>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn icon size="small" color="primary" @click="openDialog(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              size="small"
              color="red"
              @click="deleteProduct(item._id)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- 新增/編輯 Dialog -->
    <v-dialog
      v-model="dialog.open"
      persistent
      :max-width="isMobile ? '95%' : '700'"
    >
      <v-form :disabled="isSubmitting" @submit.prevent="submit">
        <v-card>
          <v-card-title>{{ dialog.id ? "編輯貼文" : "新增貼文" }}</v-card-title>
          <v-card-text>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="title.value.value"
                  :error-messages="title.errorMessage.value"
                  label="標題"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="category.value.value"
                  :items="categoryOptions"
                  :error-messages="category.errorMessage.value"
                  label="分類"
                  multiple
                  chips
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="location.value.value"
                  :error-messages="location.errorMessage.value"
                  label="位置"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  color="green"
                  v-model="release.value.value"
                  label="發布"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="description.value.value"
                  :error-messages="description.errorMessage.value"
                  label="文章"
                />
              </v-col>
              <v-col cols="12">
                <VueFileAgent
                  ref="fileAgent"
                  v-model="fileRecords"
                  v-model:raw-model-value="rawFileRecords"
                  accept="image/jpeg,image/png"
                  deletable
                  :error-text="{
                    type: '檔案格式不正確',
                    size: '檔案大小不得超過 5MB',
                  }"
                  help-text="選擇或拖拽檔案"
                  max-size="5MB"
                />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="red" :disabled="isSubmitting" @click="closeDialog"
              >取消</v-btn
            >
            <v-btn color="green" :loading="isSubmitting" type="submit">
              {{ dialog.id ? "編輯" : "新增" }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <!-- 圖片放大 Dialog -->
    <v-dialog v-model="imageDialog.open" max-width="800">
      <v-card>
        <v-img :src="imageDialog.src" />
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="imageDialog.open = false"
            >關閉</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 文章描述內容 Dialog -->
    <v-dialog v-model="descDialog.open" max-width="500">
      <v-card>
        <v-card-title>文章內容</v-card-title>
        <v-card-text>
          <pre style="white-space: pre-wrap">{{ descDialog.text }}</pre>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="descDialog.open = false"
            >關閉</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed } from "vue";
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import { useSnackbar } from "vuetify-use-dialog";
import productService from "@/services/article";
import { useDisplay } from "vuetify"; // 🔑 判斷螢幕大小

const { smAndDown } = useDisplay();
const isMobile = computed(() => smAndDown.value);
const filterRelease = ref(null);

const createSnackbar = useSnackbar();

const products = ref([]);
const search = ref("");

const headers = [
  { title: "ID", key: "_id" },
  { title: "圖片", key: "image", sortable: false },
  { title: "標題", key: "title" },
  { title: "文章", key: "description" },
  { title: "位置", key: "location" },
  {
    title: "分類",
    key: "category",
    value: (item) =>
      Array.isArray(item.category)
        ? item.category.filter((c) => c && c.trim() !== "").join(", ")
        : item.category || "",
  },
  { title: "發布", key: "release" },
  {
    title: "建立日期",
    key: "createdAt",
    value: (item) => new Date(item.createdAt).toLocaleString(),
  },
  {
    title: "更新日期",
    key: "updatedAt",
    value: (item) => new Date(item.updatedAt).toLocaleString(),
  },
  { title: "操作", key: "action", sortable: false },
];

const filteredProducts = computed(() => {
  let result = products.value;

  if (search.value) {
    const keyword = search.value.toLowerCase();
    result = result.filter((p) =>
      [p._id, p.title, p.category, p.description, p.location].some((field) =>
        String(field || "")
          .toLowerCase()
          .includes(keyword)
      )
    );
  }

  if (filterCategory.value) {
    result = result.filter((p) => p.category.includes(filterCategory.value));
  }

  if (filterRelease.value !== null) {
    result = result.filter((p) => p.release === filterRelease.value);
  }

  return result;
});

async function getProducts() {
  try {
    const { data } = await productService.getUser();
    products.value = data.articles;
  } catch (error) {
    createSnackbar({
      text: "無法載入貼文資料",
      snackbarProps: { color: "red" },
    });
  }
}
getProducts();

const fileAgent = ref(null);
const dialog = ref({ open: false, id: "" });

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

const { handleSubmit, resetForm, isSubmitting } = useForm({
  validationSchema: yup.object({
    title: yup
      .string()
      .required("標題是必填的")
      .max(100, "標題最多 100 個字元"),
    category: yup
      .array()
      .of(yup.string().oneOf(categoryOptions))
      .min(1, "請至少選擇一個分類"),
    description: yup.string().max(1000, "文章最多 1000 個字元"),
    location: yup
      .string()
      .required("位置是必填的")
      .max(100, "位置最多 100 個字元"),
    release: yup.boolean().oneOf([true, false], "必須選擇是否發布"),
  }),
  initialValues: {
    title: "",
    category: [],
    description: "",
    location: "",
    release: false,
  },
});

const title = useField("title");
const category = useField("category");
const description = useField("description");
const location = useField("location");
const release = useField("release");

const fileRecords = ref([]);
const filterCategory = ref(null);

const rawFileRecords = ref(null);

function openDialog(item) {
  if (item) {
    dialog.value.id = item._id;
    title.value.value = item.title;
    category.value.value = Array.isArray(item.category)
      ? item.category
      : [item.category];
    description.value.value = item.description;
    location.value.value = item.location;
    release.value.value = item.release;
  } else {
    dialog.value.id = "";
    resetForm();
    fileRecords.value = [];
    rawFileRecords.value = [];
    fileAgent.value?.deleteAllFileRecords?.();
  }
  dialog.value.open = true;
}

function closeDialog() {
  dialog.value.open = false;
  dialog.value.id = "";
  resetForm();
  fileAgent.value?.deleteAllFileRecords?.();
}

const submit = handleSubmit(async (values) => {
  if (fileRecords.value[0]?.error) {
    createSnackbar({
      text: "請選擇有效的圖片檔案",
      snackbarProps: { color: "red" },
    });
    return;
  }
  if (!dialog.value.id && fileRecords.value.length === 0) {
    createSnackbar({ text: "請上傳貼文圖片", snackbarProps: { color: "red" } });
    return;
  }

  try {
    const fd = new FormData();
    fd.append("title", values.title);
    fd.append("category", JSON.stringify(values.category));
    fd.append("description", values.description || "");
    fd.append("location", values.location);
    fd.append("release", String(values.release));

    if (fileRecords.value.length > 0) {
      fd.append("image", fileRecords.value[0].file);
    }

    if (!dialog.value.id) {
      await productService.create(fd);
    } else {
      await productService.update(dialog.value.id, fd);
    }

    createSnackbar({ text: "操作成功！", snackbarProps: { color: "green" } });
    closeDialog();
    getProducts();
  } catch (error) {
    createSnackbar({
      text: error?.response?.data?.message || "操作失敗",
      snackbarProps: { color: "red" },
    });
  }
});

async function deleteProduct(id) {
  if (!confirm("確定要刪除這篇貼文嗎？")) return;
  try {
    await productService.remove(id);
    createSnackbar({ text: "刪除成功！", snackbarProps: { color: "green" } });
    getProducts();
  } catch (error) {
    createSnackbar({
      text: "刪除失敗，請稍後再試",
      snackbarProps: { color: "red" },
    });
  }
}

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
</script>

<style scoped>
.clickable-image {
  cursor: pointer;
}
.description-text {
  cursor: pointer;
  color: #1976d2;
  text-decoration: underline;
}
.v-data-table tbody tr:hover {
  background-color: #f5f5f5;
}
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 限制 2 行 */
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-title-ellipsis {
  font-weight: bold;
  font-size: 1.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90vw; /* 或 200px, 依需求調整 */
  display: block;
}
</style>

<route lang="yaml">
meta:
  layout: "admin"
  title: "貼文管理"
  login: "login-only"
  admin: false
</route>
