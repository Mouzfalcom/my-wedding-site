document.addEventListener('DOMContentLoaded', () => {
    // === Код: Вводное наложение (Intro Overlay) ===
    const introOverlay = document.getElementById('introOverlay');
    const mainContent = document.getElementById('mainContent');

    if (introOverlay && mainContent) {
        // Убедитесь, что mainContent ИЗНАЧАЛЬНО скрыт в CSS с opacity: 0 и visibility: hidden,
        // а не с display: none в JS. Это ключ к плавной анимации.
        // Пример CSS для mainContent (ДОБАВЬТЕ ЭТО В ВАШ weddingbody.css):
        /*
        #mainContent {
            opacity: 0;
            visibility: hidden; // Скрывает элемент, но сохраняет его место в DOM
            filter: blur(20px);
            transition: opacity 1s ease-out, visibility 1s ease-out, filter 1s ease-out;
            will-change: opacity, filter, transform; // Для аппаратного ускорения
        }
        #mainContent.show-content {
            opacity: 1;
            visibility: visible;
            filter: blur(0);
        }
        */

        introOverlay.addEventListener('click', () => {
            introOverlay.style.opacity = '0'; // Запускает анимацию исчезновения оверлея (opacity)

            // Добавляем класс 'show-content' для mainContent, чтобы он начал плавно появляться
            mainContent.classList.add('show-content');

            // Скрываем оверлей полностью после завершения анимации opacity
            setTimeout(() => {
                introOverlay.style.display = 'none'; // Убираем из потока документа
                introOverlay.style.visibility = 'hidden'; // Дополнительно скрываем
                document.body.style.overflow = ''; // Восстанавливаем прокрутку
            }, 1000); // Должно соответствовать длительности transition для opacity оверлея в CSS
        });
    } else if (mainContent) {
        // Если introOverlay не найден, mainContent должен быть сразу виден
        mainContent.classList.add('show-content'); // Активируем класс показа
        document.body.style.overflow = '';
    }

    // === Код: Анимации при прокрутке (Intersection Observer) ===
    // #countdown-timer добавлен для наблюдения, чтобы его анимация появлялась при скролле.
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

    // === ВОССТАНОВЛЕННЫЙ КОД: Логика модального окна RSVP ===
    // Если вы хотите использовать модальное окно RSVP, вам также нужно убедиться,
    // что соответствующий HTML для модального окна и кнопка с ID "openRsvpModal"
    // присутствуют в вашем index.html.
    const openRsvpModalBtn = document.getElementById('openRsvpModal');
    const rsvpModal = document.getElementById('rsvpModal');

    if (rsvpModal) {
        const closeButton = rsvpModal.querySelector('.close-button');
        const rsvpForm = rsvpModal.querySelector('form');

        if (openRsvpModalBtn) {
            openRsvpModalBtn.addEventListener('click', (e) => {
                e.preventDefault();
                rsvpModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            });
        }

        if (closeButton) {
            closeButton.addEventListener('click', () => {
                rsvpModal.style.display = 'none';
                document.body.style.overflow = '';
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === rsvpModal) {
                rsvpModal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });

        // === ОБРАБОТКА ФОРМЫ С Fetch API (для модального окна) ===
        if (rsvpForm) {
            rsvpForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const form = e.target;
                const formData = new FormData(form);
                const formAction = form.action;

                try {
                    // Важное примечание: 'no-cors' предотвращает чтение ответа сервера,
                    // что делает невозможным надежно определить успех или ошибку.
                    // Для реальной серверной обработки лучше использовать CORS или
                    // отправлять форму традиционным способом, если это Google Forms.
                    const response = await fetch(formAction, {
                        method: 'POST',
                        body: formData,
                        mode: 'no-cors'
                    });

                    const modalContent = rsvpModal.querySelector('.modal-content');
                    modalContent.innerHTML = `
                        <span class="close-button">×</span>
                        <h2>Дякуємо за Ваше підтвердження!</h2>
                        <p>Ми з нетерпінням чекаємо на зустріч з Вами на нашому весіллі.</p>
                        <button class="submit-rsvp-button" id="closeAfterSubmit">Закрити</button>
                    `;

                    // Добавляем слушателей к новым кнопкам после их создания
                    modalContent.querySelector('#closeAfterSubmit').addEventListener('click', () => {
                        rsvpModal.style.display = 'none';
                        document.body.style.overflow = '';
                        // location.reload(); // Раскомментируйте, если нужно перезагружать страницу
                    });

                    modalContent.querySelector('.close-button').addEventListener('click', () => {
                        rsvpModal.style.display = 'none';
                        document.body.style.overflow = '';
                        // location.reload(); // Раскомментируйте, если нужно перезагружать страницу
                    });

                } catch (error) {
                    console.error('Ошибка при отправке формы:', error);
                    const modalContent = rsvpModal.querySelector('.modal-content');
                    modalContent.innerHTML = `
                        <span class="close-button">×</span>
                        <h2>Виникла помилка!</h2>
                        <p>Не вдалося відправити Ваше підтвердження. Будь ласка, спробуйте ще раз або зв'яжіться з нами напряму.</p>
                        <button class="submit-rsvp-button" id="closeError">Закрити</button>
                    `;
                    // Добавляем слушателей к новым кнопкам после их создания
                    modalContent.querySelector('#closeError').addEventListener('click', () => {
                        rsvpModal.style.display = 'none';
                        document.body.style.overflow = '';
                        // location.reload(); // Раскомментируйте, если нужно перезагружать страницу
                    });
                    modalContent.querySelector('.close-button').addEventListener('click', () => {
                        rsvpModal.style.display = 'none';
                        document.body.style.overflow = '';
                        // location.reload(); // Раскомментируйте, если нужно перезагружать страницу
                    });
                }
            });
        }
    }
});