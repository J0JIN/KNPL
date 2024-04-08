<template>
    <div>
        <nav class="navbar">
            <!-- 화면 왼쪽에 배치될 요소 -->
            <div lang="en" @click="goToRoute('/')" class="logo-item router">
                <img
                    src="/assets/navbar-image/main-logo2.png"
                    class="logo-img"
                />
            </div>

            <!-- 화면 오른쪽에 배치될 요소들을 div로 그룹화 -->
            <div class="right-items">
                <div
                    @click="goToRoute('/separation')"
                    class="right-item item1 router"
                >
                    Separation
                </div>
                <div
                    @click="goToRoute('/conversion')"
                    class="right-item item2 router"
                >
                    AI Cover
                </div>
                <div
                    @click="goToRoute('/input')"
                    class="right-item item3 router"
                >
                    AI Custom
                </div>
            </div>
        </nav>
        <ExitAlarm v-if="exitAlarmStore.exitAlarm" />
        <Loading v-if="loadingAlarmStore.loadingAlarm" />
    </div>
</template>

<script setup lang="ts">
import { onBeforeRouteLeave } from 'vue-router';
import '@/components/navbar/navbar.css';
import { useRouter } from 'vue-router';
import { useSeparateStore } from '@/stores/separate';
import { useConversionStore } from '@/stores/conversion';
import { useExitAlarmStore } from '@/stores/exit-alarm';
import { useLoadingAlarmStore } from '@/stores/loading-alarm';
import ExitAlarm from '@/components/exit-alarm/ExitAlarm.vue';
import Loading from '@/components/loading/Loading.vue';

const router = useRouter();
const separateStore = useSeparateStore();
const conversionStore = useConversionStore();
const exitAlarmStore = useExitAlarmStore();
const loadingAlarmStore = useLoadingAlarmStore();

const goToRoute = (path: string) => {
    if (separateStore.check || conversionStore.check) {
        exitAlarmStore.exitAlarm = true;
        exitAlarmStore.path = path;
    } else {
        router.push(path);
    }
};

onBeforeRouteLeave((to, from, next) => {
    next();
});
</script>
