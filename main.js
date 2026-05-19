import DocumentScanner from './scanner.js'; 
import TextRecognizer from './recognizer.js';
import AIProcessor from './ai-processor.js';
import ChatBot from './chatbot.js';

class HomeworkAIBotApp {
    constructor() {
        this.scanner = new DocumentScanner();
        this.recognizer = new TextRecognizer();
        this.aiProcessor = new AIProcessor();
        this.chatBot = new ChatBot(this.aiProcessor);
        this.initEventListeners();
    }

    initEventListeners() {
        // Кнопки интерфейса
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        document.getElementById('scanBtn').addEventListener('click', async () => {
            try {
                this.chatBot.addMessage('Запуск сканирования документа...', false);

                // Гарантируем, что камера запущена
                if (!this.scanner.isCameraActive) {
                    const cameraStarted = await this.scanner.startCamera();
                    if (!cameraStarted) {
                return;
            }
        }

                const imageDataUrl = this.scanner.captureFrame();
                this.chatBot.addMessage('Документ захвачен!', false);

                // Распознаём текст
                await this.recognizer.initialize();
                const recognizedText = await this.recognizer.recognizeText(imageDataUrl);
                document.getElementById('recognizedText').value = recognizedText;
                this.chatBot.addMessage(`Распознанный текст:\n${recognizedText}`, false);
                await this.recognizer.cleanup();
            } catch (error) {
                console.error('Ошибка сканирования:', error);
                this.chatBot.addMessage('Ошибка при сканировании документа. Проверьте камеру и попробуйте ещё раз.', false);
            }
        });

        document.getElementById('captureBtn').addEventListener('click', () => {
            try {
                const imageDataUrl = this.scanner.captureFrame();
                this.chatBot.addMessage('Снимок сделан!', false);
            } catch (error) {
                console.error('Ошибка захвата кадра:', error);
                this.chatBot.addMessage('Не удалось сделать снимок. Проверьте камеру.', false);
            }

        });
    };
}



