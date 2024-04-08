import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useRouter } from 'vue-router';
import { useSeparateStore } from '@/stores/separate';
import { useConversionStore } from '@/stores/conversion';

export const useExitAlarmStore = defineStore('exitalarm', () => {
    const exitAlarm = ref(false);
    const path = ref('');
    const router = useRouter();
    const separateStore = useSeparateStore();
    const conversionStore = useConversionStore();

    const moveOtherView = () => {
        router.push(path.value);
        exitAlarm.value = false;
        separateStore.check = false;
        conversionStore.check = false;
        path.value = '';
    };
    return { exitAlarm, moveOtherView, path };
});
