import Tesseract from 'tesseract.js';

class TextRecognizer {
    constructor() {
        this.worker = null;
    }

    async initialize() {
        this.worker = await Tesseract.createWorker('eng+rus', {
            logger: m => console.log(m) // Логирование прогресса
        });
    }

    async recognizeText(imageDataUrl) {
        try {
            const result = await this.worker.recognize(imageDataUrl, {
                tessedit_pageseg_mode: 6, // Единый блок текста
                preserve_interword_spaces: 1
            });
            return result.data.text;
        } catch (error) {
            console.error('Ошибка распознавания:', error);
            throw error;
        }
    }

    async cleanup() {
        if (this.worker) {
            await this.worker.terminate();
        }
    }
}




