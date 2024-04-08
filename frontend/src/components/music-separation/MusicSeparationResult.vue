<template>
    <div
        class="music-separation-main-container"
        :class="{ hidden: !initialRender }"
    >
        <div class="music-separation-container">
            <div class="audio-controls-container" ref="ckBoxRef">
                <!-- 왼쪽 영역: 볼륨 조절기 -->
                <div class="music-separation-volume-controls" ref="audioRef">
                    <div
                        v-for="track in tracks"
                        :key="track.id"
                        class="track"
                        lang="ko"
                    >
                        <el-checkbox
                            v-model="track.isTurnedOn"
                            sizs="large"
                            :label="track.label"
                            style="width: 130px; margin-right: 25px"
                        />
                        <el-slider
                            v-model="track.volume"
                            :min="0"
                            :max="100"
                            :step="1"
                            @click="updateVolume(track.id)"
                        />
                        <div lang="en" class="volume-text">
                            {{ track.volume }}
                        </div>
                    </div>
                </div>
                <!-- 오른쪽 영역: 컨테이너 -->
                <div ref="container" class="separate-waveform-container"></div>
                <div
                    v-if="!separateConversion"
                    type="selecet-boxs"
                    ref="selectSinger"
                >
                    <div v-for="(track, index) in tracks" class="selecet-box">
                        <el-select
                            v-if="!separateConversion"
                            v-model="track.selectedSinger"
                            placeholder="프리셋 선택"
                            @change="updateSvcFile(index)"
                            style="width: 150px"
                        >
                            <el-option value="Kim">Kim</el-option>
                            <el-option value="Na">Na</el-option>
                            <el-option value="Park">Park</el-option>
                            <el-option value="Lee">Lee</el-option>
                            <el-option value="변환하지 않음"
                                >변환하지 않음</el-option
                            >
                        </el-select>
                    </div>
                </div>
            </div>
            <div class="equalizer">
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
                        show-stops
                        v-model="eqSettings[index]"
                        vertical
                        :show-tooltip="false"
                        height="180px"
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
            <div class="buttons-container">
                <div>
                    <el-button-group ref="playbutton">
                        <el-button
                            type="primary"
                            style="font-size: 14px"
                            :icon="isPlaying ? VideoPause : VideoPlay"
                            @click="togglePlay"
                            >{{ isPlaying ? '일시정지' : '재생' }}</el-button
                        >
                        <el-button
                            type="primary"
                            style="font-size: 14px"
                            @click="reWind"
                            >Replay</el-button
                        >
                    </el-button-group>
                </div>
                <div>
                    <div class="save-button-container">
                        <el-button
                            v-if="!separateConversion"
                            style="font-size: 14px"
                            type="primary"
                            :icon="Switch"
                            @click="startConversion"
                            ref="conversion"
                            >변환</el-button
                        >
                        <div
                            class="flex flex-wrap items-center"
                            style="margin-left: 3px"
                        >
                            <el-dropdown
                                split-button
                                type="success"
                                @click="separationMixing"
                                style="font-size: 14px"
                                ref="mixing"
                            >
                                믹싱
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            ><el-checkbox
                                                @click.navtive.stop=""
                                                v-model="checkedMixOther"
                                                label="Music"
                                        /></el-dropdown-item>
                                        <el-dropdown-item
                                            ><el-checkbox
                                                @click.navtive.stop=""
                                                v-model="checkedMixVocals"
                                                label="Vocal"
                                        /></el-dropdown-item>
                                        <el-dropdown-item
                                            ><el-checkbox
                                                @click.navtive.stop=""
                                                v-model="checkedMixBass"
                                                label="Bass"
                                        /></el-dropdown-item>
                                        <el-dropdown-item
                                            ><el-checkbox
                                                @click.navtive.stop=""
                                                v-model="checkedMixDrums"
                                                label="Drum"
                                        /></el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </div>
                        <div
                            class="flex flex-wrap items-center"
                            style="margin-left: 3px"
                        >
                            <el-dropdown>
                                <el-button
                                    type="success"
                                    style="font-size: 14px"
                                    :icon="Download"
                                    ref="save"
                                >
                                    저장<el-icon class="el-icon--right"
                                        ><ArrowDown
                                    /></el-icon>
                                </el-button>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            @click="sessionFileDownload"
                                            >Music</el-dropdown-item
                                        >
                                        <el-dropdown-item
                                            @click="vocalFileDownload"
                                            >Vocal</el-dropdown-item
                                        >
                                        <el-dropdown-item
                                            @click="bassFileDownload"
                                            >Bass</el-dropdown-item
                                        >
                                        <el-dropdown-item
                                            @click="drumFileDownload"
                                            >Drum</el-dropdown-item
                                        >
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </div>
                        <el-tour
                            v-model="separateResultManual"
                            class="separation-result-step"
                        >
                            <el-tour-step
                                title="가수 선택"
                                placement="left"
                                :target="selectSinger"
                                lang="ko"
                            >
                                <div lang="ko">4명의 가수 중 하나를 선택</div>
                            </el-tour-step>
                            <el-tour-step
                                lang="ko"
                                title="음원 변환"
                                placement="top"
                                :target="conversion?.$el"
                            >
                                <div lang="ko">
                                    세션별로 선택한 가수들의 목소리로 음원을
                                    변환
                                </div>
                            </el-tour-step>
                            <el-tour-step
                                lang="ko"
                                title="음원 믹싱"
                                placement="top"
                                :target="mixing?.$el"
                            >
                                <div lang="ko">
                                    원하는 세션을 선택 후 믹싱 버튼을
                                </div>
                                <div lang="ko">
                                    누를 시 하나의 음원으로 제공
                                </div>
                            </el-tour-step>
                            <el-tour-step
                                lang="ko"
                                title="음원 저장"
                                placement="top"
                                :target="save?.$el"
                            >
                                <div lang="ko">원하는 세션을 선택하여 저장</div>
                            </el-tour-step>
                        </el-tour>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, reactive } from 'vue';
import { useSeparateStore } from '@/stores/separate';
import '@/components/music-separation/music-separation-main.css';
import type { ButtonInstance } from 'element-plus';
import {
    VideoPause,
    VideoPlay,
    ArrowDown,
    Switch,
    Download,
} from '@element-plus/icons-vue';

declare const Multitrack: any;
const store = useSeparateStore();
const initialRender = ref(false);
const audioRef = ref<any>();
const selectSinger = ref<any>();
const playbutton = ref<any>();
const conversion = ref<ButtonInstance>();
const mixing = ref<ButtonInstance>();
const save = ref<ButtonInstance>();
const isPlaying = ref(false);
const separateConversion = ref(false);
const separateResultManual = ref(true);
const container = ref<HTMLElement | null>(null);
let multitrack = ref<any>(null);
const audioContext = new AudioContext();
const eqBands = [60, 140, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
const filters: BiquadFilterNode[] = reactive([]);
const eqSettings = ref(eqBands.map(() => 0));
const trackVocalAudio: HTMLAudioElement = document.createElement('audio');
const trackSessionAudio: HTMLAudioElement = document.createElement('audio');
const trackDrumAudio: HTMLAudioElement = document.createElement('audio');
const trackBassAudio: HTMLAudioElement = document.createElement('audio');

const checkedMixOther = ref(false);
const checkedMixVocals = ref(false);
const checkedMixBass = ref(false);
const checkedMixDrums = ref(false);

const startConversion = () => {
    isPlaying.value = multitrack.value.pause();
    store.separateConversion = true;
    separateConversion.value = true;
    // 기존 음원분리 트랙 제거.
    multitrack.value.destroy();
    // 각 음원별 목소리 변환 시작.
    store.musicSeparateConversion();
};

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

watch(separateResultManual, (newValue, oldValue) => {
    // 쿠키에 저장, 만료 시간 1시간
    setCookie('separateResultManual', newValue.toString(), 1);
});

watch(
    () => store.conversioncheck,
    (newVal, oldVal) => {
        if (newVal === true) {
            // multitrack 파괴후 다시 재 생성
            initializeMultitrack();
        }
    },
    { immediate: true }
);

const tracks = ref([
    {
        id: 0,
        volume: 50,
        label: 'Music',
        isTurnedOn: true,
        selectedSinger: '변환하지 않음',
    },
    {
        id: 1,
        volume: 50,
        label: 'Vocal',
        isTurnedOn: true,
        selectedSinger: '변환하지 않음',
    },
    {
        id: 2,
        volume: 50,
        label: 'Bass',
        isTurnedOn: true,
        selectedSinger: '변환하지 않음',
    },
    {
        id: 3,
        volume: 50,
        label: 'Drum',
        isTurnedOn: true,
        selectedSinger: '변환하지 않음',
    },
]);

const updateSvcFile = (trackIndex: number) => {
    const selectedSinger = tracks.value[trackIndex].selectedSinger;
    // 여기에서 svcFile 배열을 업데이트하는 로직을 구현합니다.
    // 예시로, 선택된 가수가 없으면 select를 false로, 그렇지 않으면 true로 설정합니다.
    if (selectedSinger === '변환하지 않음') {
        store.svcFile[trackIndex].select = false;
        store.svcFile[trackIndex].voice = '';
    } else {
        store.svcFile[trackIndex].select = true;
        store.svcFile[trackIndex].voice = selectedSinger;
    }
};

const initializeMultitrack = () => {
    if (!container.value) return;
    trackVocalAudio.src = `${store.vocalFile.url}`;
    trackSessionAudio.src = `${store.sessionFile.url}`;
    trackDrumAudio.src = `${store.drumFile.url}`;
    trackBassAudio.src = `${store.bassFile.url}`;

    multitrack.value = Multitrack.create(
        [
            {
                id: 0,
                volume: 1,
                options: {
                    waveColor: 'rgb(255, 133, 96)',
                    progressColor: 'rgb(255, 133, 96)',
                    height: 80,
                    media: trackSessionAudio,
                },
            },
            {
                id: 1,
                volume: 1,
                options: {
                    waveColor: 'rgb(246, 204, 144)',
                    progressColor: 'rgb(246, 204, 144)',
                    height: 80,
                    media: trackVocalAudio,
                },
            },
            {
                id: 2,
                volume: 1,
                options: {
                    waveColor: 'rgb(227, 127, 126)',
                    progressColor: 'rgb(227, 127, 126)',
                    height: 80,
                    media: trackBassAudio,
                },
            },
            {
                id: 3,
                volume: 1,
                options: {
                    waveColor: 'rgb(255, 200, 136)',
                    progressColor: 'rgb(255, 200, 136)',
                    height: 80,
                    media: trackDrumAudio,
                },
            },
        ],
        {
            container: container.value,
            minPxPerSec: 5,
            rightButtonDrag: false,
            cursorWidth: 2,
            cursorColor: '#D72F21',
            trackBackground: '#2D2D2D',
            trackBorderColor: '#7C7C7C',
            dragBounds: true,
            envelopeOptions: {
                lineColor: 'rgba(255, 0, 0, 0.7)',
                lineWidth: 4,
                dragPointFill: 'rgba(255, 255, 255, 0.8)',
                dragPointStroke: 'rgba(255, 255, 255, 0.3)',
            },
        }
    );
    //   각 트랙에 대해 EQ 설정
    if (!separateConversion.value) {
        setupEq(trackSessionAudio);
        setupEq(trackVocalAudio);
        setupEq(trackDrumAudio);
        setupEq(trackBassAudio);
    }
};

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

const togglePlay = () => {
    if (!multitrack.value) return;
    if (multitrack.value.currentTime >= multitrack.value.maxDuration) {
        multitrack.value.setTime(0);
        isPlaying.value = multitrack.value.pause();
    } else {
        multitrack.value.isPlaying()
            ? multitrack.value.pause()
            : multitrack.value.play();
        isPlaying.value = multitrack.value.isPlaying();
    }
};

const reWind = () => {
    if (!multitrack.value) return;
    multitrack.value.setTime(0);
};

const updateVolume = (trackId: number) => {
    const track = tracks.value.find((t) => t.id === trackId);
    if (track && multitrack.value) {
        // 볼륨 업데이트 로직을 조정하여, 음소거 상태가 아닐 때만 볼륨을 업데이트
        if (track.isTurnedOn) {
            multitrack.value.setTrackVolume(trackId, track.volume / 100);
        }
    }
};

const sessionFileDownload = () => {
    const link = document.createElement(`a`);
    link.href = `${store.sessionFile.url}`;
    link.download = `${store.sepFilesInfo[1].fileName}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const vocalFileDownload = () => {
    const link = document.createElement(`a`);
    link.href = `${store.vocalFile.url}`;
    link.download = `${store.sepFilesInfo[0].fileName}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const drumFileDownload = () => {
    const link = document.createElement(`a`);
    link.href = `${store.drumFile.url}`;
    link.download = `${store.sepFilesInfo[2].fileName}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const bassFileDownload = () => {
    const link = document.createElement(`a`);
    link.href = `${store.bassFile.url}`;
    link.download = `${store.sepFilesInfo[3].fileName}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const separationMixing = () => {
    if (separateConversion.value) {
        store.musicSeparateConversionSelectMix(
            checkedMixVocals.value,
            checkedMixDrums.value,
            checkedMixBass.value,
            checkedMixOther.value
        );
    } else {
        store.musicSeparationSelectMix(
            checkedMixVocals.value,
            checkedMixDrums.value,
            checkedMixBass.value,
            checkedMixOther.value
        );
    }
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

watch(
    tracks,
    (newTracks) => {
        newTracks.forEach((track) => {
            if (track.isTurnedOn) {
                // 음소거가 아닌 경우, 저장된 볼륨 값으로 볼륨을 설정
                multitrack.value.setTrackVolume(track.id, track.volume / 100);
            } else {
                // 음소거인 경우, 볼륨을 0으로 설정
                multitrack.value.setTrackVolume(track.id, 0);
            }
        });
    },
    { deep: true }
);

onMounted(() => {
    const separateResultManualCookie = getCookie('separateResultManual');
    if (separateResultManualCookie !== undefined) {
        // 쿠키 값이 'true' 또는 'false' 문자열이므로 Boolean으로 변환합니다.
        separateResultManual.value = separateResultManualCookie === 'true';
    }
    initializeMultitrack();
    setTimeout(() => {
        initialRender.value = true;
    }, 100);
});

onBeforeUnmount(() => {
    multitrack.value?.destroy();
    store.check = false;
    separateConversion.value = false;
    store.separateConversion = false;
    store.conversioncheck = false;
});
</script>
