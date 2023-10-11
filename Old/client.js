document.addEventListener('DOMContentLoaded', function () {
    // Find the link element by its ID
    var playlistsLink = document.getElementById('playlists');

    // Add a click event listener to the link
    playlistsLink.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent the default link behavior (navigating to a new page)

        // Make an HTTP GET request to your server
        fetch('/makeplaylist', {
            method: 'GET',
        })
        .then(response => {
            if (response.ok) {
                // Handle a successful response from the server
                console.log('Request to server successful.');
            } else {
                // Handle errors from the server
                console.error('Error from server:', response.status, response.statusText);
            }
        })
        .catch(error => {
            // Handle network or other errors
            console.error('Error:', error);
        });
    });
});