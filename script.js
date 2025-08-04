document.addEventListener('DOMContentLoaded', () => {
    // === Календарь ===
    const calendarGrid = document.querySelector('.calendar-grid');
    const highlightedDate = 12; // Дата, которую нужно выделить
    const targetMonth = 11; // 0-индексированный месяц (Декабрь - это 11)
    const targetYear = 2025;

    function renderCalendar(year, month, highlightDay) {
        // Очищаем предыдущие дни
        const existingDays = calendarGrid.querySelectorAll('.day');
        existingDays.forEach(day => day.remove());

        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Смещение для начала понедельника (если воскресенье - 0, делаем его 7)
        let startDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

        // Добавляем пустые ячейки для дней перед началом месяца
        for (let i = 0; i < startDay; i++) {
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
    const elementsToAnimate = document.querySelectorAll(
        '.invitation-block-wrapper, .story-text, .highlight-text-block, .story-text h3, .story-text h4, .calendar-wrapper, .rsvp-block'
    );

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('highlight-text-block') ||
                    entry.target.tagName === 'H3' ||
                    entry.target.tagName === 'H4') {
                    // Для этих элементов класс is-visible добавляется к их родительскому .story-text
                    // Поэтому здесь мы проверяем, имеет ли родитель is-visible.
                    // Если вы хотите, чтобы они анимировались независимо, им нужно добавить класс
                    // 'is-visible' напрямую или изменить логику.
                    // Поскольку у нас есть родительские классы, мы можем просто добавить is-visible
                    // к самому элементу, если он в списке elementsToAnimate.
                    entry.target.classList.add('is-visible');
                } else {
                    entry.target.classList.add('is-visible');
                }
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // Элемент считается видимым, когда 10% его видна
    });

    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });

    // Обработка случая с highlight-text-block, h3, h4, если они внутри story-text
    // и должны анимироваться после story-text.
    // Если вы хотите последовательную анимацию, убедитесь, что delay в CSS соответствует.
    // Если они не анимируются, возможно, нужно изменить threshold или добавить им свои обсерверы.
});