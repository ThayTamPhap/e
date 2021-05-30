import { _keys_map } from "./vn_keys_map.js"
import { _mappings } from "./vn_mappings.js"

export const VN_PHRASE_BREAK_REGEX = /[^\sqwertyuiopasdfghjklzxcvbnmàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+/gi;

var keysMap = {};

const keysMapRegex = new RegExp('(?:' + 
_keys_map.split("\n").map(x => {

  let splits = x.split(/_+/);
  let k = splits[0];
  let v = splits[1];
  keysMap[k] = v;

  return k;
}).slice(1,).join("|")+')(?=$)', 'i'); // need to match end of string
// console.log(keysMap, keysMapRegex);

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
        value = value.replace(gram, "").replace("||","|").replace(/\|$/,"");
        if (value.length === 0) {
            _mappings[key] = gram;
        } else {    
            _mappings[key] = gram + "|" + value;
        }
            
    } else {
         value = value ? gram + "|" + value : gram;
         value.replace(/\|$/,"");
         _mappings[key] = value;
        // console.log(_mappings[key]);
    }
}

export function mapKeys(sent) {
  return sent.replace(keysMapRegex, k => {
    let v = keysMap[k.toLowerCase()];
    console.log(`\n!! mapKeys: '${k}' => '${v}'`);
    return v ?? k;
  });
}
assertEqual(mapKeys(' nx'), ' những');
assertEqual(mapKeys('nx'), 'nx');
assertEqual(mapKeys('nx '), 'nx ');

/* 
let vowelsMap = {
    "aa":"â", "aw":"ă", 
    "ee":"ê", 
    "oo":"ô", "ow":"ơ",
    "uw":"ư", 
    "ww":"ư",
}
for (var k in vowelsMap) {
    vowelsMap[k[0].toUpperCase()+k[1]] = vowelsMap[k].toUpperCase();
    vowelsMap[k[0]+k[1].toUpperCase()] = vowelsMap[k].toUpperCase();
}
*/

let tonesMap = {
    "as":"á", "af":"à", "ax":"ã", "ar":"ả", "aj":"ạ",
    "âs":"ấ", "âf":"ầ", "âx":"ẫ", "âr":"ẩ", "âj":"ậ",
    "ăs":"ắ", "âf":"ằ", "ăx":"ẵ", "ăr":"ẳ", "ăj":"ặ",
    "es":"é", "ef":"è", "ex":"ẽ", "er":"ẻ", "ej":"ẹ",
    "ês":"ế", "êf":"ề", "êx":"ễ", "êr":"ể", "êj":"ệ",
    "os":"ó", "of":"ò", "ox":"õ", "or":"ỏ", "oj":"ọ",
    "ôs":"ố", "ôf":"ồ", "ôx":"ỗ", "ôr":"ổ", "ôj":"ộ",
    "ơs":"ớ", "ơf":"ờ", "ơx":"ỡ", "ơr":"ở", "ơj":"ợ",
    "us":"ú", "uf":"ù", "ux":"ũ", "ur":"ủ", "uj":"ụ",
    "ưs":"ứ", "ưf":"ừ", "ưx":"ữ", "ưr":"ử", "ưj":"ự",
    "is":"í", "if":"ì", "ix":"ĩ", "ir":"ỉ", "ij":"ị",
    "ys":"ý", "yf":"ỳ", "yx":"ỹ", "yr":"ỷ", "yj":"ỵ",
};
// window.tonesMap = tonesMap;
for (var k in tonesMap) {
    tonesMap[k[0].toUpperCase()+k[1]] = tonesMap[k].toUpperCase();
}

const _syllLeft = /(^|qu|[qrtsdđghklxcvbnm]+)((?:uy|u|ư|i)?[aăâeêuưoơôiy])(.*)/i;

export function changeTone(s, tone) {
    let ss = _removeTone(s);
    if (tone === 'z')return ss;

    let sss, m = ss.match(_syllLeft);
    // console.log(3, m[1], m[2], m[3]);

    if (m[2].length === 2 && m[2][1] === "a") {
        sss = m[1] + 
              tonesMap[m[2][0]+tone] + m[2][1] + 
              m[3];

    } else {
        sss = m[1] + 
              m[2].slice(0, -1) + tonesMap[m[2].slice(-1)+tone] + 
              m[3];
    }

    // same tone will clear tone & return tone char
    return sss !== s ? sss : ss + tone;
}
assertEqual(changeTone("quá","f"), "quà");
assertEqual(changeTone("cua","f"), "cùa");
assertEqual(changeTone("cửa","j"), "cựa");
assertEqual(changeTone("tuyền","x"), "tuyễn");
assertEqual(changeTone("tuyền","f"), "tuyênf");
assertEqual(changeTone("thuổng","s"), "thuống");
assertEqual(changeTone("kiếm","j"), "kiệm");
assertEqual(changeTone("kiếm","z"), "kiêm");
assertEqual(changeTone("khuâng","r"), "khuẩng");
assertEqual(changeTone("ươi","f"),"ười");
assertEqual(changeTone("vit","j"),"vịt");
assertEqual(changeTone("khong","f"),"khòng");

function _removeTone(s) {
    return s.
        replace(/[àáạảã]/g , "a").
        replace(/[âầấậẩẫ]/g, "â").
        replace(/[ăằắặẳẵ]/g, "ă").
        replace(/[èéẹẻẽ]/g , "e").
        replace(/[êềếệểễ]/g, "ê").
        replace(/[òóọỏõ]/g,  "o").
        replace(/[ôồốộổỗ]/g, "ô").
        replace(/[ơờớợởỡ]/g, "ơ").
        replace(/[ùúụủũ]/g,  "u").
        replace(/[ưừứựửữ]/g, "ư").
        replace(/[ìíịỉĩ]/g,  "i").
        replace(/[ỳýỵỷỹ]/g,  "y");
}

// https://kipalog.com/posts/Mot-so-ki-thuat-xu-li-tieng-Viet-trong-Javascript
export function removeVienameseMarks(str) {
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
