"use strict";
var songs = [];
for (var i = 1; i <= 24; i++) {
    songs.push("assets/songs/" + i + ".mp3");
}
var currentSong = 0;
// TODO rename to song
var changeSound = function () {
    var offset = Math.floor(Math.random() * (songs.length - 1));
    currentSong = (currentSong + offset) % songs.length;
    document.getElementById("beats").src = songs[currentSong];
};
