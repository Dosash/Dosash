Помни что нужно установить [NodeJS](https://nodejs.org/en/download) и зависимости для него.
---
Установка зависимостей:
```
npm init -y

npm install dotenv node-telegram-bot-api
```
---
Не забудь в **[.env](https://github.com/Dosash/Dosash/blob/7f83e61ef3c835f59b238c37416f4a0bf773ac6a/Notion/VPN/Bot_telegam_token_send/.env)** добавить токен телеграм бота.

```BOT_TOKEN=Токен бота!```

---
В **[keys.json](https://github.com/Dosash/Dosash/blob/7f83e61ef3c835f59b238c37416f4a0bf773ac6a/Notion/VPN/Bot_telegam_token_send/keys.json)** примеры какая должна быть база.
В первой строке пример с двумя ключами, а во второй с одним.

```json
{
  "123456789": ["KEY-FOR-USER-1-1", "KEY-FOR-USER-1-2"],
  "987654321": ["KEY-FOR-USER-2-1"]
}
```

---
Пример того что будет отпровлять бот после команды /start Если у тебя несколько ключей, то бот отправит несколько сообщений с ключами.

```🔑 Ваш ключ №1:
`KEY-FOR-USER-1-1`
[📋 Нажмите, чтобы скопировать]

🔑 Ваш ключ №2:
`KEY-FOR-USER-1-2`
[📋 Нажмите, чтобы скопировать]
```
---
Так-же все готово для запуска в **[Docker контейнере](https://github.com/Dosash/Dosash/blob/a831838b43e6f38ef4aa793d81218c67617e8342/Notion/VPN/Bot_telegam_token_send/dockerfile)**.

Запуск контейнера, сначала его нужно собрать первой командой, а второй командой запустить. 
```
docker build -t telegram-bot .

docker run -d --name my-bot --env-file .env -v $(pwd)/keys.json:/app/keys.json telegram-bot
```
