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
Добавить в конфиг: **input**

`input {
kb_layout=us,ru
kb_options=grp:alt_shift_toggle
}`


---

Как решить проблему с Garrys Mod, что нет нормального разрешения в 2к в игре. Он почему-то берет разрешение второго монитора который 1080p

Попробовать прописать в конфиг мониторов: `xrandr --output DP-3 --primary`

Настройки моих мониторов:

`monitor=DP-3, 2560x1440@179.90, 0x0, 1, transform, 0`

`monitor=HDMI-A-1, 1920x1080@59.96, 2560x0, 1, transform, 2`

`workspace=1, monitor:DP-3`

`workspace=2, monitor:HDMI-A-1`

