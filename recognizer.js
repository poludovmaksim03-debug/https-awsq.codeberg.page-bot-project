class TextRecognizer {  
    constructor() {
        this.worker = null; 
    }

    async initialize(language = 'eng+rus') {
        try {
            this.worker = await Tesseract.createWorker(language, {
                logger: m => console.log(m)
            });
            console.log('Tesseract инициализирован');
        } catch (error) {
            console.error('Ошибка инициализации Tesseract:', error);
            throw error;
        }
    }

    async recognizeText(imageDataUrl) {
        if (!this.worker) {
            throw new Error('Worker не инициализирован. Вызовите initialize() сначала.');
        }

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
            this.worker = null;
        }
    }
}

export default TextRecognizer; 

// Инициализация при загрузке страницы
    document.addEventListener('DOMContentLoaded', init());
    console.log(typeof Tesseract)




