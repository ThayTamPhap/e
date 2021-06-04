const FROM_VIRTUAL_BUTTON = "FROM_VIRTUAL_BUTTON";

// https://regexr.com/ => to test regex
const END_PHRASE_AND_SENT_REGEX = /(\s*(?:[,;:\n\\\.\?\!]\s*)+)/gm;
const END_SENT_REGEX =            /(\s*(?:[\n\\\.\?\!]\s*)+)/gm;

const controlKeys = "Tab,Capslock,Enter,"+
    "ControlLeft,AltLeft,ShiftLeft,OsLeft,MetaLeft"+
    "ControlRight,AltRight,ShiftRight,OsRight,MetaRight"+
    "ArrowRight,ArrowLeft,ArrowUp,ArrowDown";

// Global variables (app state)
var currSubIndex, subsCount;
let adjustedDeltas = [];

var phapname = location.search.replace("?","").split("&")[0].split(".")[0];
if (phapname === "") {
  phapname = "phaps/20200704";
} console.log('phapname', phapname);

function keepTwoDigitsAfterPeriod(f) {
  return Math.round(f * 100) / 100;
}

// So it works on other platform
if (!console.assert) console.assert = function (x) {
  if (x !== true) console.log("Assertion fail!");
  return x;
}

function assertEqual(x, y) {
  let condition = x === y;
  console.assert(condition);
  if (!condition) {
    console.log(x, "!==", y);
  }
};

function twoDigitsFmt(d) {
  return `${d <= 9 ? '0' : ''}${d}`
}
assertEqual(twoDigitsFmt( 0), '00');
assertEqual(twoDigitsFmt( 9), '09');
assertEqual(twoDigitsFmt(10), '10');
assertEqual(twoDigitsFmt(19380), '19380');


function secondsToMinutesAndSecondsAndRemains(s) {
  let minutes = Math.floor(s / 60);
  s -= minutes*60;
  let seconds = Math.floor(s);
  let remains = s - seconds;
  remains = Math.round(remains * 100);
  return [minutes, seconds, remains];
}
const secsToMSAR = secondsToMinutesAndSecondsAndRemains;
assertEqual(secsToMSAR( 0).toString(), "0,0,0");
assertEqual(secsToMSAR(60).toString(), "1,0,0");
assertEqual(secsToMSAR(61).toString(), "1,1,0");
assertEqual(secsToMSAR(61.543).toString(), "1,1,54");
assertEqual(secsToMSAR(3661.543).toString(), "61,1,54");

function secondsToTime(s) {
  // return `${Math.floor(s)}.${Math.floor(s*1000%1000)}`;
  let a = secondsToMinutesAndSecondsAndRemains(s);
  return `${twoDigitsFmt(a[0])}:${twoDigitsFmt(a[1])},${twoDigitsFmt(a[2])}`
}
// assertEqual(secondsToTime(61.545563).toString(), "61.545");
assertEqual(secondsToTime(61.543).toString(), "01:01,54");


var isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
