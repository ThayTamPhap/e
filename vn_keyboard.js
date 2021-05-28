import { _keys_map } from "./keys_map.js"
import { _mappings } from "./mappings.js"

import * as CursorHelpers from "./cursor_helpers.js"
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
// console.log(keysMap, keysMapRegex);

document.addEventListener("keyup", mapKeysForMe);

var prevC, matches = [];
var buttonBar = document.getElementById("buttonBar");
let suggestion = document.getElementById("suggestion");

async function mapKeysForMe(event) {
    CursorHelpers.saveLastCursor('mapKeysForMe');
    suggestion.style.display = "none";
    buttonBar.style = "display: true";

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

    let l = t.substr(0, i);
    let r = t.substr(i,);
    let newl;

    if (c1 === 32 || c1 === 160) { // Android space char code is 160
        if (c2 === 32 || c2 === 160) {
            CursorHelpers.playCurrPos();
        }
        if (c1 === 160) {
            CursorHelpers.resetTextAndPos();
        }
        if (matches.length == 1) {
            // alert(matches[0]);
            let selected = matches[0];
            newl = l.substr(0, l.length-selected.length-1) + selected 
                + String.fromCharCode(160); prevC = 160;
            p.innerHTML = newl + r;
            s.collapse(p.firstChild, CursorHelpers.setLastCursorFast(newl.length));
        }
        return;
    }
    
    // Default
    newl = mapKeys(l);

    if (newl.slice(-2) != l.slice(-2)) {
        p.innerHTML = newl + r;
        s.collapse(p.firstChild, CursorHelpers.setLastCursorFast(newl.length));
        l = newl;
    }

    // Select from previous matches
    if (matches.length > 0) {
        let index = c1 - 49;
        if (index < matches.length) {
            let selected = matches[index];
            // console.log('Selected:', selected);
            newl = l.substr(0, l.length-selected.length-1) + selected 
                + String.fromCharCode(160); prevC = 160;
            p.innerHTML = newl + r;
            s.collapse(p.firstChild, CursorHelpers.setLastCursorFast(newl.length));
            // console.log(index, newl);
        }
        matches = [];
        return;
    }

    let lastPhrase = l.split(VN_PHRASE_BREAK_REGEX).pop();
    let words = lastPhrase.trim().split(/\s+/).slice(-3);
    let gram = words.join(" ").toLowerCase();
    gram = removeVienameseMarks(gram);
    let matched = _mappings[gram];
    
    if (!matched) {
        gram = words.slice(-2).join(" ").toLowerCase();
        gram = removeVienameseMarks(gram);
        matched = _mappings[gram];
    }

    if (matched) {
        let htmls = [];
        matches = matched.split("|");
        for (i = 0; i < matches.length; i++) {
            htmls.push(`${i+1}: ${matches[i]}`);
            console.log(i+1, matches[i]);
        }        
        suggestion.innerHTML = htmls.join("; ");
        suggestion.style = "display: true";
        buttonBar.style.display = "none";
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


const VN_PHRASE_BREAK_REGEX = /[^\sqwertyuiopasdfghjklzxcvbnmàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+/gi;
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
