import { ref } from 'vue';
import type { Ref } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';
import { useLoadingAlarmStore } from '@/stores/loading-alarm';

interface MixFile {
    vocals: boolean;
    drums: boolean;
    bass: boolean;
    other: boolean;
}

interface FileInfo {
    file: File | null;
    url: string | null;
}

export const useSeparateStore = defineStore('separation', () => {
    const store = useLoadingAlarmStore();
    const check = ref(false);
    const musicFile = ref<File | null>(null);
    const vocalFile: Ref<FileInfo> = ref({ file: null, url: null });
    const sessionFile: Ref<FileInfo> = ref({ file: null, url: null });
    const drumFile: Ref<FileInfo> = ref({ file: null, url: null });
    const bassFile: Ref<FileInfo> = ref({ file: null, url: null });
    const done = ref(false);
    const conversioncheck = ref(false);
    const outPutExtension = ref('');
    const taskId = ref('');
    const separation = ref(false);
    const selectMix = ref(false);
    const separateConversion = ref(false);
    const conversionSelectMix = ref(false);
    const sepFilesInfo = ref([
        {
            type: 'vocal',
            fileName: ``,
            endPoint: ``,
        },
        {
            type: 'session',
            fileName: ``,
            endPoint: ``,
        },
        {
            type: 'drum',
            fileName: ``,
            endPoint: ``,
        },
        {
            type: 'bass',
            fileName: ``,
            endPoint: ``,
        },
    ]);
    const svcFile = ref([
        {
            type: 'other',
            select: false,
            voice: '',
        },
        {
            type: 'vocals',
            select: false,
            voice: '',
        },
        {
            type: 'bass',
            select: false,
            voice: '',
        },
        {
            type: 'drums',
            select: false,
            voice: '',
        },
    ]);
    const mixFile: Ref<MixFile> = ref({
        vocals: false,
        drums: false,
        bass: false,
        other: false,
    });

    // 1. 악기 분리 요청
    const musicSeparation = () => {
        const formData = new FormData();
        // 파일을 formData에 추가
        if (musicFile.value instanceof File) {
            formData.append('file', musicFile.value, musicFile.value?.name);
        }
        // outputExtension을 formData에 추가
        formData.append('outputExtension', outPutExtension.value);
        store.loadingAlarm = true;
        axios({
            method: 'post',
            url: `${import.meta.env.VITE_APP_API_URL}/api/separation`,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data', // 대부분의 경우, 이 행은 생략 가능
            },
        })
            .then((res) => {
                taskId.value = res.data.taskId;
                separation.value = true;
                sseConnect(res.data.taskId);
            })
            .catch((err) => {
                store.loadingAlarm = false;
            });
    };

    // 2. 분리된 음성 전달하기.
    const musicSeparationResult = () => {
        axios({
            method: 'get',
            url: `${import.meta.env.VITE_APP_API_URL}/api/separation/${
                taskId.value
            }`,
        })
            .then((res) => {
                res.data.files.forEach((element: any) => {
                    if (element.type === 'vocals') {
                        sepFilesInfo.value[0].endPoint = element.endPoint;
                        sepFilesInfo.value[0].fileName = element.fileName;
                        vocalFileSave();
                    } else if (element.type === 'drums') {
                        sepFilesInfo.value[2].endPoint = element.endPoint;
                        sepFilesInfo.value[2].fileName = element.fileName;
                        drumFileSave();
                    } else if (element.type === 'bass') {
                        sepFilesInfo.value[3].endPoint = element.endPoint;
                        sepFilesInfo.value[3].fileName = element.fileName;
                        bassFileSave();
                    } else {
                        sepFilesInfo.value[1].endPoint = element.endPoint;
                        sepFilesInfo.value[1].fileName = element.fileName;
                        sessionFileSave();
                    }
                });
            })
            .catch((err: any) => {
                store.loadingAlarm = false;
            });
    };

    // 보컬 파일 피니아에 저장..
    const vocalFileSave = () => {
        axios({
            method: 'get',
            url: `${import.meta.env.VITE_APP_API_URL}${
                sepFilesInfo.value[0].endPoint
            }`,
            responseType: 'blob',
        })
            .then((res) => {
                const blob = res.data;
                // Blob을 File 객체로 변환.
                const file = new File(
                    [blob],
                    `${sepFilesInfo.value[0].fileName}`,
                    { type: `audio/${outPutExtension.value}` }
                );
                // Blob 객체로부터 URL을 생성.
                const fileURL = URL.createObjectURL(blob);
                // vocalFile에 파일 객체와 URL을 저장.
                vocalFile.value = { file: file, url: fileURL };
                checkurl();
            })
            .catch((err) => {
                // 에러 처리
                vocalFile.value = { file: null, url: null };
            });
    };

    // 보컬 파일과 과정 동일 저장되는 파일명만 다르다!
    const sessionFileSave = () => {
        axios({
            method: 'get',
            url: `${import.meta.env.VITE_APP_API_URL}${
                sepFilesInfo.value[1].endPoint
            }`,
            responseType: 'blob',
        })
            .then((res) => {
                const blob = res.data;
                const file = new File(
                    [blob],
                    `${sepFilesInfo.value[1].fileName}`,
                    { type: `audio/${outPutExtension.value}` }
                );
                const fileURL = URL.createObjectURL(blob);
                sessionFile.value = { file: file, url: fileURL };
                checkurl();
            })
            .catch((err) => {
                sessionFile.value = { file: null, url: null };
            });
    };

    // 보컬 파일과 과정 동일 저장되는 파일명만 다르다!
    const drumFileSave = () => {
        axios({
            method: 'get',
            url: `${import.meta.env.VITE_APP_API_URL}${
                sepFilesInfo.value[2].endPoint
            }`,
            responseType: 'blob',
        })
            .then((res) => {
                const blob = res.data;
                const file = new File(
                    [blob],
                    `${sepFilesInfo.value[2].fileName}`,
                    { type: `audio/${outPutExtension.value}` }
                );
                const fileURL = URL.createObjectURL(blob);

                drumFile.value = { file: file, url: fileURL };
                checkurl();
            })
            .catch((err) => {
                drumFile.value = { file: null, url: null };
            });
    };

    // 보컬 파일과 과정 동일 저장되는 파일명만 다르다!
    const bassFileSave = () => {
        axios({
            method: 'get',
            url: `${import.meta.env.VITE_APP_API_URL}${
                sepFilesInfo.value[3].endPoint
            }`,
            responseType: 'blob',
        })
            .then((res) => {
                const blob = res.data;
                const file = new File(
                    [blob],
                    `${sepFilesInfo.value[3].fileName}`,
                    { type: `audio/${outPutExtension.value}` }
                );
                const fileURL = URL.createObjectURL(blob);
                bassFile.value = { file: file, url: fileURL };
                checkurl();
            })
            .catch((err) => {
                bassFile.value = { file: null, url: null };
            });
    };

    // 파일 저장됐는지 확인 하기 위한 조치.
    const checkurl = () => {
        if (
            sessionFile.value.url &&
            vocalFile.value.url &&
            drumFile.value.url &&
            bassFile.value.url
        ) {
            check.value = true;
            if (separateConversion.value === true) {
                conversioncheck.value = true;
                separateConversion.value = false;
            }
            store.loadingAlarm = false;
        }
    };

    // 3. 분리된 음원 선택후 믹싱
    const musicSeparationSelectMix = (
        vocals: boolean,
        drums: boolean,
        bass: boolean,
        other: boolean
    ) => {
        const jsonData = {
            taskId: taskId.value,
            vocals,
            drums,
            bass,
            other,
        };
        store.loadingAlarm = true;
        axios({
            method: 'post',
            url: `${import.meta.env.VITE_APP_API_URL}/api/separation/${
                taskId.value
            }/mixing`,
            data: jsonData,
        })
            .then((res) => {
                selectMix.value = true;
                sseConnect(taskId.value);
            })
            .catch((err) => {
                store.loadingAlarm = false;
            });
    };

    // 4. 합성한 음성 전달 받기.
    const musicSeparationSelectMixResult = () => {
        axios({
            method: 'get',
            url: `${import.meta.env.VITE_APP_API_URL}/api/separation/${
                taskId.value
            }/mixing`,
        })
            .then((res) => {
                const link = document.createElement(`a`);
                link.href = `${import.meta.env.VITE_APP_API_URL}${
                    res.data.filePath
                }`;
                link.download = `${res.data.fileName}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                store.loadingAlarm = false;
            })
            .catch((err: any) => {
                store.loadingAlarm = false;
            });
    };

    // 5. 음성 변환(분리O)
    const musicSeparateConversion = () => {
        vocalFile.value = { file: null, url: null };
        sessionFile.value = { file: null, url: null };
        drumFile.value = { file: null, url: null };
        bassFile.value = { file: null, url: null };
        const jsonData = {
            svcFile: svcFile.value,
            taskId: taskId.value,
        };
        store.loadingAlarm = true;
        axios({
            method: 'post',
            url: `${import.meta.env.VITE_APP_API_URL}/api/svc/separation`,
            data: jsonData,
        })
            .then((res) => {
                taskId.value = res.data.taskId;
                separateConversion.value = true;
                sseConnect(res.data.taskId);
            })
            .catch((err) => {
                store.loadingAlarm = false;
            });
    };

    // 6.변환된 음성 전달하기(분리 O)
    const musicSeparateConversionResult = () => {
        axios({
            method: 'get',
            url: `${import.meta.env.VITE_APP_API_URL}/api/svc/separation/${
                taskId.value
            }`,
        })
            .then((res) => {
                res.data.svcWithSepFilesInfo.forEach((element: any) => {
                    if (element.type === 'vocals') {
                        sepFilesInfo.value[0].endPoint = element.endPoint;
                        sepFilesInfo.value[0].fileName = element.fileName;
                        vocalFileSave();
                    } else if (element.type === 'drums') {
                        sepFilesInfo.value[2].endPoint = element.endPoint;
                        sepFilesInfo.value[2].fileName = element.fileName;
                        drumFileSave();
                    } else if (element.type === 'bass') {
                        sepFilesInfo.value[3].endPoint = element.endPoint;
                        sepFilesInfo.value[3].fileName = element.fileName;
                        bassFileSave();
                    } else {
                        sepFilesInfo.value[1].endPoint = element.endPoint;
                        sepFilesInfo.value[1].fileName = element.fileName;
                        sessionFileSave();
                    }
                });
            })
            .catch((err) => {
                store.loadingAlarm = false;
            });
    };

    // 7. 변환된 음원 선택후 믹싱(분리 O)
    const musicSeparateConversionSelectMix = (
        vocals: boolean,
        drums: boolean,
        bass: boolean,
        other: boolean
    ) => {
        const jsonData = {
            vocals,
            drums,
            bass,
            other,
        };
        store.loadingAlarm = true;
        axios({
            method: 'post',
            url: `${import.meta.env.VITE_APP_API_URL}/api/svc/separation/${
                taskId.value
            }/mixing`,
            data: jsonData,
        })
            .then((res) => {
                conversionSelectMix.value = true;
                sseConnect(taskId.value);
            })
            .catch((err: any) => {
                store.loadingAlarm = false;
            });
    };

    // 8. 변환된 합성 음성 전달하기(분리 O)
    const musicSeparateConversionSelectMixResult = () => {
        axios({
            method: 'get',
            url: `${import.meta.env.VITE_APP_API_URL}/api/svc/separation/${
                taskId.value
            }/mixing`,
        })
            .then((res) => {
                const link = document.createElement(`a`);
                link.href = `${import.meta.env.VITE_APP_API_URL}${
                    res.data.filePath
                }`;
                link.download = `${res.data.fileName}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                store.loadingAlarm = false;
            })
            .catch((err: any) => {
                store.loadingAlarm = false;
            });
    };

    let sse: EventSource;
    // sseConnect
    const sseConnect = (param: string) => {
        sse = new EventSource(
            `${import.meta.env.VITE_APP_API_URL}/api/sse/connect/${param}`
        );

        sse.addEventListener('completed message', (event) => {
            console.log('data receive');
            done.value = true;
            if (separation.value === true) {
                musicSeparationResult();
                separation.value = false;
            } else if (selectMix.value === true) {
                musicSeparationSelectMixResult();
                selectMix.value = false;
            } else if (separateConversion.value === true) {
                musicSeparateConversionResult();
            } else if (conversionSelectMix.value === true) {
                musicSeparateConversionSelectMixResult();
                conversionSelectMix.value = false;
            }
        });

        sse.onopen = function (e) {
            console.log('connect');
        };

        sse.onerror = function (error) {
            console.log('error!');
            separation.value = false;
            selectMix.value = false;
            separateConversion.value = false;
            conversionSelectMix.value = false;
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
        conversioncheck,
        musicFile,
        vocalFile,
        sessionFile,
        drumFile,
        bassFile,
        sepFilesInfo,
        separateConversion,
        outPutExtension,
        svcFile,
        mixFile,
        musicSeparation,
        musicSeparationResult,
        musicSeparateConversion,
        musicSeparationSelectMix,
        musicSeparateConversionSelectMix,
        vocalFileSave,
        sessionFileSave,
        drumFileSave,
        bassFileSave,
        sseConnect,
        sseDisconnect,
    };
});
