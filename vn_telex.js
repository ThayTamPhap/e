import { _isVietnamese, _removeTone, _getTone } from "./vn_syllable.js"
import { WORD_VALID_CHARS, VN_PHRASE_BREAK_REGEX } from "./vn_grams.js"

const _syllLeft = /(^|qu|gi|[qrtpsdđghklxcvbnm]+)((?:uy|u|o|ư|i|y)?[aăâeêuưoơôiy])(.*)/i;

const tonesMap = {
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

const vowelsMap = {
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
    if (mark === "z") { return naked; }

    // console.log('changeMark:', s, tone, naked, mark);

    let m = naked.match(_syllLeft);
    if (!m) { return s + mark; }

    // Invalid mark general checking
    if (mark !== "w" && !m[2].includes(mark)) {
        return s + mark;
    }

    // console.log(3, m[1], m[2], m[3]);

    var news, vowel;

    if (m[2].length === 2 && (false 
            // trường hợp u, o không phải âm đệm mà là âm chính
            || (m[2] === "ui") // cui+w
            || (m[2] === "ua" && mark !== "a") // cua+w, not cua+a
            || (m[2] === "oi") // hoi+o
        )) {
    
        vowel = m[2][0];
        vowel = vowelsMap[ vowel + mark ] ?? vowel;
        vowel = tonesMap[ vowel + tone ] ?? vowel;
        news = m[1] + vowel + m[2][1] + m[3];

        // console.log('Vowel 2:', m[2], vowel);

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


export function telexifyLastWord(sent) {
    if (isMobileDevice) { return sent; }

    // console.log("telexifyLastWord", sent);
    if (sent.length < 2) { return sent; }

    let e = sent.length - 1;
    while (e > 0 && !WORD_VALID_CHARS.includes(sent[e])) { e--; }
    if (e === 0) { return sent; }

    let b = e - 1;
    while (b >= 0 && WORD_VALID_CHARS.includes(sent[b])) { b--; }

    let lastWord = sent.substr(b + 1, e - b);
    let newLastWord = telexifyWord(lastWord);
    
    // console.log("telexifyLastWord", lastWord, newLastWord);

    return sent.substr(0, b + 1) + newLastWord + sent.substr(e + 1);
}
assertEqual(telexifyLastWord("fdg, huyetes . "), "fdg, huyết . ");


export function telexifyWord(w) {
    if (isMobileDevice) { return w; }

    if (w.match(VN_PHRASE_BREAK_REGEX)) { return w; }
    let neww = w[0], i = 1, n = w.length, c;
    for (; i < n; i++) {
        c = w[i];
        if ("sfrxj".includes(c)) {
            neww = changeTone(neww, c);
        } else if ("daeow".includes(c)) {
            neww = changeMark(neww, c);
        } else {
            neww += c;
        }
    }

    let isVnSyllable = _isVietnamese(neww);
    console.log('Telexify:', w, neww, isVnSyllable);
    return  isVnSyllable ? 
        changeTone(_removeTone(neww),_getTone(neww)) : w;
}

assertEqual(telexifyWord("quets"), "quét");
assertEqual(telexifyWord("huyetes"), "huyết");
assertEqual(telexifyWord("tòan"), "toàn");
assertEqual(telexifyWord("nièem"), "niềm");
assertEqual(telexifyWord("dadwngaf"), "đầng");
assertEqual(telexifyWord("nhieefu"), "nhiều");

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


assertEqual(changeMark("ngoi","o"), "ngôi");
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
