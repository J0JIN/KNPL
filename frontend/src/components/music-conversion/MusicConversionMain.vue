<template>
    <div
        class="conversion-title-main-container"
        :class="{ hidden: !initialRender }"
        @dragstart.prevent
    >
        <div
            class="conversion-function"
            @dragover.prevent="dragOver"
            @drop.prevent="handleDrop"
        >
            <div lang="en" class="conversion-title">AI Cover</div>
            <div lang="ko" class="conversion-body">
                노래를 원하는 목소리로 변환 합니다.
            </div>
            <input
                type="file"
                accept="audio/*"
                ref="fileInput"
                style="display: none"
                @change="handleFileSelect"
            />
            <div class="conversion-select-container" ref="btnRef">
                <div class="conversion-select-item">
                    <el-select
                        v-model="selectSinger"
                        placeholder="Select"
                        size="large"
                        style="width: 240px"
                    >
                        <el-option
                            v-for="item in options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </div>
                <div class="conversion-select-item">
                    <button @click="triggerFileSelect" class="custom-btn btn-7">
                        음원 선택
                    </button>
                </div>

                <el-tour v-model="conversionManual" class="conversion-step1">
                    <el-tour-step
                        lang="en"
                        title="AI Cover"
                        placement="right"
                        :target="btnRef"
                    >
                        <div lang="ko">해당 파일을 선택한 가수가</div>
                        <div lang="ko">부른것처럼 목소리를 변경</div>
                    </el-tour-step>
                </el-tour>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useConversionStore } from '@/stores/conversion';
import '@/components/music-conversion/music-conversion-title.css';
import '@/css/custom-btn.css';
import { ElNotification } from 'element-plus';

const store = useConversionStore();
const fileInput = ref<HTMLInputElement | null>(null);
const btnRef = ref<any>();
const initialRender = ref(false);
const selectSinger = ref('Kim');
const extension = ref('mp3');
const conversionManual = ref(true);

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

watch(conversionManual, (newValue, oldValue) => {
    // 쿠키에 저장, 만료 시간 1시간
    setCookie('conversionManual', newValue.toString(), 1);
});

const options = [
    {
        value: 'Kim',
        label: 'Kim',
    },
    {
        value: 'Na',
        label: 'Na',
    },
    {
        value: 'Park',
        label: 'Park',
    },
    {
        value: 'Lee',
        label: 'Lee',
    },
];

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
        store.selectSinger = selectSinger.value;
        store.musicConversion();
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
    const conversionManualCookie = getCookie('conversionManual');
    if (conversionManualCookie !== undefined) {
        // 쿠키 값이 'true' 또는 'false' 문자열이므로 Boolean으로 변환합니다.
        conversionManual.value = conversionManualCookie === 'true';
    }
    // Delay to trigger the animation after rendering
    setTimeout(() => {
        initialRender.value = true;
    }, 100);
});
</script>
