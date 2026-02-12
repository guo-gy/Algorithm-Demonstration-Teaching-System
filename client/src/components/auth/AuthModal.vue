<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { X, User, Lock, Loader2 } from 'lucide-vue-next';
import { useI18n } from '../../i18n';

const props = defineProps<{
  isOpen: boolean;
  initialMode: 'login' | 'register';
}>();

const emit = defineEmits(['close']);

const { t } = useI18n();
const authStore = useAuthStore();

const mode = ref<'login' | 'register'>(props.initialMode);
const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const toggleMode = () => {
  mode.value = mode.value === 'login' ? 'register' : 'login';
  error.value = '';
};

const handleSubmit = async () => {
  if (!username.value || !password.value) {
    error.value = t('auth.error_required');
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    if (mode.value === 'login') {
      await authStore.login(username.value, password.value);
    } else {
      await authStore.register(username.value, password.value);
    }
    emit('close');
    // Reset form
    username.value = '';
    password.value = '';
  } catch (err: any) {
    error.value = err.response?.data?.error || t('auth.error_failed');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
    <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
      <!-- Header -->
      <div class="relative p-6 text-center border-b border-slate-100">
        <button 
          @click="emit('close')"
          class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
        <h2 class="text-2xl font-bold text-slate-900">
          {{ mode === 'login' ? t('auth.login') : t('auth.register') }}
        </h2>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-8 space-y-6">
        <div v-if="error" class="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg text-center">
          {{ error }}
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">{{ t('auth.username') }}</label>
            <div class="relative">
              <User class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                v-model="username"
                type="text" 
                class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                :placeholder="t('auth.username')"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">{{ t('auth.password') }}</label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                v-model="password"
                type="password" 
                class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                :placeholder="t('auth.password')"
              />
            </div>
          </div>
        </div>

        <button 
          type="submit"
          :disabled="loading"
          class="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-primary-200 transition-all flex items-center justify-center space-x-2"
        >
          <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
          <span>{{ mode === 'login' ? t('auth.login') : t('auth.register') }}</span>
        </button>

        <div class="text-center">
          <p class="text-sm text-slate-500">
            {{ mode === 'login' ? t('auth.no_account') : t('auth.has_account') }}
            <button 
              type="button"
              @click="toggleMode"
              class="text-primary-600 font-bold hover:underline ml-1"
            >
              {{ mode === 'login' ? t('auth.register') : t('auth.login') }}
            </button>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>
