import { _shortcuts } from "./shortcuts.js"

const SPECIAL_WORDS_REGEX = /(\d+%?)([^\d%|]|$)/g;

/* 
?= is a positive lookahead
https://stackoverflow.com/questions/1570896/what-does-mean-in-a-regular-expression

"αβ αβγ γαβ αβ αβ".replace(/(^|\s)αβ(?=\s|$)/g, "$1AB")
https://stackoverflow.com/questions/2881445/utf-8-word-boundary-regex-in-javascript
The word boundary assertion does only match if a word character is not preceded 
or followed by another word character (so .\b. is equal to \W\w and \w\W). 
And \w is defined as [A-Za-z0-9_]. So \w doesn’t match greek characters.
*/

export var typingShortcuts = {};
export var suffixShortcuts = {};

const typingShortcutsRegex = new RegExp('(^|\\s)(?:' + 
_shortcuts.split("\n").map(x => {

  let splits = x.split(/^(\S+)\s+/); // console.log(splits);
  if (splits.length < 2) return "-=-=-"; // any nonsense string

  let k = splits[1];
  let v = splits[2];
  
  if (typingShortcuts[k]) { 
    console.log("\n\n!!! WARNING", k, "shortcut is duplicated.\n\n"); 
  }

  if (k.length > 2) {
    _addToSuffixShortcuts(k.slice(0,-1), k);
    _addToSuffixShortcuts(k[0] + k[2], k);
    if  (k.length > 3) {
      _addToSuffixShortcuts(k[0] + k[3], k);
    }
  } else if (k.length === 2) {
    _addToSuffixShortcuts(k[0], k);
  }

  typingShortcuts[k] = v;  
  return k.replace("?", "\\?").replace(".", "\\.");

}).slice(1,).join("|")+')(?=[\\s!?.,;:|\\]})])', 'gi'); 

function _addToSuffixShortcuts(k, v) {
    suffixShortcuts[k] = suffixShortcuts[k] ?? [];
    if (!suffixShortcuts[k].includes(v)) {
      suffixShortcuts[k].push(v); 
    }  
}

window.normalizeText = normalizeText; // Hack: make it available in storage.js
export function normalizeText(value, completeSent=true) {
  value = value.replace("...","…").replace(" \""," “").replace("\" ","”");
  value = value.replace(/[ ]/," ")

  value = convertShortcuts(value, completeSent);
  value = spellSpecialWords(value);

  value = value.replace(/[[{(]\s+/g, x => " "+x.replace(/\s+/g,""));
  value = value.replace(/\s+[\]})\,\.;:?\!…]/g, x => x.replace(/\s+/g,"")+" ");
  value = value.replace(/\s+[\]})\,\.;:?\!…]/g, x => x.replace(/\s+/g,"")+" ");

  // "g g.  hom \nay") === "G g. Hom \Nay"
  value = value.replace(/[.?!\\/]\s*\S/g, x => 
      x.substr(0,x.length-1)+x[x.length-1].toUpperCase());

  // Strip begin, and end spacings
  let repStr = completeSent ? "" : " ";
  value = value.replace(/^\s+/, repStr).replace(/\s+$/, repStr);
   // and strim in-between spacings
  value = value.replace(/\s+/g," ");

  return value;
}
assertEqual(normalizeText("x .  x , x : x ] x } x )  x  …  x !  x ?  ") ,  "x. X, x: x] x} x) x… x! X?");
assertEqual(normalizeText("g g.  hom nay") ,  "g g. Hom nay");
assertEqual(normalizeText("  d  . ", false), " d. ");
assertEqual(normalizeText("  d { d f   fd !}  d ,   f .  Hk? "), "d {d f fd!} d, f. Hiểu không?");


export function spellSpecialWords(txt) {
  // e.g: 100 or 100% not end with |
  return txt.replace(SPECIAL_WORDS_REGEX, function (x) {
    var md, m = x.match(/(\d+%?)([^\d%\|]|$)/);
    // console.log(txt, x, m);
    // Just return 0-9,10
    if (m[1].match(/^(\d|10)$/)) return x;
    
    if (md = m[1].match(/^(\d+)%$/))
      return `|${spellNumber(md[1])} phần trăm|${m[1]}|${m[2]}`;
    
    // Default is number
    return `|${spellNumber(m[1])}|${m[1]}|${m[2]}`;
  });
} 
assertEqual(spellSpecialWords("100%|") ,  "100%|");
assertEqual(spellSpecialWords("100%") ,  "|một trăm phần trăm|100%|");
assertEqual(spellSpecialWords("10") ,  "10");
assertEqual(spellSpecialWords("10|") ,  "10|");
assertEqual(spellSpecialWords("15q") ,  "|mười lăm|15|q");
assertEqual(spellSpecialWords("12") ,  "|mười hai|12|");


function spellNumber(x) {
  // console.log(`spellNumber "${x}"`)
  var prefix, md, mdd;
  // xxxx
  if (md = x.match(/^(\d)(\d\d\d)$/)) {
    prefix = `${spellNumber(md[1])} nghìn`;

    if (md[2] == '000') {
      return prefix;
    }

    return `${prefix} ${spellNumber(md[2])}`
  }

  // xxx
  if (md = x.match(/^(\d)(\d\d)$/)) {
    prefix = `${spellNumber(md[1])} trăm`;

    if (md[2] == '00') {
      return prefix;
    }

    if (mdd = md[2].match(/^0(\d)$/)) {
        return `${prefix} lẻ ${spellNumber(mdd[1])}`;
    }

    return `${prefix} ${spellNumber(md[2])}`
  }

  // xx
  if (md = x.match(/^(\d)(\d)$/)) {
    if (x == '10') {
      return 'mười';
    }

    // 1x => mười x (11,11,..,19)
    // 2x => 2 x (2x,..,9x)
    prefix = md[1] == '1' ? 'mười' : spellNumber(md[1]);

    switch (md[2]) {
      case '0': return `${prefix} mươi`;
      case '4': return `${prefix} tư`;
      case '5': return `${prefix} lăm`;
      default:  return `${prefix} ${spellNumber(md[2])}`;
    }
  }

  // x
  switch (x) {
    case '0': return `không`;
    case '1': return `một`;
    case '2': return `hai`;
    case '3': return `ba`;
    case '4': return `bốn`;
    case '5': return `năm`;
    case '6': return `sáu`;
    case '7': return `bảy`;
    case '8': return `tám`;
    case '9': return `chín`;
  }
}
assertEqual(spellNumber("15") ,  "mười lăm");
assertEqual(spellNumber("12") ,  "mười hai");
assertEqual(spellNumber("102") ,  "một trăm lẻ hai");
assertEqual(spellNumber("1004") ,  "một nghìn không trăm lẻ bốn");


function convertShortcuts(txt, completeSent=true) {
  
  if (completeSent) { txt = (txt + " "); }

  txt = txt.replace(typingShortcutsRegex, x => {
    var splits = x.split(/(\s?)(.+)/);
    // console.log("Found:", x, splits);
    let k = splits[2], md;
    let v = typingShortcuts[k.toLowerCase()];
    if (md = k.match(/(^\d+)[a-z]+?/)) { 
      k = k.replace(/^\d+/, "\\d+");
      v = typingShortcuts[k].replace("\\d+", md[1]);
    }
    // console.log(k, '=>', v); // k: 323d
    return splits[1] + (k[0]===k[0].toLowerCase() ? v 
      : v[0].toUpperCase() + v.substr(1,));
  });

  return completeSent ? txt.slice(0, txt.length - 1) : txt;
}
assertEqual(convertShortcuts('Byg',false), 'Byg');
assertEqual(convertShortcuts('byg'), 'bây giờ');
assertEqual(convertShortcuts('323d'), '323 ngày');
assertEqual(convertShortcuts('Byg chúng ta nc về nx cng đang ở đây'),
  'Bây giờ chúng ta nước về những con người đang ở đây');