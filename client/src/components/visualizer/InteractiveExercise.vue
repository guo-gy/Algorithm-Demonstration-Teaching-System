<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { buildPracticeSet } from '@shared/practice';
import type { FillBlankEvaluation, MultipleChoicePracticeQuestion } from '@shared/types';
import { useAlgorithmStore } from '../../stores/algorithm';
import { CheckCircle, AlertCircle, HelpCircle, RefreshCcw, ListChecks, PencilLine, LoaderCircle, Sparkles } from 'lucide-vue-next';

const algoStore = useAlgorithmStore();

const practiceMode = ref<'multiple-choice' | 'fill-blank'>('multiple-choice');
const multipleChoiceSelections = ref<Record<string, string>>({});
const multipleChoiceResults = ref<Record<string, 'correct' | 'wrong' | null>>({});
const fillBlankAnswer = ref('');
const fillBlankResult = ref<FillBlankEvaluation | null>(null);
const fillBlankError = ref('');
const isGradingFillBlank = ref(false);

const emptyPracticeSet = {
  multipleChoice: [],
  fillBlank: [],
};

const practiceSet = computed(() => {
  if (!algoStore.currentAlgorithm) return emptyPracticeSet;
  return buildPracticeSet(algoStore.currentAlgorithm, algoStore.currentSnapshot);
});

const fillBlankQuestion = computed(() => practiceSet.value.fillBlank[0] ?? null);

const multipleChoiceScore = computed(() =>
  practiceSet.value.multipleChoice.reduce((score, question) => {
    return multipleChoiceResults.value[question.id] === 'correct' ? score + question.points : score;
  }, 0),
);

const multipleChoiceTotal = computed(() =>
  practiceSet.value.multipleChoice.reduce((score, question) => score + question.points, 0),
);

const fillBlankScore = computed(() => fillBlankResult.value?.score ?? 0);
const fillBlankTotal = computed(() => fillBlankQuestion.value?.points ?? 0);

function resetPractice() {
  multipleChoiceSelections.value = {};
  multipleChoiceResults.value = {};
  fillBlankAnswer.value = '';
  fillBlankResult.value = null;
  fillBlankError.value = '';
  isGradingFillBlank.value = false;
  practiceMode.value = 'multiple-choice';
}

watch(
  [() => algoStore.currentAlgorithm?.id, () => algoStore.currentStepIndex],
  () => {
    resetPractice();
  },
);

function selectOption(questionId: string, optionId: string) {
  multipleChoiceSelections.value = {
    ...multipleChoiceSelections.value,
    [questionId]: optionId,
  };
  multipleChoiceResults.value = {
    ...multipleChoiceResults.value,
    [questionId]: null,
  };
}

function checkMultipleChoice(question: MultipleChoicePracticeQuestion) {
  const selectedOption = multipleChoiceSelections.value[question.id];
  if (!selectedOption) return;

  multipleChoiceResults.value = {
    ...multipleChoiceResults.value,
    [question.id]: selectedOption === question.correctOptionId ? 'correct' : 'wrong',
  };
}

function splitTemplateLine(line: string, blankToken: string) {
  const tokenIndex = line.indexOf(blankToken);
  if (tokenIndex === -1) {
    return { hasBlank: false, before: line, after: '' };
  }

  return {
    hasBlank: true,
    before: line.slice(0, tokenIndex),
    after: line.slice(tokenIndex + blankToken.length),
  };
}

async function submitFillBlank() {
  const question = fillBlankQuestion.value;
  if (!question || !fillBlankAnswer.value.trim()) return;

  isGradingFillBlank.value = true;
  fillBlankError.value = '';

  try {
    fillBlankResult.value = await algoStore.gradeFillBlank(question.id, fillBlankAnswer.value);
  } catch (error: any) {
    fillBlankResult.value = null;
    fillBlankError.value = error.response?.data?.error || error.message || '填空题判分失败，请稍后重试。';
  } finally {
    isGradingFillBlank.value = false;
  }
}

function clearFillBlankFeedback() {
  fillBlankResult.value = null;
  fillBlankError.value = '';
}

function getQuestionTypeLabel(subtype: MultipleChoicePracticeQuestion['subtype']) {
  return subtype === 'concept' ? '基础理解' : '计算题';
}
</script>

<template>
  <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2 text-primary-600">
        <HelpCircle class="w-5 h-5" />
        <h3 class="font-bold text-slate-800">互动练习</h3>
      </div>
      <button @click="resetPractice" class="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all">
        <RefreshCcw class="w-4 h-4" />
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p class="text-xs font-bold uppercase tracking-wider text-slate-400">选择题得分</p>
        <p class="mt-2 text-2xl font-bold text-slate-900">{{ multipleChoiceScore }} / {{ multipleChoiceTotal }}</p>
        <p class="mt-1 text-sm text-slate-500">包含基础知识理解和计算题两类。</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p class="text-xs font-bold uppercase tracking-wider text-slate-400">代码填空得分</p>
        <p class="mt-2 text-2xl font-bold text-slate-900">{{ fillBlankScore }} / {{ fillBlankTotal }}</p>
        <p class="mt-1 text-sm text-slate-500">填空题由 DeepSeek 进行语义判分并返回讲评。</p>
      </div>
    </div>

    <div class="inline-flex rounded-xl bg-slate-100 p-1">
      <button
        @click="practiceMode = 'multiple-choice'"
        class="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
        :class="practiceMode === 'multiple-choice' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
      >
        <span class="inline-flex items-center space-x-2">
          <ListChecks class="w-4 h-4" />
          <span>选择题</span>
        </span>
      </button>
      <button
        @click="practiceMode = 'fill-blank'"
        class="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
        :class="practiceMode === 'fill-blank' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
      >
        <span class="inline-flex items-center space-x-2">
          <PencilLine class="w-4 h-4" />
          <span>代码填空</span>
        </span>
      </button>
    </div>

    <template v-if="practiceMode === 'multiple-choice'">
      <div class="space-y-4">
        <div
          v-for="question in practiceSet.multipleChoice"
          :key="question.id"
          class="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4"
        >
          <div class="flex items-center justify-between gap-3">
            <span class="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-700">
              {{ getQuestionTypeLabel(question.subtype) }}
            </span>
            <span class="text-xs font-semibold text-slate-400">{{ question.points }} 分</span>
          </div>

          <p class="text-slate-800 font-semibold leading-relaxed">{{ question.prompt }}</p>

          <div class="space-y-3">
            <button
              v-for="option in question.options"
              :key="option.id"
              @click="selectOption(question.id, option.id)"
              class="w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group"
              :class="multipleChoiceSelections[question.id] === option.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-slate-100 hover:border-slate-200 hover:bg-white'"
            >
              <span class="text-sm font-medium" :class="multipleChoiceSelections[question.id] === option.id ? 'text-primary-700' : 'text-slate-600'">
                {{ option.text }}
              </span>
              <div
                class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                :class="multipleChoiceSelections[question.id] === option.id ? 'border-primary-500 bg-primary-500' : 'border-slate-200 group-hover:border-slate-300'"
              >
                <div v-if="multipleChoiceSelections[question.id] === option.id" class="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </button>
          </div>

          <div
            v-if="multipleChoiceResults[question.id]"
            class="rounded-xl border p-4 flex items-start space-x-3"
            :class="multipleChoiceResults[question.id] === 'correct'
              ? 'border-green-100 bg-green-50 text-green-700'
              : 'border-red-100 bg-red-50 text-red-700'"
          >
            <CheckCircle v-if="multipleChoiceResults[question.id] === 'correct'" class="w-5 h-5 mt-0.5" />
            <AlertCircle v-else class="w-5 h-5 mt-0.5" />
            <div class="space-y-1">
              <p class="font-bold">{{ multipleChoiceResults[question.id] === 'correct' ? '回答正确' : '再想一步' }}</p>
              <p class="text-sm leading-relaxed">{{ question.explanation }}</p>
            </div>
          </div>

          <button
            @click="checkMultipleChoice(question)"
            :disabled="!multipleChoiceSelections[question.id]"
            class="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
          >
            提交这道题
          </button>
        </div>
      </div>
    </template>

    <template v-else>
      <div v-if="fillBlankQuestion" class="space-y-4">
        <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4">
          <div class="flex items-center justify-between gap-3">
            <span class="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
              代码填空
            </span>
            <span class="text-xs font-semibold text-slate-400">{{ fillBlankQuestion.points }} 分</span>
          </div>

          <p class="text-slate-800 font-semibold leading-relaxed">{{ fillBlankQuestion.prompt }}</p>

          <div class="rounded-2xl bg-slate-950 text-slate-100 border border-slate-900 overflow-hidden">
            <div class="px-4 py-2 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">Pseudo Code</div>
            <div class="p-4 space-y-2 font-mono text-sm">
              <div
                v-for="(line, index) in fillBlankQuestion.templateLines"
                :key="`${fillBlankQuestion.id}-${index}`"
                class="flex items-center gap-2 flex-wrap"
              >
                <span class="w-6 text-right text-slate-500 select-none">{{ index + 1 }}</span>
                <template v-if="splitTemplateLine(line, fillBlankQuestion.blankToken).hasBlank">
                  <span>{{ splitTemplateLine(line, fillBlankQuestion.blankToken).before }}</span>
                  <input
                    v-model="fillBlankAnswer"
                    @input="clearFillBlankFeedback"
                    type="text"
                    class="min-w-[180px] rounded-md border border-primary-400/40 bg-slate-900 px-3 py-1 text-primary-200 outline-none focus:border-primary-300"
                    placeholder="填写这里"
                  />
                  <span>{{ splitTemplateLine(line, fillBlankQuestion.blankToken).after }}</span>
                </template>
                <template v-else>
                  <span>{{ line }}</span>
                </template>
              </div>
            </div>
          </div>

          <div class="rounded-xl border border-dashed border-slate-200 bg-white p-4">
            <p class="text-xs font-bold uppercase tracking-wider text-slate-400">提示</p>
            <p class="mt-2 text-sm text-slate-600">{{ fillBlankQuestion.hint }}</p>
          </div>

          <div v-if="fillBlankError" class="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {{ fillBlankError }}
          </div>

          <div
            v-if="fillBlankResult"
            class="rounded-xl border p-4 space-y-2"
            :class="fillBlankResult.isCorrect ? 'border-green-100 bg-green-50 text-green-700' : 'border-amber-100 bg-amber-50 text-amber-800'"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center space-x-2">
                <CheckCircle v-if="fillBlankResult.isCorrect" class="w-5 h-5" />
                <Sparkles v-else class="w-5 h-5" />
                <p class="font-bold">{{ fillBlankResult.isCorrect ? 'DeepSeek 判定正确' : 'DeepSeek 已完成讲评' }}</p>
              </div>
              <span class="rounded-full bg-white/70 px-3 py-1 text-xs font-bold">
                {{ fillBlankResult.score }} / {{ fillBlankQuestion.points }}
              </span>
            </div>
            <p class="text-sm leading-relaxed">{{ fillBlankResult.feedback }}</p>
            <p class="text-sm">
              参考答案：
              <span class="font-mono font-semibold">{{ fillBlankResult.expectedAnswer }}</span>
            </p>
            <p class="text-xs uppercase tracking-wider opacity-70">评分来源：{{ fillBlankResult.source === 'deepseek' ? 'DeepSeek' : '本地兜底规则' }}</p>
          </div>

          <button
            @click="submitFillBlank"
            :disabled="!fillBlankAnswer.trim() || isGradingFillBlank"
            class="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95 inline-flex items-center justify-center space-x-2"
          >
            <LoaderCircle v-if="isGradingFillBlank" class="w-4 h-4 animate-spin" />
            <span>{{ isGradingFillBlank ? 'DeepSeek 正在评分...' : '提交填空题' }}</span>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
