## Инструкция по запуску Minecraft-сервера ATM10 с Docker Compose и отдельными volumes для мира, конфигов и пользовательских данных

### 1. Подготовка структуры папок

На вашем хосте (в папке, где будет жить сервер), создайте следующую структуру каталогов и файлов:

```
minecraft/
├── Dockerfile
├── atm10-server-files/           # Здесь должны лежать startserver.sh, forge-*.jar, папка mods и другие серверные файлы модпака ATM10
│   ├── startserver.sh
│   ├── forge-*.jar
│   ├── mods/
│   └── ... (остальные файлы, необходимые для вашего ATM10)
├── data/                         # Здесь будут храниться данные сервера, которые не должны перезаписываться при обновлении
│   ├── world/                    # Мир
│   ├── logs/                     # Логи сервера
│   ├── journeymap/               # Карты (JourneyMap)
│   ├── local/                    # Локальные файлы модов
│   ├── packmenu/                 # Меню пакетов
│   ├── patchouli_books/          # Книги Patchouli
│   ├── server.properties         # Основной конфиг сервера
│   ├── eula.txt                  # Файл EULA (автоматически создаётся, если нет)
│   ├── ops.json                  # Операторы сервера
│   └── ...                       # Можете добавить свои файлы и папки по аналогии
└── docker-compose.yml            # Compose-файл для удобного запуска
```

**Убедитесь, что файл `startserver.sh` и все необходимые серверные файлы лежат в `atm10-server-files/`** — они будут скопированы внутрь образа при сборке.

### 2. Dockerfile

В папке `minecraft/` создайте или отредактируйте файл `Dockerfile` с таким содержимым:

```dockerfile
FROM azul/zulu-openjdk:21

RUN adduser --disabled-password --gecos '' --home /minecraft minecraft && \
    mkdir -p /minecraft/server-files && \
    chown -R minecraft:minecraft /minecraft

COPY ./atm10-server-files /minecraft/server-files
RUN chown -R minecraft:minecraft /minecraft/server-files && \
    chmod +x /minecraft/server-files/startserver.sh

USER minecraft
WORKDIR /minecraft/server-files

CMD ["./startserver.sh"]
```

### 3. Docker Compose

В папке `minecraft/` создайте или отредактируйте файл `docker-compose.yml`:

```yaml
version: '3.8'

services:
  atm10:
    image: my-atm10-server
    container_name: atm10-server
    restart: unless-stopped
    ports:
      - "25565:25565"
    volumes:
      - ./data/world:/minecraft/server-files/world
      - ./data/logs:/minecraft/server-files/logs
      - ./data/server.properties:/minecraft/server-files/server.properties
      - ./data/eula.txt:/minecraft/server-files/eula.txt
      - ./data/ops.json:/minecraft/server-files/ops.json
      - ./data/journeymap:/minecraft/server-files/journeymap
      - ./data/local:/minecraft/server-files/local
      - ./data/packmenu:/minecraft/server-files/packmenu
      - ./data/patchouli_books:/minecraft/server-files/patchouli_books
      # Добавляйте другие папки/файлы по необходимости
    environment:
      MEMORY: "10G"  # Опционально, регулирует выделяемую память для Java
```

### 4. Сборка и запуск

Откройте терминал в папке `minecraft/` и выполните:

```bash
# Сборка образа
docker build -t my-atm10-server .

# Запуск сервера через Docker Compose
docker compose up -d
```

### 5. Как обновлять модпак

- **Измените серверные файлы в папке `atm10-server-files/`** (если есть новая версия модпака).
- **Пересоберите образ**:  
  `docker build -t my-atm10-server .`
- **Запустите заново**:  
  `docker compose down && docker compose up -d`
- **Мир, логи, конфиги, пользовательские папки останутся неизменными на хосте** и не перезапишутся.

### 6. Что делать с миром и настройками

- **Чтобы перенести существующий мир**, положите свою папку `world` в `data/world/` перед запуском.
- **Чтобы сохранить логи и настройки**, используйте `data/logs/`, `data/server.properties`, `data/eula.txt` и т.д.
- **Если используете другие моды с сохранением своих данных**, добавьте их папки в `volumes` в `docker-compose.yml`.

**Дальнейшая работа:**  
После запуска вы сможете подключаться к серверу по IP хоста и порту 25565.  
**Если нужна автоматическая настройка EULA, убедитесь, что в стартовом скрипте есть команда, устанавливающая значение в eula.txt.**

**Если потребуется автоматический бэкап, смена Java-параметров, добавление резервных конфигов — напишите, и я помогу расширить инструкцию под ваш кейс.**