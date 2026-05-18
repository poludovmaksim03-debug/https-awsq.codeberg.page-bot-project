import Tesseract from "tesseract.js";

class TextRecognizer {
    constructor() {
        this.worker = null;
    }

    async initialize() {
        this.worker = await Tesseract.createWorker('eng');
    }

    async recognizeText(imageDataUrl) {
        try {
            const result = await this.worker.recognize(imageDataUrl, {
                tessedit_pageseg_mode: 6, // Assume a single uniform block of text
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

export default TextRecognizer
