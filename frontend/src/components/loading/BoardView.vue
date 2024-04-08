<template>
    <div class="board" tabIndex="1">
        <div v-for="(r_item, r_i) in board.cells" :key="r_i">
            <cell v-for="(c_item, c_i) in r_item" :key="c_i"></cell>
        </div>
        <tile-view v-for="(tile, i) in tiles" :tile="tile" :key="i">
        </tile-view>
        <game-end-overlay
            :board="board"
            :onrestart="onRestart"
        ></game-end-overlay>
    </div>
</template>

<script setup>
import Cell from '@/components/loading/Cell.vue';
import TileView from '@/components/loading/TileView.vue';
import GameEndOverlay from '@/components/loading/GameEndOverlay.vue';
import { Board } from '@/components/loading/board';
import { onMounted, onBeforeUnmount, ref, computed } from 'vue';

const board = ref(new Board());

const handleKeyDown = (event) => {
    if (board.value.hasWon()) {
        return;
    }
    if (event.keyCode >= 37 && event.keyCode <= 40) {
        event.preventDefault();
        let direction = event.keyCode - 37;
        board.value.move(direction);
    }
};

// 컴포넌트 마운트 및 언마운트 시 이벤트 리스너 등록 및 해제
onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
});
onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown);
});

// 게임 재시작 함수
const onRestart = () => {
    board.value = new Board();
};

// 게임 보드의 타일을 계산하는 computed 속성
const tiles = computed(() => {
    return board.value.tiles.filter((tile) => tile.value != 0);
});
</script>

<style scoped lang="scss">
// game
@import './scss/main.scss';
@import './scss/style.scss';
</style>
