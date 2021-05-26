const FROM_VIRTUAL_BUTTON = "FROM_VIRTUAL_BUTTON";

// https://regexr.com/ => to test regex
const END_PHRASE_AND_SENT_REGEX = /(\s*(?:[,;:\n\\\.\?\!]\s*)+)/gm;
const END_SENT_REGEX =            /(\s*(?:[\n\\\.\?\!]\s*)+)/gm;

// Global variables (app state)
var currSubIndex, subsCount;
let adjustedDeltas = [];

const phapname = location.search.replace("?","").split(".")[0];
console.log('phapname', phapname);


function keepTwoDigitsAfterPeriod(f) {
  return Math.round(f * 100) / 100;
}

function twoDigitsFmt(d) {
  return `${d <= 9 ? '0' : ''}${d}`
}
console.assert(twoDigitsFmt( 0)==='00');
console.assert(twoDigitsFmt( 9)==='09');
console.assert(twoDigitsFmt(10)==='10');
console.assert(twoDigitsFmt(19380)==='19380');


function secondsToMinutesAndSecondsAndRemains(s) {
  let minutes = Math.floor(s / 60);
  s -= minutes*60;
  let seconds = Math.floor(s);
  let remains = s - seconds;
  remains = Math.round(remains * 100);
  return [minutes, seconds, remains];
}
const secsToMSAR = secondsToMinutesAndSecondsAndRemains;
console.assert(secsToMSAR( 0).toString()==="0,0,0");
console.assert(secsToMSAR(60).toString()==="1,0,0");
console.assert(secsToMSAR(61).toString()==="1,1,0");
console.assert(secsToMSAR(61.543).toString()==="1,1,54");
console.assert(secsToMSAR(3661.543).toString()==="61,1,54");

function secondsToTime(s) {
  // return `${Math.floor(s)}.${Math.floor(s*1000%1000)}`;
  let a = secondsToMinutesAndSecondsAndRemains(s);
  return `${twoDigitsFmt(a[0])}:${twoDigitsFmt(a[1])},${twoDigitsFmt(a[2])}`
}
// console.assert(secondsToTime(61.545563).toString()==="61.545");
console.assert(secondsToTime(61.543).toString()==="01:01,54");
