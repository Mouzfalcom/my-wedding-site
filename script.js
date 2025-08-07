document.addEventListener('DOMContentLoaded', () => {
    // === EXISTING CODE: Intro Overlay ===
    const introOverlay = document.getElementById('introOverlay');
    const mainContent = document.getElementById('mainContent');

    if (introOverlay && mainContent) {
        // Убедимся, что mainContent изначально скрыт, если он не должен быть виден до клика
        // Это важно, если в CSS main-content не имеет жесткого фона и прозрачен
        mainContent.style.display = 'none'; 
        mainContent.style.filter = 'blur(20px)'; // Изначальное размытие
        mainContent.style.transition = 'filter 1s ease-out'; // Плавное снятие размытия

        introOverlay.addEventListener('click', () => {
            introOverlay.style.opacity = '0'; // Запускает анимацию исчезновения оверлея
            
            // Сразу показываем mainContent, чтобы анимация размытия могла быть видна
            mainContent.style.display = 'block'; 
            mainContent.style.filter = 'blur(0)'; // Снимаем размытие

            setTimeout(() => {
                introOverlay.style.display = 'none'; // Полностью скрываем оверлей после анимации
                document.body.style.overflow = ''; // Восстанавливаем прокрутку, если она была отключена
            }, 1000); // Должно соответствовать transition в CSS (для opacity оверлея)
        });
    } else if (mainContent) {
        // Если introOverlay не найден (например, был удален), mainContent должен быть сразу виден и без размытия
        mainContent.style.display = 'block';
        mainContent.style.filter = 'blur(0)';
        document.body.style.overflow = ''; // Убедимся, что прокрутка включена
    }

    // === EXISTING CODE: Scroll Animations (Intersection Observer) ===
    const sectionsToAnimate = document.querySelectorAll(
        '.invitation-block-wrapper, .story-text, .highlight-text-block, .calendar-wrapper, .rsvp-block, .location-details-wrapper, #countdown-timer'
    );

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-on-scroll');
                observer.unobserve(entry.target); // Stop observing after animation
            }
        });
    }, observerOptions);

    sectionsToAnimate.forEach(section => {
        observer.observe(section);
    });

    // === EXISTING CODE: Calendar Highlight ===
    const calendarGrid = document.querySelector('.calendar-grid');
    if (calendarGrid) {
        const weddingDay = 12;
        const totalDaysInMonth = 31; // For December 2025

        // Dec 1, 2025 is Monday (day 1 of week assuming Mon=1, Tue=2, etc.)
        const firstDayOfWeek = new Date('2025-12-01').getDay(); // 0 for Sunday, 1 for Monday...
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

    // === EXISTING CODE: Countdown Timer ===
    const countdownTimer = document.getElementById('countdown-timer');
    const weddingDate = new Date('December 12, 2025 11:00:00').getTime(); // Use 24-hour format

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (distance < 0) {
            clearInterval(countdownInterval);
            if (countdownTimer) {
                countdownTimer.innerHTML = "Ми вже одружилися! Дякуємо, що були з нами!";
            }
        } else {
            if (document.getElementById('days')) document.getElementById('days').textContent = days;
            if (document.getElementById('hours')) document.getElementById('hours').textContent = hours;
            if (document.getElementById('minutes')) document.getElementById('minutes').textContent = minutes;
            if (document.getElementById('seconds')) document.getElementById('seconds').textContent = seconds;
        }
    }
    if (countdownTimer) {
        const countdownInterval = setInterval(updateCountdown, 1000);
        updateCountdown();
    }

    // === EXISTING CODE: Back to Top Button ===
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

    // === NEW/MODIFIED CODE: RSVP Modal Logic ===
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

        // === NEW CODE: Handle Form Submission with Fetch API ===
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
                        location.reload();
                    });
                    
                    modalContent.querySelector('.close-button').addEventListener('click', () => {
                        rsvpModal.style.display = 'none';
                        document.body.style.overflow = '';
                        location.reload();
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
                        location.reload();
                    });
                    modalContent.querySelector('.close-button').addEventListener('click', () => {
                        rsvpModal.style.display = 'none';
                        document.body.style.overflow = '';
                        location.reload();
                    });
                }
            });
        }
    }
});