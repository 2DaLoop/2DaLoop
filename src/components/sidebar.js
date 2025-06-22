export function loadSidebar() {
    const nav = document.getElementById('nav');
    if (nav) {
        fetch('src/components/sidebar.html')
            .then(response => response.text())
            .then(data => {
                nav.innerHTML = data;
            })
    }
}