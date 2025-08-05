document.addEventListener('DOMContentLoaded', () => {
    // Получаем ссылки на элементы
    const introOverlay = document.getElementById('introOverlay');
    const mainContent = document.getElementById('mainContent');

    // === Функция для скрытия intro-overlay и показа main-content ===
    function revealContent() {
        if (introOverlay) {
            introOverlay.classList.add('fade-out'); // Запускаем анимацию исчезновения оверлея

            // --- НОВОЕ ДОБАВЛЕНИЕ / ИЗМЕНЕНИЕ ---
            // Если mainContent уже есть в DOM, сразу добавляем класс show, чтобы запустить blur-анимацию.
            // Это важно, чтобы transition сработал сразу.
            if (mainContent) {
                mainContent.classList.add('show'); 
            }
            // --- КОНЕЦ НОВОГО ДОБАВЛЕНИЯ / ИЗМЕНЕНИЯ ---

            // Ждем завершения анимации исчезновения оверлея
            // (время должно соответствовать transition в CSS, например, 1.5s)
            introOverlay.addEventListener('transitionend', function handler() {
                // Удаляем intro-overlay из DOM после завершения анимации
                introOverlay.remove();
                
                // Удаляем слушатель события, чтобы избежать повторных вызовов
                this.removeEventListener('transitionend', handler);

                // Важно: Инициируем наблюдение IntersectionObserver только после того,
                // как mainContent стал видимым и transition для blur завершился.
                // Это гарантирует, что анимации элементов внутри mainContent будут запускаться
                // по мере прокрутки, а не до того, как страница станет сфокусированной.
                elementsToAnimate.forEach(element => {
                    animateOnScrollObserver.observe(element);
                });
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
        if (!calendarGrid) return;

        const existingDays = calendarGrid.querySelectorAll('.day:not(.day-name)');
        existingDays.forEach(day => day.remove());

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        let startDayOffset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < startDayOffset; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('day', 'empty');
            calendarGrid.appendChild(emptyDay);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('day');
            dayElement.textContent = i;
            if (i === highlightDay && month === targetMonth && year === targetYear) {
                dayElement.classList.add('highlighted');
            }
            calendarGrid.appendChild(dayElement);
        }
    }

    renderCalendar(targetYear, targetMonth, highlightedDate);

    // === Анимация при прокрутке ===
    const animateOnScrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    const elementsToAnimate = document.querySelectorAll(
        '.invitation-block-wrapper, .story-text, .highlight-text-block, .story-text h3, .story-text h4, .calendar-wrapper, .rsvp-block'
    );

    // Initial check for elements already in viewport on page load (if intro overlay is not present initially)
    // This part is mostly for when the page loads *without* the intro overlay (e.g., direct access)
    // If the intro overlay is always present, this block might be less critical but harmless.
    /* --- НОВОЕ ДОБАВЛЕНИЕ / ИЗМЕНЕНИЕ: Условие для запуска IntersectionObserver --- */
    // Мы запускаем Observer, только если introOverlay отсутствует ИЛИ уже скрыт.
    // Если introOverlay присутствует и виден, Observer будет запущен после revealContent.
    if (!introOverlay || introOverlay.classList.contains('fade-out')) {
        elementsToAnimate.forEach(element => {
            animateOnScrollObserver.observe(element);
        });
    }
    /* --- КОНЕЦ НОВОГО ДОБАВЛЕНИЯ / ИЗМЕНЕНИЯ --- */
});