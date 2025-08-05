document.addEventListener('DOMContentLoaded', () => {
    // Получаем ссылки на элементы
    const introOverlay = document.getElementById('introOverlay');
    const mainContent = document.getElementById('mainContent');

    // === Список всех элементов, которые должны анимироваться при прокрутке ===
    // Таймер #countdown-timer добавлен сюда, чтобы он также управлялся IntersectionObserver,
    // если вам нужен эффект появления при скролле.
    // Если хотите, чтобы таймер появлялся сразу с .main-content.show,
    // то нужно убрать его из этого списка и управлять его видимостью напрямую
    // в функции revealContent.
    const elementsToAnimate = document.querySelectorAll(
        '.invitation-block-wrapper, .story-text, .highlight-text-block, .story-text h3, .story-text h4, .calendar-wrapper, .rsvp-block, .location-details-wrapper, #countdown-timer'
    );

    // === IntersectionObserver для анимации при прокрутке ===
    const animateOnScrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Остановить наблюдение после появления
            }
        });
    }, {
        threshold: 0.1 // Элемент виден на 10%
    });

    // === Функция для скрытия intro-overlay и показа main-content ===
    function revealContent() {
        if (introOverlay) {
            introOverlay.classList.add('fade-out'); // Запускаем анимацию исчезновения оверлея

            // Если mainContent уже есть в DOM, сразу добавляем класс show, чтобы запустить blur-анимацию.
            if (mainContent) {
                mainContent.classList.add('show');
            }

            // Ждем завершения анимации исчезновения оверлея
            introOverlay.addEventListener('transitionend', function handler() {
                // Удаляем intro-overlay из DOM после завершения анимации
                introOverlay.remove();

                // Удаляем слушатель события, чтобы избежать повторных вызовов
                this.removeEventListener('transitionend', handler);

                // Важно: Инициируем наблюдение IntersectionObserver только после того,
                // как mainContent стал видимым.
                elementsToAnimate.forEach(element => {
                    animateOnScrollObserver.observe(element);
                });

                // Также, если таймер должен начать работать сразу после открытия,
                // вызываем его обновление здесь.
                // Если таймер управляется animateOnScrollObserver, то эта строка не нужна.
                // updateCountdown(); // Если хотите, чтобы таймер запустился сразу
            }, { once: true });
        }
    }

    // Слушатель клика по экрану-конверту
    if (introOverlay) {
        introOverlay.addEventListener('click', revealContent, { once: true });
    } else {
        // Если introOverlay по какой-то причине не найден (например, при отладке или после перезагрузки),
        // запускаем анимации прокрутки сразу.
        elementsToAnimate.forEach(element => {
            animateOnScrollObserver.observe(element);
        });
        if (mainContent) {
            mainContent.classList.add('show'); // Убедиться, что mainContent виден
        }
    }

    // === Календарь ===
    const calendarGrid = document.querySelector('.calendar-grid');
    const highlightedDate = 12; // Дата, которую нужно выделить
    const targetMonth = 11;     // 0-индексированный месяц (Декабрь - это 11)
    const targetYear = 2025;

    function renderCalendar(year, month, highlightDay) {
        if (!calendarGrid) return;

        // Удаляем существующие дни, но оставляем названия дней недели
        const existingDays = calendarGrid.querySelectorAll('.day:not(.day-name)');
        existingDays.forEach(day => day.remove());

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        // Приводим воскресенье (0) к 6, остальные дни - от 0 до 5
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

    // Отображаем календарь при загрузке страницы
    renderCalendar(targetYear, targetMonth, highlightedDate);


    // === Таймер Обратного Отсчета ===
    // Дата и время свадьбы: 12 декабря 2025 года, 11:00 утра.
    // Важно: Месяцы в JavaScript начинаются с 0 (Январь = 0, Декабрь = 11).
    // Для Франкфурта (CET/CEST) используем формат ISO 8601 с указанием часового пояса.
    // В декабре 2025 года будет действовать CET (UTC+1).
    const weddingDate = new Date('2025-12-12T11:00:00+01:00').getTime(); // Указание часового пояса CET (+01:00)

    const countdownTimerElement = document.getElementById("countdown-timer");
    const daysElement = document.getElementById("days");
    const hoursElement = document.getElementById("hours");
    const minutesElement = document.getElementById("minutes");
    const secondsElement = document.getElementById("seconds");

    function updateCountdown() {
        if (!countdownTimerElement) return; // Проверка на существование элемента

        const now = new Date().getTime();
        const distance = weddingDate - now;

        if (distance < 0) {
            clearInterval(countdownInterval); // Остановить интервал
            countdownTimerElement.innerHTML = `
                <div style="text-align: center; width: 100%;">
                    <span style="font-size: 1.8em; color: #de9c00;">Ми вже одружилися!</span>
                    <br>
                    <span style="font-size: 0.9em; color: #ffffff; opacity: 0.8;">Дякуємо, що були з нами!</span>
                </div>
            `;
            // Очищаем стили, чтобы текст "Ми одружилися!" выглядел лучше
            countdownTimerElement.style.padding = '0';
            countdownTimerElement.style.backgroundColor = 'transparent';
            countdownTimerElement.style.boxShadow = 'none';
            countdownTimerElement.style.gap = '0';
            return; // Выходим из функции
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Обновляем текст в элементах, если они существуют
        if (daysElement) daysElement.innerHTML = days;
        if (hoursElement) hoursElement.innerHTML = hours;
        if (minutesElement) minutesElement.innerHTML = minutes;
        if (secondsElement) secondsElement.innerHTML = seconds;
    }

    // Запускаем таймер, обновляя его каждую секунду
    const countdownInterval = setInterval(updateCountdown, 1000);

    // Вызываем updateCountdown один раз сразу, чтобы избежать задержки в одну секунду при первой загрузке
    updateCountdown();

});