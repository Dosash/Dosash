# Решение некоторых проблем на HyperLand

---

Установка Hiddyfy:

`bash <(curl https://i.hiddify.com/release)`

Конфиг для подключения: (Смотри в ТГ!)

---

Смена языка на Alt+Shift:

`input {
kb_layout=us,ru
kb_options=grp:alt_shift_toggle
}`

Добавить в конфиг: **input**

---

Как решить проблему с Garrys Mod, что нет нормального разрешения в 2к в игре. Он почему-то берет разрешение второго монитора который 1080p

Попробовать прописать в конфиг мониторов: `xrandr --output DP-2 --primary`