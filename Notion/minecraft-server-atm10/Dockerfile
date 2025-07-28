    # База с поддержкой ARM/AMD
ARG JAVA_VERSION=21
FROM azul/zulu-openjdk:${JAVA_VERSION}

# Создаем пользователя minecraft
RUN adduser --disabled-password --gecos '' --home /minecraft minecraft && \
    mkdir -p /minecraft/server-files && \
    chown -R minecraft:minecraft /minecraft

# Копируем серверные файлы ATM10 (включая startserver.sh)
COPY ./server-ATM10-4.4 /minecraft/server-files
RUN chown -R minecraft:minecraft /minecraft/server-files && \
    chmod +x /minecraft/server-files/startserver.sh

# Переопределяем права на все файлы для владельца
RUN chown -R minecraft:minecraft /minecraft

# Переключаемся на пользователя minecraft для безопасности
USER minecraft
WORKDIR /minecraft/server-files


# Запускаем сервер через ваш startserver.sh (можно добавить параметры памяти здесь)
CMD ["./startserver.sh"]
