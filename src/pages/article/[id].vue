<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-center">{{ product.title }}</h1>
      </v-col>
      <v-divider />
      <v-col cols="12" md="6">
        <v-img
          class="mb-4"
          contain
          height="400"
          :src="product.image"
        />
      </v-col>
      <v-col cols="12" md="6">
        <p>分類: {{ product.category }}</p>
        <v-divider class="my-5" />
        <p style="white-space: pre;">{{ product.description }}</p>
        <v-number-input
          v-model="quantity"
          control-variant="split"
          :min="1"
          variant="outlined"
        />
        <v-btn
          class="mt-4"
          color="primary"
          :disabled="!product.release"
          @click="addToCart"
        >
          加入購物車
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
  <v-overlay
    class="align-center justify-center text-center"
    :model-value="!product.release"
    opacity="0.7"
    persistent
    scrim="black"
  >
    <h1>已下架</h1>
    <p>這個商品已經下架，無法購買。</p>
    <v-btn
      color="primary"
      to="/"
    >
      返回首頁
    </v-btn>
  </v-overlay>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSnackbar } from 'vuetify-use-dialog'
import productService from '@/services/article'
import userService from '@/services/user'
import { useUserStore } from '@/stores/user'

const createSnackbar = useSnackbar()
const router = useRouter()
const route = useRoute()
const user = useUserStore()

const product = ref({
  title: '',
  location: '',
  description: '',
  category: '',
  release: true,
  image: '',
})

const getProduct = async () => {
  try {
    const { data } = await productService.getId(route.params.id)
    product.value.title = data.product.title
    product.value.location = data.product.location
    product.value.description = data.product.description
    product.value.category = data.product.category
    product.value.release = data.product.release
    product.value.image = data.product.image

    document.title = `${data.product.title} | 痕跡`
  } catch (error) {
    console.error('Error fetching products:', error)
    createSnackbar({
      text: '無法載入商品資料',
      snackbarProps: {
        color: 'red',
      },
    })
    router.push('/')
  }
}
getProduct()

const quantity = ref(1)
const addToCart = async () => {
  try {
    const { data } = await userService.cart({
      product: route.params.id,
      quantity: quantity.value,
    })
    user.cartTotal = data.result
    createSnackbar({
      text: '已加入購物車',
      snackbarProps: {
        color: 'green',
      },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    createSnackbar({
      text: '無法加入購物車',
      snackbarProps: {
        color: 'red',
      },
    })
    router.push('/')
  }
}
</script>

<route lang="yaml">
meta:
  title: '商品'
  login: ''
  admin: false
</route>
