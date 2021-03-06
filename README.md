# Vietnamese Syllables

## Dùng wasm để mã hoá và và giải mã âm tiết tiếng Việt

### Một cách mã hoá khác là dùng ngay ký tự a-y làm từ điển để lưu mã telex

không  => khoong
khuyến => khuyeens
thường => thuowngf

Một âm tiết ko dấu dùng tối đa 8 ký tự a-y.
Cần 4-bits để mã hoá 25 chữ cái a-z
=> 4 x 8 = 32-bits để mã hoá 1 syllable

Vì đằng nào khi lưu trữ ở json hoặc js ko thể xài binary nên cần làm tròn 17-bits thành 32-bits để lưu trữ.

### Nhỏ nhất là bẻ syllable thành 4 phần âm đầu, âm giữa, âm cuối và thanh điệu. Lưu 4 từ điển nhỏ của 4 phần đó, mapping từng phần rồi ghép lại

Phần code để giải mã lưu trong wasm luôn

Mỗi âm tiết TV viết thường, có dấu, sau khi tách làm 4 phần cần 17-bits để lưu. Làm tròn thành 32-bits (int32) sẽ dư ra 15-bits, có thể dùng để mã hoá thêm các thông tin phụ như chữ cái nào viết hoa hay viết thường vì âm tiết dài nhất trong TV chỉ có khoảng 6 chữ cái thôi. Còn dư thêm 9 bits để làm trò gì đó nữa.

### Nhanh, dễ nhất là dùng dict để map syllable thành int32, và map int32 thành syllables

```js
indexToSyllable = ["s1", "s2"];
syllableToIndex = {"s1":0, "s2":1}; // dựng lại từ indexToSyllable
```

Để mã hoá thì ẩn vào wasm binary code
https://www.assemblyscript.org/stdlib/map.html
```ts
var indexToSyllable = new Array<string>(3200)
var syllableToIndex = new Map<string,i32>() // dựng lại từ indexToSyllable
...
```
 
[ SKIP ]

Phức tạp ko cần thiết trong khi độ ứng dụng ko cao.
- Phải lưu bi,tri-gram ko dấu, bi-tri-gram có dấu
- Phải viết hàm mã hoá, hàm giải mã cho syllable ko dấu, syllable có dấu

## Dùng JavaScript ArrayBuffer để mã hoá n-grams

```js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer

// one byte = 8 bit => 17 bits need 3 bytes
let vnSyllable = new ArrayBuffer(3);

// => 4 syllables need 12 bytes
// 12 bytes * 8 (bits / bytes) = 96 bits
// 96 bits / 32 (bits / Uint32) = 3 Uint32

// 3 syllables need 9 bytes
let vn3Gram = new ArrayBuffer(9);
vn3Gram.byteLength

const sylls = new DataView(vn3Gram);
const syll0 = new DataView(vn3Gram, 0, 3); // from byte 0-2
const syll1 = new DataView(vn3Gram, 3, 3); // from byte 3-5
const syll2 = new DataView(vn3Gram, 6, 3); // from byte 6-8

// let vn4Gram = new ArrayBuffer(12);
// const syll3 = new DataView(vn4Gram, 9, 3); // from byte 9-11
// let x = new Uint32Array(vn4Gram);
```

## Âm tiết Tiếng Việt không dấu, không thanh
```js
/^(tr|th|ph|ng|ngh|nh|kh|gh|gi|ch|[bckqdghlmnprstvx])?(uy|ua|ue|uye|uya|oa|oe|oo|ie|ia|ye|uo|[iyeuoa])(nh|ng|ch|[ctpmniyuo])?$/i;
```
```regex
phụ âm đầu      (26+1) 2^5
                        (10) tr|th|ph|ng|ngh|nh|kh|gh|gi|ch|
                        (16) [bckqdghlmnprstvx]

âm giữa (âm đệm + nguyên âm)

                (18+0) 2^5
                        (05) uy|ua|ue|uye|uya|
                        (07) oa|oe|oo|ie|ia|ye|uo|
                        (06) [iyeuoa]

âm cuối         (12+1) 2^4
                        (12) nh|ng|ch|[ctpmniyuo]
```

- - - - - - - - - - - -

[ DONE ]

## Âm tiết Tiếng Việt
```js
/^(tr|th|ph|ng|ngh|nh|kh|gh|gi|ch|[bckqdđghlmnprstvx])?(uy|uâ|uê|ue|uyê|uya|oa|oă|oe|oo|iê|ia|yê|ươ|ưa|uô|ua|[iyeêưuoôơaăâ])(nh|ng|ch|[ctpmniyuo])?[sfrxj]?$/i;
```
```regex
phụ âm đầu      (27+1) 2^5  
                        (10) tr|th|ph|ng|ngh|nh|kh|gh|gi|ch|
                        (17) [bckqdđghlmnprstvx]

âm giữa (âm đệm + nguyên âm)

                (29+0) 2^5
                        (06) uy|uâ|uê|ue|uyê|uya|
                        (04) oa|oă|oe|oo|
                        (07) iê|ia|yê|ươ|ưa|uô|ua|
                        (12) [iyeêưuoôơaăâ]

âm cuối         (12+1) 2^4
                        (12) nh|ng|ch|[ctpmniyuo]

thanh điệu      (05+1) 2^3
                        (05) [sfrxj]?

       - OR -

cuối + thanh    (66+0) 2^7
                        (54) (nh|ng|[mniyuo])?[sfrxj]?|
                        (08) (ch|[ctp])[sj]

[note] 
    x+0, phải có
    x+1, có thể ko có, nên cần thêm 1 số đếm để ghi nhận
```
toa, ta
tanh, tang, tam, tan,
tai, tay, tau, tao,
tách, tác, tát, táp

=> Cần 17 bits để ghi riêng từng thành phần. 

=> Dùng rule-based (hoặc FST) để dịch mã hoá thành văn bản thì sẽ ko cần
phải lưu từ điển dưới dạng text, có lẽ sẽ tiết kiệm khoảng 1MB dữ liệu.

=> Dùng cách tương tự để lưu và giải mã các file text nữa, vừa bảo mật vừa tiết kiệm.


- - - - - - - - - - - -

http://thtrungnguyen.vinhphuc.edu.vn/bai-viet-chuyen-mon/cau-tao-tieng-cau-tao-van-trong-tieng-viet-c7597-36557.aspx

### 22 phụ âm:
b, c (k,q), ch, d (gi), đ, g (gh), h, kh, l, m, n, nh, ng (ngh), p, ph, r, s, t, tr, th, v, x.

```js
/[bđhlmnprstvx]|(?:d|gi)|[ckq]|ch|(:?g|gh)|kh|nh|(:?ng|ngh)|ph|tr|th/i
```

### Âm đệm + âm chính
– Âm đệm được ghi bằng con chữ u và o.
+ Ghi bằng con chữ u khi đứng trước các nguyên âm: y, ê, e, â.
+ Ghi bằng con chữ o khi đứng trước các nguyên âm: a, ă, e.

```regex
+ âm đệm     (03) 2^2  [uo]?
| âm chính   (14) 2^4  iê|ia|yê|ươ|ưa|uô|ua|[iyeêưuoôơaăâ]
=>
06 uy|uâ|uê|ue|uyê|uya|
04 oa|oă|oe|oo|
19 (iê|ia|yê)|(ươ|ưa)|(uô|ua)|iyeêưuoôơaăâ
--
29
```

+ {iê}:

{ia} trước không có âm đệm, sau không có âm cuối.
VD: t{ia}, {ỉa}

{yê} trước có âm đệm hoặc không có âm nào, sau có âm cuối.
VD: {yê}u, chu{yê}n

{ya} trước có âm đệm, sau không có âm cuối.
VD: khu{ya}

{iê} khi phía trước có phụ âm đầu, phía sau có âm cuối.
VD: t{iê}n, k{iế}ng

+ {uơ}:
{ươ} sau có âm cuối.        VD: mượn
{ưa} sau không có âm cuối.  VD: ưa

+ {uô}:
{uô} sau có âm cuối.        VD: m{uố}n
{ua} sau không có âm cuối.  VD: m{ua}


- - - - - - - - - - - -

## Auto-masking (add tones and marks)

e.g: https://vietnameseaccent.com/

Automatically inserting accent marks for Vietnamese words.
The free Web interface supports text up to 1000 characters.

"trong cuoc song chung ta phai biet tran trong nhung dieu nho nhat nhat, co le la khong nen lam gi ca" =>

"trong cuộc sống chúng ta phải biết trân trọng những điều nhỏ nhặt nhất, có lẽ là không nên làm gi cả""


[ SKIP ]

## Two-phrase-matching shortcuts

Example of typical shortcuts (scs for short) typing
bd    bắt đầu
bg    bao giờ
bgm   bây giờ mình
blm   ba-la-mật

[ PROBLEM: ]

hard-to-remember over 100+ scs. Not suggestion so easily to wrong type 
word-in-your-head with pre-defined sc. e.g: word-in-your-head "chính xác", 
you typed 'cx' then you got "cảm xúc" :'(

scs requires considerable time to check for duplication and create / change scs manually.


[ SOLUTION: two-phrase-matching ]

\#1: use only first syllabel char => very easy to remember and can be generated automatically

\#2: show suggested words while typing so no mis-match with word-in-your-head
and words that machine know. Suggested words are extracted from bi-gram, tri-gram and 4-gram built from a text corpus and sorted by word frequency corelated with already typed
syllables ...

For example:

bgct  bao giờ chúng ta
bgct  bây giờ chúng ta
cbtm  cho bản thân mình
cbtm  chính bản thân mình
cbtm  của bản thân mình

=>

Human   Computer
type    show
- - - - - - - - -
bgct    (1) bao giờ chúng ta (2) bây giờ chúng ta
cbtm    (1) cho bản thân mình (2) chính bản thân mình (3) của bản thân mình

Then:

Human   Computer
choose  finalize
- - - - - - - - -
1       bao giờ chúng ta
3       của bản thân mình

Finally:

Human   Computer
- - - - - - - - -
bgct1   bao giờ chúng ta
cbtm3   của bản thân mình

=> Very simple, intuitive UI / UX
=> And very simple data structure and algorithm too:

shortcuts = {
    "bgct" : "bao giờ chúng ta|bây giờ chúng ta",
    "cbtm" : "cho bản thân mình|chính bản thân mình|của bản thân mình"
}
