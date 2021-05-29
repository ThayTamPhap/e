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
let suggestion = document.getElementById("suggestion");
let www, suggestionRegex = null;
let autoReplaced = false;
let gram, matched;

async function mapKeysForMe(event) {
    CursorHelpers.saveLastCursor('mapKeysForMe');
    suggestion.style.display = "none";

    // Android's keyCode: enter = 13; backspace = 8; others are all 229
    if (event.code == '' && (event.key == 'Backspace' || event.keyCode == 8)) { 
        event.code = 'Backspace';
        prevC = null;
    }
    
    if (event.code != "" && "CtrlLeft,AltLeft,Tab,Enter,ShiftRight,AltRight".includes(event.code)) { return; }

    var s = window.getSelection();
    let i = s.anchorOffset;
    var p = document.getElementById(currSubIndex);
    var t = p.innerText;
    let c1 = t.charCodeAt(i-1);
    let c2 = prevC;
    prevC = c1;
    
    // Default mapKeys
    let l = t.substr(0, i);
    let r = t.substr(i,);
    let newl = mapKeys(l);

    if (newl.slice(-2) != l.slice(-2)) {
        p.innerHTML = newl + r;
        s.collapse(p.firstChild, CursorHelpers.setLastCursorFast(newl.length));
        l = newl;
    }

    // Select from previous matches
    if (matches.length > 0) {
        let index = c1 - 49;        
        // Select valid number from 0 to matches.length
        // then replace current char (c1 or prevC) by a space
        if (-1 <= index && index < matches.length) { 
            prevC = 160;
            autoReplaced = false;
            
            if (index == -1) {
                // Add new, selected pattern to the top
                // _mappings[gram] = www.toLowerCase() + '|' + matched;
            } else {
                // Switch selected one to the top
                let temp = matches[index].toLowerCase();
                matched = matched.replace(temp, "").replace("||","|")
                if (matched.length === 0) {
                    _mappings[gram] = temp;
                } else {
                    _mappings[gram] = temp + "|" + matched;
                }
                
            }
        }
        else if (c1 < 97 || c1 > 122) { // Not a-z
            index = 0;
            autoReplaced = true;
        }

        if (index == -1) { // Select 0 will keep the original string
            newl = l.substr(0, l.length-1);
        } else if (index < matches.length) {
            // console.log("User select:", index, matches[index]);
            newl = l.replace(suggestionRegex, matches[index]);
            newl = newl.substr(0, newl.length-1);
        }
        if (-1 <= index && index < matches.length) {
            newl += String.fromCharCode(prevC);
            p.innerHTML = newl + r;
            s.collapse(p.firstChild, CursorHelpers.setLastCursorFast(newl.length));
        }
        matches = [];
    }

    if (c1 === 32 || c1 === 160) { // Android space char code is 160
        if (c2 === 32 || c2 === 160) { // Double-space
            CursorHelpers.playCurrPos(); 
        } else { // Mono-space
            CursorHelpers.resetTextAndPos();
        }
    }


    // Not from a-z
    if (c1 < 97 || c1 > 122) { return; }
/*
    for (var pe = l.length - 1; pe >= 0 && l[pe].match(/\s/); pe--);
    var pb=pe - 1, char, triWords = [];
    while (pb >= 0) {
        char = l[pb];
        if (",:;.".includes(char)) { break; }
        if (char.match(/\s/) || pb === 0) {
            triWords.unshift(l.substr(pb === 0?0:pb+1, pe-pb+1));
            console.log(pb, char, pe, l[pe], triWords);
            if (triWords.length == 3) { break; }
            for (pe = pb; pe >= 0 && l[pe].match(/\s/); pe--);
            pb=pe;
        }
        if (pb > 0) pb--; 
    }
*/ 
    let lastPhrase = l.split(VN_PHRASE_BREAK_REGEX).pop();
    let triWords = lastPhrase.trim().split(/\s+/).slice(-3);
    // need at least two words
    if (triWords.length <= 1) {
        return;
    }
    gram = triWords.join(" ").toLowerCase();
    gram = removeVienameseMarks(gram);
    matched = _mappings[gram];

    console.log(triWords, gram, matched);
    // 3-gram don't match => try bi-gram
    if (!matched && triWords.length > 2) {
        triWords.shift();
        gram = triWords.join(" ").toLowerCase();
        gram = removeVienameseMarks(gram);
        matched = _mappings[gram];
    }

    if (matched) {
        // console.log(triWords.length, gram, matched);
        matches = [];
        www =triWords.join(" ");
        let ww = www.toLowerCase();
        matched.split("|").forEach((m) => {
            if (ww == m) ww = null;
            let mWords = m.split(" ");
            if (
                okok(triWords[0], mWords[0]) &&
                okok(triWords[1], mWords[1], autoReplaced) &&
                okok(triWords[2], mWords[2])
            ) {
                var str = "", z = 0, simi = 0;
                for (; z < www.length; z++) {
                    // char at z is upper case
                    if (www[z].toUpperCase() === www[z]) {
                        str += m[z].toUpperCase();
                    } else {
                        str += m[z];
                    }
                    if (www[z] === str[z]) { simi++; }
                }
                matches.push([str, simi]);
            }
        });

        if (matches.length > 0) {
            let htmls = [];
            matches = matches.sort((a,b) => b[1] - a[1]).map(x => x[0]);
            let lastWord = triWords[triWords.length-1];
            if (removeVienameseMarks(lastWord) !== lastWord) {
                console.log('len la len', www);
                matches = matches.filter(m => m !== www);
                matches.unshift(www);
                ww = null;
            }
            matches.forEach((m, i)=> {
                htmls.push(`<span class="${i==0?"default":""}">${i+1}. ${m}</span>`);
            });
            if (ww != null) { 
                htmls.push("<span>0. " + triWords.join(" ")) + "</span>"; 
            }
            suggestionRegex = new RegExp(`${triWords.join("\\s+")}`);
            console.log(suggestionRegex);
            suggestion.innerHTML = htmls.join("<br />");
            suggestion.style = "display: true";
        }
    }
}

function okok(w1, w2, autoReplaced=false) {
    if (typeof w1 === 'undefined') return true;
    // console.log("okok",w1, w2, autoReplaced);
    if (autoReplaced) return true;
    w1 = w1.toLowerCase();
    w2 = w2.toLowerCase();
    if (w1 == w2) return true;
    let w0 = removeVienameseMarks(w1);
    if (w0 == removeVienameseMarks(w2)) return true;
    return false;
}

export function makeUseOfBiTriGramsFrom(txt) {
    let phrases = txt.toLowerCase().split(VN_PHRASE_BREAK_REGEX);
    phrases.forEach((phrase) => {
        extractBiTriGrams(phrase);
    });
}

function extractBiTriGrams(phrase) {
    var w0 = "_", w1 = "_", s2, s3;
    var words = phrase.trim().split(/\s+/);
    words.forEach(w2 => {
        s2 = `${w1} ${w2}`;
        s3 = `${w0} ${s2}`;
        w0 = w1; w1 = w2;
        makeUseOfGram(s2);
        makeUseOfGram(s3);
    });
}

function makeUseOfGram(gram) {
    if (gram.includes("_")) return;
    // console.log(gram);
    let key = removeVienameseMarks(gram);
    let value = _mappings[key];
    if (value && value.includes(gram)) {
        // console.log(gram);
        // console.log("=>", value);
        _mappings[key] = gram + "|" + 
            value.replace(gram, "").replace("||","|").replace(/\|$/,"");
    } else {
         value = value ? gram + "|" + value : gram;
         value.replace(/\|$/,"");
         _mappings[key] = value;
        // console.log(_mappings[key]);
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
