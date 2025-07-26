showWaitlistForm();

function showWaitlistForm() {
    setTimeout(() => {
        document.querySelector('.ghl-form').classList.remove('hidden');
        document.querySelector('.overlay').classList.add('active');
    }, 1000);
}

// TODO: fix so it hides when a user submits (wait for dom to load thank you message?)
// TODO: fix size of box when thank you message appears, or get rid of it?