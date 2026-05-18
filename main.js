import DocumentScanner from 'scanner.js';
import TextRecognizer from 'recognizer.js';
import AIProcessor from 'ai-processor.js';
import ChatBot from 'chatbot.js';

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
            this.scanner.toggleFullscreen();
        });

        document.getElementById('scanBtn').addEventListener('click', async () => {
            try {
                this.chatBot.addMessage('Запуск сканирования документа...', false);
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
                this.chatBot.addMessage('Ошибка при сканировании документа.', false);
            }
        });

        document.getElementById('captureBtn').addEventListener('click', () => {
            const imageDataUrl = this.scanner.captureFrame();
            this.chatBot.addMessage('Снимок сделан!', false);
        });

        // Чат
        document.getElementById('sendBtn').addEventListener('click', () => {
            const input = document.getElementById('userInput');
            const message = input.value.trim();
            if (message) {
                this.chatBot.processUserMessage(message);
                input.value = '';
            }
        });

        // Обработка Enter в поле ввода
        document.getElementById('userInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('sendBtn').click();
            }
        });
    }

    async init() {
        await this.scanner.startCamera();
        await this.aiProcessor.loadModel();
        this.chatBot.addMessage('Привет! Я AI чат‑бот для распознавания и решения домашнего задания. Используйте команду "Помощь" для начала.', false);
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    const app = new HomeworkAIBotApp();
    app.init();
});


