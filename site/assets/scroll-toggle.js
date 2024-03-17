document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('header.site');
    const menu = document.querySelector('ul.top-level');
    const menuSnap = 650;

    function checkViewport(e) {
        if (e.matches) {
            // If the viewport is at least menuSnap pixels wide
            menu.style.height = 'auto';
            menu.style.top = header.offsetHeight + 'px';
        } else {
            // If the viewport is less than menuSnap pixels wide
            menu.style.height = (globalThis.innerHeight - header.offsetHeight) + 'px';
            menu.style.top = header.offsetHeight + 'px';
        }
    }

    const mql = window.matchMedia(`(min-width: ${menuSnap}px)`);
    // Call the function at run time
    checkViewport(mql);
    // Attach listener function on state changes
    mql.addEventListener('change', checkViewport);

    document.getElementById('menu-toggle').addEventListener('change', function () {
        if (this.checked) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
    });
});