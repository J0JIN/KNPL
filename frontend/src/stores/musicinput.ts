import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useLoadingAlarmStore } from '@/stores/loading-alarm';
import axios from 'axios';
import { ElNotification } from 'element-plus';

export const useMusicInputStore = defineStore('musicinput', () => {
    const check = ref(false);
    const store = useLoadingAlarmStore();
    const musicFile = ref<File | null>(null);
    const vocalFile = ref<File | null>(null);
    const taskId = ref('');

    const musicCustom = () => {
        check.value = true;
        const formData = new FormData();
        if (vocalFile.value instanceof File) {
            formData.append(
                'vocalFile',
                vocalFile.value,
                vocalFile.value?.name
            );
        }
        if (musicFile.value instanceof File) {
            formData.append(
                'musicFile',
                musicFile.value,
                musicFile.value?.name
            );
        }
        store.loadingAlarm = true;
        axios({
            method: 'post',
            url: `${import.meta.env.VITE_APP_API_URL}/api/diff`,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data', // 대부분의 경우, 이 행은 생략 가능
            },
        })
            .then((res) => {
                console.log(res.data.message_queue_id);
                taskId.value = res.data.message_queue_id;
                check.value = false;
                ElNotification({
                    title: '토큰 발급',
                    message: taskId.value,
                    type: 'success',
                    duration: 0,
                });
                store.loadingAlarm = false;
            })
            .catch((err: any) => {
                check.value = false;
                store.loadingAlarm = false;
                if (err.response.status === 400) {
                    ElNotification({
                        title: '파일 오류',
                        message: '입력된 파일을 다시 확인해주세요',
                        type: 'error',
                        duration: 0,
                    });
                } else if (err.response.status === 422) {
                    ElNotification({
                        title: '파일 형식 오류',
                        message: '입력된 파일을 다시 확인해주세요',
                        type: 'error',
                        duration: 0,
                    });
                } else if (err.response.status === 429) {
                    ElNotification({
                        title: '과도한 요청',
                        message: '하루에 한번만 요청 가능합니다',
                        type: 'error',
                        duration: 0,
                    });
                } else {
                    ElNotification({
                        title: '서버 오류',
                        message: '서버 오류입니다.',
                        type: 'error',
                        duration: 0,
                    });
                }
            });
    };

    const musicCustomResult = (payload: string) => {
        store.loadingAlarm = true;
        axios({
            method: 'get',
            url: `${
                import.meta.env.VITE_APP_API_URL
            }/api/diff/status/${payload}`,
            responseType: 'blob',
        })
            .then((res) => {
                if (res.request.status === 200) {
                    const url = window.URL.createObjectURL(
                        new Blob([res.data])
                    );
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'result.wav');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    ElNotification({
                        title: '성공',
                        message: '해당 파일을 다운로드 합니다',
                        type: 'success',
                    });
                } else if (res.request.status === 204) {
                    ElNotification({
                        title: '진행 중',
                        message: '해당 파일은 작업중에 있습니다',
                        type: 'warning',
                    });
                }
                store.loadingAlarm = false;
            })
            .catch((err: any) => {
                store.loadingAlarm = false;
                check.value = false;
                if (err.response.status === 400) {
                    ElNotification({
                        title: '에러',
                        message: '유효하지 않은 토큰 값 입니다',
                        type: 'error',
                    });
                } else if (err.response.status === 404) {
                    ElNotification({
                        title: '에러',
                        message: '파일이 손상되어 출력이 불가능 합니다.',
                        type: 'error',
                    });
                } else {
                    ElNotification({
                        title: '서버 에러',
                        message: '현재 서버가 꺼져 있는 상황 입니다.',
                        type: 'error',
                    });
                }
                store.loadingAlarm = false;
            });
    };

    return {
        check,
        musicFile,
        vocalFile,
        taskId,
        musicCustom,
        musicCustomResult,
    };
});
