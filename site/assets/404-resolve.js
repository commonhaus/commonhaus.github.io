if (window.location.pathname.startsWith('/votes')) {
    if (window.location.pathname.endsWith('.svg')) {
        window.location.replace('/votes/vote-unknown.svg');
    } else {
        window.location.replace('/votes');
    }
}
if (window.location.pathname == "/activity/123.html/n/nInitial") {
    window.location.replace("/activity/123.html");
}