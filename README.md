<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Чат‑бот для ДЗ</title>
    <link rel="stylesheet" href="style2.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>Чат‑бот для распознавания ДЗ</h1>
            <button id="fullscreenBtn">Полноэкранный режим</button>
        </header>

        <div class="main-content">
            <div class="scanner-section">
                <h2>Сканирование ДЗ</h2>
                <video id="video" autoplay muted playsinline></video>
                <canvas id="canvas" style="display: none;"></canvas>
                <div class="controls">
                    <button id="scanBtn">Сканировать</button>
                    <button id="captureBtn">Сделать снимок</button>
                </div>
            </div>

            <div class="chat-section">
                <h2>Чат с ботом</h2>
                <div id="chatMessages" class="chat-messages"></div>
                <div class="input-area">
                    <input type="text" id="userInput" placeholder="Введите сообщение...">
                    <button id="sendBtn">Отправить</button>
                </div>
            </div>

            <div class="recognition-result">
                <h2>Распознанный текст</h2>
                <textarea id="recognizedText" readonly></textarea>
            </div>
        </div>
    </div>

    <script type="module" src="scanner.js"></script>
    <script type="module" src="recognizer.js"></script>
    <script type="module" src="chatbot.js"></script>
    <script type="module" src="main.js"></script>
</body>
</html>
