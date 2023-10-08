// client.js
document.addEventListener('DOMContentLoaded', function () {
    const loginButton = document.getElementById('login-button');
    loginButton.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent the default behavior of the anchor tag
        window.location.href = '/token'; // Redirect to the login route
    });
});
