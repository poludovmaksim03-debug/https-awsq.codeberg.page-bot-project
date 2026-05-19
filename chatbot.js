class ChatBot {
    constructor(aiProcessor) {
        // Проверяем обязательные зависимости
        if (!aiProcessor) {
            throw new Error('AIProcessor не передан в конструктор ChatBot');
        }

        this.aiProcessor = aiProcessor;
        this.messages = [];

        // Безопасное получение элементов DOM
        this.chatMessages = document.getElementById('chatMessages');
        this.recognizedText = document.getElementById('recognizedText');
        this.aiSolution = document.getElementById('aiSolution');

        // Проверка наличия обязательных элементов интерфейса
        if (!this.chatMessages) {
            console.error('Элемент #chatMessages не найден в DOM');
        }
        if (!this.recognizedText) {
            console.error('Элемент #recognizedText не найден в DOM');
        }
        if (!this.aiSolution) {
            console.error('Элемент #aiSolution не найден в DOM');
        }
    }

    /**
     * Безопасное добавление сообщения в чат
     */
    addMessage(text, isUser = false) {
        try {
            // Валидация входных данных
            if (!text || typeof text !== 'string') {
                console.warn('Попытка добавить некорректное сообщение:', text);
                return;
            }

            if (!this.chatMessages) {
                console.error('Не удалось добавить сообщение: элемент чата не найден');
                return;
            }

            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
            messageDiv.textContent = text;
            this.chatMessages.appendChild(messageDiv);

            // Плавная прокрутка к последнему сообщению
            setTimeout(() => {
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            }, 100);

            // Сохраняем сообщение в истории
            this.messages.push({
                text: text,
                isUser: isUser,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Ошибка при добавлении сообщения:', error);
        }
    }

    /**
     * Обработка сообщения пользователя с полной обработкой ошибок
     */
    async processUserMessage(message) {
        try {
            // Валидация входного сообщения
            if (!message || typeof message !== 'string' || !message.trim()) {
                this.addMessage('Пожалуйста, введите сообщение.', false);
                return;
            }

            const trimmedMessage = message.trim();

            // Добавляем сообщение пользователя
            this.addMessage(trimmedMessage, true);

            // Нормализуем сообщение для анализа команд
            const normalizedMessage = trimmedMessage.toLowerCase();

            // Обрабатываем разные типы запросов
            if (normalizedMessage.includes('распознай') ||
                normalizedMessage.includes('сканир')) {
                await this.handleRecognitionRequest();
            } else if (normalizedMessage.includes('реш')) {
                await this.handleSolutionRequest(trimmedMessage);
            } else if (normalizedMessage.includes('помощь')) {
                this.sendHelpMessage();
            } else {
                this.sendDefaultResponse();
            }
        } catch (error) {
            console.error('Критическая ошибка в processUserMessage:', error);
            this.addMessage('Произошла непредвиденная ошибка. Попробуйте позже.', false);
        }
    }

    /**
     * Обработка запроса на распознавание
     */
    async handleRecognitionRequest() {
        try {
            this.addMessage('Запускаю сканирование документа...', false);

            const scanner = new DocumentScanner();

            // Гарантируем, что камера запущена
            if (!scanner.isCameraActive) {
                const cameraStarted = await scanner.startCamera();
                if (!cameraStarted) {
                    this.addMessage('Не удалось запустить камеру. Проверьте разрешения.', false);
                    return;
                }
            }

            const imageDataUrl = scanner.captureFrame();
            this.addMessage('Распознаю текст с изображения...', false);

            const recognizer = new TextRecognizer();
            await recognizer.initialize();
            const recognizedText = await recognizer.recognizeText(imageDataUrl);

            // Показываем распознанный текст
            if (this.recognizedText) {
                this.recognizedText.value = recognizedText;
            }
            this.addMessage(`Распознанный текст:\n${recognizedText}`, false);

            await recognizer.cleanup();
        } catch (error) {
            console.error('Ошибка распознавания:', error);
            this.addMessage('Произошла ошибка при распознавании текста. Попробуйте ещё раз.', false);
        }
    }

    /**
     * Обработка запроса на решение задачи
     */
    async handleSolutionRequest(message) {
        try {
            if (!this.recognizedText) {
                this.addMessage('Элемент для распознанного текста не найден.', false);
                return;
            }

            const inputText = this.recognizedText.value;

            if (!inputText.trim()) {
                this.addMessage('Сначала отсканируйте домашнее задание.', false);
                return;
            }

            this.addMessage('Анализирую задание и генерирую решение...', false);

            const result = await this.aiProcessor.processHomework(inputText);

            // Отображаем решение от AI
            if (this.aiSolution) {
                this.aiSolution.innerHTML = `
                    <strong>Анализ:</strong> ${result.analysis.subject} (уверенность: ${result.analysis.confidence})<br><br>
                    <strong>Решение:</strong><br>${result.solution.replace(/\n/g, '<br>')}
                `;
            }

            this.addMessage('Решение сгенерировано. Смотрите ниже.', false);
        } catch (error) {
            console.error('Ошибка обработки AI:', error);
            this.addMessage('Произошла ошибка при генерации решения. Попробуйте позже.', false);
        }
    }

    /**
     * Отправка справки
     */
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

    /**
     * Ответ по умолчанию
     */
    sendDefaultResponse() {
        const responses = [
            'Я готов помочь с вашим домашним заданием! Используйте команду "Распознай ДЗ" для сканирования.',
            'Чем могу помочь с домашним заданием?',
            'Отправьте команду "Распознай ДЗ", чтобы я отсканировал и распознал ваше домашнее задание.',
            'Для начала отсканируйте домашнее задание командой "Распознай ДЗ".'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        this.addMessage(randomResponse, false);
    }

    /**
     * Очистка истории сообщений
     */
    clearHistory() {
        this.messages = [];
        if (this.chatMessages) {
            this.chatMessages.innerHTML = '';
        }
    }

    /**
     * Получение истории сообщений
     */
    getMessageHistory() {
        return [...this.messages]; // Возвращаем копию массива
    }
}

export default ChatBot;
