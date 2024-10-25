console.log("hii javascript");
let currentSong = new Audio();
let songs;
let currFolder = "songs";  
function secondsToMMSS(seconds) {
  const minutes = Math.floor(seconds / 60);
  const formattedMinutes = String(minutes).padStart(2, '0');
  const remainingSeconds = String(Math.floor(seconds % 60)).padStart(2, '0');
  return `${formattedMinutes}:${remainingSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder || currFolder; 
  let response = await fetch(`http://127.0.0.1:5500/${encodeURIComponent(currFolder)}/`);
  let text = await response.text();
  console.log(text);
  let div = document.createElement("div");
  div.innerHTML = text;
  let as = div.getElementsByTagName("a");
  songs = [];

  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(decodeURIComponent(element.href.split(`${currFolder}/`)[1]));  
    }
  }
  return songs;
}
const playMusic = (track) => {
  const trackPath = `http://127.0.0.1:5500/${encodeURIComponent(currFolder)}/${encodeURIComponent(track)}`;
  console.log(`Playing song from: ${trackPath}`);
  
  currentSong.src = trackPath;

  currentSong.play()
    .then(() => {
      play.src = "pause.svg";
      document.querySelector(".songinfo").innerHTML = track.replaceAll("%20", " ");
      document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    })
    .catch((error) => {
      console.error("Error playing the song:", error);
      console.log("Track path:", trackPath);
    });
};
async function main() {
  songs = await getSongs(); 
  console.log(songs);

  let songUL = document.querySelector(".songsList").getElementsByTagName("ul")[0];
  songUL.innerHTML = ""; 
  for (const song of songs) {
    songUL.innerHTML += `
      <li>
        <div class="info">
          <div>${song.replaceAll("%20", " ")}</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" style="width: 20px;"><path fill="none" stroke="white" stroke-linejoin="round" stroke-width="1.5" d="m5 3l16 9l-16 9z"/></svg>
        </div>
      </li>`;
  }

  // Add click events for each song in the list
  Array.from(document.querySelectorAll(".songsList li")).forEach((e) => {
    e.addEventListener("click", () => {
      let track = e.querySelector(".info").firstElementChild.innerHTML.trim();
      playMusic(track);
    });
  });

  let isPlaying = false; // Track the play state

  // Play/pause button handling
  play.addEventListener("click", () => {
    if (!isPlaying) {
      currentSong.play()
        .then(() => {
          play.src = "pause.svg";
          isPlaying = true;
        })
        .catch((error) => {
          console.error("Error playing the song:", error);
        });
    } else {
      currentSong.pause();
      play.src = "PlayMobile.svg";
      isPlaying = false;
    }
  });

  // Update song duration and time
  currentSong.addEventListener("loadeddata", () => {
    let duration = currentSong.duration;
    console.log("Duration:", duration);
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMMSS(currentSong.currentTime)} / ${secondsToMMSS(currentSong.duration || 0)}`;
    document.querySelector(".circle2").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Seekbar handling
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle2").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration) * percent / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    const leftPanel = document.querySelector(".left");
    leftPanel.classList.toggle("active");
  });
  
  // Close button handling
  document.querySelector(".close").addEventListener("click", () => {
    const leftPanel = document.querySelector(".left");
    leftPanel.classList.remove("active"); // Close the panel
  });
  
  
  document.querySelector(".close").addEventListener("click", () => {
    const leftPanel = document.querySelector(".left");
    leftPanel.style.left = "-200%"; // Close the panel on 'close' button click
  });

  // Previous song handling
  previous.addEventListener("click", () => {
    let currentTrack = currentSong.src.split("/").pop(); // Get current song name
    let index = songs.indexOf(decodeURIComponent(currentTrack)); // Get index of the current song in the list
    if (index > 0) { // Ensure index doesn't go below 0
      playMusic(songs[index - 1]); // Play the previous song
    } else {
      console.log("This is the first song in the list.");
    }
  });
  next.addEventListener("click", () => {
    let currentTrack = currentSong.src.split("/").pop(); 
    let index = songs.indexOf(decodeURIComponent(currentTrack)); 
    if (index < songs.length - 1) { 
      playMusic(songs[index + 1]); 
      console.log("This is the last song in the list.");
    }
  });
  document.querySelector(".range input").addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
  });
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range input").value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document.querySelector(".range input").value = 10;
    }
  });

  // Handling folder selection from cards
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      let folder = item.currentTarget.getAttribute('data-songs');  
      songs = await getSongs(folder);  
      main();  
      playMusic(songs[0]);
    });
  });
}

// Initialize the app
main();
