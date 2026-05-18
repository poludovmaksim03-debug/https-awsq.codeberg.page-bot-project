import DocumentScanner from "./scanner.js";
import ChatBot from "./chatbot.js";

class HomeworkBotApp {
    constructor() {
        this.scanner = new DocumentScanner();
        this.chatBot = new apiKey();
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

                // Передаём изображение в распознаватель
                const recognizer = new (await import('./recognizer.js')).default();
                await recognizer.initialize();
                const recognizedText = await recognizer.recognizeText(imageDataUrl);
                document.getElementById('recognizedText').value = recognizedText;
                this.chatBot.addMessage(`Распознанный текст:\n${recognizedText}`, false);
                await recognizer.cleanup();
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
        this.chatBot.addMessage('Привет! Я чат‑бот для распознавания домашнего задания. Используйте команду "Помощь" для начала.', false);
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    const app = new HomeworkBotApp();
    app.init();
})
