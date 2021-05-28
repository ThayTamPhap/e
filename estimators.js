import * as Words from './words.js';
import * as CursorHelpers from './cursor_helpers.js';

const defaultSecondsPerWord = 0.3;
const maxSecondsPerWord = 0.36;
const notWordRegex = /[\s\,\.\<\>\;\:\/\?\|\\\[\]\{\}\`\~\!\@\#\$\%\^\&\*\(\)\_\+\-\=“”…‘’]+/gm;

let secondsPerWord = defaultSecondsPerWord;
let wholeSentLength = -1;
let wholeSentDelta = 0;

export function adjustDeltas(x) {
  var currPos = CursorHelpers.getCurrPosStr().length;
  var ad = adjustedDeltas[currPos];
  adjustedDeltas[currPos] = (ad == undefined ? 0 : ad) + x;
  adjustedDeltas = adjustedDeltas.slice(0, currPos + 1);
  wholeSentLength = -1; // reset to re-estimate wholeSentLength
  saveCurrAdjustedDeltas();
}

export async function getCurrDelta(wholeSent = false) {
  var q, currPos;

  if (wholeSent) {
    // estimate whole sentence duration in seconds
    // Last sub, play for 1 min
    if (currSubIndex == subsCount - 1) {
      return 60;
    } // seconds

    // Get all the text of current sub to estimate duration
    q = document.getElementById(currSubIndex).innerText;
    currPos = q.length;

    // Too short text (hard to estimate) also play for 1 min
    if (currPos < 10) {
      return 60;
    } // seconds

    // Don't re-estimate if only 10% diff from the last estimation
    var ratio = currPos / wholeSentLength;

    if (Math.abs(1 - ratio) < 0.1) {
      var newEst = ratio * wholeSentDelta;
      // console.log('wholeSentDelta (cached)',wholeSentDelta,'ratio',ratio,'newEst',newEst);
      return newEst;
    }

    // Remember the new wholeSentLength before estimate a new one
    wholeSentLength = currPos;
  } else {
    // Get text from beginning to current cursor position
    q = CursorHelpers.getCurrPosStr();
    currPos = q.length;
  }

  // Est beginning of a sent (normally when switch sub) will reset wholeSentLength to force it re-estimated
  if (currPos < 5) wholeSentLength = -1;

  // Estimate delta2 based on number of words and duration of the previous sent
  q = q.toLocaleLowerCase();
  var words = q.split(notWordRegex);
  var breakCount1 = q.split(END_PHRASE_AND_SENT_REGEX).length - 1;
  var breakCount2 = q.split(END_SENT_REGEX).length - 1;

  var wordsCount = words.length - 2;
  if (words[words.length - 1] == '') {
    wordsCount--;
  }
  // Too short string always return 0 to make it point to the beginning of the sent
  if (wordsCount <= 0) return 0;
  if (words.length > 20) wordsCount -= words.length / 10;
  if (words.length > 40) wordsCount -= words.length / 20;
  wordsCount += breakCount1 * 0.3 + breakCount2 * 0.5;
  var delta2 = wordsCount * (await estimateSecondsPerWord(currSubIndex));

  // Estimate delta1 based-on avg duration of force-aligned audios
  var delta1 = 0;
  if (words.length > 0) {
    words.forEach(w => (delta1 += Words.duration[w] ?? defaultSecondsPerWord));
    delta1 += (breakCount1 + breakCount2) * defaultSecondsPerWord * 0.8;
  }

  // Final delta will be avg of delta1 and delta2
  var delta = (delta1 + delta2) / 2;

  // Take into account of adjustedDeltas (by press '<<', '>>' button manually)
  var ad,
    i,
    n = adjustedDeltas.length - 1;
  if (n > currPos) n = currPos;
  for (i = 0; i <= n; i++) {
    ad = adjustedDeltas[i];
    if (ad != 0 && ad != undefined) {
      delta += ad;
      // console.log('adjustedDeltas[', i, '] = ', ad);
    }
  }

  // Keep only two last digits after period to easier to read in console.log
  delta = keepTwoDigitsAfterPeriod(delta);
  delta1 = keepTwoDigitsAfterPeriod(delta1);
  delta2 = keepTwoDigitsAfterPeriod(delta2);

  if (wholeSent) {
    // Buffer more to ensure to reach next sent for whole sent estimation case
    delta = keepTwoDigitsAfterPeriod(delta * 1.35 + 3.5);
    // Remember newly estimated wholeSentDelta to use for the next case
    wholeSentDelta = delta;
    // console.log(wholeSent, words.length, delta1, delta2, delta);
  } else {
    // console.log('currSub:',currSubIndex,'words',words.length,'delta1',delta1,'wordsCount',
    //   wordsCount,'delta2',delta2,'currPos',currPos,'adjustedDeltas',adjustedDeltas.length,
    //   'delta',delta);
  }

  // Ensure delta always > 0 and return it
  return delta < 0 ? 0 : delta;
}

async function estimateSecondsPerWord(index) {
  if (index == 0) {
    return secondsPerWord;
  }

  let q = await loadText(index - 1);
  let b = await loadTime(index - 1);
  let e = await loadTime(index);

  if (b >= e) {
    return secondsPerWord;
  }

  let avgWordDuration = (e - b) / q.split(/\s+/).length;
  secondsPerWord =
    avgWordDuration <= maxSecondsPerWord ? avgWordDuration : secondsPerWord;

  // console.log('secondsPerWord:', keepTwoDigitsAfterPeriod(secondsPerWord));
  return secondsPerWord;
}
