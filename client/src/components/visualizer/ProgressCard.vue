<script setup lang="ts">
import { computed } from 'vue';
import { useAlgorithmStore } from '../../stores/algorithm';
import { useAuthStore } from '../../stores/auth';
import { Trophy, Clock, CheckCircle2, Lock } from 'lucide-vue-next';
import { useI18n } from '../../i18n';

const algoStore = useAlgorithmStore();
const authStore = useAuthStore();
const { t } = useI18n();

const progress = computed(() => {
  if (!authStore.isAuthenticated || !algoStore.currentAlgorithm) return null;
  // This would ideally come from a progress store or be fetched when algorithm changes
  return null; // For now, we'll show a placeholder or "Locked" state if not implemented fully
});
</script>

<template>
  <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
    <div v-if="!authStore.isAuthenticated" class="absolute inset-0 bg-slate-50/80 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center text-center p-4">
      <Lock class="w-8 h-8 text-slate-400 mb-2" />
      <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">{{ t('navbar.login') }}以查看进度</p>
    </div>

    <h3 class="font-bold text-slate-800 mb-4 flex items-center">
      <Trophy class="w-4 h-4 mr-2 text-yellow-500" />
      学习进度
    </h3>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <CheckCircle2 class="w-4 h-4 text-green-500" />
          <span class="text-sm text-slate-600">已完成演示</span>
        </div>
        <span class="text-xs font-bold text-slate-400">100%</span>
      </div>
      
      <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <div class="bg-green-500 h-full w-[100%] rounded-full"></div>
      </div>

      <div class="flex items-center justify-between text-xs text-slate-400">
        <div class="flex items-center">
          <Clock class="w-3 h-3 mr-1" />
          <span>上次访问: 刚刚</span>
        </div>
        <span>得分: 85</span>
      </div>
    </div>
  </div>
</template>
