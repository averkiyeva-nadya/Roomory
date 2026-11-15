# Roomory — уютный природный дизайн

Локальный дизайн-черновик: мотивационные подписи не возвращены, структура и логика хранения сохранены. Новая тема применена к обзору дома, плану сверху, развёрткам стен, содержимому мебели, поиску и диалогам.

## Материалы

- `assets/hobbit-home.png` — авторская иллюстрация, созданная встроенным инструментом `image_gen` и сохранённая в проекте. Показывается только в «Мой дом», над карточками комнат. На узком экране кадр адаптируется к высоте баннера.
- `assets/hobbit-mark.svg` — небольшой векторный домик с круглой дверью и деревом; новый знак бренда и favicon. Создан в коде, чтобы оставаться чётким в маленьком размере.
- `assets/leaf-sprig.svg` — декоративная веточка в карточках и панели содержимого, создана в SVG.
- `woodland.css` — дерево, тёплая бумага, моховые и оливковые оттенки, латунные акценты, спокойная антиква в заголовках. Основной интерфейс остаётся читаемым системным шрифтом.

## Финальный запрос для иллюстрации

Инструмент: встроенный `image_gen`, без CLI и API-ключа. Прозрачный фон не запрашивался.

> Use case: illustration-story. Asset: wide panoramic header illustration for a cozy hobbit-inspired home inventory web app. A beautiful inviting exterior of Bilbo's hobbit home in a grassy hill: iconic round moss-green wooden door with a brass knob, warm honey-coloured stone and curved timber facade, small round windows with amber glow, little stone path, flowering cottage garden, a rustic wooden fence. One magnificent old oak tree growing atop the hill, spreading sculptural branches and leafy canopy. Hand-painted storybook watercolor and gouache, finely drawn botanical details, warm creamy paper texture, soft morning light, moss and olive greens, walnut brown, golden ochre, muted terracotta. Quiet, charming, high-end editorial illustration, not childish clipart. Panoramic landscape 3:1 composition, house centered slightly right, tree canopy filling upper area, foreground flowers and grass framing the bottom; all key subjects fit in a wide shallow banner. No people, no lettering, no logos, no border, no watermark. Save generated asset as a local file and return its path if supported.

## Проверка

- Главная иллюстрация загружается в обзоре и скрывается при открытии комнаты.
- Новый домик отображается в бренде, SVG используется как favicon.
- Просмотрены обзор дома, переход в кабинет и новый вид развёртки.
- 14 тестов данных и геометрии проходят. Логика фиксации мебели и размещение кнопки добавления комнат не менялись.
- Физический телефон и разные браузеры в этой итерации не проверялись.

После просмотра автор одобрил отправку изменений в GitHub.

Дополнительно проверена компоновка «Мой дом» с иллюстрацией в области 360 × 800 CSS px: clientWidth = scrollWidth = 360, изображение и карточки отображаются без горизонтального переполнения.

## Вторая визуальная итерация

«Мой дом» превращён в широкий заголовочный баннер с названием и статистикой поверх иллюстрации. Добавлен мягкий градиент для читаемости. Поиск и карточки следуют за баннером. Интерфейс переведён на современный системный шрифт без засечек, а сказочное начертание оставлено в бренде.

Добавлены короткие переходы при смене комнаты/ракурса, спокойные hover-состояния, плавное возвращение наверх при переходе в другую комнату и свободное пространство после содержимого. Движение отключается при системной настройке prefers-reduced-motion.

Удалены декоративная полоска окна на плане и зелёная веточка в панели мебели. Мини-планы в обзоре больше не выделяют случайно выбранный предмет зелёным.

Проверено после второй итерации: переход из обзора в спальню и обратно; отсутствие `.window` на плане; фактический нижний отступ 181,72 px на проверенном размере окна; обзор с баннером в области 360 px без переполнения (clientWidth = scrollWidth = 360). Снимок и архив сохранены для просмотра. Новых проверок на физическом телефоне не проводилось.
