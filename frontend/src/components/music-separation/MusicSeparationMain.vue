<template>
    <div
        class="separation-title-maincontainer"
        :class="{
            hidden: !initialRender,
        }"
        @dragstart.prevent
    >
        <div
            class="music-separation-function"
            @dragover.prevent="dragOver"
            @drop.prevent="handleDrop"
        >
            <div lang="en" class="separation-title">Separation</div>
            <div lang="ko" class="separation-body">
                노래에서 악기를 분리합니다.
            </div>
            <input
                type="file"
                accept="audio/*"
                ref="fileInput"
                style="display: none"
                @change="handleFileSelect"
            />
            <div class="separation-select-container">
                <div class="separation-button-container">
                    <el-button
                        ref="btnRef"
                        lang="ko"
                        @click="triggerFileSelect"
                        class="custom-btn btn-7"
                    >
                        음원 선택
                    </el-button>
                </div>

                <el-tour v-model="separateMainManual" class="separation-step1">
                    <el-tour-step
                        lang="en"
                        title="Separation"
                        placement="right"
                        :target="btnRef?.$el"
                    >
                        <div lang="ko">사용자의 mp3, wav 파일을</div>
                        <div lang="ko">4가지 세션으로 분리</div>
                    </el-tour-step>
                </el-tour>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import type { ButtonInstance } from 'element-plus';
import { useSeparateStore } from '@/stores/separate';
import '@/components/music-separation/music-separation-title.css';
import '@/css/custom-btn.css';
import { ElNotification } from 'element-plus';
const store = useSeparateStore();
const separateMainManual = ref(true);
const fileInput = ref<HTMLInputElement | null>(null);
const btnRef = ref<ButtonInstance>();
const initialRender = ref(false);
const extension = ref('mp3');

const setCookie = (name: string, value: string, hours: number) => {
    let expires = '';
    if (hours) {
        const date = new Date();
        date.setTime(date.getTime() + hours * 60 * 60 * 1000);
        expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/';
};

const getCookie = (name: string): string | undefined => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
};

watch(separateMainManual, (newValue, oldValue) => {
    // 쿠키에 저장, 만료 시간 1시간
    setCookie('separateMainManual', newValue.toString(), 1);
});

const dragOver = (event: DragEvent) => {
    event.preventDefault();
};

const handleDrop = (event: DragEvent) => {
    event.preventDefault(); // 기본 동작을 방지
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
        const file = files[0];
        processFile(file);
    }
};

const triggerFileSelect = () => {
    fileInput.value?.click();
};

const handleFileSelect = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
        const file = files[0];
        processFile(file);
    }
};

const processFile = (file: File) => {
    // MP3 또는 WAV 파일인지 확인합니다.
    if (
        file.type === 'audio/mpeg' ||
        file.type === 'audio/wav' ||
        file.type === 'audio/x-wav'
    ) {
        store.musicFile = file;
        store.outPutExtension = extension.value;
        store.musicSeparation();
    } else {
        // 잘못된 파일 형식일 경우, 경고 메시지를 표시합니다.
        showAlert();
        resetFileInput();
    }
};

const showAlert = () => {
    ElNotification({
        title: '잘못된 파일 형식',
        message:
            '오디오 파일의 확장자를 확인해주세요.\n지원되는 형식: mp3, wav',
        type: 'error',
    });
};

const resetFileInput = () => {
    if (fileInput.value) {
        fileInput.value.value = ''; // 파일 입력 필드를 클리어합니다.
    }
};

onMounted(() => {
    const separateMainManualCookie = getCookie('separateMainManual');
    if (separateMainManualCookie !== undefined) {
        // 쿠키 값이 'true' 또는 'false' 문자열이므로 Boolean으로 변환합니다.
        separateMainManual.value = separateMainManualCookie === 'true';
    }
    // Delay to trigger the animation after rendering
    setTimeout(() => {
        initialRender.value = true;
    }, 100);
});
</script>
