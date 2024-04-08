<template>
    <div
        class="music-input-title-container"
        :class="{
            hidden: !initialRender,
        }"
        @dragstart.prevent
    >
        <div class="music-input-function">
            <div class="music-input-title">AI Custom</div>
            <div class="music-input-body">
                원하는 노래에 원하는 음성을 입힙니다.
            </div>
            <input
                type="file"
                accept="audio/*"
                ref="fileInput"
                style="display: none"
            />
            <div class="music-input-select-container">
                <div class="music-input-select-song" ref="btnRef1">
                    <el-input
                        v-model="state.musicFileName"
                        style="width: 240px"
                        disabled
                        placeholder="노래를 선택하세요"
                    />
                    <button
                        @click="triggerMusicSelect"
                        class="custom-btn btn-7"
                    >
                        노래선택
                    </button>
                </div>
            </div>
            <div class="music-input-select-container">
                <div class="music-input-select-singer" ref="btnRef2">
                    <el-input
                        v-model="state.vocalFileName"
                        style="width: 240px"
                        disabled
                        placeholder="음성을 선택하세요"
                    />
                    <button
                        @click="triggerVocalSelect"
                        class="custom-btn btn-7"
                    >
                        음성 선택
                    </button>
                </div>
            </div>
            <div class="music-input-button-container">
                <div class="music-input-button">
                    <button
                        @click="dialogFormVisible = true"
                        class="custom-btn btn-primary"
                        ref="btnRef4"
                    >
                        결과 확인
                    </button>
                </div>
                <div class="music-input-button">
                    <button
                        @click="startConversion"
                        class="custom-btn btn-warning"
                        ref="btnRef3"
                    >
                        변환 진행
                    </button>
                </div>
            </div>
        </div>
    </div>

    <el-dialog v-model="dialogFormVisible" title="Token 입력" width="400">
        <el-form :model="formState" center>
            <el-form-item label="Token :">
                <el-input v-model="formState.taskId" autocomplete="off" />
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="dialogFormVisible = false">Cancel</el-button>
                <el-button type="primary" @click="confirmToken">
                    Confirm
                </el-button>
            </div>
        </template>
    </el-dialog>

    <el-tour v-model="aiCustomManual" class="custom-step1">
        <el-tour-step
            lang="en"
            title="AI Custom"
            placement="right"
            :target="btnRef1"
        >
            <div lang="ko">원하는 음원파일을 선택 (wav, mp3)</div>
            <div lang="ko" class="music-input-caution">
                ※ MR이 제거된 노래파일 필요
            </div>
        </el-tour-step>
        <el-tour-step
            lang="en"
            title="AI Custom"
            placement="right"
            :target="btnRef2"
        >
            <div lang="ko">사용자의 음성파일을 선택 (wav, mp3)</div>
            <div lang="ko" class="music-input-caution">
                ※ 30분 이상의 음성이 필요
            </div>
        </el-tour-step>
        <el-tour-step
            lang="en"
            title="AI Custom"
            placement="right"
            :target="btnRef3"
        >
            <div lang="ko">음원파일에 사용자의 음성을 입힙니다</div>
            <div lang="ko" class="music-input-caution">
                ※ 제공되는 코드는 결과 확인시 필요
            </div>
            <div lang="ko" class="music-input-caution">
                ※ 코드 재발급은 불가하니 주의
            </div>
        </el-tour-step>
        <el-tour-step
            lang="en"
            title="AI Custom"
            placement="left"
            :target="btnRef4"
        >
            <div lang="ko">음원 변환이 완료되면 코드를 입력하여</div>
            <div lang="ko">결과를 다운 받으실수 있습니다</div>
        </el-tour-step>
    </el-tour>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useMusicInputStore } from '@/stores/musicinput';
import '@/components/music-input/music-Input-title.css';
import '@/css/custom-btn.css';
import { ElNotification } from 'element-plus';

const store = useMusicInputStore();
const musicInputStore = useMusicInputStore();
const fileInput = ref<HTMLInputElement | null>(null);
const btnRef1 = ref<any>();
const btnRef2 = ref<any>();
const btnRef3 = ref<any>();
const btnRef4 = ref<any>();
const initialRender = ref(false);
const dialogFormVisible = ref(false);
const formState = reactive({
    taskId: '',
});
const aiCustomManual = ref(true);
const formLabelWidth = '2';

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

watch(aiCustomManual, (newValue, oldValue) => {
    // 쿠키에 저장, 만료 시간 1시간
    setCookie('aiCustomManual', newValue.toString(), 1);
});

const state = reactive({
    showVocalCaution: false,
    showMusicCaution: false,
    musicFileName: '', // 음악 파일 이름 저장
    vocalFileName: '', // 목소리 파일 이름 저장
});

const alertConversion = () => {
    ElNotification({
        title: '입력 확인',
        message: '파일을 입력해주세요',
        type: 'error',
    });
};

const sucessConversion = () => {
    ElNotification({
        title: 'Token 발급 중',
        message:
            '파일을 다시 찾을 때, 토큰이 필요하니 꼭 저장해주시길 바랍니다.',
        type: 'info',
    });
};

const triggerMusicSelect = () => {
    state.showMusicCaution = false;
    fileInput.value?.click();
    fileInput.value?.removeEventListener('change', handleVocalFile); // 목소리 선택 리스너 제거
    fileInput.value?.addEventListener('change', handleMusicFile); // 음원 선택 리스너 추가
};

const triggerVocalSelect = () => {
    state.showVocalCaution = false;
    fileInput.value?.click();
    fileInput.value?.removeEventListener('change', handleMusicFile); // 음원 선택 리스너 제거
    fileInput.value?.addEventListener('change', handleVocalFile); // 목소리 선택 리스너 추가
};

const handleMusicFile = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
        const file = files[0];
        processFile(file, 'music');
    }
};

const handleVocalFile = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
        const file = files[0];
        processFile(file, 'vocal');
    }
};

const processFile = (file: File, type: string) => {
    if (
        file.type === 'audio/mpeg' ||
        file.type === 'audio/wav' ||
        file.type === 'audio/x-wav'
    ) {
        if (type === 'music') {
            store.musicFile = file;
            state.musicFileName = file.name; // 파일 이름 저장
        } else if (type === 'vocal') {
            store.vocalFile = file;
            state.vocalFileName = file.name; // 파일 이름 저장
        }
    } else {
        if (type === 'music') {
            state.showMusicCaution = true;
            showAlert();
            resetFileInput();
        } else if (type === 'vocal') {
            state.showVocalCaution = true;
            showAlert();
            resetFileInput();
        }
    }
};

const startConversion = () => {
    if (state.musicFileName === '' || state.vocalFileName === '') {
        alertConversion();
    } else {
        sucessConversion();
        store.musicCustom();
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

const confirmToken = () => {
    musicInputStore.musicCustomResult(formState.taskId);
    dialogFormVisible.value = false;
};

onMounted(() => {
    const aiCustomManualCookie = getCookie('aiCustomManual');
    if (aiCustomManualCookie !== undefined) {
        // 쿠키 값이 'true' 또는 'false' 문자열이므로 Boolean으로 변환합니다.
        aiCustomManual.value = aiCustomManualCookie === 'true';
    }
    // Delay to trigger the animation after rendering
    setTimeout(() => {
        initialRender.value = true;
    }, 100);
});
</script>
