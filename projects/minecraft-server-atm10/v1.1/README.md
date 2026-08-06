## Инструкция по запуску Minecraft сервера с Docker Compose

Сборка `Docker-compose` файла сделана с помощью [itzg/minecraft-server](https://github.com/itzg/docker-minecraft-server) офф GitHub репозиторий. Так-же все настройки по `Docker-Compose` файлы вы можете найти [тут](https://docker-minecraft-server.readthedocs.io/en/latest/#using-docker-compose).


### 💝 Сказать спасибо: [ТЫК!](https://pay.cloudtips.ru/p/54d2c495)

---

### 1. Подготовка окружения

- Убедись, что на твоей машине установлен Docker и Docker Compose.
  - Проверка Docker:  
    ```bash
    docker --version
    ```
  - Проверка Docker Compose:  
    ```bash
    docker-compose --version
    ```

- Создай рабочую директорию для сервера Minecraft, например:  
  ```bash
  mkdir -p ~/minecraft-server
  cd ~/minecraft-server
  ```

### 2. Создай файл `docker-compose.yml`

- В рабочей папке создай файл `docker-compose.yml` и вставь туда следующий код (с твоими параметрами):

```yaml
services:
  mc:
    image: itzg/minecraft-server
    tty: true
    stdin_open: true
    ports:
      - "25565:25565" # Порт для сервера
    environment:
      EULA: "TRUE"
      TYPE: "AUTO_CURSEFORGE"
      CF_API_KEY: '${CF_API_KEY}' # Твой API ключ CurseForge (берётся из файла .env)
      CF_PAGE_URL: "https://www.curseforge.com/minecraft/modpacks/all-the-mods-10" # Ссылка на модпак
      MEMORY: "8G"  # Оперативная память для сервера
      VERSION: 1.21.1 # Версия Minecraft сборки
    volumes:
      - ./data:/data
```

### 3. Создание и подготовка директорий для сохранений и конфигов

- Файлы `server.properties`, `eula.txt`, `ops.json` можно создать пустыми, Docker создаст их автоматически при первом запуске, либо подготовить свои конфиги.

- Важно: в файле `eula.txt` должен быть текст `eula=true`, чтобы сервер запускался корректно. (Не обязательно, он будет сам создан после создания сборки)

### 4. Получение API ключа CurseForge

- Зарегистрируйся или войди на [CurseForge API](https://console.curseforge.com/?#/api-keys)
- Создай новый API ключ
- Рядом с `docker-compose.yml` создай файл `.env` и положи ключ туда:
  ```
  CF_API_KEY=твой-ключ-с-console.curseforge.com
  ```
- Docker Compose сам подставит значение из `.env` вместо `${CF_API_KEY}`. Никогда не коммить `.env` и сам ключ в git.

### 5. Запуск сервера

- Из директории с файлом `docker-compose.yml` выполни команду:  
```bash
docker-compose up -d
```

- Опция `-d` запускает сервер в фоновом режиме.

### 6. Просмотр логов и управление сервером

- Чтобы посмотреть логи сервера:  
```bash
docker-compose logs -f
```

- Для остановки сервера:  
```bash
docker-compose down
```

### 7. Подключение к серверу

- В Minecraft-клиенте добавь сервер с IP-адресом твоего хоста (если локально — это `localhost` или `127.0.0.1` или `ваш IP сервера (VPS)`), порт по умолчанию `25565` или который вы укажите в `Docker-compose.yml`.

***
