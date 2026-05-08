(function() {
    const saved = localStorage.getItem('theme');
    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
    }
})();

// Theme cycle: dark → blue-orange → light → dark
const THEME_CYCLE = ['dark', 'blue-orange', 'light'];

function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') || 'dark';
    const currentIndex = THEME_CYCLE.indexOf(current);
    const next = THEME_CYCLE[(currentIndex + 1) % THEME_CYCLE.length];
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateToggleIcon();
}

function updateToggleIcon() {
    const btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    if (theme === 'light') {
        btn.innerHTML = '🌙 Dark';
    } else if (theme === 'blue-orange') {
        btn.innerHTML = '☀️ Light';
    } else {
        btn.innerHTML = '🔵 Blue-Orange';
    }
}

document.addEventListener('DOMContentLoaded', updateToggleIcon);
