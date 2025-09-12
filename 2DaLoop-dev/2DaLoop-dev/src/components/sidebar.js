export function loadSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        fetch('/components/sidebar.html')
            .then(response => response.text())
            .then(html => {
                sidebar.innerHTML = html;
            })
    }
}