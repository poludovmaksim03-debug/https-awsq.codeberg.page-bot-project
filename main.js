document.addEventListener('DOMContentLoaded', async function() { 
    try {
        // Инициализация компонентов
        const aiProcessor = new AIProcessor();
        const chatBot = new ChatBot(aiProcessor);
        const scanner = new DocumentScanner();

        // Запуск камеры при загрузке
        await scanner.startCamera();

        // Обработчики событий
        document.getElementById('sendBtn').addEventListener('click', function() {
            const input = document.getElementById('userInput');
            const message = input.value.trim();
            if (message) {
                chatBot.processUserMessage(message);
                input.value = '';
            }
        });

        document.getElementById('scanBtn').addEventListener('click', async function() {
            chatBot.addMessage('Запускаю сканирование...', false);
            await chatBot.handleRecognitionRequest();
        });

        document.getElementById('captureBtn').addEventListener('click', async function() {
            try {
                const imageDataUrl = scanner.captureFrame();
                chatBot.addMessage('Кадр захвачен, распознаю текст...', false);

                const recognizer = new TextRecognizer();
                await recognizer.initialize();
                const recognizedText = await recognizer.recognizeText(imageDataUrl);

                if (chatBot.elements.recognizedText) {
                    chatBot.elements.recognizedText.value = recognizedText;
                }
                chatBot.addMessage(`Распознанный текст:\n${recognizedText}`, false);
                await recognizer.cleanup();
            } catch (error) {
                console.error('Ошибка захвата кадра:', error);
                chatBot.addMessage('Ошибка при захвате кадра.', false);
            }
        });

        document.getElementById('fullscreenBtn').addEventListener('click', function() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
                this.textContent = '⛶ Выйти из полноэкранного режима';
            } else {
                document.exitFullscreen();
                this.textContent = '⛶ Полноэкранный режим';
            }
        });

        // Обработка ввода по Enter
        document.getElementById('userInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                document.getElementById('sendBtn').click();
            }
        });

                chatBot.addMessage('Привет! Я AI‑бот для помощи с домашним заданием. Готов распознать и решить задачи!', false);

        // Инициализация AI‑модели
        await aiProcessor.loadModel();

        console.log('Все компоненты успешно инициализированы');
    } catch (error) {
        console.error('Критическая ошибка инициализации:', error);
        alert('Произошла ошибка при запуске бота. Проверьте консоль браузера.');
    }
});



