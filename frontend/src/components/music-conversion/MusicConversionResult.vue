<template>
    <div class="conversion-main-container" :class="{ hidden: !initialRender }">
        <div class="conversion-music-container">
            <div class="conversion-audio-controls-container">
                <div class="conversion-volume-controls">
                    <div class="conversion-track">
                        <el-checkbox
                            v-model="isTurnedOn"
                            sizs="large"
                            label="음량"
                            style="
                                width: 130px;
                                margin-left: 10px;
                                margin-right: 10px;
                            "
                        />
                        <el-slider
                            v-model="volume"
                            :min="0"
                            :max="100"
                            :step="1"
                            style="margin-right: 10px"
                        />
                        <div lang="en" class="volume-text">{{ volume }}</div>
                    </div>
                </div>
                <div id="waveform" class="conversion-waveform-container"></div>
            </div>
            <div class="conversion-equalizer">
                <div
                    v-for="(freq, index) in eqBands"
                    :key="freq"
                    class="equalizer-slider-container"
                >
                    <div style="color: #eeeeee">
                        {{ filters[index]?.gain.value }}db
                    </div>
                    <el-slider
                        :min="-10"
                        :max="10"
                        :step="1"
                        v-model="eqSettings[index]"
                        vertical
                        show-stops
                        :show-tootip="false"
                        height="200px"
                    />
                    <div style="color: #eeeeee">
                        {{
                            eqBands[index] >= 1000
                                ? eqBands[index] / 1000 + 'k'
                                : eqBands[index]
                        }}Hz
                    </div>
                </div>
            </div>
            <div class="conversion-main-buttons-container">
                <div>
                    <el-button-group>
                        <el-button
                            type="primary"
                            size="large"
                            style="font-size: 17px"
                            :icon="isPlaying ? VideoPause : VideoPlay"
                            @click="togglePlay"
                            >{{ isPlaying ? '일시정지' : '재생' }}</el-button
                        >
                        <el-button
                            type="primary"
                            size="large"
                            style="font-size: 17px"
                            @click="rewindAudio"
                            >Replay</el-button
                        >
                    </el-button-group>
                </div>
                <div>
                    <div class="save-button-container">
                        <div
                            class="flex flex-wrap items-center"
                            style="margin-left: 3px"
                        >
                            <el-button
                                type="success"
                                size="large"
                                style="font-size: 17px"
                                :icon="Download"
                                @click="conversionFileDownload"
                            >
                                저장
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch, onUnmounted } from 'vue';
import { useConversionStore } from '@/stores/conversion';
import WaveSurfer from 'wavesurfer.js';
import '@/components/music-conversion/music-conversion-main.css';
import { VideoPause, VideoPlay, Download } from '@element-plus/icons-vue';

const store = useConversionStore();
const initialRender = ref(false);

let waveSurfer = ref<WaveSurfer | null>(null);
const isPlaying = ref(false);
const isTurnedOn = ref(true);
const volume = ref(50);
const audioContext = new AudioContext();
// Define the equalizer bands
const eqBands = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
// Reactive filters array
const filters: BiquadFilterNode[] = reactive([]);
const eqSettings = ref(eqBands.map(() => 0));
const initializeSingletrack = () => {
    if (!audioContext) return;
    // 오디오 파일 생성.
    const audio = document.createElement('audio');
    audio.src = `${store.conversionFile.url}`;

    // Wavesufer 생성.
    waveSurfer.value = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'rgb(255, 133, 96)',
        progressColor: 'white',
        media: audio,
    });
    waveSurfer.value.on('ready', () => {});
    waveSurfer.value.on('play', () => (isPlaying.value = true));
    waveSurfer.value.on('pause', () => (isPlaying.value = false));
    waveSurfer.value.on('finish', () => (isPlaying.value = false));
    setupEq(audio);
    // 이퀄라이저 설정.
    watch(volume, (newValue) => {
        if (waveSurfer.value) {
            waveSurfer.value.setVolume(newValue / 100);
        }
    });

    watch(isTurnedOn, (newValue) => {
        if (isTurnedOn.value) {
            waveSurfer.value?.setVolume(volume.value / 100);
        } else {
            waveSurfer.value?.setVolume(0);
        }
    });
};

// 오디오 이퀄라이저 설정.
const setupEq = (audioElement: HTMLAudioElement) => {
    const mediaElementSource =
        audioContext.createMediaElementSource(audioElement);
    let previous: AudioNode = mediaElementSource;
    eqBands.forEach((band, index) => {
        const filter = audioContext.createBiquadFilter();
        filter.type =
            band <= 60 ? 'lowshelf' : band >= 16000 ? 'highshelf' : 'peaking';
        filter.frequency.value = band;
        filter.Q.value = 1;
        filter.gain.value = eqSettings.value[index];
        filters.push(filter);
        previous.connect(filter);
        previous = filter;
    });
    previous.connect(audioContext.destination);
};

watch(
    eqSettings,
    (newSettings) => {
        newSettings.forEach((gain, index) => {
            if (filters[index]) {
                filters[index].gain.value = gain;
            }
        });
    },
    { deep: true }
);

// 음악 재생, 정지 버튼.
const togglePlay = async () => {
    if (!waveSurfer.value) return;
    // 사용자가 버튼을 눌렀을 때 AudioContext가 중지 상태인 경우 재개
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }
    waveSurfer.value.isPlaying()
        ? waveSurfer.value.pause()
        : waveSurfer.value.play();
};

// 오디오  0초로 되감기.
const rewindAudio = () => {
    if (!waveSurfer.value) return;
    waveSurfer.value.seekTo(0);
};

onMounted(() => {
    initializeSingletrack();
    setTimeout(() => {
        initialRender.value = true;
    }, 100);
});

onUnmounted(() => {
    if (waveSurfer.value) {
        waveSurfer.value.destroy(); // WaveSurfer 인스턴스를 정리합니다.
        waveSurfer.value = null;
        store.musicFile = null;
    }
    store.check = false; // 여기에 추가적인 종료 로직을 구현
});

const conversionFileDownload = () => {
    const link = document.createElement(`a`);
    link.href = `${store.conversionFile.url}`;
    link.download = `${store.filename}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
</script>
