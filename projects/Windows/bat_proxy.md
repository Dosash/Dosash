# Windows Proxy Toggle BAT

Простой `.bat`-скрипт для быстрого включения и отключения системного proxy в Windows.

Проект создан для ситуации, когда нужно часто вручную прописывать proxy в настройках Windows через:

`Параметры → Сеть и Интернет → Proxy`

С этим скриптом достаточно просто запустить `.bat` файл — proxy включится автоматически. Пока консольное окно открыто, proxy считается активным. После закрытия или нажатия клавиши proxy отключается.

---

## Что делает скрипт

Скрипт автоматически прописывает proxy-сервер в системные настройки Windows для текущего пользователя:

```text
192.168.0.182:12323
```

---

## Сам скрипт

```
@echo off
chcp 65001 >nul
title Proxy ON - 192.168.0.182:12323

set "PROXY=192.168.0.182:12323"
set "REG_KEY=HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings"

echo Включаю системный proxy: %PROXY%

reg add "%REG_KEY%" /v ProxyEnable /t REG_DWORD /d 1 /f >nul
reg add "%REG_KEY%" /v ProxyServer /t REG_SZ /d "%PROXY%" /f >nul
reg add "%REG_KEY%" /v ProxyOverride /t REG_SZ /d "localhost;127.0.0.1;^<local^>" /f >nul

echo.
echo Proxy включен.
echo.
echo Оставь это окно открытым, пока нужен proxy.
echo Чтобы выключить proxy — нажми любую клавишу.
echo.

start "" /min powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command "$p=(Get-CimInstance Win32_Process -Filter ('ProcessId=' + $PID)).ParentProcessId; while(Get-Process -Id $p -ErrorAction SilentlyContinue){Start-Sleep 2}; reg add 'HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings' /v ProxyEnable /t REG_DWORD /d 0 /f ^| Out-Null"

pause >nul

echo Отключаю proxy...

reg add "%REG_KEY%" /v ProxyEnable /t REG_DWORD /d 0 /f >nul

echo Proxy выключен.
timeout /t 2 >nul
exit
```

---

A simple Windows BAT script for quickly enabling and disabling system proxy settings.

Простой BAT-скрипт для быстрого включения и отключения системного proxy в Windows.