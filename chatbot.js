class ChatBot {
    constructor() {
        this.messages = [];
        this.chatMessages = document.getElementById('chatMessages');
    }

    addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        messageDiv.textContent = text;
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    async processUserMessage(message) {
        // Добавляем сообщение пользователя
        this.addMessage(message, true);

        // Обрабатываем разные типы запросов
        if (message.toLowerCase().includes('распознай')) {
            await this.handleRecognitionRequest();
        } else if (message.toLowerCase().includes('помощь')) {
            this.sendHelpMessage();
        } else {
            this.sendDefaultResponse();
        }
    }

    async handleRecognitionRequest() {
        try {
            this.addMessage('Запускаю сканирование документа...', false);
            const scanner = new DocumentScanner();
            const imageDataUrl = scanner.captureFrame();

            this.addMessage('Распознаю текст с изображения...', false);
            const recognizer = new TextRecognizer();
            await recognizer.initialize();
            const recognizedText = await recognizer.recognizeText(imageDataUrl);

            // Показываем распознанный текст
            document.getElementById('recognizedText').value = recognizedText;
            this.addMessage(`Распознанный текст:\n${recognizedText}`, false);

            await recognizer.cleanup();
        } catch (error) {
            console.error('Ошибка обработки запроса:', error);
            this.addMessage('Произошла ошибка при распознавании текста.', false);
        }
    }

    sendHelpMessage() {
        const helpText = `
Доступные команды:
- "Распознай ДЗ" — запустить сканирование и распознавание домашнего задания
- "Помощь" — показать эту справку
- Просто задайте вопрос по домашнему заданию
        `;
        this.addMessage(helpText, false);
    }

    sendDefaultResponse() {
        const responses = [
            'Я готов помочь с вашим домашним заданием! Используйте команду "Распознай ДЗ" для сканирования.',
            'Чем могу помочь с домашним заданием?',
            'Отправьте команду "Распознай ДЗ", чтобы я отсканировал и распознал ваше домашнее задание.'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        this.addMessage(randomResponse, false);
    }
};
const apiKey = "sk-WmuuzBk7uVOh97xUMbTalt3Pp306h";
export default apiKey;
