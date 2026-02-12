import { reactive, computed } from 'vue';
import zh from './locales/zh.json';

const state = reactive({
    locale: 'zh',
    translations: {
        zh
    } as Record<string, any>
});

export function useI18n() {
    const t = (key: string, params: Record<string, any> = {}) => {
        const keys = key.split('.');
        let value: any = state.translations[state.locale];

        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                return key;
            }
        }

        if (typeof value !== 'string') return key;

        let result = value;
        for (const [pKey, pVal] of Object.entries(params)) {
            result = result.replace(new RegExp(`{${pKey}}`, 'g'), String(pVal));
        }

        return result;
    };

    const locale = computed(() => state.locale);

    return { t, locale };
}
