document.addEventListener('DOMContentLoaded', function () {
    const items = document.querySelectorAll('#tier-1 .card');
    items.forEach(item => {
        item.style.order = Math.floor(Math.random() * items.length + 1);
    });
});