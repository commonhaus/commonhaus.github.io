import App from "./App.svelte";

const app = document.addEventListener('DOMContentLoaded', function () {
    new App({
        target: document.getElementById("member-app"),
    });
});

export default app;