<template>
    <el-dialog
        v-model="exitAlarmStore.exitAlarm"
        title="이 페이지에서 나가시겠습니까?"
        width="500"
    >
        <span>변경사항이 저장되지 않을 수 있습니다.</span>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="cancel">취소</el-button>
                <el-button type="primary" @click="confirm">나가기</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { useExitAlarmStore } from '@/stores/exit-alarm';

const exitAlarmStore = useExitAlarmStore();

const confirm = () => {
    exitAlarmStore.moveOtherView();
};
const cancel = () => {
    exitAlarmStore.exitAlarm = false;
    exitAlarmStore.path = '';
};
</script>
