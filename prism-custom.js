Prism.languages.tgeasy = {
  'keyword': /\b(установка токена|токен|команда|конец|написать|текст от пользователя|рандом)\b/,
  'string': /"[^"]*"/,
  'variable': /\b(id|user|name|любой_текст)\b/,
  'function': /рандом\([^)]+\)/,
  'command': /\/[a-zA-Z]+/,
  'number': /\d+/,
  'punctuation': /[(){},]/,
};
