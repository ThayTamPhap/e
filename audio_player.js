const ap = document.getElementById("audioPlayer");
var maxPlayTime = ap.duration;
var goingToPause = false;

export function initSource(phapname) {
  ap.innerHTML = 
   `<source src="https://thaytamphap.github.io/${phapname}.ogg"/>
    <source src="https://thaytamphap.github.io/${phapname}.mp3"/>`;
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

export async function play() {
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

ap.ontimeupdate = function() {
  let a = secondsToMinutesAndSecondsAndRemains(ap.currentTime);
  let timeDisp = document.getElementById('playPauseBtn')
  timeDisp.innerHTML = `${twoDigitsFmt(a[0])}:${twoDigitsFmt(a[1])}`;
  if (ap.currentTime > maxPlayTime) {
    ap.pause();
  }
};
