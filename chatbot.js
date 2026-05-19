class ChatBot {
    constructor(aiProcessor) {
        this.validateDependencies(aiProcessor);
        this.aiProcessor = aiProcessor;
        this.messages = [];
        this.isProcessing = false;
        this.elements = this.getDOMElements();
        this.bindMethods();
    }

    validateDependencies(aiProcessor) {
        if (!aiProcessor) throw new Error('AIProcessor обязателен для ChatBot');
        if (typeof aiProcessor.processHomework !== 'function') throw new Error('AIProcessor должен иметь processHomework');
    }

    getDOMElements() {
        return {
            chatMessages: document.getElementById('chatMessages'),
            recognizedText: document.getElementById('recognizedText'),
            aiSolution: document.getElementById('aiSolution'),
            userInput: document.getElementById('userInput'),
            sendBtn: document.getElementById('sendBtn')
        };
    }

    bindMethods() {
        ['addMessage', 'processUserMessage'].forEach(method => {
            this[method] = this[method].bind(this);
        });
    }

    addMessage(text, isUser = false) {
        try {
            if (!text || typeof text !== 'string' || !text.trim()) return false;

            const trimmedText = text.trim();
            if (!this.elements.chatMessages) return false;

            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
            messageDiv.textContent = trimmedText;
            this.elements.chatMessages.appendChild(messageDiv);
            this.smoothScrollToBottom();

            this.messages.push({
                text: trimmedText,
                isUser: isUser,
                timestamp: new Date().toISOString()
            });
            return true;
        } catch (error) {
            console.error('Ошибка добавления сообщения:', error);
            return false;
        }
    }

    smoothScrollToBottom() {
        try {
            if (this.elements.chatMessages) {
                try {
                    this.elements.chatMessages.scrollTo({
                        top: this.elements.chatMessages.scrollHeight,
behavior: 'smooth'
});
}; 
catch (e) {
this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
};
} 
catch (error) {
console.error('Ошибка прокрутки:', error);
}
}
async processUserMessage(message) {
if (this.isProcessing) {
this.addMessage('Подождите, я обрабатываю предыдущий запрос…', false);
return;
}

try {
this.isProcessing = true;
this.disableInput();

if (!message || typeof message !== 'string' || !message.trim()) {
this.addMessage('Пожалуйста, введите сообщение.', false);
return;
}

const trimmedMessage = message.trim();
this.addMessage(trimmedMessage, true);

await this.handleCommand(trimmedMessage.toLowerCase(), trimmedMessage);
} catch (error) {
console.error('Критическая ошибка в processUserMessage:', error);
this.addMessage('Произошла непредвиденная ошибка. Попробуйте позже.', false);
} finally {
this.isProcessing = false;
this.enableInput();
}
}

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

async handleRecognitionRequest() {
try {
this.addMessage('Запускаю сканирование документа…', false);

const scanner = new DocumentScanner();

if (!scanner.isCameraActive) {
const cameraStarted = await scanner.startCamera();
if (!cameraStarted) {
this.addMessage('Не удалось запустить камеру. Проверьте разрешения.', false);
return;
}
}

const imageDataUrl = scanner.captureFrame();
this.addMessage('Распознаю текст с изображения…', false);

const recognizer = new TextRecognizer();
await recognizer.initialize();
const recognizedText = await recognizer.recognizeText(imageDataUrl);

if (this.elements.recognizedText) {
this.elements.recognizedText.value = recognizedText;
}
this.addMessage(Распознанный текст:\n${recognizedText}, false);

await recognizer.cleanup();
} catch (error) {
console.error('Ошибка распознавания:', error);
this.addMessage('Произошла ошибка при распознавании текста. Попробуйте ещё раз.', false);
}
}

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

this.addMessage('Анализирую задание и генерирую решение…', false);

const result = await this.aiProcessor.processHomework(inputText);

if (this.elements.aiSolution) {
this.elements.aiSolution.innerHTML = <strong>Анализ:</strong> ${result.analysis.subject} (уверенность: ${(result.analysis.confidence * 100).toFixed(1)}%)<br><br>                 <strong>Решение:</strong><br>${result.solution.replace(/\n/g, '<br>')}            ;
}

this.addMessage('Решение сгенерировано. Смотрите ниже.', false);
} catch (error) {
console.error('Ошибка обработки AI:', error);
this.addMessage('Произошла ошибка при генерации решения. Попробуйте позже.', false);
}
}

sendHelpMessage() {
const helpText = `
Доступные команды:

“Распознай ДЗ” или “Сканируй” — запустить сканирование и распознавание домашнего задания

“Реши” — получить решение от AI на основе распознанного текста

“Помощь” — показать эту справку

Просто задайте вопрос по домашнему заданию
`;
this.addMessage(helpText, false);
}

sendDefaultResponse() {
const responses = [
'Я готов помочь с вашим домашним заданием! Используйте команду “Распознай ДЗ” для сканирования.',
'Чем могу помочь с домашним заданием?',
'Отправьте команду "Распознай ДЗ", чтобы я отсканировал и распознал ваше домашнее задание.',
'Для начала отсканируйте домашнее задание командой "Распознай ДЗ".'
];
const randomResponse = responses[Math.floor(Math.random() * responses.length)];
this.addMessage(randomResponse, false);
}

clearHistory() {
try {
this.messages = [];
if (this.elements.chatMessages) {
this.elements.chatMessages.innerHTML = '';
}
} catch (error) {
console.error('Ошибка при очистке истории:', error);
}
}

getMessageHistory() {
return […this.messages];
}

disableInput() {
if (this.elements.userInput && this.elements.sendBtn) {
this.elements.userInput.disabled = true;
this.elements.sendBtn.disabled = true;
this.elements.userInput.placeholder = 'Обработка…';
}
}

enableInput() {
if (this.elements.userInput && this.elements.sendBtn) {
this.elements.userInput.disabled = false;
this.elements.sendBtn.disabled = false;
this.elements.userInput.placeholder = 'Введите сообщение…';
}
}

destroy() {
this.clearHistory();
this.elements = null;
this.aiProcessor = null;
this.messages = null;
}
}

export default ChatBot;
