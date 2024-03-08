if (window.location.pathname.startsWith('/votes')) {
    if (window.location.pathname.endsWith('.svg')) {
        window.location.replace('/votes/vote-unknown.svg');
    } else {
        window.location.replace('/votes');
    }
}