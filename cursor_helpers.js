import * as AudioPlayer from "./audio_player.js";
import * as Estimators from "./estimators.js";
import * as TypedText from "./typed_text.js"
import * as VnTelex from "./vn_telex.js"

var lastCurrPos = 0;
var selectedText = "";

export function getCursorback(from) {
  if (from !== FROM_VIRTUAL_BUTTON) { return; }
  let p = document.getElementById(currSubIndex); p.focus();
  // console.log("\nlastCurrPos:", lastCurrPos);
  let n = p.innerText.length;
  if (lastCurrPos > n) {
    lastCurrPos = n;
  }
  collapse(window.getSelection(), p.firstChild, lastCurrPos);
}

export async function playCurrSubIndex(delta = 0) {
  if (selectedText.length > 0) { AudioPlayer.pause(); return; }
  var time = await loadTime(currSubIndex);
  if (isNaN(time)) return;
  if (time != 0 || currSubIndex == 0) {
    AudioPlayer.adjustCurrentTime(time, delta);
    AudioPlayer.adjustMaxPlayTime(time, await Estimators.getCurrDelta('Whole sentence'));
    await AudioPlayer.play();
  }  
}

export async function playCurrPos() {
  playCurrSubIndex(await Estimators.getCurrDelta());
}

export async function pauseOrPlayCurrPos() {
  AudioPlayer.isPaused() ?  playCurrPos() : AudioPlayer.pause();
}

export function getLastCurrPos() {
  return lastCurrPos;
}

export function setLastCursorFast(i) {
  return lastCurrPos = i;
}

export function saveLastCursor(from="", pos=null) {
  lastCurrPos = pos ?? window.getSelection().anchorOffset;
  // console.log(`\n\nsaveLastCursor(${from}) => ${lastCurrPos}\n\n`);
}

export function setLastCursor(from="", value) {
  lastCurrPos = value;
  // console.log(`\n\setLastCursor(${from}) => ${lastCurrPos}\n\n`);
}

export function getCurrPosStr() {
  var currP = document.getElementById(currSubIndex);
  var currInnerText = currP.innerText;
  return currInnerText.substr(0, window.getSelection().anchorOffset);
}

export function collapse(sel, elem, n) {
    let range = new Range();
    range.setStart(elem, n);
    range.setEnd(elem, n);
    sel.removeAllRanges();
    sel.addRange(range);
}

export function resetTextAndPos() {
    // Reset HTML to plain text to select correct cursor position
    var sel = window.getSelection();
    var currP = document.getElementById(currSubIndex);
    var currInnerText = currP.innerText;

    let isEndOfSent = lastCurrPos >= currInnerText.length;

    let normText = currInnerText.substr(0, lastCurrPos);
    normText = VnTelex.telexifyLastWord(normText);
    normText = TypedText.normalizeText(normText, false);

    let remain = currInnerText.substr(lastCurrPos,);
    remain = TypedText.normalizeText(remain);

    currInnerText = normText + remain;
    lastCurrPos = normText.length;

    if (shouldCapitalizedFirstCharOf(currP)) {
      currInnerText = currInnerText[0].toUpperCase() + currInnerText.slice(1,);
    }
    function shouldCapitalizedFirstCharOf(p) {
      if (p.id === "0") { return true; }
      let pp = p.parentNode.previousSibling.lastChild;
      return pp.firstChild.textContent 
        && pp.firstChild.textContent.match(/[.?!\\/]\s*$/);
    }


    let n = currInnerText.length;
    if (isEndOfSent || lastCurrPos > n) {
      lastCurrPos = n;
    }
    currP.firstChild.textContent = currInnerText;
    // console.log(`n=${n}, lastCurrPos=${lastCurrPos}\nnormText="${normText}", remain="${remain}"`);
    collapse(sel, currP.firstChild, lastCurrPos);
}


export function blinkCurPos(pos) {
  var currP = document.getElementById(currSubIndex);
  if (!currP.firstChild) { return; }

  let sel = window.getSelection(); 
  selectedText = sel.getRangeAt(0).toString();

  // console.log('blinkCurPos():\nselectedText', selectedText);

  if (selectedText.length > 0) {
    AudioPlayer.pause();
    return;
  }

  // use lastCurrPos since click on virtual button reset curpos to 0
  var currPos = typeof pos == 'number' ? pos : lastCurrPos;
  var txt = currP.firstChild ? currP.firstChild.textContent : "";
  
  var n = txt.length;
  if (currPos > n) currPos = n;

  var b = currPos, e = currPos+1, n = txt.length;
  while (txt[b] != ' ' && b > 0) b--; if (b < 0) b = 0;
  while (txt[e] != ' ' && e < n) e++; if (e > n) e = n;
  

  let range = new Range();  
  range.setStart(currP.firstChild, b);
  range.setEnd(currP.firstChild, e);
  sel.removeAllRanges();
  sel.addRange(range);

  let count = 0;
  let interval = window.setInterval(function() {
    if (++count > 0) { 
      clearInterval(interval); 
      collapse(sel, currP.firstChild, currPos);
    }

    if (selectedText.length > 0) {
      AudioPlayer.pause();
      clearInterval(interval);
      return;
    }

    if (count % 2 == 0) {
      range.setStart(currP.firstChild, b);
      range.setEnd(currP.firstChild, e);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      collapse(sel, currP.firstChild, currPos);
    }
  }, 50);
}