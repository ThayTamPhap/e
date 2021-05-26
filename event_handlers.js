import * as CursorHelpers from "./cursor_helpers.js";
import * as AudioPlayer from "./audio_player.js";
import * as Estimators from "./estimators.js";

var cooldown = 0;
var currKey;
var needToResetTextAndPos = true;

document.addEventListener("keydown", handleKeyPress);
document.addEventListener("keyup", handleKeyUp);

// Export to global to bind to elements
window.handleKeyPress = handleKeyPress;
window.playSub = playSub;
window.playAndUpdateSub = playAndUpdateSub;

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
    loadCurrAdjustedDeltas();
    await CursorHelpers.playCurrSubIndex();
    CursorHelpers.blinkCurPos(0);
  }  else { 
    // Click on current sub
    CursorHelpers.saveLastCursor('playSub: Click on current sub');
    await CursorHelpers.playCurrPos();
    CursorHelpers.blinkCurPos();
  }
}

// Whenever a sub get focused (click, tab, enter) will call playAndUpdateSub()
async function playAndUpdateSub(event) {
  console.log("currSubIndex", currSubIndex);
  // Save recent edited text
  if (currSubIndex >  1) saveTextIndex(currSubIndex - 1);
  if (currSubIndex >= 0) saveTextIndex(currSubIndex);
  if (currSubIndex < subsCount - 1) saveTextIndex(currSubIndex + 1);

  switch (currKey) {
    case 'Enter':
      loadCurrAdjustedDeltas();
      saveCurrSubIndex(currSubIndex);
      AudioPlayer.saveCurrentTimeToIndex(currSubIndex);
      AudioPlayer.adjustMaxPlayTime(null, await Estimators.getCurrDelta('Whole sentence'));
      AudioPlayer.play();
      if (currSubIndex < subsCount - 1) {
        document.getElementById(currSubIndex+1).contentEditable = true;
      }
      break;

    case 'Tab':
      loadCurrAdjustedDeltas();
      await CursorHelpers.playCurrSubIndex();
      CursorHelpers.blinkCurPos(0);

      if (currSubIndex >= subsCount) {
        // Play till the end
        AudioPlayer.adjustMaxPlayTime(99999);
      } else {
        // Play till the end of the current sent
        AudioPlayer.adjustMaxPlayTime(await loadTime(currSubIndex+1));
      }
      break;

    default:
  }

  currKey = null;
}


async function handleKeyUp(event) {
  CursorHelpers.saveLastCursor('handleKeyUp');

  if (event.code == 'Space') {
    resetTextAndPos();
    await CursorHelpers.playCurrPos();
  }
}

async function handleKeyPress(event, from=null) {
  // let logStr = `keydown: key='${event.key}' | code='${event.code}' | keyCode=${event.keyCode}`;
  // console.log(logStr); // alert(logStr);
  currKey = event.code;
  
  // key mapping for different browsers / systems
  // Android's keyCode: enter = 13; backspace = 8; others are all 229
  if (currKey == 'MetaRight') { currKey = 'OSRight'; }
  if (currKey == '' && (event.key == 'Backspace' || event.keyCode == 8)) { 
    currKey = 'Backspace'; 
  }
  
  
  if (event.key == 'Enter' || event.keyCode == 13) { 
    event.preventDefault();
    // Replace code don't work
    // event.keyCode = 220; event.key = "\\"; event.code = "Backslash";
    resetTextAndPos("\\");
/*
    needToResetTextAndPos = true;
    resetTextAndPos(" ");
    await CursorHelpers.playCurrPos();
    let p = document.getElementById(currSubIndex); p.focus();
    if (event.code == '') { CursorHelpers.blinkCurPos(); } // blinkCurPos for Android
*/    
    return;
  }

  switch(currKey) {

    case 'AltLeft':
      event.preventDefault();
      CursorHelpers.getCursorback(from);
      AudioPlayer.pauseOrSeekAndPlay(-0.8);
      break;

    case 'Backspace':
      if (currSubIndex > 0 && currSubIndex == subsCount - 1 
        && document.getElementById(currSubIndex).innerText=="") {
        document.body.removeChild(document.getElementById(currSubIndex).parentNode);
        document.getElementById(--currSubIndex).focus();
        saveSubsCount(--subsCount);
      }
      break;

    case 'Enter':
      event.preventDefault();
      if (cooldown > 0) {
        CursorHelpers.getCursorback(from);
        break;
      }

      if (currSubIndex < subsCount-1) { 

        let p = document.getElementById(++currSubIndex);
        p.contentEditable = true;
        p.focus();
        p.parentNode.scrollIntoView();
        saveCurrSubIndex(currSubIndex);
        lastCurrPos = 0;
        cooldown=2; let inter=setInterval(()=>(--cooldown==0) && clearInterval(inter),1000);

      } else {

        let div = document.createElement('div');
        let p = document.createElement('p');
        div.innerHTML = `<i>[${++currSubIndex}] ${secondsToTime(0)}</i>`;
        p.id = currSubIndex;
        p.contentEditable = "true";
        p.className = 'edited';
        p.addEventListener("click", playSub);
        p.addEventListener("focus", playAndUpdateSub);
        p.addEventListener("blur", saveTextIndex);
        div.appendChild(p);
        document.body.appendChild(div);
        p.focus();
        // p.parentNode.scrollIntoView();
        window.scrollTo(0,document.body.scrollHeight);
        saveSubsCount(++subsCount);
      }
      break;

    case 'Tab':
      event.preventDefault();
      if (await isEditedIndex(currSubIndex+1)) { 
        document.getElementById(++currSubIndex).focus();
      }
      break;

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
      resetTextAndPos();
      adjust(+1);
      CursorHelpers.blinkCurPos();
      break;

    case 'OSRight':
      event.preventDefault();
      CursorHelpers.getCursorback(from);
      resetTextAndPos();
      adjust(-1);
      CursorHelpers.blinkCurPos();
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
  var _time = await loadTime(currSubIndex) + delta, time;
  if (delta == 0 && CursorHelpers.getLastCurrPos() < 5) {
    time = _time + 0.15 * x;
    time = AudioPlayer.normalizeTime(time);
    saveTime(currSubIndex, time);
  } else {
    Estimators.adjustDeltas(1.5 * x);
    time = _time + 1.5 * x;
    time = AudioPlayer.normalizeTime(time);
  }
  console.log(`Adjust ap.currentTime`, time - _time);
  AudioPlayer.adjustCurrentTime(time);
  await AudioPlayer.play();
}
