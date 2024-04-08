import { ref } from 'vue';
import type { Ref } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';
import { useLoadingAlarmStore } from '@/stores/loading-alarm';

interface FileInfo {
    file: File | null;
    url: string | null;
}

export const useConversionStore = defineStore('conversion', () => {
    const store = useLoadingAlarmStore();
    const check = ref(false);
    const musicFile = ref<File | null>(null);
    const conversionFile: Ref<FileInfo> = ref({ file: null, url: null });
    const outPutExtension = ref('');
    const selectSinger = ref('');
    const taskId = ref('');
    const endpoint = ref('');
    const filename = ref('');

    // 음성변환  분리X
    const musicConversion = () => {
        const formData = new FormData();
        // 파일을 formData에 추가
        if (musicFile.value instanceof File) {
            formData.append('file', musicFile.value, musicFile.value?.name);
        }
        // outputExtension을 formData에 추가
        const svcInfo = new Blob(
            [
                JSON.stringify({
                    voice: selectSinger.value,
                    outputExtension: outPutExtension.value,
                }),
            ],
            { type: 'application/json' }
        );
        formData.append('svcInfo', svcInfo);
        store.loadingAlarm = true;
        axios({
            method: 'post',
            url: `${import.meta.env.VITE_APP_API_URL}/api/svc`,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
            .then((res) => {
                taskId.value = res.data.taskId;
                sseConnect(res.data.taskId);
            })
            .catch((err: any) => {
                store.loadingAlarm = false;
            });
    };

    // 변환된 음성 전달하기(분리 O)
    const musicConversionResult = () => {
        axios({
            method: 'get',
            url: `${import.meta.env.VITE_APP_API_URL}/api/svc/${taskId.value}`,
        })
            .then((res) => {
                filename.value = res.data.fileName;
                endpoint.value = res.data.endPoint;
                conversionFileSave();
            })
            .catch((err: any) => {
                store.loadingAlarm = false;
            });
    };

    const conversionFileSave = () => {
        axios({
            method: 'get',
            url: `${import.meta.env.VITE_APP_API_URL}${endpoint.value}`,
            responseType: 'blob',
        })
            .then((res) => {
                const blob = res.data;
                const file = new File([blob], `${filename.value}`, {
                    type: `audio/${outPutExtension.value}`,
                });
                const fileURL = URL.createObjectURL(blob);
                conversionFile.value = { file: file, url: fileURL };
                check.value = true;
                store.loadingAlarm = false;
            })
            .catch((err) => {
                store.loadingAlarm = false;
            });
    };

    let sse: EventSource;
    const sseConnect = (param: string) => {
        sse = new EventSource(
            `${import.meta.env.VITE_APP_API_URL}/api/sse/connect/${param}`
        );
        sse.addEventListener('completed message', (event) => {
            console.log('data receive');
            musicConversionResult();
        });

        sse.onopen = function (e) {
            console.log('connect');
        };

        sse.onerror = function (error) {
            console.log('error!');
            store.loadingAlarm = false;
            sse.close();
        };

        sse.onmessage = function (e) {};
    };

    const sseDisconnect = () => {
        sse.close();
        console.log('Disconnect');
    };
    return {
        check,
        musicFile,
        conversionFile,
        endpoint,
        filename,
        selectSinger,
        outPutExtension,
        musicConversion,
        sseDisconnect,
    };
});
