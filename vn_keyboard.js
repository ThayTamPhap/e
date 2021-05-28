import { _keys_map } from "./keys_map.js"
import { setLastCursorFast, playCurrPos, resetTextAndPos, saveLastCursor } from "./cursor_helpers.js"
import * as AudioPlayer from "./audio_player.js"

var keysMap = {};
const keysMapRegex = new RegExp('(?:' + 
_keys_map.split("\n").map(x => {

  let splits = x.split(/_+/);
  let k = splits[0];
  let v = splits[1];
  keysMap[k] = v;

  // let s = k[0] == " " ? `[\\s.,:;]${k.substr(1,)}` : k;
  return k;
}).slice(1,).join("|")+')(?=$)', 'i'); // need to match end of string

console.log(keysMap, keysMapRegex);

document.addEventListener("keyup", mapKeysForMe);

var prevC;
async function mapKeysForMe(event) {
    saveLastCursor('mapKeysForMe');

    // Android's keyCode: enter = 13; backspace = 8; others are all 229
    if (event.code == '' && (event.key == 'Backspace' || event.keyCode == 8)) { 
        event.code = 'Backspace';
        prevC = null;
        return;
    }

    var s = window.getSelection();
    let i = s.anchorOffset;
    var p = document.getElementById(currSubIndex);
    var t = p.innerText;
    let c1 = t.charCodeAt(i-1);
    let c2 = prevC;
    prevC = c1;

    if (c1 === 32 || c1 === 160) {
      if (c2 === 32 || c2 === 160) playCurrPos();
      if (c1 === 160) resetTextAndPos();
      return;
    }
    
    // Default
    let l = t.substr(0, i);
    let newl = mapKeys(l);
    if (newl.slice(-2) != l.slice(-2)) {
        p.innerHTML = newl + t.substr(i,);
        s.collapse(p.firstChild, setLastCursorFast(newl.length));
    }
}

function playCurrent() {
    AudioPlayer.adjustMaxPlayTime(null, 60);
    AudioPlayer.play();
}

function mapKeys(sent) {
  return sent.replace(keysMapRegex, k => {
    let v = keysMap[k.toLowerCase()];
    console.log(`\n!! mapKeys: '${k}' => '${v}'`);
    return v ?? k;
  });
}
console.assert(mapKeys(' nx')===' những ');
console.assert(mapKeys('nx')==='nx');
console.assert(mapKeys('nx ')==='nx ');

