const ap = document.getElementById("audioPlayer");
var maxPlayTime = ap.duration;
// Suppose to use goingToPause to smoothen transition between play & pause
// Not implemented yet but keep it there for reference
var goingToPause = false;

ap.ontimeupdate = function() {
  let a = secondsToMinutesAndSecondsAndRemains(ap.currentTime);
  let timeDisp = document.getElementById('playPauseBtn')
  timeDisp.innerHTML = `${twoDigitsFmt(a[0])}:${twoDigitsFmt(a[1])}`;
  if (ap.currentTime > maxPlayTime) {
    ap.pause();
  }
};

export function initSource(phapname) {
    var request = new XMLHttpRequest();
    request.open(
      "GET", 
      "https://thaytamphap.github.io/assets/audios.json", 
      true
    );
    request.send();
    
    request.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let phaps = JSON.parse(this.responseText).phaps;
        for (var n = phaps.length, i = 0; i < n; i++) {
            if (phaps[i].audio.includes(phapname)) {
              ap.innerHTML = 
`<source src="https:/thaytamphap.github.io/${phapname}.ogg"/>
<source src="${phaps[i].audio.split("?")[1]}"/>`
              return; break;
            }
        }
      }
    };
}

export function setPlaybackRate(fastMode) {
  return ap.playbackRate = fastMode ? 1.3 : 1.0;
}

export function normalizeTime(time) {
  if (time > ap.duration) return ap.duration;
  if (time < 0) return 0;
  return time;
}

export function getDuration() {
  return ap.duration;
}

export async function saveCurrentTimeToIndex(i) {
  if (!await isEditedIndex(i)) {
    saveTime(currSubIndex, ap.currentTime);
  }
}

export async function play(delay=0) {
  goingToPause = false;
  await ap.play();  
}

export async function pause() {
  goingToPause = false;
  ap.pause();
}

export function isPaused() {
  return ap.paused;
}

export function adjustCurrentTime(time=null, delta=0) {
  ap.currentTime = (time ?? ap.currentTime) + delta;
}

export function adjustMaxPlayTime(time=null, delta=0) {
  maxPlayTime = (time ?? maxPlayTime) + delta;
}

export function seekAndPlay(delta) {
    adjustCurrentTime(null, delta);
    play();
}

export function pauseOrSeekAndPlay(delta) {
  if (ap.paused) { 
    seekAndPlay(delta);
  } else { 
    pause();
  };
}
