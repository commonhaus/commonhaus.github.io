document.addEventListener('DOMContentLoaded', function () {
    const items = document.querySelectorAll('#project-list .card');
    items.forEach(item => {
        item.style.order = Math.floor(Math.random() * items.length + 1);
    });
});