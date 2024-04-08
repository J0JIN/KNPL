<template>
    <div>
        <div v-if="!store.check">
            <MusicSeparationMain />
        </div>
        <div v-else>
            <MusicSeparationResult />
        </div>
    </div>
</template>

<script setup lang="ts">
import MusicSeparationMain from "@/components/music-separation/MusicSeparationMain.vue";
import MusicSeparationResult from "@/components/music-separation/MusicSeparationResult.vue";
import { useSeparateStore } from "@/stores/separate";
import { useExitAlarmStore } from "@/stores/exit-alarm";
import { onBeforeRouteLeave } from "vue-router";
import { onMounted, onUnmounted } from 'vue';

const store = useSeparateStore();
const exitAlarmStore = useExitAlarmStore();
// 새로고침을 방지.  
// KeyboardEvent => 키보드의 특정 버튼눌렀을때 반응. 
const preventRefresh = (event: KeyboardEvent) => {
    if (event.key === "F5" && store.check) {
        event.preventDefault();
        exitAlarmStore.exitAlarm = true
    }
}

onMounted(() => {
    // 새로고침키 이벤트 감지
    window.addEventListener('keydown', preventRefresh);
});

onUnmounted(() => {
    // 새로고침 키 이벤트 감지 해제 
    window.removeEventListener('keydown', preventRefresh);
});

//vue 라우터에서 해당 화면을 뒤로가기로 떠나려 할때 사용하는 함수
onBeforeRouteLeave((to, from, next) => {
    if (!store.check) {
        next()
    } else {
        exitAlarmStore.exitAlarm = true
    }
});

</script>
