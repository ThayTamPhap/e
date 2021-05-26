import * as TypingText from "./typing_text.js"

const IDEAL_LINE_CHARS = 45*5;
const MAX_LINE_CHARS = 60*5;
const MIN_LINE_CHARS = 22*5;

var textGridLoaded = false;
const expanding = false;

export function run() {
  
  loadSubsCount().then(async function () {

    if (!isNaN(subsCount) && subsCount > 0 && !expanding) {
      console.log("Use cached data to gen subs");
      genSubs();

    } else {

      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function () {
        if (this.status == 404) {
          if (!textGridLoaded) loadTextGrid();
        } else
        if (this.readyState == 4 && this.status == 200) {
          txt = this.responseText;
          initSubs(txt).then(genSubs);
        }
      };
      xmlhttp.open("GET", `/${phapname}.lab`, true);
      xmlhttp.send();
    }
  });
}

function loadTextGrid() {
  textGridLoaded = true;
  console.log("Load TextGrid ...")
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let txt = this.responseText;
      initTextGrid(txt).then(genSubs);
    }
  };
  xmlhttp.open("GET", `/${phapname}.txt`, true);
  xmlhttp.send();
}

async function initTextGrid(txt) {
  txt = txt.split("intervals: size = ")[1];
  let intervals = txt.split(/intervals.+?:/);
  intervals = intervals.slice(1,);

  var time, text;
  for (var inter, i = 0; i < intervals.length; i++) {
    inter = intervals[i];
    time = inter.match(/xmin = ([\d\.]+)/)[1]
    text = inter.match(/text = "(.*)"/)[1]

    await saveTime(i, time);
    await saveText(i, text);
  }
  await saveSubsCount(intervals.length);
}

async function initSubs(txt) {
  var sents = [], sent;
  var splits = txt.split(END_SENT_REGEX); splits.push("");
  
  while (splits.length >= 2) {
    sent = splits.shift() + splits.shift();
    sent = sent.replace(/\n/gm,'\\').replace(/\s+/gm," ");
    sent = sent.replace(/^\s+/m,"").replace(/\s+$/m,"");
    sents.push(sent);
  }

  
  splits = []; var n, i, m, phrases, k, s;
  
  for (n=sents.length, i=0; i < n; i++) {
  
    m = sents[i].length;
    console.log('Sent',i,'length is',m);

    if (m > IDEAL_LINE_CHARS) {
      phrases = sents[i].split(END_PHRASE_AND_SENT_REGEX);
      phrases.push("");
      sent = "", k = 0;
      while (k < MIN_LINE_CHARS && phrases.length >= 2) {
        sent = sent + (s = phrases.shift()) + phrases.shift();
        k = k + s.length;
      }

      splits.push(sent);
      console.log('splited to:', sent);

      if (phrases.length > 0) {
        sents[i] = phrases.join("");
        console.log('... remain is:', sents[i]);
        i--;
      }

    } else 
    if ( m < MIN_LINE_CHARS && i < n-1 
        && m+sents[i+1].length <= MAX_LINE_CHARS ) {

      console.log('merged length', m+sents[i+1].length, '< max length', MAX_LINE_CHARS);
      sents[i+1] = sents[i]+' '+sents[i+1];      
      console.log('... merged to sents[i+1]', sents[i+1]);

    } else if ( m < MIN_LINE_CHARS && i > 0 
        && m+sents[i-1].length <= MAX_LINE_CHARS ) {

      sents[i] = splits.pop()+' '+sents[i];
      splits.push(sents[i]);
      console.log('... merged to sents[i]', sents[i]);
    
    } else {
      
      splits.push(sents[i]);
    }
  } // for

  var n = 0, time;
  if (expanding) do {
      time = await loadTime(++n);
    } while (!isNaN(time) && time > 0);

  splits.push("./.");
  for (i = 0; i < splits.length; i++) {
    await saveTime(n, 0);
    await saveText(n, splits[i]);
    n++;
  }
  await saveSubsCount(n);
}

function focusAndScrollIntoViewSubIndex(index) {
  var p = document.getElementById(index);
  p.parentNode.focus();
  p.scrollIntoView();
}

async function genSubs() {
  await loadSubsCount();
  currSubIndex = -1;
  for (var p, div, time, text, i = 0; i < subsCount; i++) {
    div = document.createElement('div');
    time = await loadTime(i);
    div.innerHTML = `<i>[${i}] ${secondsToTime(time)}</i>`;
    p = document.createElement('p');
    p.innerHTML = TypingText.spellSpecialWords(await loadText(i));
    p.id = i;
    if (await isEditedIndex(i) || i <= 1) {
      p.contentEditable = "true";
      p.className = 'edited';
    }
    // if p is click then p will get focus
    p.addEventListener("click", playSub);
    p.addEventListener("focus", playAndUpdateSub);
    p.addEventListener("blur",  saveTextIndex);
    div.appendChild(p);
    document.body.appendChild(div);

    if (currSubIndex < 0 && time == 0 && i-1 >= 0) {
      currSubIndex = i - 1;
      focusAndScrollIntoViewSubIndex(currSubIndex);
      // console.log('currSubIndex', currSubIndex);
    }
  }
  if (currSubIndex < 0) {
    focusAndScrollIntoViewSubIndex(currSubIndex = subsCount-1);
  }
}
