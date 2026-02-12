<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useAlgorithmStore } from '../../stores/algorithm';
import { CheckCircle, AlertCircle, HelpCircle, RefreshCcw } from 'lucide-vue-next';
import { useI18n } from '../../i18n';

const algoStore = useAlgorithmStore();
const { t } = useI18n();
const selectedOption = ref<string | null>(null);
const result = ref<'correct' | 'wrong' | null>(null);

// Reset state when algorithm or snapshot changes significantly
watch(() => algoStore.currentAlgorithm?.id, () => {
  reset();
});

const question = computed(() => {
  const id = algoStore.currentAlgorithm?.id;
  const snapshot = algoStore.currentSnapshot;
  
  if (id === 'bubble-sort') {
    const j = snapshot?.variables.j ?? 0;
    return {
      text: t('practice.bubble_sort_question'),
      options: [
        { id: 'a', text: t('practice.bubble_sort_opt_a', { j, j1: j + 1 }) },
        { id: 'b', text: "比较数组中不相邻的元素" },
        { id: 'c', text: "直接将当前元素移动到末尾" }
      ],
      correctId: 'a'
    };
  } else if (id === 'binary-search') {
    const mid = snapshot?.variables.mid ?? 0;
    const target = algoStore.currentSnapshot?.variables.target ?? "";
    return {
      text: `在二分查找中，当前中间索引是 ${mid}。如果 arr[${mid}] < ${target}，下一步应该做什么？`,
      options: [
        { id: 'a', text: "在左半部分继续查找" },
        { id: 'b', text: `将左边界移动到 ${mid + 1}` },
        { id: 'c', text: "算法立即结束" }
      ],
      correctId: 'b'
    };
  } else if (id === 'dfs' || id === 'bfs') {
    const visiting = snapshot?.variables.visiting ?? "A";
    return {
      text: `${id.toUpperCase()} 算法当前正在访问节点 ${visiting}。接下来会发生什么？`,
      options: [
        { id: 'a', text: "访问该节点的所有邻居" },
        { id: 'b', text: id === 'dfs' ? "沿着一条路深入探索" : "按层级访问节点" },
        { id: 'c', text: "随机跳转到另一个节点" }
      ],
      correctId: 'b'
    };
  }
  
  return {
    text: t('practice.default_question'),
    options: [
      { id: 'a', text: t('practice.default_opt_a') },
      { id: 'b', text: t('practice.default_opt_b') },
      { id: 'c', text: t('practice.default_opt_c') }
    ],
    correctId: 'a'
  };
});

const checkAnswer = () => {
  if (selectedOption.value === question.value.correctId) {
    result.value = 'correct';
  } else {
    result.value = 'wrong';
  }
};

const reset = () => {
  selectedOption.value = null;
  result.value = null;
};
</script>

<template>
  <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-2 text-primary-600">
        <HelpCircle class="w-5 h-5" />
        <h3 class="font-bold text-slate-800">{{ t('practice.title') }}</h3>
      </div>
      <button @click="reset" class="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all">
        <RefreshCcw class="w-4 h-4" />
      </button>
    </div>

    <div class="p-4 bg-slate-50 border border-slate-100 rounded-xl">
      <p class="text-slate-700 font-semibold leading-relaxed">{{ question.text }}</p>
    </div>

    <div class="space-y-3">
      <button 
        v-for="opt in question.options" 
        :key="opt.id"
        @click="selectedOption = opt.id; result = null"
        class="w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group"
        :class="[
          selectedOption === opt.id 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
        ]"
      >
        <span class="text-sm font-medium" :class="selectedOption === opt.id ? 'text-primary-700' : 'text-slate-600'">{{ opt.text }}</span>
        <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
          :class="selectedOption === opt.id ? 'border-primary-500 bg-primary-500' : 'border-slate-200 group-hover:border-slate-300'">
          <div v-if="selectedOption === opt.id" class="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </button>
    </div>

    <div v-if="result" class="p-4 rounded-xl flex items-center space-x-3 animate-in slide-in-from-top-2 duration-300" 
      :class="result === 'correct' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'">
      <CheckCircle v-if="result === 'correct'" class="w-5 h-5" />
      <AlertCircle v-else class="w-5 h-5" />
      <span class="text-sm font-bold">{{ result === 'correct' ? t('practice.correct_msg') : t('practice.wrong_msg') }}</span>
    </div>

    <div class="flex space-x-3 pt-4">
      <button 
        @click="checkAnswer"
        :disabled="!selectedOption || result !== null"
        class="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
      >
        {{ t('practice.check_answer') }}
      </button>
    </div>
  </div>
</template>
