const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static('public'));

// Root route
app.get('/', (req, res) => {
    res.send('<h1>ReaperVerseNation is live! 🔥</h1><p>Go to <a href="/music-player">Music Player</a></p>');
});

// Music Player route
app.get('/music-player', (req, res) => {
    const musicDir = path.join(__dirname, 'public', 'music');

    // Read all subfolders in music
    const folders = fs.readdirSync(musicDir).filter(f =>
        fs.statSync(path.join(musicDir, f)).isDirectory()
    );

    let allTracks = [];

    folders.forEach(folder => {
        const folderPath = path.join(musicDir, folder);
        const tracks = fs.readdirSync(folderPath)
            .filter(file => file.endsWith('.mp3'))
            .map(file => ({ folder, file, url: `/music/${folder}/${file}` }));
        allTracks = allTracks.concat(tracks);
    });

    // Shuffle tracks
    allTracks.sort(() => Math.random() - 0.5);

    // Build HTML for music player with autoplay queue
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>RVN Music Player</title>
    </head>
    <body>
        <h1>RVN Music Player 🎵</h1>
        <audio id="player" controls autoplay></audio>
        <ul id="playlist">
            ${allTracks.map(track => `<li data-src="${track.url}"><strong>${track.folder}</strong>: ${track.file}</li>`).join('')}
        </ul>

        <script>
            const player = document.getElementById('player');
            const playlistItems = document.querySelectorAll('#playlist li');
            let queue = Array.from(playlistItems);
            let index = 0;

            function playTrack(i) {
                if (!queue[i]) return;
                player.src = queue[i].dataset.src;
                player.play();
            }

            player.addEventListener('ended', () => {
                index++;
                if (index >= queue.length) index = 0; // loop
                playTrack(index);
            });

            // Start autoplay
            playTrack(index);
        </script>
    </body>
    </html>
    `;

    res.send(html);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
