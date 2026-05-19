class ChatBot {
    constructor(aiProcessor) { 
        this.validateDependencies(aiProcessor);


        this.aiProcessor = aiProcessor;
        this.messages = [];
        this.isProcessing = false; // Флаг обработки запроса

        // Безопасное получение элементов DOM с проверкой
        this.elements = this.getDOMElements();
        this.bindMethods();
    }

    /**
     * Валидация зависимостей
     */
    validateDependencies(aiProcessor) {
        if (!aiProcessor) {
            throw new Error('ChatBot: AIProcessor обязателен для работы');
        }
        if (typeof aiProcessor.processHomework !== 'function') {
            throw new Error('ChatBot: AIProcessor должен иметь метод processHomework');
        }
    }

    /**
     * Безопасное получение элементов DOM
     */
    getDOMElements() {
        const elements = {
            chatMessages: document.getElementById('chatMessages'),
            recognizedText: document.getElementById('recognizedText'),
            aiSolution: document.getElementById('aiSolution'),
            userInput: document.getElementById('userInput'),
            sendBtn: document.getElementById('sendBtn')
        };

        // Логируем отсутствующие элементы
        Object.entries(elements).forEach(([key, element]) => {
            if (!element) {
                console.warn(`ChatBot: элемент #${key} не найден в DOM`);
            }
        });

        return elements;
    }

    /**
     * Привязка методов к контексту класса
     */
    bindMethods() {
        this.addMessage = this.addMessage.bind(this);
        this.processUserMessage = this.processUserMessage.bind(this);
    }

    /**
     * Безопасное добавление сообщения в чат
     */
    addMessage(text, isUser = false) {
        try {
            // Валидация входных данных
            if (!text || typeof text !== 'string' || text.trim().length === 0) {
                return false;
            }

            const trimmedText = text.trim();

            if (!this.elements.chatMessages) {
                console.error('ChatBot: не удалось добавить сообщение — элемент чата не найден');
                return false;
            }

            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
            messageDiv.textContent = trimmedText;

            this.elements.chatMessages.appendChild(messageDiv);

            // Плавная прокрутка к последнему сообщению
            this.smoothScrollToBottom();

            // Сохраняем сообщение в истории
            this.messages.push({
                text: trimmedText,
                isUser: isUser,
                timestamp: new Date().toISOString()
            });

            return true;
        } catch (error) {
            console.error('ChatBot: ошибка при добавлении сообщения:', error);
            return false;
        }
    }

    /**
     * Плавная прокрутка к последнему сообщению
     */
    smoothScrollToBottom() {
        try {
            if (this.elements.chatMessages) {
                this.elements.chatMessages.scrollTo({
                    top: this.elements.chatMessages.scrollHeight,
                    behavior: 'smooth'
                });
            }
        } catch (error) {
            // Если smooth scroll не поддерживается, используем обычный
            if (this.elements.chatMessages) {
                this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
            }
        }
    }

    /**
     * Обработка сообщения пользователя с полной обработкой ошибок
     */
    async processUserMessage(message) {
        // Проверяем, не идёт ли уже обработка
        if (this.isProcessing) {
            this.addMessage('Подождите, я обрабатываю предыдущий запрос...', false);
            return;
        }

        try {
            this.isProcessing = true;
            this.disableInput();

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

            await this.handleCommand(normalizedMessage, trimmedMessage);
        } catch (error) {
            console.error('ChatBot: критическая ошибка в processUserMessage:', error);
            this.addMessage('Произошла непредвиденная ошибка. Попробуйте позже.', false);
        } finally {
            this.isProcessing = false;
            this.enableInput();
        }
    }

    /**
     * Обработка команд пользователя
     */
    async handleCommand(normalizedMessage, originalMessage) {
        if (normalizedMessage.includes('распознай') ||
            normalizedMessage.includes('сканир')) {
            await this.handleRecognitionRequest();
        } else if (normalizedMessage.includes('реш')) {
            await this.handleSolutionRequest();
        } else if (normalizedMessage.includes('помощь')) {
            this.sendHelpMessage();
        } else {
            this.sendDefaultResponse();
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
            if (this.elements.recognizedText) {
                this.elements.recognizedText.value = recognizedText;
            }
            this.addMessage(`Распознанный текст:\n${recognizedText}`, false);

            await recognizer.cleanup();
        } catch (error) {
            console.error('ChatBot: ошибка распознавания:', error);
            this.addMessage('Произошла ошибка при распознавании текста. Попробуйте ещё раз.', false);
        }
    }

    /**
     * Обработка запроса на решение задачи
     */
    async handleSolutionRequest() {
        try {
            if (!this.elements.recognizedText) {
                this.addMessage('Элемент для распознанного текста не найден.', false);
                return;
            }

            const inputText = this.elements.recognizedText.value;

            if (!inputText.trim()) {
                this.addMessage('Сначала отсканируйте домашнее задание.', false);
                return;
            }

            this.addMessage('Анализирую задание и генерирую решение...', false);

            const result = await this.aiProcessor.processHomework(inputText);

            // Отображаем решение от AI
            if (this.elements.aiSolution) {
                this.elements.aiSolution.innerHTML = `
                    <strong>Анализ:</strong> ${result.analysis.subject} (уверенность: ${result.analysis.confidence})<br><br>
                    <strong>Решение:</strong><br>${result.solution.replace(/\n/g, '<br>')}
                `;
            }

            this.addMessage('Решение сгенерировано. Смотрите ниже.', false);
        } catch (error) {
            console.error('ChatBot: ошибка обработки AI:', error);
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
        try {
            this.messages = [];
            if (this.elements.chatMessages) {
                this.elements.chatMessages.innerHTML = '';
            }
        } catch (error) {
            console.error('ChatBot: ошибка при очистке истории:', error);
        }
    }

    /**
     * Получение истории сообщений
     */
    getMessageHistory() {
        return [...this.messages]; // Возвращаем копию массива
    }

    /**
     * Отключение поля ввода во время обработки
     */
    disableInput() {
        if (this.elements.userInput && this.elements.sendBtn) {
            this.elements.userInput.disabled = true;
            this.elements.sendBtn.disabled = true;
            this.elements.userInput.placeholder = 'Обработка...';
        }
    }

    /**
     * Включение поля ввода после обработки
     */
    enableInput() {
        if (this.elements.userInput && this.elements.sendBtn) {
            this.elements.userInput.disabled = false;
            this.elements.sendBtn.disabled = false;
            this.elements.userInput.placeholder = 'Введите сообщение...';
        }
    }

    /**
     * Безопасное обновление интерфейса
     */
    updateUI() {
        try {
            // Обновляем отображение распознанного текста
            if (this.elements.recognizedText) {
                const lastRecognized = this.messages
                    .filter(msg => msg.text.includes('Распознанный текст:'))
            .pop();
                if (lastRecognized) {
                    const text = lastRecognized.text.replace('Распознанный текст:\n', '');
            this.elements.recognizedText.value = text;
        }
            }

            // Обновляем решение AI
            if (this.elements.aiSolution) {
                const lastSolution = this.messages
            .filter(msg => msg.text.includes('Решение сгенерировано'))
            .pop();
                if (lastSolution) {
                    this.elements.aiSolution.innerHTML = `
                <strong>Последнее решение:</strong><br>
                ${lastSolution.text.replace('Решение сгенерировано. Смотрите ниже.', '')}
            `;
        }
            }
        } catch (error) {
            console.error('ChatBot: ошибка обновления интерфейса:', error);
        }
    }

    /**
     * Деструктор для корректного освобождения ресурсов
     */
    destroy() {
        this.clearHistory();
        this.elements = null;
        this.aiProcessor = null;
        this.messages = null;
    }
}

export default ChatBot;

// Инициализация при загрузке страницы
    document.addEventListener('DOMContentLoaded', init());
    console.log(typeof Tesseract)







