document.addEventListener('DOMContentLoaded', () => {
    const introOverlay = document.getElementById('introOverlay');
    const mainContent = document.getElementById('mainContent');

    // Функция для скрытия intro-overlay и показа main-content
    function revealContent() {
        // Убедимся, что overlay существует перед добавлением класса
        if (introOverlay) {
            introOverlay.classList.add('fade-out'); // Запускаем анимацию исчезновения

            // Ждем завершения анимации исчезновения оверлея, прежде чем показывать основной контент
            introOverlay.addEventListener('transitionend', () => {
                if (mainContent) {
                    mainContent.classList.add('show'); // Показываем основной контент

                    // Немедленно запускаем анимации для всех элементов, которые должны быть анимированы при показе основного контента
                    // Это важно, так как IntersectionObserver может сработать не сразу, если элементы находятся выше скролла
                    const elementsToAnimate = document.querySelectorAll(
                        '.invitation-block-wrapper, .story-text, .highlight-text-block, .story-text h3, .story-text h4, .calendar-wrapper, .rsvp-block'
                    );
                    elementsToAnimate.forEach(element => {
                        // Добавляем класс is-visible, если элемент находится в видимой части экрана
                        // или если он должен появиться сразу (например, верхние блоки)
                        // Для надежности, мы можем просто добавить класс всем,
                        // а CSS-переходы позаботятся об анимации.
                        // Или, если хотим более точный контроль, проверяем видимость:
                        const rect = element.getBoundingClientRect();
                        const isVisible = (rect.top <= window.innerHeight && rect.bottom >= 0);
                        if (isVisible) {
                            element.classList.add('is-visible');
                        }
                    });
                }
                introOverlay.remove(); // Удаляем intro-overlay из DOM после завершения анимации
            }, { once: true }); // Удалить слушатель после первого срабатывания
        }
    }

    // Слушатель клика по экрану-конверту
    if (introOverlay) {
        introOverlay.addEventListener('click', revealContent);
    }


    // === Календарь ===
    const calendarGrid = document.querySelector('.calendar-grid');
    const highlightedDate = 12; // Дата, которую нужно выделить
    const targetMonth = 11; // 0-индексированный месяц (Декабрь - это 11)
    const targetYear = 2025;

    function renderCalendar(year, month, highlightDay) {
        // Убедимся, что calendarGrid существует
        if (!calendarGrid) return;

        // Удаляем существующие дни, чтобы перерисовать календарь
        const existingDays = calendarGrid.querySelectorAll('.day:not(.day-name)');
        existingDays.forEach(day => day.remove());

        // Определяем, какой день недели является первым днем месяца (0 = Вс, 1 = Пн, ...)
        // Для первого дня недели в сетке (Пн) нужно откорректировать смещение
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        let startDayOffset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1; // Если Воскресенье (0), то смещение 6 (перед Пн)

        const daysInMonth = new Date(year, month + 1, 0).getDate(); // Получаем количество дней в месяце

        // Добавляем пустые ячейки для дней до начала месяца
        for (let i = 0; i < startDayOffset; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('day', 'empty');
            calendarGrid.appendChild(emptyDay);
        }

        // Добавляем дни месяца
        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('day');
            dayElement.textContent = i;
            if (i === highlightDay) {
                dayElement.classList.add('highlighted');
            }
            calendarGrid.appendChild(dayElement);
        }
    }

    // Рендерим календарь при загрузке страницы
    renderCalendar(targetYear, targetMonth, highlightedDate);


    // === Анимация при прокрутке ===
    // Observer для элементов, которые анимируются при прокрутке
    const animateOnScrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Прекращаем наблюдение за этим элементом после анимации
            }
        });
    }, {
        threshold: 0.1 // Когда 10% элемента видно
    });

    // Наблюдаем за элементами, которые должны анимироваться при прокрутке
    const elementsToAnimate = document.querySelectorAll(
        '.invitation-block-wrapper, .story-text, .highlight-text-block, .story-text h3, .story-text h4, .calendar-wrapper, .rsvp-block'
    );

    // Запускаем наблюдение для каждого элемента
    elementsToAnimate.forEach(element => {
        animateOnScrollObserver.observe(element);
    });

    // Дополнительно: если пользователь сразу прокрутил вниз,
    // убедимся, что элементы, которые уже в viewport, анимируются.
    // Это будет обрабатываться в revealContent() для верхних элементов
    // и animateOnScrollObserver для остальных по мере прокрутки.
});