document.addEventListener('DOMContentLoaded', () => {
    // === Вводное наложение (Intro Overlay) ===
    const introOverlay = document.getElementById('introOverlay');
    const mainContent = document.getElementById('mainContent');

    if (introOverlay && mainContent) {
        introOverlay.addEventListener('click', () => {
            introOverlay.style.opacity = '0';
            mainContent.classList.add('show-content');

            setTimeout(() => {
                introOverlay.style.display = 'none';
                introOverlay.style.visibility = 'hidden';
                document.body.style.overflow = ''; // Восстанавливаем скролл
            }, 1000); // Соответствует transition в CSS для opacity introOverlay
        });
    } else if (mainContent) {
        // Если оверлея нет, сразу показываем основной контент
        mainContent.classList.add('show-content');
        document.body.style.overflow = '';
    }

    // === Анимации при прокрутке (Intersection Observer) ===
    // Добавляем все классы, которые должны быть анимированы JavaScript'ом.
    // Элементы, которые видны сразу, должны иметь 'animate-on-scroll' в HTML.
   const sectionsToAnimate = document.querySelectorAll(
        '.invitation-block-wrapper, .story-content, .highlight-text-block, .calendar-wrapper, ' +
        '.location-details-wrapper, #countdown-timer, .rsvp-block, .gallery-item, ' +
        '.section-title, .story-text' // <-- MAKE SURE ALL THESE ARE HERE!
    );

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // Срабатывает, когда 10% элемента становится видимым
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-on-scroll');
                observer.unobserve(entry.target); // Прекращаем наблюдать
            }
        });
    }, observerOptions);

    sectionsToAnimate.forEach(section => {
        // Мы НЕ наблюдаем за элементами, у которых уже есть animate-on-scroll (для тех, что видны сразу)
        if (!section.classList.contains('animate-on-scroll')) {
            observer.observe(section);
        }
    });

    // === Выделение дня в календаре ===
    const calendarGrid = document.querySelector('.calendar-grid');
    if (calendarGrid) {
        const weddingDay = 12; // День свадьбы
        const totalDaysInMonth = 31; // Всего дней в декабре 2025

        // Определяем день недели для 1 декабря 2025 (Понедельник = 1, Воскресенье = 0)
        // new Date('2025-12-01').getDay() вернет 1 для понедельника
        const firstDayOfWeek = new Date('2025-12-01').getDay();
        // Рассчитываем количество пустых ячеек в начале месяца
        // Если 1-й день - воскресенье (0), нужно 6 пустых дней. Иначе (firstDayOfWeek - 1).
        const emptyDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

        // Создаем пустые ячейки для дней до 1-го числа
        for (let i = 0; i < emptyDays; i++) {
            const emptyDayDiv = document.createElement('div');
            emptyDayDiv.classList.add('day', 'empty'); // Добавляем класс 'empty'
            calendarGrid.appendChild(emptyDayDiv);
        }

        // Заполняем дни месяца
        for (let i = 1; i <= totalDaysInMonth; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('day');
            dayDiv.textContent = i;
            if (i === weddingDay) {
                dayDiv.classList.add('highlighted');
            }
            calendarGrid.appendChild(dayDiv);
        }
    }

    // === Таймер обратного отсчета ===
    const countdownTimerElement = document.getElementById('countdown-timer');
    const weddingDate = new Date('December 12, 2025 11:00:00').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (distance < 0) {
            clearInterval(countdownInterval);
            if (countdownTimerElement) {
                countdownTimerElement.innerHTML = "Ми вже одружилися! Дякуємо, що були з нами!";
            }
        } else {
            if (document.getElementById('days')) document.getElementById('days').textContent = days;
            if (document.getElementById('hours')) document.getElementById('hours').textContent = hours;
            if (document.getElementById('minutes')) document.getElementById('minutes').textContent = minutes;
            if (document.getElementById('seconds')) document.getElementById('seconds').textContent = seconds;
        }
    }

    if (countdownTimerElement) {
        const countdownInterval = setInterval(updateCountdown, 1000);
        updateCountdown();
    }

    // === Кнопка "Наверх" ===
    const backToTopButton = document.getElementById('backToTop');

    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });

        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // === Логика модального окна RSVP ===
    const openRsvpModalBtn = document.getElementById('openRsvpModal'); // Если такой кнопки нет, этот код не сработает
    const rsvpModal = document.getElementById('rsvpModal'); // Убедитесь, что у вас есть модальное окно с этим ID

    if (rsvpModal) { // Проверяем, существует ли модальное окно
        const closeButton = rsvpModal.querySelector('.close-button'); // Кнопка закрытия внутри модалки
        const rsvpForm = rsvpModal.querySelector('form'); // Форма внутри модалки

        if (openRsvpModalBtn) {
            openRsvpModalBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Предотвращаем дефолтное поведение ссылки
                rsvpModal.style.display = 'block'; // Показываем модалку
                document.body.style.overflow = 'hidden'; // Запрещаем скролл фона
            });
        }

        if (closeButton) {
            closeButton.addEventListener('click', () => {
                rsvpModal.style.display = 'none'; // Скрываем модалку
                document.body.style.overflow = ''; // Разрешаем скролл фона
            });
        }

        // Закрытие модалки по клику вне ее
        window.addEventListener('click', (e) => {
            if (e.target === rsvpModal) {
                rsvpModal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });

        // Отправка формы RSVP (если форма существует)
        if (rsvpForm) {
            rsvpForm.addEventListener('submit', async (e) => {
                e.preventDefault(); // Предотвращаем стандартную отправку формы

                const form = e.target;
                const formData = new FormData(form);
                const formAction = form.action; // URL из атрибута action вашей формы Google Forms

                try {
                    // Отправка данных на Google Forms (используем no-cors для обхода ограничений)
                    const response = await fetch(formAction, {
                        method: 'POST',
                        body: formData,
                        mode: 'no-cors' // Важно для отправки на Google Forms
                    });

                    // После успешной (или кажущейся успешной из-за no-cors) отправки
                    const modalContent = rsvpModal.querySelector('.modal-content');
                    modalContent.innerHTML = `
                        <span class="close-button">×</span>
                        <h2>Дякуємо за Ваше підтвердження!</h2>
                        <p>Ми з нетерпінням чекаємо на зустріч з Вами на нашому весіллі.</p>
                        <button class="submit-rsvp-button" id="closeAfterSubmit">Закрити</button>
                    `;

                    // Добавляем обработчики для новых кнопок закрытия
                    modalContent.querySelector('#closeAfterSubmit').addEventListener('click', () => {
                        rsvpModal.style.display = 'none';
                        document.body.style.overflow = '';
                    });
                    modalContent.querySelector('.close-button').addEventListener('click', () => {
                        rsvpModal.style.display = 'none';
                        document.body.style.overflow = '';
                    });

                } catch (error) {
                    console.error('Ошибка при отправке формы:', error);
                    // Обработка ошибки
                    const modalContent = rsvpModal.querySelector('.modal-content');
                    modalContent.innerHTML = `
                        <span class="close-button">×</span>
                        <h2>Виникла помилка!</h2>
                        <p>Не вдалося відправити Ваше підтвердження. Будь ласка, спробуйте ще раз або зв'яжіться з нами напряму.</p>
                        <button class="submit-rsvp-button" id="closeError">Закрити</button>
                    `;
                    modalContent.querySelector('#closeError').addEventListener('click', () => {
                        rsvpModal.style.display = 'none';
                        document.body.style.overflow = '';
                    });
                    modalContent.querySelector('.close-button').addEventListener('click', () => {
                        rsvpModal.style.display = 'none';
                        document.body.style.overflow = '';
                    });
                }
            });
        }
    }
});