<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { LogOut, User, BookOpen } from 'lucide-vue-next';
import { useI18n } from '../../i18n';
import AuthModal from '../auth/AuthModal.vue';

const authStore = useAuthStore();
const { t } = useI18n();

const isAuthModalOpen = ref(false);
const authMode = ref<'login' | 'register'>('login');

const openAuth = (mode: 'login' | 'register') => {
  authMode.value = mode;
  isAuthModalOpen.value = true;
};
</script>

<template>
  <nav class="bg-white border-b border-slate-200 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <BookOpen class="h-8 w-8 text-primary-600" />
            <span class="ml-2 text-xl font-bold text-slate-900">AlgoEdu</span>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <a href="#" class="border-primary-500 text-slate-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
              {{ t('navbar.algorithms') }}
            </a>
            <a href="#" class="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
              {{ t('navbar.practice') }}
            </a>
            <a href="#" class="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
              {{ t('navbar.theory') }}
            </a>
          </div>
        </div>

        <div class="hidden sm:ml-6 sm:flex sm:items-center">
          <template v-if="authStore.isAuthenticated">
            <div class="flex items-center space-x-4">
              <div class="flex items-center px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                <User class="h-4 w-4 mr-2 text-slate-500" />
                <span class="text-sm font-semibold text-slate-700">
                  {{ authStore.user?.username }}
                </span>
              </div>
              <button 
                @click="authStore.logout" 
                class="flex items-center space-x-1 text-slate-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-all text-sm font-medium"
              >
                <LogOut class="h-4 w-4" />
                <span>{{ t('navbar.logout') }}</span>
              </button>
            </div>
          </template>
          <template v-else>
            <div class="flex items-center space-x-3">
              <button 
                @click="openAuth('login')"
                class="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                {{ t('navbar.login') }}
              </button>
              <button 
                @click="openAuth('register')"
                class="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-primary-700 shadow-md shadow-primary-100 transition-all active:scale-95"
              >
                {{ t('navbar.register') }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Auth Modal -->
    <AuthModal 
      :is-open="isAuthModalOpen" 
      :initial-mode="authMode"
      @close="isAuthModalOpen = false"
    />
  </nav>
</template>
