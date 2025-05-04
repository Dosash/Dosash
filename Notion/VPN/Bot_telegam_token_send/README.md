Помни что нужно установить NodeJS и зависимости для него.

Установка зависимостей:
```
npm init -y
npm install dotenv node-telegram-bot-api
```

Не забудь в **[.env](https://github.com/Dosash/Dosash/blob/7f83e61ef3c835f59b238c37416f4a0bf773ac6a/Notion/VPN/Bot_telegam_token_send/.env)** добавить токен телеграм бота.

В **[keys.json](https://github.com/Dosash/Dosash/blob/7f83e61ef3c835f59b238c37416f4a0bf773ac6a/Notion/VPN/Bot_telegam_token_send/keys.json)** примеры какая должна быть база.

Пример того что будет отпровлять бот после команды /start Если у тебя несколько ключей, то бот отправит несколько сообщений с ключами.


```🔑 Ваш ключ №1:
`KEY-FOR-USER-1-1`
[📋 Нажмите, чтобы скопировать]

🔑 Ваш ключ №2:
`KEY-FOR-USER-1-2`
[📋 Нажмите, чтобы скопировать]
```


Так-же все готово для запуска в **Docker контейнере**.

