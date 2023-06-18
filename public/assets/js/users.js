const socket = io();

socket.on('refresh_page', (message) => {
    location.reload();
  });
