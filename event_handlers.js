import * as CursorHelpers from "./cursor_helpers.js";
import * as AudioPlayer from "./audio_player.js";
import * as Estimators from "./estimators.js";
import * as VnHelpers from "./vn_helpers.js"

var fastMode = false;
var needToResetTextAndPos = true;

document.addEventListener("keydown", handleKeyPress);

// Export to global to bind to elements
window.handleKeyPress = handleKeyPress;
window.playSub = playSub;
window.updateIndexTime = updateIndexTime;

async function updateIndexTime() {
  var i = parseInt(this.id);
  let value = await loadTime(i);
  this.previousSibling.innerHTML = `[${i}] ${secondsToTime(value)}`;
  await loadCurrAdjustedDeltas();
}

function resetTextAndPos(suffix=false) {
  if (needToResetTextAndPos) {
    CursorHelpers.resetTextAndPos(suffix);
  }
  needToResetTextAndPos = false;
}

// Click a sub will call playSub()
async function playSub(event) {
  let index = parseInt(this.id);
  // Click on not edited sub have no effect
  // , only enter can change sub's timing and make it edited 
  if (!(await isEditedIndex(index))) return;

  if (currSubIndex != index) {
    // First click on sub
    CursorHelpers.saveLastCursor('playSub: First click on sub', 0);
    saveCurrSubIndex(index);
    await loadCurrAdjustedDeltas();
    await CursorHelpers.playCurrSubIndex();
    CursorHelpers.blinkCurPos(0);
  }  else { 
    // Click on current sub
    CursorHelpers.saveLastCursor('playSub: Click on current sub');
    await CursorHelpers.playCurrPos();
    CursorHelpers.blinkCurPos();
  }
}

async function handleKeyPress(event, from=null) {
  // let logStr = `keydown: key='${event.key}' | code='${event.code}' | keyCode=${event.keyCode}`;
  // console.log(logStr); // alert(logStr);
  let currKey = event.code;
  
  // key mapping for different browsers / systems
  // Android's keyCode: enter = 13; backspace = 8; others are all 229
  if (currKey == 'MetaRight') { currKey = 'OSRight'; }
  if (currKey == 'CapsLock') { currKey = 'Tab'; }
  if (currKey == '' && (event.key == 'Backspace' || event.keyCode == 8)) { 
    currKey = 'Backspace'; 
  }
  
  
  if (event.key == 'Enter' || event.keyCode == 13) { 
    event.preventDefault();
    fastMode = !fastMode;
    document.getElementById("forwardButton").innerHTML = fastMode ? ">>>" : ">>";
    document.getElementById("backwardButton").innerHTML = fastMode ? "<<<" : "<<";
    AudioPlayer.setPlaybackRate(fastMode);
    AudioPlayer.seekAndPlay(-0.8);
    return;
  }

  switch(currKey) {
    case 'ShiftLeft':
      event.preventDefault();
      CursorHelpers.getCursorback(from);
      AudioPlayer.pauseOrSeekAndPlay(-0.8);
      break;

    case 'Backspace':
      if (currSubIndex > 0 && currSubIndex == subsCount - 1 
        && document.getElementById(currSubIndex).innerText.length === 0) {
        document.body.removeChild(document.getElementById(currSubIndex).parentNode);
        document.getElementById(--currSubIndex).focus();
        saveSubsCount(--subsCount);
        saveTime(subsCount, 0);
      }
      break;

    case 'Tab':
      event.preventDefault();

      if (currSubIndex < subsCount-1) { 
        let p = document.getElementById(++currSubIndex);
        p.contentEditable = true;
        p.focus();
        p.parentNode.scrollIntoView();

      } else {
        // Add new sub element
        let div = document.createElement('div');
        let p = document.createElement('p');
        div.innerHTML = `<i>[${++currSubIndex}] ${secondsToTime(0)}</i>`;
        p.id = currSubIndex;
        p.contentEditable = "true";
        p.className = 'edited';
        p.innerHTML = String.fromCharCode(160); // Space
        p.addEventListener("click", playSub);
        p.addEventListener("blur", saveTextIndex);
        p.addEventListener("focus", updateIndexTime);
        div.appendChild(p);
        document.body.appendChild(div);
        p.focus();
        // Scroll to bottom to show newly added element
        window.scrollTo(0,document.body.scrollHeight);
        // Increase & save subsCount
        saveSubsCount(++subsCount);
      }
      AudioPlayer.saveCurrentTimeToIndex(currSubIndex);      
      CursorHelpers.saveLastCursor("Next button", 0);
      // Reset cache and play new sub audio
      saveCurrSubIndex(currSubIndex);
      AudioPlayer.adjustMaxPlayTime(null, 
        await Estimators.getCurrDelta('Whole sentence'));
      AudioPlayer.play();
      VnHelpers.makeUseOfBiTriGramsFrom(await loadText(currSubIndex-1));
    /* ControlLeft = play, AltRight = forward, OSRight = backward */

    case 'ControlLeft':
      event.preventDefault();
      CursorHelpers.getCursorback(from);
      resetTextAndPos();
      await CursorHelpers.playCurrPos();
      CursorHelpers.blinkCurPos();
      break;

    case 'AltRight':
      event.preventDefault();
      CursorHelpers.getCursorback(from);
      // resetTextAndPos();
      CursorHelpers.blinkCurPos();
      adjust(+1);
      break;

    case 'AltLeft':
      event.preventDefault();
      CursorHelpers.getCursorback(from);
      // resetTextAndPos();
      CursorHelpers.blinkCurPos();
      adjust(-1);
      break;

    case 'Space':
      needToResetTextAndPos = true;
      break;

    default:
      needToResetTextAndPos = true;
      if (await loadTime(currSubIndex) != 0) { AudioPlayer.pause(); }
  }
}


async function adjust(x) {
  let delta = await Estimators.getCurrDelta();
  var time, _time = await loadTime(currSubIndex) + delta;
  if (delta == 0 && CursorHelpers.getLastCurrPos() < 5) {
    time = _time + (fastMode ? 1.5 : 0.15) * x;
    time = AudioPlayer.normalizeTime(time);
    saveTime(currSubIndex, time);
  } else {
    time = (fastMode ? 2 : 1) * x;
    Estimators.adjustDeltas(time);
    time = _time + time;
    time = AudioPlayer.normalizeTime(time);
  }
  console.log(`Adjust ap.currentTime`, _time, time - _time, delta);
  AudioPlayer.adjustCurrentTime(time);
  AudioPlayer.adjustMaxPlayTime(time+60);
  await AudioPlayer.play();
}
