# Решение некоторых проблем на HyperLand


---

Лучше добавить для поиска и установки нормально приложений: https://aur.chaotic.cx/docs 


---

Установка Hiddyfy, для начала надо установить YAY:
`sudo pacman -S --needed git base-devel && git clone https://aur.archlinux.org/yay.git && cd yay && makepkg -si`

После можно устанавливать:
`yay -S hiddify-next`

Что бы удалить:
`yay -Rns hiddify-next`

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

Попробовать прописать в конфиг мониторов: `xrandr --output DP-3 --primary`