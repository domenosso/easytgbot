const { useState, useEffect } = React;

function App() {
  const [code, setCode] = useState(`установка токена
токен ВАШ_ТОКЕН

команда /start
написать "Привет, я бот!"
конец`);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    Prism.highlightAll();
  }, [code]);

  const runBot = async () => {
    setLogs(['Запуск бота...']);
    const lines = code.split('\n').map(line => line.trim());
    let token = '';
    let handlers = [];
    let currentHandler = null;

    // Парсинг кода
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('токен ')) {
        token = line.replace('токен ', '').trim();
      } else if (line.startsWith('команда ')) {
        currentHandler = { type: 'command', name: line.replace('команда ', '').trim(), actions: [] };
        handlers.push(currentHandler);
      } else if (line.startsWith('текст от пользователя ')) {
        currentHandler = { type: 'text', trigger: line.replace('текст от пользователя ', '').trim(), actions: [] };
        handlers.push(currentHandler);
      } else if (line === 'конец') {
        currentHandler = null;
      } else if (line.startsWith('написать ')) {
        if (currentHandler) {
          currentHandler.actions.push({ type: 'send', text: line.replace('написать ', '').replace(/"/g, '') });
        }
      }
    }

    if (!token) {
      setLogs([...logs, 'Ошибка: токен не указан']);
      return;
    }

    // Симуляция обработки сообщений через Telegram API
    try {
      // Проверка токена
      const botInfo = await fetch(`https://api.telegram.org/bot${token}/getMe`).then(res => res.json());
      if (!botInfo.ok) {
        setLogs([...logs, 'Ошибка: неверный токен']);
        return;
      }
      setLogs([...logs, `Бот ${botInfo.result.username} успешно запущен`]);

      // Получение обновлений
      const updates = await fetch(`https://api.telegram.org/bot${token}/getUpdates`).then(res => res.json());
      if (updates.ok) {
        for (const update of updates.result) {
          const message = update.message;
          if (message) {
            const text = message.text || '';
            const chatId = message.chat.id;
            const user = {
              id: message.from.id,
              user: message.from.username || 'Неизвестно',
              name: message.from.first_name || 'Неизвестно',
            };

            // Обработка команд и текста
            for (const handler of handlers) {
              if (handler.type === 'command' && text === handler.name) {
                for (const action of handler.actions) {
                  if (action.type === 'send') {
                    let responseText = action.text
                      .replace('{id}', user.id)
                      .replace('{user}', user.user)
                      .replace('{name}', user.name)
                      .replace(/\{рандом\((\d+),(\d+)\)\}/g, (_, min, max) =>
                        Math.floor(Math.random() * (max - min + 1)) + parseInt(min)
                      );
                    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ chat_id: chatId, text: responseText }),
                    });
                    setLogs([...logs, `Отправлено: ${responseText}`]);
                  }
                }
              } else if (handler.type === 'text' && (handler.trigger === 'любой_текст' || text.toLowerCase() === handler.trigger)) {
                for (const action of handler.actions) {
                  if (action.type === 'send') {
                    let responseText = action.text.replace('{любой_текст}', text);
                    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ chat_id: chatId, text: responseText }),
                    });
                    setLogs([...logs, `Отправлено: ${responseText}`]);
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      setLogs([...logs, `Ошибка: ${error.message}`]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">TGEASYbot</h1>
          <div>
            <a href="docs.html" className="px-4 py-2 hover:underline">Документация</a>
            <a href="https://t.me/myactuserxq" target="_blank" className="px-4 py-2 hover:underline">Создатель</a>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-6">
        <h2 className="text-3xl font-bold mb-6">Создайте своего Telegram-бота</h2>
        <textarea
          id="code-editor"
          className="w-full p-4 border rounded-lg bg-gray-800 text-white prism-tgeasy"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck="false"
        ></textarea>
        <button
          onClick={runBot}
          className="run-button text-white px-6 py-3 rounded-lg mt-4 font-semibold"
        >
          Запуск
        </button>
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Логи</h3>
          <div className="bg-gray-800 text-white p-4 rounded-lg max-h-48 overflow-y-auto">
            {logs.map((log, index) => (
              <p key={index}>{log}</p>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
