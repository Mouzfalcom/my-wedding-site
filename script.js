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
                document.body.style.overflow = '';
            }, 1000); // Соответствует transition в CSS для opacity introOverlay
        });
    } else if (mainContent) {
        mainContent.classList.add('show-content');
        document.body.style.overflow = '';
    }

    // === Анимации при прокрутке (Intersection Observer) ===
    // *** ИСПРАВЛЕННЫЙ СПИСОК sectionsToAnimate ***
    const sectionsToAnimate = document.querySelectorAll(
        '.invitation-block-wrapper, .story-content, .highlight-text-block, .calendar-wrapper, ' +
        '.location-details-wrapper, #countdown-timer, .rsvp-block, .gallery-item, .section-title' // <--- ЭТОТ СЕЛЕКТОР ДОБАВЛЕН
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
        observer.observe(section);
    });

    // === Выделение дня в календаре ===
    const calendarGrid = document.querySelector('.calendar-grid');
    if (calendarGrid) {
        const weddingDay = 12; // День свадьбы
        const totalDaysInMonth = 31; // Всего дней в декабре 2025

        const firstDayOfWeek = new Date('2025-12-01').getDay();
        const emptyDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

        for (let i = 0; i < emptyDays; i++) {
            const emptyDayDiv = document.createElement('div');
            emptyDayDiv.classList.add('day');
            calendarGrid.appendChild(emptyDayDiv);
        }

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

        if (rsvpForm) {
            rsvpForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const form = e.target;
                const formData = new FormData(form);
                const formAction = form.action;

                try {
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