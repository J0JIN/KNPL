<template>
    <div class="loading-modal">
        <div class="loading-modal-content">
            <div lang="en" @click="cancelLoading" class="loading-image">
                <img
                    class="loading-image"
                    src="/assets/navbar-image/main-logo2.png"
                />
            </div>

            <div class="loading-game-container">
                <div class="loading-game">
                    <BoardView />
                </div>
            </div>
            <div class="loding-alarm">Loading{{ loadingDots }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import '@/components/loading/loading.css';
import { useLoadingAlarmStore } from '@/stores/loading-alarm';
import { useSeparateStore } from '@/stores/separate';
import { useConversionStore } from '@/stores/conversion';
const loadingAlarmStore = useLoadingAlarmStore();
const separateStore = useSeparateStore();
const conversionStore = useConversionStore();

// game
import BoardView from './BoardView.vue';
const loadingDots = ref('.');

onMounted(() => {
    let count = 0;
    const interval = setInterval(() => {
        count = (count + 1) % 5;
        loadingDots.value = '.'.repeat(count || 1);
    }, 500);

    onUnmounted(() => {
        clearInterval(interval);
    });
});

const cancelLoading = () => {
    loadingAlarmStore.loadingAlarm = false;
    conversionStore.sseDisconnect();
    separateStore.sseDisconnect();
};
</script>

<style scoped lang="scss">
// game
@import './scss/main.scss';
@import './scss/style.scss';
</style>
