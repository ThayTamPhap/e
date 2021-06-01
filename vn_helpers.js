import { _mappings } from "./vn_mappings.js"

export const VN_PHRASE_BREAK_REGEX = /[^\sqwertyuiopasdfghjklzxcvbnmàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+/gi;
const VN_SYLLABLE_REGEX = /[qwertyuiopasdfghjklzxcvbnmàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+/gi;

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
    let key = removeMarks(gram);
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

 
let vowelsMap = {
    "aa":"â", "aw":"ă", 
    "ee":"ê", 
    "oo":"ô", "ow":"ơ",
    "uw":"ư", 
}
for (var k in vowelsMap) {
    vowelsMap[k[0]+k[1].toUpperCase()] = vowelsMap[k];
    vowelsMap[k[0].toUpperCase()+k[1]] = vowelsMap[k].toUpperCase();
    vowelsMap[k.toUpperCase()] = vowelsMap[k].toUpperCase();
}

const _syllLeft = /(^|qu|gi|[qrtpsdđghklxcvbnm]+)((?:uy|u|o|ư|i|y)?[aăâeêuưoơôiy])(.*)/i;
const _syllFull = /^(tr|ng|ngh|[cgknpt]h|[bckqdđghlmnprstvx])?([uo])?(iê|ia|yê|ươ|ưa|uô|ua|[ieêưuoôơaăâ])?(nh|ng|ch|[ptcmniyuo])?$/i;

let tonesMap = {
    "as":"á", "af":"à", "ax":"ã", "ar":"ả", "aj":"ạ",
    "âs":"ấ", "âf":"ầ", "âx":"ẫ", "âr":"ẩ", "âj":"ậ",
    "ăs":"ắ", "ăf":"ằ", "ăx":"ẵ", "ăr":"ẳ", "ăj":"ặ",
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

export function changeTone(s, tone) {
    // console.log(s, tone);
    let ss = _removeTone(s);
    if (tone === 'z')return ss;

    let sss, m = ss.match(_syllLeft);
    if (!m) return s + tone;
    // console.log(3, m[1], m[2], m[3]);
    if (m[2].length === 2 && "aiyu".includes(m[2][1]) 
        && m[3].length === 0) {
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
assertEqual(changeTone("gia","s"),"giá");
assertEqual(changeTone("cưu","s"),"cứu");
assertEqual(changeTone("phai","r"), "phải");
assertEqual(changeTone("hoan","f"), "hoàn");
assertEqual(changeTone("nui","s"), "núi");
assertEqual(changeTone("quá","f"), "quà");
assertEqual(changeTone("cua","f"), "cùa");
assertEqual(changeTone("cửa","j"), "cựa");
assertEqual(changeTone("luấ","j"), "luậ");
assertEqual(changeTone("tuyền","x"), "tuyễn");
assertEqual(changeTone("tuyền","f"), "tuyênf");
assertEqual(changeTone("thuổng","s"), "thuống");
assertEqual(changeTone("kiếm","j"), "kiệm");
assertEqual(changeTone("thươngx","x"), "thưỡngx");
assertEqual(changeTone("kiếm","z"), "kiêm");
assertEqual(changeTone("ươ","r"), "ưở");
assertEqual(changeTone("khuâng","r"), "khuẩng");
assertEqual(changeTone("ươi","f"),"ười");
assertEqual(changeTone("vit","j"),"vịt");
assertEqual(changeTone("khong","f"),"khòng");
assertEqual(changeTone("răng","f"),"rằng");


export function changeMark(s, mark) {
    if (mark === 'd') {
        if (s[0] == 'd') return 'đ' + s.slice(1,);
        if (s[0] == 'D') return 'Đ' + s.slice(1,);
        return s + mark;
    }
    let tone = _getTone(s);
    let unTone = _removeTone(s);

    if (!"oaewz".includes(mark)) {
        return changeTone(unTone + mark, tone);
    }

    let naked = removeMarks(unTone, 'keep đ/Đ');
    if (mark === "z") return naked;

    // console.log('changeMark:', s, tone, naked, mark); 

    let m = naked.match(_syllLeft);
    if (!m) return s + mark;

    // console.log(3, m[1], m[2], m[3]);

    if (mark !== "w" && mark !== removeMarks(m[2].slice(-1))) 
        return s + mark;

    var news, vowel;

    if (m[2].length === 2 && m[2][1] === "a" //  ua
            && mark !== "a" && !(mark === "w" && m[2][0] === "o")) { 
            // cửa+a=cuẩ hoa+w=hoă

        vowel = m[2][0];
        vowel = vowelsMap[ vowel + mark ] ?? vowel;
        vowel = tonesMap[ vowel + tone ] ?? vowel;
        news = m[1] + vowel + m[2][1] + m[3];

    } else if (m[2].toLowerCase() === "uo" && mark === "w") {

        vowel = (m[2][0]==='u' ? 'ư' : 'Ư') + 'ơ';
        vowel = changeTone(vowel, tone);
        news = m[1] + vowel + m[3];

    } else {
        
        vowel = m[2].slice(-1);
        vowel = vowelsMap[ vowel + mark ] ?? vowel;
        vowel = tonesMap[ vowel + tone ] ?? vowel;
        news = m[1] + m[2].slice(0, -1) + vowel + m[3];
    }

    return news !== s ? news : changeTone(naked, tone) + mark;
}
assertEqual(changeMark("hoa","w"), "hoă");
assertEqual(changeMark("xòa","i"), "xoài");
assertEqual(changeMark("dể","d"), "để");
assertEqual(changeMark("da","d"), "đa");
assertEqual(changeMark("ye","e"), "yê");
assertEqual(changeMark("đu","o"), "đuo");
assertEqual(changeMark("à","o"), "ào");
assertEqual(changeMark("a","a"), "â");
assertEqual(changeMark("a","w"), "ă");
assertEqual(changeMark("quá","a"), "quấ");
assertEqual(changeMark("cua","w"), "cưa");
assertEqual(changeMark("cửa","a"), "cuẩ");
assertEqual(changeMark("tuyền","e"), "tuyène");
assertEqual(changeMark("thuổng","w"), "thưởng");
assertEqual(changeMark("thuổng","z"), "thuong");
assertEqual(changeMark("kiếm","e"), "kiéme");
assertEqual(changeMark("thương","o"), "thuông");
assertEqual(changeMark("kiếm","z"), "kiem");
assertEqual(changeMark("khuang","w"), "khưang");
assertEqual(changeMark("ươi","w"),"uoiw");
assertEqual(changeMark("khong","o"),"không");


function _getTone(s) {
    if (s.match(/á|ắ|ấ|ó|ớ|ố|ú|ứ|é|ế|í|ý/i)) return 's';
    if (s.match(/à|ằ|ầ|ò|ờ|ồ|ù|ừ|è|ề|ì|ỳ/i)) return 'f';
    if (s.match(/ả|ẳ|ẩ|ỏ|ở|ổ|ủ|ử|ẻ|ể|ỉ|ỷ/i)) return 'r';
    if (s.match(/ã|ẵ|ẫ|õ|ỡ|ỗ|ũ|ữ|ẽ|ễ|ĩ|ỹ/i)) return 'x';
    if (s.match(/ạ|ặ|ậ|ọ|ợ|ộ|ụ|ự|ẹ|ệ|ị|ỵ/i)) return 'j';
    return 'z';
}
assertEqual(_getTone("an"),"z");
assertEqual(_getTone("ẩn"),"r");

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

export function telexFinalizeStr(s) {
    return s.replace(VN_SYLLABLE_REGEX, w => telexFinalizeWord(w));
}

export function telexFinalizeWord(w) {
    if (w.match(VN_PHRASE_BREAK_REGEX)) { return w; }
    let neww = w[0], i = 1, n = w.length, c;
    for (; i < n; i++) {
        c = w[i];
        if ("sfrxj".includes(c)) {
            neww = changeTone(neww, c);
        } else if ("daeowiyu".includes(c)) {
            neww = changeMark(neww, c);
        } else {
            neww += c;
        }
    }
    if ("sfrxj".includes(w.slice(-1))) {
        return neww;
    }

    let newNoTone = _removeTone(neww);
    let matchNoTone = newNoTone.match(_syllFull);
    // console.log('FinalizeWord', w, neww, newNoTone, matchNoTone);
    return  matchNoTone ? neww : w;
}
assertEqual(telexFinalizeWord("nièem"), "niềm");
assertEqual(telexFinalizeWord("dadwngaf"), "đầng");
assertEqual(telexFinalizeWord("nhieefu"), "nhiều");
assertEqual(telexFinalizeStr("tonos mooj khôngr"), "tốn mộ khổng");

export function removeMarks(str, keepDd=false) {
    // https://kipalog.com/posts/Mot-so-ki-thuat-xu-li-tieng-Viet-trong-Javascript
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    if (!keepDd) {
        str = str.replace(/đ/g, "d");
        str = str.replace(/Đ/g, "D");
    }
    return str;
}
