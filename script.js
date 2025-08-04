document.addEventListener('DOMContentLoaded', () => {
    // Получаем ссылки на элементы
    const introOverlay = document.getElementById('introOverlay');
    const mainContent = document.getElementById('mainContent');

    // === Функция для скрытия intro-overlay и показа main-content ===
    function revealContent() {
        // Убедимся, что overlay существует перед добавлением класса
        if (introOverlay) {
            introOverlay.classList.add('fade-out'); // Запускаем анимацию исчезновения

            // Ждем завершения анимации исчезновения оверлея
            // (время должно соответствовать transition в CSS, например, 1.5s)
            introOverlay.addEventListener('transitionend', function handler() {
                // Убедимся, что mainContent существует
                if (mainContent) {
                    mainContent.classList.add('show'); // Показываем основной контент с анимацией

                    // Важно: Инициируем наблюдение IntersectionObserver только после того,
                    // как mainContent стал видимым. Это гарантирует, что анимации
                    // элементов внутри mainContent будут запускаться по мере прокрутки.
                    // Если какие-то элементы уже находятся в видимой области (в верхней части страницы),
                    // IntersectionObserver немедленно сработает для них.
                    elementsToAnimate.forEach(element => {
                        animateOnScrollObserver.observe(element);
                    });
                }
                // Удаляем intro-overlay из DOM после завершения анимации
                // Это предотвращает любые случайные взаимодействия или наслоения
                introOverlay.remove();
                
                // Удаляем слушатель события, чтобы избежать повторных вызовов
                this.removeEventListener('transitionend', handler);
            });
        }
    }

    // Слушатель клика по экрану-конверту
    if (introOverlay) {
        // Добавляем обработчик только один раз
        introOverlay.addEventListener('click', revealContent, { once: true });
    }

    // === Календарь ===
    const calendarGrid = document.querySelector('.calendar-grid');
    const highlightedDate = 12; // Дата, которую нужно выделить
    const targetMonth = 11;     // 0-индексированный месяц (Декабрь - это 11)
    const targetYear = 2025;

    function renderCalendar(year, month, highlightDay) {
        // Убедимся, что calendarGrid существует
        if (!calendarGrid) return;

        // Удаляем существующие дни, чтобы перерисовать календарь
        // Исключаем заголовки дней недели
        const existingDays = calendarGrid.querySelectorAll('.day:not(.day-name)');
        existingDays.forEach(day => day.remove());

        // Определяем, какой день недели является первым днем месяца (0 = Вс, 1 = Пн, ...)
        // Для первого дня недели в сетке (Пн) нужно откорректировать смещение
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        // JavaScript: 0-Sunday, 1-Monday, ..., 6-Saturday
        // CSS Grid (как у вас): Пн Вт Ср Чт Пт Сб Вс
        // Если 1-й день месяца - Вс (0), то отступ 6 (сб)
        // Если 1-й день месяца - Пн (1), то отступ 0
        // ...
        // Если 1-й день месяца - Сб (6), то отступ 5 (пт)
        let startDayOffset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1; 

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
            // Проверяем, является ли текущий день тем, который нужно выделить
            if (i === highlightDay && month === targetMonth && year === targetYear) {
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
    // Важно: Изначально не запускаем наблюдение, пока mainContent не появится
    const elementsToAnimate = document.querySelectorAll(
        '.invitation-block-wrapper, .story-text, .highlight-text-block, .story-text h3, .story-text h4, .calendar-wrapper, .rsvp-block'
    );

    // Initial check for elements already in viewport on page load (if intro overlay is not present initially)
    // This part is mostly for when the page loads *without* the intro overlay (e.g., direct access)
    // If the intro overlay is always present, this block might be less critical but harmless.
    if (!introOverlay || introOverlay.classList.contains('fade-out')) {
        elementsToAnimate.forEach(element => {
            // Если mainContent уже виден (т.е. оверлея нет), запускаем наблюдение сразу
            animateOnScrollObserver.observe(element);
        });
    }
});