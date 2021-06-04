import { _mappings } from "./vn_mappings.js"

const WORD_VALID_CHARS = "1234567890qwertyuiopasdfghjklzxcvbnmàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđQWERTYUIOPASDFGHJKLZXCVBNMÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ";

export const PHRASE_VALID_CHARS = WORD_VALID_CHARS + " ";

export const VN_PHRASE_BREAK_REGEX = /[^\sqwertyuiopasdfghjklzxcvbnmàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+/gi;

const VN_SYLLABLE_REGEX = /[qwertyuiopasdfghjklzxcvbnmàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+/gi;

const _syllLeft = /(^|qu|gi|[qrtpsdđghklxcvbnm]+)((?:uy|u|o|ư|i|y)?[aăâeêuưoơôiy])(.*)/i;
const _syllNoTone = /^(tr|th|ph|ng|ngh|nh|kh|gh|gi|ch|[bckqdđghlmnprstvx])?(uy|uâ|uê|ue|uyê|uya|oa|oă|oe|oo|iê|ia|yê|ươ|ưa|uô|ua|[iyeêưuoôơaăâ])(nh|ng|ch|[ctpmniyuo])?$/i;

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

export function isVietnamese(syllable) {
    let s = _removeTone(syllable);
    let tone = _getTone(syllable);
    let m = s.match(_syllNoTone);

    console.log('isVietnamese', syllable, s, m, tone);

    if (!m) { return false; }

    let amDau = m[1];
    let amGiua = m[2];
    let amCuoi = m[3];

    /*
    – Âm đệm được ghi bằng con chữ u và o.
    + Ghi bằng con chữ o khi đứng trước các nguyên âm: a, ă, e.
    + Ghi bằng con chữ u khi đứng trước các nguyên âm y, ê, ơ, â.
    + Quét ?? Âm đệm u đi với e?

    – Âm đệm không xuất hiện sau các phụ âm b, m, v, ph, n, r, g. Trừ các trường hợp:
    + sau ph, b: thùng phuy, voan, ô tô buýt (là từ nước ngoài)
    + sau n: thê noa, noãn sào (2 từ Hán Việt)
    + sau r: roàn roạt (1 từ)
    + sau g: goá (1 từ)
    /* */
    let coAmDem = "oa,oă,oe;y,ue,uê,uơ,uâ".includes(amGiua.slice(0,2));
    if (coAmDem) {

    }
    
    /* Âm chính là nguyên âm đôi */
    // {ia} trước không có âm đệm, sau không có âm cuối. VD: t{ia}, {ỉa}
    if (amGiua === "ia" && amCuoi) return false;

    // {yê} trước có âm đệm, sau có âm cuối. VD: chu{yê}n, hu{yế}t
    if (amGiua === "uyê" && !(amDau && amCuoi)) return false;

    // {yê} trước không có âm nào, sau có âm cuối. VD: {yê}u
    if (amGiua === "yê" && !(!amDau && amCuoi)) return false;

    // {ya} trước có âm đệm, sau không có âm cuối. VD: khu{ya}
    if (amGiua === "uya" && !amCuoi) return false;

    // {iê} trước có phụ âm đầu, sau có âm cuối. VD: t{iê}n, k{iế}ng
    if (amGiua === "iê" && !(amDau && amCuoi)) return false;

    // {ươ} sau có âm cuối. VD: mượn
    if (amGiua === "ươ" && !amCuoi) return false;

    // {ưa} sau không có âm cuối. VD: ưa
    if (amGiua === "ưa" && amCuoi) return false;

    // {uô} sau có âm cuối. VD: muốn
    if (amGiua === "uô" && !amCuoi) return false;

    // {ua} sau không có âm cuối. VD: mua
    if (amGiua === "ua" && amCuoi) return false;

    /* Các âm cuối c,ch,t,p chỉ đi với thanh s, j */
    if (amCuoi && "c,ch,t,p".includes(amCuoi) 
        && !(tone === "s" || tone === "j")) return false;

    return true;
}
assertEqual(isVietnamese("của"), true);
assertEqual(isVietnamese("huyết"), true);
assertEqual(isVietnamese("huyêt"), false);
assertEqual(isVietnamese("boong"), true);
assertEqual(isVietnamese("niềm"), true);
assertEqual(isVietnamese("iềm"), false);
assertEqual(isVietnamese("iề"), false);
assertEqual(isVietnamese( "yêu"),true);
assertEqual(isVietnamese( "yê"),false);
assertEqual(isVietnamese("tyêu"),false);
assertEqual(isVietnamese("tyêu"),false);
assertEqual(isVietnamese("ỉa"), true);
assertEqual(isVietnamese("ỉam"), false);

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

    let isVnSyllable = isVietnamese(neww);
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