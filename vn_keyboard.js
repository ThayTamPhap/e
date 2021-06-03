import * as CursorHelpers from "./cursor_helpers.js"
import * as AudioPlayer from "./audio_player.js"
import * as VnHelpers from "./vn_helpers.js"
import { _mappings } from "./vn_mappings.js"
import * as TypedText from "./typed_text.js"

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
    
    // let logStr = `keyup: key='${event.key}' | code='${event.code}' | keyCode=${event.keyCode}`;
    // console.log(logStr); // console.log(controlKeys.includes(event.code));

    // Skip control keys
    if (event.code != "" && controlKeys.includes(event.code)) { 
        // console.log("controlKey found:", event.code);
        return; 
    }

    var s = window.getSelection();
    let i = s.anchorOffset;
    var p = document.getElementById(currSubIndex);
    var t = p.innerText;
    let c1 = event.keyCode == 32 ? 32 : t.charCodeAt(i-1);
    let c2 = prevC;
    prevC = c1;
    
    let l = t.substr(0, i);
    let r = t.substr(i,);

    // Select from previous matches
    if (matches.length > 0) {
        let index = c1 - 49;        
        // Select valid number from 0 to matches.length
        // then replace current char (c1 or prevC) by a space
        if (-1 <= index && index < matches.length) { 
            prevC = 160;
            autoReplaced = false;
            
            if (index == -1) {
                // newly selected pattern to the top
            } else {
                // Switch selected one to the top
                let temp = matches[index].toLowerCase();
                matched = matched.replace(temp,"").replace("||","|").replace(/\|$/,"");
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

        var newl;
        if (index == -1) { // Select 0 will keep the original string
            newl = l.substr(0, l.length-1);
        } else if (index < matches.length) {
            // console.log("User select:", index, matches[index]);
            newl = l.replace(suggestionRegex, matches[index]);
            newl = newl.substr(0, newl.length-1);
        }
        if (-1 <= index && index < matches.length) {
            newl += String.fromCharCode(prevC);
            p.firstChild.textContent = newl + r;
            CursorHelpers.collapse(s, p.firstChild, 
                CursorHelpers.setLastCursorFast(newl.length));
        }
        matches = [];
    }

    // Press ,. or ., will remove the last phrase (to undo voice input)
    // console.log("keyup", c1, c2);
    if ((c1 === 44 && c2 === 46) || 
        (c2 === 44 && c1 === 46)) {

        let n = l.length - 1, validChars = VnHelpers.PHRASE_VALID_CHARS;
        while (n > 0 && !validChars.includes(l[n])) { n--; }
        while (n > 0 &&  validChars.includes(l[n])) { n--; }

        p.firstChild.textContent = l.substr(0, n === 0 ? 0 : ++n);
        CursorHelpers.collapse(s, p.firstChild, 
            CursorHelpers.setLastCursorFast(n));

        return;
    }

    // Press space will auto-complete sent, double space to pause / play audio
    if (c1 === 32 || c1 === 160) { // Android space char code is 160
        if (c2 === 32 || c2 === 160) { // Double-space
            console.log(" > > Double spaces < <");
            CursorHelpers.pauseOrPlayCurrPos(); 
        }
        CursorHelpers.resetTextAndPos();
        return;
    }    

    // Process phrase level
    let triWords = l.trim().split(/\s+/).slice(-3);
    let lastWord = triWords[triWords.length - 1];

    // console.log(triWords.length, triWords);

    // Process shortcuts
    var htmls = [];
    let others = TypedText.suffixShortcuts[lastWord];
    if (others) {
        htmls = others.map(x =>
            `<sub>${x} = </sub> ${TypedText.typingShortcuts[x]}`
        );
    }
    let scToText = TypedText.typingShortcuts[lastWord];
    if (scToText) {
        htmls.unshift(`<sub><span class="default">${lastWord}</span> = </sub>
             <span class="default">${scToText}</span>`);
    }
    if (htmls.length > 0) {
        suggestion.innerHTML = htmls.join("<br/>");;
        suggestion.style = "display: true";
    }
    if (scToText) { return; }

    // Hint for special words like 100% ...
    scToText = TypedText.spellSpecialWords(lastWord);
    if (scToText != lastWord) {
        suggestion.innerHTML = `<span class="default">${scToText}</span>`;
        suggestion.style = "display: true";
        return;
    }

    // Process telex input method
    let lastChar = String.fromCharCode(c1);
    lastChar = event.code === "backspace" ? null 
        : lastWord.slice(-1) === lastChar ? lastChar : null;
    // console.log('lastChar',lastChar, lastWord.slice(-1), String.fromCharCode(c1));
    if (c2 != 32 && c2 != 160 && lastChar && 
        (true || "dsfrxj aeow".includes(lastChar) || c1 === 160)) {
        let newWord = VnHelpers.telexifyWord(lastWord);
        // console.log('TELEX:',lastWord,'=>',newWord);
        if (newWord !== lastWord) {
            newl = l.substr(0,l.length - lastWord.length) + newWord;
            p.firstChild.textContent = newl + r;
            CursorHelpers.collapse(s, p.firstChild, 
                CursorHelpers.setLastCursorFast(newl.length));
            l = newl;
        }
    }

    // console.log(c1,c2,prevC);
    // Skip bi,tri-gram checking if not from a-z
    if (c1 < 97 || c1 > 122) { return; }

    // Need at least two words to match to bi,tri-grams
    if (triWords.length <= 1) {
        return;
    }
    gram = triWords.join(" ").toLowerCase();
    gram = VnHelpers.removeMarks(gram);
    matched = _mappings[gram];

    // console.log(triWords, gram, matched);
    // 3-gram don't match => try bi-gram
    if (!matched && triWords.length > 2) {
        triWords.shift();
        gram = triWords.join(" ").toLowerCase();
        gram = VnHelpers.removeMarks(gram);
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
                okok(triWords[1], mWords[1]) &&
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
            if (VnHelpers.removeMarks(lastWord) !== lastWord) {
                // console.log('len la len', www);
                matches = matches.filter(m => m !== www);
                matches.unshift(www);
                ww = null;
            }
            matches.forEach((m, i)=> {
                htmls.push(`<sub>${i+1}.</sub> <span class="${i==0?"default":""}">${m}</span>`);
            });
            if (ww != null) { 
                htmls.push("<sub>0.</sub> " + triWords.join(" "));
            }
            suggestionRegex = new RegExp(`${triWords.join("\\s+")}`);
            // console.log(suggestionRegex);
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
    let w0 = VnHelpers.removeMarks(w1);
    if (w0 == VnHelpers.removeMarks(w2)) return true;
    return false;
}