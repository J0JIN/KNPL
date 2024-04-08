<template>
    <div>
        <div v-if="!store.check">
            <MusicConversionMain />
        </div>
        <div v-else>
            <MusicConversionResult />
        </div>
    </div>
</template>

<script setup lang="ts">
import MusicConversionResult from '@/components/music-conversion/MusicConversionResult.vue';
import MusicConversionMain from '@/components/music-conversion/MusicConversionMain.vue';
import { useConversionStore } from '@/stores/conversion';
import { useExitAlarmStore } from '@/stores/exit-alarm';
import { onBeforeRouteLeave } from 'vue-router';
import { onMounted, onUnmounted } from 'vue';

const store = useConversionStore();
const exitAlarmStore = useExitAlarmStore();

const preventRefresh = (event: KeyboardEvent) => {
    if (event.key === 'F5' && store.check) {
        event.preventDefault();
        exitAlarmStore.exitAlarm = true;
    }
};

onMounted(() => {
    // 새로고침키 이벤트 감지
    window.addEventListener('keydown', preventRefresh);
});

onUnmounted(() => {
    // 새로고침 키 이벤트 감지 해제
    window.removeEventListener('keydown', preventRefresh);
});

onBeforeRouteLeave((to, from, next) => {
    if (!store.check) {
        next();
    } else {
        exitAlarmStore.exitAlarm = true;
    }
});
</script>
