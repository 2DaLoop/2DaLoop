document.getElementById('accept-cookie-btn').onclick = function () {
    localStorage.setItem('cookieAccepted', 'true');

    document.cookie = `userID=${crypto.randomUUID()}; max-age=31536000;`
    document.getElementById('cookie-popup').remove();
};
