# Базовый образ с Java 21
FROM openjdk:21-jdk-slim

# Установка минимальных зависимостей
RUN apt update && apt install -y wget curl procps

# Рабочая директория
WORKDIR /minecraft

# Копируем все файлы проекта (включая startserver.sh и neoforge-installer.jar)
COPY . /minecraft

# Делаем скрипт исполняемым
RUN chmod +x /minecraft/startserver.sh

# Открываем порты
EXPOSE 25565
EXPOSE 25575

# Запуск сервера
CMD ["/minecraft/startserver.sh"]