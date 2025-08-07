document.addEventListener('DOMContentLoaded', () => {
    // === Код: Вводное наложение (Intro Overlay) ===
    const introOverlay = document.getElementById('introOverlay');
    const mainContent = document.getElementById('mainContent');

    if (introOverlay && mainContent) {
        // Убедимся, что mainContent изначально скрыт и размыт через CSS (opacity и filter)
        // Эту строку mainContent.style.display = 'none'; - УДАЛИТЕ ИЗ JS
        // Она должна быть заменена на CSS: opacity: 0; visibility: hidden; filter: blur(20px);
        // и переход transition: opacity 1s ease-out, visibility 1s ease-out, filter 1s ease-out;

        introOverlay.addEventListener('click', () => {
            introOverlay.style.opacity = '0'; // Запускает анимацию исчезновения оверлея

            // Вместо mainContent.style.display = 'block'; добавляем класс для активации анимации
            // CSS-класс 'show-content' будет отвечать за opacity: 1, visibility: visible, filter: blur(0)
            mainContent.classList.add('show-content');

            setTimeout(() => {
                introOverlay.style.display = 'none'; // Полностью скрываем оверлей после анимации
                document.body.style.overflow = ''; // Восстанавливаем прокрутку
            }, 1000); // Должно соответствовать transition в CSS (для opacity оверлея)
        });
    } else if (mainContent) {
        // Если introOverlay не найден, mainContent должен быть сразу виден
        // Также добавляем класс для показа, если оверлей отсутствует
        mainContent.classList.add('show-content');
        document.body.style.overflow = '';
    }

    // --- Добавьте этот CSS-код в ваш файл weddingbody.css ---
    /*
    #mainContent {
        opacity: 0;
        visibility: hidden;
        filter: blur(20px);
        transition: opacity 1s ease-out, visibility 1s ease-out, filter 1s ease-out;
    }

    #mainContent.show-content {
        opacity: 1;
        visibility: visible;
        filter: blur(0);
    }
    */
    // --------------------------------------------------------


    // === Код: Анимации при прокрутке (Intersection Observer) ===
    // #countdown-timer добавлен для наблюдения, чтобы анимация появлялась при скролле.
    const sectionsToAnimate = document.querySelectorAll(
        '.invitation-block-wrapper, .story-text, .highlight-text-block, .calendar-wrapper, .rsvp-block, .location-details-wrapper, #countdown-timer'
    );

    const observerOptions = {
        root: null, // Наблюдатель будет следить за элементами относительно области просмотра (viewport)
        rootMargin: '0px',
        threshold: 0.1 // Срабатывает, когда 10% элемента становится видимым
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Если элемент видим, добавляем класс для запуска анимации
                entry.target.classList.add('animate-on-scroll');
                observer.unobserve(entry.target); // Прекращаем наблюдать после активации анимации
            }
        });
    }, observerOptions);

    // Начинаем наблюдать за всеми выбранными секциями
    sectionsToAnimate.forEach(section => {
        observer.observe(section);
    });

    // --- Добавьте этот CSS-код в ваш файл weddingbody.css, если хотите анимацию таймера при скролле ---
    /*
    #countdown-timer {
        opacity: 0; // Изначально скрыт
        // Убедитесь, что здесь НЕТ прямых свойств animation или animation-delay
    }

    #countdown-timer.animate-on-scroll {
        animation: fadeInName 1s ease-out forwards; // Анимация, которая сработает при скролле
        animation-delay: 0s; // Задержка не нужна, так как Observer уже сработал
    }

    @keyframes fadeInName { // Убедитесь, что этот keyframe определен
        0% { opacity: 0; transform: translateY(20px); }
        100% { opacity: 1; transform: translateY(0); }
    }
    */
    // --------------------------------------------------------------------------------------------------


    // === Код: Выделение дня в календаре ===
    const calendarGrid = document.querySelector('.calendar-grid');
    if (calendarGrid) {
        const weddingDay = 12; // День свадьбы
        const totalDaysInMonth = 31; // Всего дней в декабре 2025

        // Определяем первый день декабря 2025 (1 - понедельник, 0 - воскресенье)
        const firstDayOfWeek = new Date('2025-12-01').getDay();
        // Рассчитываем количество пустых ячеек до первого дня месяца
        const emptyDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

        // Добавляем пустые ячейки для выравнивания календаря
        for (let i = 0; i < emptyDays; i++) {
            const emptyDayDiv = document.createElement('div');
            emptyDayDiv.classList.add('day');
            calendarGrid.appendChild(emptyDayDiv);
        }

        // Заполняем календарь днями
        for (let i = 1; i <= totalDaysInMonth; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('day');
            dayDiv.textContent = i;
            if (i === weddingDay) {
                dayDiv.classList.add('highlighted'); // Выделяем день свадьбы
            }
            calendarGrid.appendChild(dayDiv);
        }
    }

    // === Код: Таймер обратного отсчета ===
    const countdownTimerElement = document.getElementById('countdown-timer');
    // Дата и время свадьбы
    const weddingDate = new Date('December 12, 2025 11:00:00').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        // Расчет дней, часов, минут и секунд
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (distance < 0) {
            // Если дата прошла, очищаем интервал и выводим сообщение
            clearInterval(countdownInterval);
            if (countdownTimerElement) {
                countdownTimerElement.innerHTML = "Ми вже одружилися! Дякуємо, що були з нами!";
            }
        } else {
            // Обновляем текст в элементах таймера
            if (document.getElementById('days')) document.getElementById('days').textContent = days;
            if (document.getElementById('hours')) document.getElementById('hours').textContent = hours;
            if (document.getElementById('minutes')) document.getElementById('minutes').textContent = minutes;
            if (document.getElementById('seconds')) document.getElementById('seconds').textContent = seconds;
        }
    }

    // Запускаем таймер, только если элемент существует
    if (countdownTimerElement) {
        const countdownInterval = setInterval(updateCountdown, 1000); // Обновляем каждую секунду
        updateCountdown(); // Первичный вызов для немедленного отображения
    }

    // === Код: Кнопка "Наверх" ===
    const backToTopButton = document.getElementById('backToTop');

    if (backToTopButton) {
        // Показываем/скрываем кнопку при прокрутке
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });

        // Плавная прокрутка наверх при клике
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // === Удаленный/Адаптированный код: Логика модального окна RSVP ===
    // Весь код, относящийся к открытию/закрытию модального окна RSVP и
    // обработке формы внутри него, был удален/закомментирован,
    // так как теперь кнопка RSVP напрямую перенаправляет на Google Forms.
    // Убедитесь, что HTML-код самого модального окна также удален из index.html.

});