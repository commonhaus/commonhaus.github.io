document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('header.site');
    const menuSnap = 650;

    function checkViewport(e) {
        let height, top;
        if (e.matches) {
            // If the viewport is at least menuSnap pixels wide
            height = 'auto';
            top = header.offsetHeight + 'px';
        } else {
            // If the viewport is less than menuSnap pixels wide
            height = (globalThis.innerHeight - header.offsetHeight) + 'px';
            top = header.offsetHeight + 'px';
        }

        header.style.setProperty('--menu-height', height);
        header.style.setProperty('--menu-top', top);
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