class DocumentScanner {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.context = this.canvas.getContext('2d');
        this.stream = null;
    }

    async startCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });
            this.video.srcObject = this.stream;
        } catch (error) {
            console.error('Ошибка доступа к камере:', error);
            alert('Не удалось получить доступ к камере. Проверьте разрешения.');
        }
    }

    captureFrame() {
        const video = this.video;
        this.canvas.width = video.videoWidth;
        this.canvas.height = video.videoHeight;
        this.context.drawImage(video, 0, 0);
        return this.canvas.toDataURL('image/jpeg', 0.8);
    }

    toggleFullscreen() {
        const element = document.documentElement;

        if (!document.fullscreenElement) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }

        // Обновляем класс для стилизации
        document.body.classList.toggle('fullscreen');
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
    }
}

export default DocumentScanner;



