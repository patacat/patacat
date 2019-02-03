const songs: string[] = [];
for (let i = 1; i <= 24; i++) {
    songs.push(`assets/songs/${i}.mp3`);
}
let currentSong = 0;

// TODO rename to song
const changeSound = () => {
    const offset = Math.floor(Math.random() * (songs.length - 1));
    currentSong = (currentSong + offset) % songs.length;
    (<HTMLMediaElement>document.getElementById("beats")).src = songs[currentSong];
};
