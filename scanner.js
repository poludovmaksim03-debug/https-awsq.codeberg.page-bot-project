class DocumentScanner {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.context = this.canvas.getContext('2d');
        this.stream = null;
        this.isCameraActive = false;
    }

    /**
     * Запуск камеры с улучшенной обработкой ошибок
     */
    async startCamera() {
        try {
            // Проверяем, не запущена ли уже камера
            if (this.isCameraActive) {
                console.log('Камера уже активна');
                return true;
            }

            // Проверяем поддержку getUserMedia
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Браузер не поддерживает доступ к камере');
            }

            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Задняя камера
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });

            this.video.srcObject = this.stream;
            this.isCameraActive = true;

            return true;
        } catch (error) {
            console.error('Ошибка доступа к камере:', error);

            // Более информативные сообщения об ошибках
            if (error.name === 'NotAllowedError') {
                alert('Доступ к камере отклонён. Пожалуйста, разрешите доступ к камере в настройках браузера.');
            } else if (error.name === 'NotFoundError') {
                alert('Камера не найдена. Проверьте подключение камеры.');
            } else {
                alert(`Ошибка камеры: ${error.message}`);
            }

            return false;
        }
    }

    /**
     * Захват кадра с предварительной обработкой
     */
    captureFrame() {
        if (!this.isCameraActive || !this.stream) {
            throw new Error('Камера не активна. Сначала запустите камеру.');
        }

        if (!this.video || !this.video.videoWidth || !this.video.videoHeight) {
            throw new Error('Видеопоток недоступен или имеет некорректные размеры.');
        }

        // Устанавливаем размеры canvas согласно видеопотоку
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;

        // Рисуем текущий кадр на canvas
        this.context.drawImage(this.video, 0, 0);

        // Возвращаем Data URL изображения
        return this.canvas.toDataURL('image/jpeg', 0.8);
    }

    /**
     * Остановка камеры и освобождение ресурсов
     */
    stopCamera() {
        if (this.stream && this.isCameraActive) {
            const tracks = this.stream.getTracks();
            tracks.forEach(track => track.stop());
            this.video.srcObject = null;
            this.isCameraActive = false;
        }
    }

    /**
     * Перезапуск камеры
     */
    async restartCamera() {
        this.stopCamera();
        await this.startCamera();
    }

    /**
     * Проверка доступности камеры
     */
    isCameraAvailable() {
        return navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
    }

    /**
     * Получение списка доступных устройств камеры
     */
    async getCameraDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.filter(device => device.kind === 'videoinput');
        } catch (error) {
            console.error('Ошибка получения списка камер:', error);
            return [];
        }
    }

    /**
     * Автоматическое определение лучшей камеры
     */
    async autoSelectCamera() {
        const cameras = await this.getCameraDevices();

        if (cameras.length === 0) {
            throw new Error('Камеры не обнаружены');
        }

        // Приоритет: задняя камера (environment)
        const rearCamera = cameras.find(cam =>
            cam.label.toLowerCase().includes('back') ||
            cam.label.toLowerCase().includes('rear')
        );

        if (rearCamera) {
            return rearCamera.deviceId;
        }

        // Иначе берём первую доступную
        return cameras[0].deviceId;
    }

    /**
     * Улучшенный запуск камеры с выбором устройства
     */
    async startCameraWithDevice(deviceId = null) {
        try {
            if (!deviceId) {
                deviceId = await this.autoSelectCamera();
            }

            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: { exact: deviceId },
                    width: { ideal: 1920 },
            height: { ideal: 1080 }
        }
            });

            this.video.srcObject = this.stream;
            this.isCameraActive = true;

            console.log('Камера запущена успешно с устройством:', deviceId);
            return true;
        } catch (error) {
            console.error('Ошибка запуска камеры с устройством:', error);
            throw error;
        }
    }

    /**
     * Полноэкранный режим для видео
     */
    toggleFullscreenForVideo() {
        const videoElement = this.video;

        if (!document.fullscreenElement) {
            if (videoElement.requestFullscreen) {
                videoElement.requestFullscreen();
            } else if (videoElement.webkitRequestFullscreen) {
                videoElement.webkitRequestFullscreen();
            } else if (videoElement.msRequestFullscreen) {
                videoElement.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }

    /**
     * Очистка ресурсов при уничтожении объекта
     */
    destroy() {
        this.stopCamera();
        this.context = null;
        this.canvas = null;
        this.video = null;
    }
}

// Экспорт для использования в других модулях
export default DocumentScanner; 



