<template>
  <v-app id="inspire">
    <v-main>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" md="6" sm="6">
            <v-card class="elevation-12">
              <v-window v-model="step">
                <!-- 登入區塊 -->
                <v-window-item :value="1">
                  <v-row class="fill-height">
                    <v-col cols="12" md="6">
                      <v-card-text class="mt-sm-12 mt-4">
                        <h1
                          class="text-center display-2 teal--text text--accent-3"
                        >
                          登入! 並一同前往
                        </h1>

                        <div class="text-center mt-4">
                          <v-btn class="mx-2" color="teal accent-3" fab outlined
                            ><v-icon>mdi-facebook</v-icon></v-btn
                          >
                          <v-btn class="mx-2" color="teal accent-3" fab outlined
                            ><v-icon>mdi-google</v-icon></v-btn
                          >
                          <v-btn class="mx-2" color="teal accent-3" fab outlined
                            ><v-icon>mdi-twitter</v-icon></v-btn
                          >
                        </div>

                        <h4
                          class="text-center mt-4 mb-4"
                          :class="{ 'text-error': hasLoginErrors }"
                        >
                          {{ loginErrorsMessage }}
                        </h4>

                        <!-- <v-form @submit.prevent="loginForm.handleSubmit(onLoginSubmit)"> -->
                        <v-form
                          :disabled="loginForm.isSubmitting.value"
                          @submit.prevent="onLoginSubmit"
                        >
                          <v-text-field
                            class="mb-4 form-input"
                            style="
                              max-width: 350px;
                              margin: 0 auto;
                              width: 100%;
                            "
                            v-model="loginAccount.value.value"
                            color="teal accent-3"
                            :error-messages="loginAccount.errorMessage"
                            label="帳號或信箱"
                            name="loginAccount"
                            type="text"
                          />

                          <v-text-field
                            class="mb-4 form-input"
                            style="
                              max-width: 350px;
                              margin: 0 auto;
                              width: 100%;
                            "
                            v-model="loginPassword.value.value"
                            :append-inner-icon="
                              showLoginPassword ? 'mdi-eye-off' : 'mdi-eye'
                            "
                            color="teal accent-3"
                            :error-messages="loginPassword.errorMessage"
                            label="密碼"
                            :type="showLoginPassword ? 'text' : 'password'"
                            @click:append-inner="
                              showLoginPassword = !showLoginPassword
                            "
                          />

                          <div class="text-center mt-5">
                            <v-btn
                              class="mb-4"
                              color="teal accent-3"
                              dark
                              :loading="loginForm.isSubmitting.value"
                              rounded
                              type="submit"
                            >
                              登入
                            </v-btn>
                          </div>
                        </v-form>
                      </v-card-text>
                    </v-col>

                    <v-col
                      class="teal accent-3 py-sm-12 py-6"
                      cols="12"
                      md="6"
                      style="margin-top: 10%"
                    >
                      <v-card-text class="white--text">
                        <h1 class="text-center display-1 mb-5">
                          Hello, Friend!
                        </h1>
                        <h2
                          class="text-center mb-6"
                          style="font-family: 華康娃娃體"
                        >
                          紀錄生活點點滴滴，天天分享彼此滿色彩
                        </h2>
                      </v-card-text>
                      <div class="text-center mb-sm-12 mb-6">
                        <v-btn dark outlined rounded @click="step = 2"
                          >建立新身份</v-btn
                        >
                      </div>
                    </v-col>
                  </v-row>
                </v-window-item>

                <!-- 註冊區塊 -->
                <v-window-item :value="2">
                  <v-row class="fill-height">
                    <v-col
                      class="teal accent-3 py-sm-12 py-6"
                      cols="12"
                      md="6"
                      style="margin-top: 10%"
                    >
                      <v-card-text class="white--text">
                        <h1 class="text-center display-1 mb-5">
                          Welcome Back!
                        </h1>
                        <h2
                          class="text-center mb-6"
                          style="font-family: 華康娃娃體"
                        >
                          為了與我們保持聯繫，請使用您的個人資訊登錄
                        </h2>
                      </v-card-text>
                      <div class="text-center mb-sm-12 mb-6">
                        <v-btn dark outlined rounded @click="step = 1"
                          >開始探索</v-btn
                        >
                      </div>
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-card-text class="mt-sm-12 mt-4">
                        <h1
                          class="text-center display-2 teal--text text--accent-3"
                        >
                          帳號註冊
                        </h1>

                        <div class="text-center mt-4">
                          <v-btn class="mx-2" color="teal accent-3" fab outlined
                            ><v-icon>mdi-facebook</v-icon></v-btn
                          >
                          <v-btn class="mx-2" color="teal accent-3" fab outlined
                            ><v-icon>mdi-google</v-icon></v-btn
                          >
                          <v-btn class="mx-2" color="teal accent-3" fab outlined
                            ><v-icon>mdi-twitter</v-icon></v-btn
                          >
                        </div>

                        <h4
                          class="text-center mt-4 mb-4"
                          :class="{ 'text-error': hasRegisterErrors }"
                        >
                          {{ registerErrorsMessage }}
                        </h4>

                        <!-- <v-form @submit.prevent="registerForm.handleSubmit(onRegisterSubmit)"> -->
                        <v-form
                          :disabled="registerForm.isSubmitting.value"
                          @submit.prevent="onRegisterSubmit"
                        >
                          <v-text-field
                            class="form-input"
                            style="
                              max-width: 350px;
                              margin: 0 auto;
                              width: 100%;
                            "
                            v-model="account.value.value"
                            color="teal accent-3"
                            :error-messages="account.errorMessage"
                            label="帳號"
                            name="account"
                            type="text"
                          />

                          <v-text-field
                            class="form-input"
                            style="
                              max-width: 350px;
                              margin: 0 auto;
                              width: 100%;
                            "
                            v-model="email.value.value"
                            color="teal accent-3"
                            :error-messages="email.errorMessage"
                            label="信箱"
                            name="email"
                            type="text"
                          />

                          <v-text-field
                            class="form-input"
                            style="
                              max-width: 350px;
                              margin: 0 auto;
                              width: 100%;
                            "
                            v-model="password.value.value"
                            :append-inner-icon="
                              showRegisterPassword ? 'mdi-eye-off' : 'mdi-eye'
                            "
                            color="teal accent-3"
                            :error-messages="password.errorMessage"
                            label="密碼"
                            name="password"
                            :type="showRegisterPassword ? 'text' : 'password'"
                            @click:append-inner="
                              showRegisterPassword = !showRegisterPassword
                            "
                          />

                          <v-text-field
                            class="form-input"
                            style="
                              max-width: 350px;
                              margin: 0 auto;
                              width: 100%;
                            "
                            v-model="confirmPassword.value.value"
                            :append-inner-icon="
                              showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'
                            "
                            color="teal accent-3"
                            :error-messages="confirmPassword.errorMessage"
                            label="確認密碼"
                            name="confirmPassword"
                            :type="showConfirmPassword ? 'text' : 'password'"
                            @click:append-inner="
                              showConfirmPassword = !showConfirmPassword
                            "
                          />

                          <div class="text-center mt-3">
                            <v-btn
                              class="mb-4"
                              color="teal accent-3"
                              dark
                              :loading="registerForm.isSubmitting.value"
                              rounded
                              type="submit"
                            >
                              註冊
                            </v-btn>
                          </div>
                        </v-form>
                      </v-card-text>
                    </v-col>
                  </v-row>
                </v-window-item>
              </v-window>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
<script setup>
import validator from "validator";
import { useField, useForm } from "vee-validate";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useSnackbar } from "vuetify-use-dialog";
import * as yup from "yup";
import userService from "@/services/user";
import { useUserStore } from "@/stores/user";

const createSnackbar = useSnackbar();
const router = useRouter();
const user = useUserStore();

const step = ref(1);

// 註冊表單
const registerForm = useForm({
  validationSchema: yup.object({
    account: yup
      .string()
      .required("帳號是必填的")
      .min(3, "帳號至少需要 3 個字元")
      .max(20, "帳號最多只能有 20 個字元")
      .test("isAlphanumeric", "帳號只能包含英文字母和數字", (value) =>
        validator.isAlphanumeric(value || "")
      ),

    email: yup
      .string()
      .required("電子郵件是必填的")
      .test("isEmail", "請輸入有效的電子郵件地址", (value) =>
        validator.isEmail(value || "")
      ),

    password: yup
      .string()
      .required("密碼是必填的")
      .min(4, "密碼至少需要 4 個字元")
      .max(20, "密碼最多只能有 20 個字元"),

    confirmPassword: yup
      .string()
      .required("確認密碼是必填的")
      .oneOf([yup.ref("password")], "密碼和確認密碼必須相同"),
  }),
});

const registerErrors = registerForm.errors;
const hasRegisterErrors = computed(
  () => Object.keys(registerErrors.value).length > 0
);

const showLoginPassword = ref(false);
const showRegisterPassword = ref(false);
const showConfirmPassword = ref(false);
const account = useField("account");
const email = useField("email");
const password = useField("password");
const confirmPassword = useField("confirmPassword");

const loginErrorsMessage = computed(() => {
  const messages = [];
  if (loginErrors.value.loginAccount)
    messages.push(loginErrors.value.loginAccount);
  if (loginErrors.value.loginPassword)
    messages.push(loginErrors.value.loginPassword);
  return messages.join("、") || "Ensure your email for registration";
});

const registerErrorsMessage = computed(() => {
  const messages2 = [];
  if (registerErrors.value.account)
    messages2.push(registerErrors.value.account);
  if (registerErrors.value.email) messages2.push(registerErrors.value.email);
  if (registerErrors.value.password)
    messages2.push(registerErrors.value.password);
  if (registerErrors.value.confirmPassword)
    messages2.push(registerErrors.value.confirmPassword);
  return messages2.join("、") || "Ensure your email for registration";
});
// registerErrors.value?.account
// || registerErrors.value?.email
// || registerErrors.value?.password
// || registerErrors.value?.confirmPassword
// || 'Ensure your email for registration',

// 登入表單
const loginForm = useForm({
  validationSchema: yup.object({
    loginAccount: yup
      .string()
      .required("帳號或信箱是必填的")
      .test("isAccountOrEmail", "請輸入有效的帳號或電子郵件", (value) => {
        if (!value) return false;
        if (validator.isEmail(value)) return true;
        return /^[a-zA-Z0-9]{4,20}$/.test(value);
      }),

    loginPassword: yup
      .string()
      .required("登入密碼是必填的")
      .min(4, "密碼至少需要 4 個字元"),
  }),
});

const loginErrors = loginForm.errors;
const hasLoginErrors = computed(
  () => Object.keys(loginErrors.value).length > 0
);

const loginAccount = useField("loginAccount");
const loginPassword = useField("loginPassword");

const onLoginSubmit = loginForm.handleSubmit(async (values) => {
  console.log("登入送出:", values);
  try {
    const { data } = await userService.login({
      account: values.loginAccount,
      password: values.loginPassword,
    });
    console.log("登入回傳:", data);
    user.login(data.user);
    createSnackbar({
      text: "登入成功！",
      snackbarProps: {
        color: "green",
      },
    });
    router.push("/");
  } catch (error) {
    console.error(error);
    createSnackbar({
      text: error?.response?.data?.message || "登入失敗，請稍後再試！",
      snackbarProps: {
        color: "red",
      },
    });
  }
});

const onRegisterSubmit = registerForm.handleSubmit(async (values) => {
  console.log("註冊送出:", values);
  try {
    await userService.create({
      account: values.account,
      email: values.email,
      password: values.password,
    });
    createSnackbar({
      text: "註冊成功！",
      snackbarProps: {
        color: "green",
      },
    });
    step.value = 1; // 回到登入畫面
  } catch (error) {
    console.error(error);
    createSnackbar({
      text: error?.response?.data?.message || "註冊失敗，請稍後再試！",
      snackbarProps: {
        color: "red",
      },
    });
  }
});
</script>

<route lang="yaml">
meta:
  title: "登入 / 註冊"
  login: "no-login-only"
  admin: false
</route>
