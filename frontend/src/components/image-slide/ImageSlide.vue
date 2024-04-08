<template>
    <div class="container" :class="{ hidden: !initialRender }">
        <div class="carousel">
            <div
                class="carousel-inner"
                :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
            >
                <div
                    class="carousel-item"
                    v-for="(image, index) in imagesDay"
                    :key="index"
                >
                    <div>
                        <img :src="image.src" :alt="'Image ' + index" />
                        <transition name="slide-fade" mode="out-in">
                            <div
                                class="overlay"
                                :key="currentIndex"
                                @click="navigate(image.route)"
                            >
                                <h1 lang="en">
                                    {{ imagesDay[currentIndex].title }}
                                    <el-icon :size="30">
                                        <Connection />
                                    </el-icon>
                                </h1>
                                <p lang="en">
                                    {{ imagesDay[currentIndex].content }}
                                </p>
                            </div>
                        </transition>
                    </div>
                </div>
            </div>
            <div lang="ko" class="carousel-position-indicator">
                <el-slider
                    class="image-slider"
                    v-model="sliderValue"
                    :step="1"
                    min="1"
                    max="3"
                    :show-tooltip="false"
                />
            </div>
        </div>
        <div class="prev-area" @click="prev"></div>
        <div class="next-area" @click="next"></div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Connection } from '@element-plus/icons-vue';
import '@/components/image-slide/imageslide.css';

const transitioning = ref(false);
const initialRender = ref(false);
const imagesDay = ref([
    {
        src: '/assets/background-image/separation-image-day.gif',
        title: 'Separation',
        content: 'Separate instruments from music',
        route: '/separation',
    },
    {
        src: '/assets/background-image/conversion-image-day.gif',
        title: 'AI Cover',
        content: 'Convert songs to preset voices',
        route: '/conversion',
    },
    {
        src: '/assets/background-image/ai-custom-image-day.gif',
        title: 'AI Custom',
        content: 'Convert songs to custom voice',
        route: '/input',
    },
]);

const currentIndex = ref(0);
let autoChangeTimeout: number;
const router = useRouter();

const sliderValue = computed({
    get: () => currentIndex.value + 1,
    set: (val) => {
        currentIndex.value = val - 1;
    },
});

const next = () => {
    transitioning.value = true;
    currentIndex.value = (currentIndex.value + 1) % imagesDay.value.length;
    nextTick(() => {
        transitioning.value = false;
    });
    resetAutoChange();
};

const prev = () => {
    transitioning.value = true;
    currentIndex.value =
        (currentIndex.value - 1 + imagesDay.value.length) %
        imagesDay.value.length;
    nextTick(() => {
        transitioning.value = false;
    });
    resetAutoChange();
};

const handleWheel = (e: WheelEvent) => {
    if (e.deltaY > 0) {
        next();
    } else if (e.deltaY < 0) {
        prev();
    }
};

// 자동으로 다음 이미지로 전환
const resetAutoChange = () => {
    clearTimeout(autoChangeTimeout as number);
    autoChangeTimeout = setTimeout(() => {
        next();
    }, 10000);
};

const navigate = (route: string) => {
    router.push(route);
};

onMounted(() => {
    resetAutoChange();
    setTimeout(() => {
        initialRender.value = true;
    }, 100);
    window.addEventListener('wheel', handleWheel, { passive: true });
});

onUnmounted(() => {
    window.removeEventListener('wheel', handleWheel);
});
</script>
