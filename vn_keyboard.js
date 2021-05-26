import { _keys_map } from "./keys_map.js"
import { setLastCursorFast, playCurrPos, resetTextAndPos } from "./cursor_helpers.js"
import * as AudioPlayer from "./audio_player.js"

var keysMap = {};

const keysMapRegex = new RegExp('(?:' + 
_keys_map.split("\n").map(x => {

  let splits = x.split(/^(.+?)\s+_/);
  let k = splits[1];
  let v = splits[2];
  keysMap[k] = v;  

  return k;
}).slice(1,).join("|")+')(?=$)', 'i'); // need to match end of string

console.log(keysMap, keysMapRegex);

document.addEventListener("keyup", mapKeysForMe);

async function mapKeysForMe(event) {
    let currKey = event.code;
    // Android's keyCode: enter = 13; backspace = 8; others are all 229
    if (currKey == '' && (event.key == 'Backspace' || event.keyCode == 8)) { 
        currKey = 'Backspace';
        return;
    }

    var s = window.getSelection();
    let i = s.anchorOffset;
    var p = document.getElementById(currSubIndex);
    var t = p.innerText;
    let c = t.charCodeAt(i-1);

    // let log = `Typed char: "${c}"`;console.log(); alert(log);
    if (c === 160) { // space on Android
        resetTextAndPos(" ");
        await playCurrPos();
        return;
    }

    // return;

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
    console.log(`\n!! mapKeys: '${k}'' => '${v}'`);
    return v;
  });
}
console.assert(mapKeys(' j')===' gi');
console.assert(mapKeys('dfdj')==='dfdj');
console.assert(mapKeys('dfdj ')==='dfdj ');

// Loại bỏ tất cả các kí tự không phải chữ cái và số
const notAlphaOrDigitRegex = /[^0-9a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]/gi;

// https://kipalog.com/posts/Mot-so-ki-thuat-xu-li-tieng-Viet-trong-Javascript
function removeVienameseMarks(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
}
