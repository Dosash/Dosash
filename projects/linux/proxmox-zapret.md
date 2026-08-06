# Zapret + SOCKS5 + HTTP Proxy в Proxmox

Готовая инструкция по установке `zapret`, включению SOCKS5 в `tpws` и пробросу HTTP-proxy через `Privoxy`.

Proxmox контейнеру установлен статический *IP: 192.168.1.50* 

> В примерах ниже используется IP сервера: `192.168.1.50`  
> Если у тебя другой IP — просто замени его в командах и настройках клиентов.

---

## 1. Установка zapret.installer

Установи `curl`, затем запусти установщик:

```bash
apt-get update
apt-get install -y curl

sh -c "$(curl -fsSL https://raw.githubusercontent.com/Snowy-Fluffy/zapret.installer/refs/heads/main/installer.sh)"
````

После установки можно открыть панель/меню:

```bash
zapret
```

---

## 2. Основной конфиг zapret

Основной конфиг находится тут:

```bash
/opt/zapret/config
```

Перед изменениями лучше сделать бэкап:

```bash
cp /opt/zapret/config /opt/zapret/config.bak.$(date +%F-%H%M%S)
```

---

## 3. Включение SOCKS5 в zapret

Включаем встроенный SOCKS5 через `tpws`:

```bash
sed -i 's/^TPWS_SOCKS_ENABLE=.*/TPWS_SOCKS_ENABLE=1/' /opt/zapret/config
sed -i 's/^TPPORT_SOCKS=.*/TPPORT_SOCKS=987/' /opt/zapret/config
```

### Рекомендуемый блок `TPWS_SOCKS_OPT`

Открой конфиг:

```bash
nano /opt/zapret/config
```

Найди блок `TPWS_SOCKS_OPT` и приведи его к такому виду:

```bash
TPWS_SOCKS_OPT="
--filter-tcp=80 --methodeol <HOSTLIST> --new
--filter-tcp=443 --split-pos=1,midsld --disorder <HOSTLIST>
--bind-addr=192.168.1.50
"
```

> Такой вариант лучше использовать вместо старого `--split-tls=sni`, так как `--split-pos=1,midsld --disorder` — более актуальный и аккуратный способ для SOCKS5-режима `tpws`.

После этого перезапусти `zapret`:

```bash
systemctl restart zapret
systemctl status zapret --no-pager
```

Проверка, что SOCKS5 поднялся:

```bash
ss -lntp | grep 987
```

Ожидаемый результат примерно такой:

```text
LISTEN 0 10 127.0.0.1:987     0.0.0.0:*
LISTEN 0 10 192.168.1.50:987  0.0.0.0:*
```

Проверка локально на сервере:

```bash
curl --socks5-hostname 127.0.0.1:987 https://example.com -I
```

Проверка с другого устройства в сети:

```bash
curl --socks5-hostname 192.168.1.50:987 https://example.com -I
```

---

## 4. Параметры SOCKS5 для клиентов

Используй такие настройки:

```text
SOCKS5 host: 192.168.1.50
Port: 987
```

### Примеры устройств

* **Mac / Windows / Linux** — можно указывать SOCKS5 в браузере или приложении
* **Firefox** — желательно включить `Proxy DNS when using SOCKS v5`
* **curl** — использовать именно `--socks5-hostname`, а не просто `--socks5`

---

## 5. Установка HTTP-proxy поверх SOCKS5

Если устройство умеет только HTTP-proxy (например iPhone или часть Android TV), ставим `Privoxy`.

### Установка Privoxy

```bash
apt-get update
apt-get install -y privoxy
cp /etc/privoxy/config /etc/privoxy/config.bak.$(date +%F-%H%M%S)
```

### Настройка Privoxy

Удаляем старые строки и добавляем минимальную рабочую конфигурацию:

```bash
sed -i '/^[[:space:]]*listen-address[[:space:]]/d' /etc/privoxy/config
sed -i '/^[[:space:]]*permit-access[[:space:]]/d' /etc/privoxy/config
sed -i '/^[[:space:]]*deny-access[[:space:]]/d' /etc/privoxy/config
sed -i '/^[[:space:]]*forward-socks5[[:space:]]/d' /etc/privoxy/config

cat >> /etc/privoxy/config <<'EOF'

listen-address  192.168.1.50:8118
permit-access   192.168.1.0/24
forward-socks5  / 127.0.0.1:987 .
EOF
```

### Запуск Privoxy

```bash
systemctl enable --now privoxy
systemctl restart privoxy
systemctl status privoxy --no-pager -l
ss -lntp | grep 8118
```

Проверка работы HTTP-proxy:

```bash
curl -x http://127.0.0.1:8118 https://example.com -I
```

---

## 6. Параметры HTTP-proxy для клиентов

Используй такие настройки:

```text
HTTP proxy host: 192.168.1.50
Port: 8118
```

### iPhone / iPad

* `Settings`
* `Wi-Fi`
* выбрать сеть
* `Configure Proxy`
* `Manual`
* `Server: 192.168.1.50`
* `Port: 8118`


### ПК / ноутбук

Если приложение поддерживает SOCKS5 — лучше использовать **SOCKS5** напрямую:

```text
Host: 192.168.1.50
Port: 987
```

Если приложение понимает только HTTP-proxy:

```text
Host: 192.168.1.50
Port: 8118
```

---

## 7. Полезные команды для диагностики

### Проверить zapret

```bash
systemctl status zapret --no-pager
ss -lntp | grep 987
curl --socks5-hostname 127.0.0.1:987 https://example.com -I
```

### Проверить Privoxy

```bash
systemctl status privoxy --no-pager
ss -lntp | grep 8118
curl -x http://127.0.0.1:8118 https://example.com -I
```

### Посмотреть последние ошибки Privoxy

```bash
journalctl -u privoxy -n 50 --no-pager
```

### Посмотреть последние ошибки zapret

```bash
journalctl -u zapret -n 50 --no-pager
```

---

## 8. Важные замечания

* `SOCKS5` через `tpws` работает только для **TCP**
* `HTTP-proxy` через `Privoxy` нужен для устройств, где нет настройки SOCKS5
* часть приложений на iPhone / Android TV может игнорировать системный proxy
* для браузеров и большинства обычных приложений схема работает отлично

---

## 9. Итоговая схема

```text
Устройство
   ↓
HTTP Proxy (Privoxy :8118) или SOCKS5 (tpws :987)
   ↓
SOCKS5 tpws
   ↓
zapret
   ↓
Интернет
```

---

## 10. Кратко

### Установить zapret

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/Snowy-Fluffy/zapret.installer/refs/heads/main/installer.sh)"
```

### Включить SOCKS5

```bash
sed -i 's/^TPWS_SOCKS_ENABLE=.*/TPWS_SOCKS_ENABLE=1/' /opt/zapret/config
sed -i 's/^TPPORT_SOCKS=.*/TPPORT_SOCKS=987/' /opt/zapret/config
systemctl restart zapret
```

### Установить HTTP-proxy

```bash
apt-get install -y privoxy
```

### Настроить HTTP -> SOCKS5

```bash
cat >> /etc/privoxy/config <<'EOF'

listen-address  192.168.1.50:8118
permit-access   192.168.1.0/24
forward-socks5  / 127.0.0.1:987 .
EOF

systemctl restart privoxy
```

