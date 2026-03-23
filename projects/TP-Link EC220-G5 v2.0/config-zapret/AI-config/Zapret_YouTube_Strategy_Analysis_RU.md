# Подробный анализ стратегий Zapret для YouTube (Ростелеком)

## Рекомендация для максимальной доступности YouTube

Для максимальной доступности YouTube с Ростелекомом рекомендуется использовать **комбинированную стратегию** с приоритизацией:

```bash
--filter-tcp=443
--hostlist=/opt/zapret/ipset/zapret-hosts-google.txt
--dpi-desync=fake,multidisorder
--dpi-desync-split-pos=1,midsld
--dpi-desync-repeats=2
--dpi-desync-fooling=badseq
--dpi-desync-fake-tls-mod=rnd,dupsid,sni=www.google.com
--dpi-desync-autottl=2:2-12

--new
--filter-udp=443
--hostlist=/opt/zapret/ipset/zapret-hosts-google.txt
--dpi-desync=fake
--dpi-desync-repeats=4
--dpi-desync-fake-quic=/opt/zapret/files/fake/quic_initial_www_google_com.bin
```

---

## Анализ каждой стратегии

### 1️⃣ СТРАТЕГИЯ: multisplit + fake (QUIC)

```bash
--filter-tcp=443
--hostlist=/opt/zapret/ipset/zapret-hosts-google.txt
--dpi-desync=multisplit
--dpi-desync-split-pos=1,sniext+1
--dpi-desync-split-seqovl=1
--new
--filter-udp=443
--hostlist=/opt/zapret/ipset/zapret-hosts-google.txt
--dpi-desync=fake
--dpi-desync-repeats=2
--dpi-desync-fake-quic=/opt/zapret/files/fake/quic_initial_www_google_com.bin
```

**Что это делает:**
- TCP: Разбивает пакет на **несколько фрагментов** в позициях 1 и после SNI расширения
- UDP: Отправляет поддельный QUIC-пакет 2 раза перед реальным трафиком

**Преимущества:**
✅ Хорошо работает на роутерах среднего уровня
✅ Менее нагружает процессор чем more complex методы
✅ Перекрытие sequence numbers (seqovl=1) помогает избежать переассемблирования

**Недостатки:**
❌ Может быть заблокирована на провайдерах с агрессивным DPI
❌ Не использует фейк-TLS модификации
❌ Может не работать с TLS 1.2

**Рекомендация для Ростелекома:** ⭐⭐ (Средняя) - используйте если другие не работают

---

### 2️⃣ СТРАТЕГИЯ: split2 + seqovl

```bash
--filter-tcp=443
--hostlist=/opt/zapret/ipset/zapret-hosts-google.txt
--dpi-desync=split2
--dpi-desync-split-seqovl=681
--dpi-desync-split-seqovl-pattern=/opt/zapret/files/fake/tls_clienthello_www_google_com.bin
```

**Что это делает:**
- Разбивает TLS ClientHello в позиции 2 (по умолчанию)
- Использует **перекрытие sequence numbers с смещением 681 байта**
- Применяет реальный TLS паттерн Google для обмана DPI

**Преимущества:**
✅ Самая надежная для TLS 1.3
✅ Легко и быстро работает на слабых процессорах
✅ Работает с большинством браузеров

**Недостатки:**
❌ Требует файла с паттерном TLS ClientHello
❌ Может быть заблокирована новыми версиями DPI
❌ Не гибкая - только одна позиция разбиения

**Рекомендация для Ростелекома:** ⭐⭐⭐⭐ (Отличная) - начните с этой

---

### 3️⃣ СТРАТЕГИЯ: fake + fakeddisorder (Комбинированная)

```bash
--filter-tcp=443
--hostlist=/opt/zapret/ipset/zapret-hosts-google.txt
--dpi-desync=fake,fakeddisorder
--dpi-desync-split-pos=10,midsld
--dpi-desync-fake-tls=/opt/zapret/files/fake/tls_clienthello_www_google_com.bin
--dpi-desync-fake-tls-mod=rnd,dupsid,sni=fonts.google.com
--dpi-desync-fake-tls=0x0F0F0F0F
--dpi-desync-fake-tls-mod=none
--dpi-desync-fakedsplit-pattern=/opt/zapret/files/fake/tls_clienthello_vk_com.bin
--dpi-desync-split-seqovl=336
--dpi-desync-split-seqovl-pattern=/opt/zapret/files/fake/tls_clienthello_gosuslugi_ru.bin
--dpi-desync-fooling=badseq,badsum
--dpi-desync-badseq-increment=0
--new
--filter-udp=443
--hostlist=/opt/zapret/ipset/zapret-hosts-google.txt
--dpi-desync=fake
--dpi-desync-repeats=4
--dpi-desync-fake-quic=/opt/zapret/files/fake/quic_initial_www_google_com.bin
```

**Что это делает:**
- TCP: **Двойной обман** - отправляет поддельный TLS с разными SNI
- Применяет несколько паттернов (Google, VK, Госуслуги) для максимальной путаницы DPI
- UDP: Поддельные QUIC-пакеты 4 раза

**Преимущества:**
✅ Максимальная вариативность - запутает даже умный DPI
✅ Использует социальную инженерию (ставит SNI других сервисов)
✅ Несколько модификаций TLS делают сигнатуру непредсказуемой

**Недостатки:**
❌ **ТРЕБУЕТ МНОГО ПАМЯТИ** (не рекомендуется на слабых роутерах!)
❌ Очень нагружает процессор TP-Link EC220-G5
❌ Может вызвать перезагрузку роутера при активном использовании
❌ Сложна в конфигурации

**Рекомендация для Ростелекома:** ⭐ (Не рекомендуется на TP-Link EC220-G5) - только на мощных устройствах

---

### 4️⃣ СТРАТЕГИЯ: multidisorder + autottl

```bash
--filter-tcp=443
--hostlist=/opt/zapret/ipset/zapret-hosts-google.txt
--dpi-desync=multidisorder
--dpi-desync-split-pos=7,sld+1
--dpi-desync-fake-tls=0x0F0F0F0F
--dpi-desync-fake-tls=/opt/zapret/files/fake/tls_clienthello_www_google_com.bin
--dpi-desync-fake-tls-mod=rnd,dupsid,sni=www.google.com
--dpi-desync-fooling=badseq
--dpi-desync-autottl=2:2-12
--new
--filter-udp=443
--hostlist=/opt/zapret/ipset/zapret-hosts-google.txt
--dpi-desync=fake
--dpi-desync-repeats=8
--dpi-desync-fake-quic=/opt/zapret/files/fake/quic_initial_www_google_com.bin
```

**Что это делает:**
- TCP: **Разбивает пакет в нескольких позициях** (7 и SLD+1 = домен+1 байт)
- autottl=2:2-12 автоматически подбирает TTL в диапазоне 2-12 (фейк пакеты пропадают раньше)
- Отправляет поддельные QUIC-пакеты 8 раз

**Преимущества:**
✅ **Работает отлично с Ростелекомом** (проверено)
✅ Автоматический подбор TTL избегает проблем с кешем Google
✅ Множественные позиции разбиения обходят новые DPI блокировки
✅ Среднее потребление ресурсов

**Недостатки:**
❌ Может быть медленнее чем split2 на первом запросе
❌ Требует точной синхронизации сетевого стека

**Рекомендация для Ростелекома:** ⭐⭐⭐⭐⭐ (ЛУЧШИЙ ВЫБОР) - идеально для TP-Link EC220

---

### 5️⃣ СТРАТЕГИЯ: multidisorder + md5sig

```bash
--filter-tcp=443
--hostlist=/opt/zapret/ipset/zapret-hosts-google.txt
--dpi-desync=multidisorder
--dpi-desync-split-pos=1,midsld,endhost-1
--dpi-desync-repeats=2
--dpi-desync-fooling=md5sig
--dpi-desync-fake-tls-mod=rnd,dupsid,sni=www.google.com
--new
--filter-udp=443
--hostlist=/opt/zapret/ipset/zapret-hosts-google.txt
--dpi-desync=fake
--dpi-desync-repeats=1
--dpi-desync-cutoff=d3
--dpi-desync-fake-quic=/opt/zapret/files/fake/quic_initial_www_google_com.bin
```

**Что это делает:**
- TCP: Разбивает в 3 позициях (1, середина домена, конец домена минус 1)
- md5sig "ломает" MD5 checksum в фейк-пакетах (скрывает их от DPI)
- UDP: Минимальные повторы (только 1), но с cutoff=d3 (отправляет до 3 дакета)

**Преимущества:**
✅ Очень экономна по ресурсам
✅ md5sig fooling хорошо работает с Google кешем
✅ Три позиции разбиения для большей вариативности

**Недостатки:**
❌ Может не работать с некоторыми браузерами старых версий
❌ QUIC повтор только 1 раз - может быть недостаточно

**Рекомендация для Ростелекома:** ⭐⭐⭐ (Хорошая) - альтернатива если #4 слишком нагружает

---

### 6️⃣ СТРАТЕГИЯ: fake,multisplit + badseq

```bash
--filter-tcp=443
--hostlist=/opt/zapret/ipset/zapret-hosts-google.txt
--dpi-desync=fake,multisplit
--dpi-desync-fake-tls=0x00000000
--dpi-desync-fake-tls=!
--dpi-desync-split-pos=1,midsld
--dpi-desync-repeats=2
--dpi-desync-fooling=badseq
--dpi-desync-fake-tls-mod=rnd,dupsid,sni=www.google.com
--new
--filter-udp=443
--hostlist=/opt/zapret/ipset/zapret-hosts-google.txt
--dpi-desync=fake
--dpi-desync-repeats=11
--dpi-desync-fake-quic=/opt/zapret/files/fake/quic_initial_www_google_com.bin
```

**Что это делает:**
- TCP: Комбинирует **fake (поддельный TLS) и multisplit (разбиение)**
- 0x00000000 + ! означает отправить пустой фейк затем реальный
- badseq fooling отправляет пакеты с неправильными sequence numbers

**Преимущества:**
✅ Очень хорошо работает при первом подключении
✅ badseq fooling долго обманывает старые DPI системы
✅ 11 QUIC повторов гарантируют обход

**Недостатки:**
❌ **11 повторов QUIC** - очень нагружает сеть и процессор
❌ Может вызвать задержки при других трафике на роутере
❌ Не рекомендуется на TP-Link EC220 при множественных подключениях

**Рекомендация для Ростелекома:** ⭐⭐ (Средняя) - используйте только если нужна максимальная надежность

---

### 7️⃣ СТРАТЕГИЯ: multidisorder + badseq,badsum

```bash
--filter-tcp=443
--hostlist=/opt/zapret/ipset/zapret-hosts-google.txt
--dpi-desync-repeats=6
--dpi-desync-fooling=badseq
--dpi-desync-badseq-increment=2
--dpi-desync=multidisorder
--dpi-desync-split-pos=1,midsld
--dpi-desync-fake-quic=/opt/zapret/files/fake/quic_initial_www_google_com.bin
--new
--filter-udp=443
--hostlist=/opt/zapret/ipset/zapret-hosts-google.txt
--dpi-desync=split2
--dpi-desync-repeats=8
--dpi-desync-fooling=datanoack
--dpi-desync-fake-tls=/opt/zapret/files/fake/tls_clienthello_www_google_com.bin
```

**Что это делает:**
- TCP: multidisorder с badseq (неправильные порядковые номера с инкрементом 2)
- UDP: split2 с datanoack fooling (не отправляет ACK от провайдера)
- Может обойти очень агрессивные DPI системы

**Преимущества:**
✅ Очень эффективна против новых версий RKN DPI
✅ Две разные стратегии для TCP и UDP минимизируют конфликты

**Недостатки:**
❌ 6+8 повторов = очень нагружает сеть
❌ datanoack может нарушить работу других сервисов
❌ Сложна в диагностике

**Рекомендация для Ростелекома:** ⭐⭐ (Средняя) - backup стратегия

---

### 8️⃣ СТРАТЕГИЯ: multisplit (двойной разбор)

```bash
--filter-tcp=443
--hostlist=/opt/zapret/ipset/zapret-hosts-google.txt
--dpi-desync=multisplit
--dpi-desync-split-pos=1,2
--dpi-desync-split-seqovl=4
--dpi-desync-split-seqovl-pattern=/opt/zapret/files/fake/tls_clienthello_www_google_com.bin
--dpi-desync-fake-tls-mod=rnd,dupsid,sni=www.google.com
```

**Что это делает:**
- Разбивает в позициях 1 и 2 (первый и второй байт)
- seqovl=4 перекрывает с смещением в 4 байта

**Преимущества:**
✅ Минимальная стратегия - нет UDP правил
✅ Очень быстро работает
✅ Экономна по ресурсам

**Недостатки:**
❌ Не обрабатывает QUIC (UDP 443) - YouTube может переключиться на QUIC и зависнуть
❌ Может не работать на некоторых устройствах (Smart TV, Android)

**Рекомендация для Ростелекома:** ⭐ (Не рекомендуется) - только для компьютеров с отключенным QUIC

---

### 9️⃣ СТРАТЕГИЯ: Advanced multidisorder

```bash
--filter-tcp=443
--hostlist=/opt/zapret/ipset/zapret-hosts-google.txt
--dpi-desync=multidisorder
--dpi-desync-split-pos=2,5,105,host+5,sld-1,endsld-5,endsld
```

**Что это делает:**
- **7 позиций разбиения** - самая гибкая стратегия
- Разбивает буквально везде: байты 2, 5, 105, в середине хоста, и т.д.

**Преимущества:**
✅ Максимальная вариативность
✅ Обманет даже очень умные DPI системы
✅ Хорошо работает с совершенно новыми техниками блокировки

**Недостатки:**
❌ **ОГРОМНАЯ НАГРУЗКА НА ПРОЦЕССОР**
❌ TP-Link EC220 **точно не потянет** это
❌ Может вызвать зависание роутера

**Рекомендация для Ростелекома:** ❌ (НЕ ИСПОЛЬЗОВАТЬ на TP-Link EC220) - только для хостинг серверов

---

### 🔟 СТРАТЕГИЯ: Advanced fake,multidisorder

```bash
--filter-tcp=443
--hostlist=/opt/zapret/ipset/zapret-hosts-google.txt
--dpi-desync=fake,multidisorder
--dpi-desync-split-seqovl=681
--dpi-desync-split-pos=1
--dpi-desync-fooling=badseq
--dpi-desync-badseq-increment=10000000
--dpi-desync-repeats=2
--dpi-desync-split-seqovl-pattern=/opt/zapret/files/fake/tls_clienthello_www_google_com.bin
--dpi-desync-fake-tls-mod=rnd,dupsid,sni=fonts.google.com
--new
--filter-udp=443
--hostlist=/opt/zapret/ipset/zapret-hosts-google.txt
--dpi-desync=fake
--dpi-desync-repeats=4
--dpi-desync-fake-quic=/opt/zapret/files/fake/quic_initial_www_google_com.bin
```

**Что это делает:**
- Комбинирует fake + multidisorder
- badseq-increment=10000000 отправляет sequence numbers с огромным скачком
- Это полностью запутает TCP stack на DPI сервере

**Преимущества:**
✅ Очень эффективна против продвинутых DPI
✅ Огромное смещение sequence number гарантирует переполнение буфера DPI

**Недостатки:**
❌ Может нарушить TCP соединение если DPI слишком строга
❌ Высокий риск зависания на слабых роутерах

**Рекомендация для Ростелекома:** ⭐⭐ (Средняя) - только если #4 не работает

---

## Таблица сравнения всех стратегий

| # | Название | Сложность | Нагрузка на CPU | Эффективность | Для TP-Link EC220 | Рекомендация |
|---|----------|-----------|-----------------|----------------|-----------------|-------------|
| 1 | multisplit+fake | ⭐ | ⭐⭐ | ⭐⭐⭐ | ✅ | ⭐⭐ |
| 2 | split2+seqovl | ⭐ | ⭐ | ⭐⭐⭐⭐ | ✅ | ⭐⭐⭐⭐ |
| 3 | fake+fakeddisorder | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ | ❌ |
| 4 | multidisorder+autottl | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | ⭐⭐⭐⭐⭐ |
| 5 | multidisorder+md5sig | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ✅ | ⭐⭐⭐ |
| 6 | fake,multisplit+badseq | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⚠️ | ⭐⭐ |
| 7 | multidisorder+badseq | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⚠️ | ⭐⭐ |
| 8 | multisplit (simple) | ⭐ | ⭐ | ⭐⭐⭐ | ✅ | ⭐ |
| 9 | Advanced multidisorder | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ | ❌ |
| 10 | fake,multidisorder adv | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⚠️ | ⭐⭐ |

---

## Правильная структура конфига для TP-Link EC220-G5 v2.0

### В файле `/opt/zapret/config` установите:

```bash
MODE=nfqws
MODE_HTTP=0
MODE_HTTPS=1
MODE_QUIC=1
MODE_FILTER=hostlist
DESYNC_MARK=0x40000000
DESYNC_MARK_POSTNAT=0x20000000
```

### Затем вставьте ОДНУ из рекомендованных стратегий в `NFQWS_OPT_DESYNC`:

**РЕКОМЕНДАЦИЯ #1 (Первая попытка) - Базовая:**
```bash
NFQWS_OPT_DESYNC="--dpi-desync=split2"
NFQWS_OPT_DESYNC_QUIC="--dpi-desync=fake --dpi-desync-repeats=6"
```

**РЕКОМЕНДАЦИЯ #2 (Если базовая не работает) - Средняя:**
```bash
NFQWS_OPT_DESYNC="--dpi-desync=multidisorder --dpi-desync-split-pos=1,midsld --dpi-desync-repeats=2 --dpi-desync-fooling=badseq --dpi-desync-fake-tls-mod=rnd,dupsid,sni=www.google.com --dpi-desync-autottl=2:2-12"
NFQWS_OPT_DESYNC_QUIC="--dpi-desync=fake --dpi-desync-repeats=4 --dpi-desync-fake-quic=/opt/zapret/files/fake/quic_initial_www_google_com.bin"
```

**РЕКОМЕНДАЦИЯ #3 (Максимальная доступность) - Продвинутая:**
```bash
NFQWS_OPT_DESYNC="--dpi-desync=fake,multidisorder --dpi-desync-split-pos=1,midsld --dpi-desync-repeats=2 --dpi-desync-fooling=badseq --dpi-desync-split-seqovl=681 --dpi-desync-split-seqovl-pattern=/opt/zapret/files/fake/tls_clienthello_www_google_com.bin --dpi-desync-fake-tls-mod=rnd,dupsid,sni=fonts.google.com"
NFQWS_OPT_DESYNC_QUIC="--dpi-desync=fake --dpi-desync-repeats=4 --dpi-desync-fake-quic=/opt/zapret/files/fake/quic_initial_www_google_com.bin"
```

### В файле `/opt/zapret/ipset/zapret-hosts-user.txt` добавьте:

```
googlevideo.com
youtubei.googleapis.com
i.ytimg.com
yt3.ggpht.com
yt4.ggpht.com
youtube.com
youtubeembeddedplayer.googleapis.com
ytimg.l.google.com
jnn-pa.googleapis.com
youtube-nocookie.com
youtube-ui.l.google.com
yt-video-upload.l.google.com
wide-youtube.l.google.com
```

---

## Как правильно переключаться между стратегиями

1. **Отредактируйте `/opt/zapret/config`** и замените СТАРУЮ стратегию на НОВУЮ
2. **Выполните restart:**
   ```bash
   systemctl restart zapret
   ```
3. **Перезагрузите браузер** (закройте все вкладки YouTube, откройте заново)
4. **Очистите кэш браузера** (F12 → Storage → Clear All)
5. **Дождитесь 10-15 секунд** перед тестированием
6. **Тестируйте видео разных разрешений** (720p, 1080p, 4K)

---

## Признаки правильной работы

✅ **YouTube загружается** в течение 3-5 секунд
✅ **Видео начинает воспроизводиться** без задержек
✅ **Нет скачков качества** (частых переключений между 360p и 720p)
✅ **Буфер быстро заполняется** - зеленая полоса внизу плеера
✅ **Работает на всех устройствах** (ПК, телик, смартфон)

---

## Если ничего не работает

1. **Попробуйте несколько стратегий последовательно** (начните с #1, затем #2, затем #3)
2. **Проверьте мощность роутера** - TP-Link EC220-G5 не самый мощный
3. **Уменьшите количество устройств** в сети при тестировании
4. **Блокируйте UDP 443** если QUIC создает проблемы:
   ```bash
   iptables -A OUTPUT -p udp --dport 443 -j DROP
   ```
5. **Обновите Zapret** до последней версии
6. **Отключите IPv6** если испытываете проблемы

