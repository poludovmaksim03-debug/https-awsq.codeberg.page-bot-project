class ChatBot {
    constructor(aiProcessor) {
        this.messages = [];
        this.chatMessages = document.getElementById('chatMessages');
        this.aiProcessor = aiProcessor;
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
        if (message.toLowerCase().includes('распознай') ||
            message.toLowerCase().includes('сканир')) {
            await this.handleRecognitionRequest();
        } else if (message.toLowerCase().includes('реш')) {
            await this.handleSolutionRequest(message);
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
            console.error('Ошибка распознавания:', error);
            this.addMessage('Произошла ошибка при распознавании текста.', false);
        }
    }

    async handleSolutionRequest(message) {
        try {
            const inputText = document.getElementById('recognizedText').value;

            if (!inputText.trim()) {
                this.addMessage('Сначала отсканируйте домашнее задание.', false);
                return;
            }

            this.addMessage('Анализирую задание и генерирую решение...', false);

            const result = await this.aiProcessor.processHomework(inputText);

            // Отображаем решение от AI
            document.getElementById('aiSolution').innerHTML = `
                <strong>Анализ:</strong> ${result.analysis.subject} (уверенность: ${result.analysis.confidence})<br><br>
                <strong>Решение:</strong><br>${result.solution.replace(/\n/g, '<br>')}
            `;

            this.addMessage('Решение сгенерировано. Смотрите ниже.', false);
        } catch (error) {
            console.error('Ошибка обработки AI:', error);
            this.addMessage('Произошла ошибка при генерации решения.', false);
        }
    }

    sendHelpMessage() {
        const helpText = `
Доступные команды:
- "Распознай ДЗ" или "Сканируй" — запустить сканирование и распознавание домашнего задания
- "Реши" — получить решение от AI на основе распознанного текста
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
}


