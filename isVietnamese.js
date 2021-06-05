import {_removeTone, _getTone} as VnHelpers from "./vn_helpers.js"

const _syllNoTone = /^(tr|th|ph|ng|ngh|nh|kh|gh|gi|ch|[bckqdđghlmnprstvx])?(uy|uâ|uê|ue|uyê|uya|oa|oă|oe|oo|iê|ia|yê|ươ|ưa|uô|ua|[iyeêưuoôơaăâ])(nh|ng|ch|[ctpmniyuo])?$/i;

export function isVietnamese(syllable) {
    let s = VnHelpers._removeTone(syllable);
    let tone = VnHelpers._getTone(syllable);
    let m = s.match(_syllNoTone);

    // console.log('isVietnamese', syllable, s, m, tone);

    if (!m) { return false; }

    let amDau = m[1];
    let amGiua = m[2];
    let amCuoi = m[3];
    let coAmDem = /^o[oaăe]|u[yeêơâ]$/i.test(amGiua.slice(0,2));
    let amDem = !coAmDem ? null : amGiua[0];
    let nguyenAm = !coAmDem ? amGiua : amGiua.slice(1,);
    let coNguyenAmDiVoiK = /[eê]|i[êa]/.test(nguyenAm);

    /*
    https://hoatieu.vn/quy-tac-chinh-ta-phan-biet-l-n-ch-tr-x-s-gi-d-c-q-k-i-y-163648#mcetoc_1d9bloqng0
    
    5- Quy tắc viết phụ âm đầu “cờ”:
    Âm đầu “cờ” được ghi bằng các chữ cái c, k, q.
    – Viết q trước các vần có âm đệm ghi bằng chữ cái u.
    – Viết k trước các nguyên âm e, ê, i (iê, ia)
    – Viết c trước các nguyên âm khác còn lại.
    /* */

    if (amDau === "q" && amDem !== "u") return false;
    if (amDau === "k" && !coNguyenAmDiVoiK) return false;
    if (amDau === "c" && coNguyenAmDiVoiK) return false;

    // – Viết gh, ngh trước các nguyên âm e, ê, i, iê (ia).
    // – Viết g, ng trước các nguyên âm khác còn lại.
    if (amDau === "gh" && !coNguyenAmDiVoiK) return false;
    if (amDau === "g" && coNguyenAmDiVoiK) return false;
    if (amDau === "ngh" && !coNguyenAmDiVoiK) return false;
    if (amDau === "ng" && coNguyenAmDiVoiK) return false;

    /*
    https://vietnamnet.vn/vn/giao-duc/hien-tuong-tu-vung-tieng-viet-am-dau-d-gi-244065.html
    
    - Âm đầu “gi” không bao giờ kết hợp với âm đệm, tức là không đứng trước các vần oa, oă, uâ, uê, uy, nên khi gặp những vần nay thì viết “d” như doạ nạt, nổi dóa, hậu duệ, vô duyên, kiểm duyệt, duy trì…

    ý kiến của GS.TS Đoàn Thiện Thuật (1999, Ngữ âm tiếng Việt): “Cách ghi D và GI khác nhau trong những từ cụ thể, không thể đúc rút thành quy luật chính tả được vì nó là vấn đề từ vựng học và có lí do lịch sử của nó. Những từ được ghi bằng D có lẽ vào thời kì chữ quốc ngữ được xây dựng có cách phát âm khác với những từ được ghi bằng GI ở bộ phận âm đầu. Những từ được ghi bằng GI như gia, giang, giáo… thường là những từ Hán Việt và theo cách phát âm cổ của chúng trước kia...”
    /* */

    if (amDau === "gi" && coAmDem) return false;

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
    if (coAmDem) {
        // ...
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
assertEqual(isVietnamese( "yêu"), true);
assertEqual(isVietnamese( "yê"), false);
assertEqual(isVietnamese("tyêu"), false);
assertEqual(isVietnamese("ỉa"), true);
assertEqual(isVietnamese("ỉam"), false);

"gioạ,gióa,giuệ,giuyên,giuyệt,giuy".split(",").forEach(x => {
    assertEqual(isVietnamese(x), false);
    assertEqual(isVietnamese(x.replace("gi","d")), true);
});
