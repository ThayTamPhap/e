# Vietnamese Syllables

## Âm tiết Tiếng Việt
```
regex = /^(tr|th|ph|ng|ngh|nh|kh|gh|ch|[bckqdđghlmnprstvx])?(uy|uâ|uê|uya|oa|oă|oe|iê|ia|yê|ươ|ưa|uô|ua|[iyeêưuoôơaăâ])((?:ch|[ctp])[sj]|(?:nh|ng|[mniyuo])[frx]?)?$/i

phụ âm đầu      (27+1) 2^5  
                        (10) tr|th|ph|ng|ngh|nh|kh|gh|gi|ch|
                        (17) [bckqdđghlmnprstvx]

âm giữa (đệm + chính)
                (29+0) 2^5
                        (06) uy|uâ|uê|ue|uyê|uya|
                        (04) oa|oă|oe|oo|
                        (07) iê|ia|yê|ươ|ưa|uô|ua|
                        (12) [iyeêưuoôơaăâ]

cuối + thanh    (66+0) 2^7
                        (54) (nh|ng|[mniyuo])?[sfrxj]?|
                        (08) (ch|[ctp])[sj]
       - OR -
cuối            (12+1) 2^4
                        (12) nh|ng|ch|[ctpmniyuo]
thanh           (05+1) 2^3
                        (05) [sfrxj]?

[note] x+0,x+1 0: phải có, 1: có thể ko có, thì cần thêm 1 số đếm để ghi nhận
```
toa, ta
tanh, tang, tam, tan,
tai, tay, tau, tao,
tách, tác, tát, táp

=> Cần 17 bits để ghi riêng từng thành phần. 
- Dùng bảng mã ASCII cần 3 ký tự          2^7 = 128
- Dùng hệ thập phân cần tối đa 6 ký tự.  2^17 = 131072
- Dùng Octal number syntax cần 7 ký tự. var n = 0000755; // 493
- Dùng Hexadecimal number  cần 7 ký tự.         0x0000A; // 10

=> Dùng rule-based (hoặc FST) để dịch mã hoá thành văn bản thì sẽ ko cần
phải lưu từ điển dưới dạng text, có lẽ sẽ tiết kiệm khoảng 1MB dữ liệu.

=> Dùng cách tương tự để lưu và giải mã các file text nữa, vừa bảo mật vừa tiết kiệm.

### Âm cuối + thanh điệu
ch,c,t,p chỉ đi với s,j
```
32 (nh|ng|[mniyuo])[frx]?
08 (ch|[ctp])[sj]
--
40
```

### Âm đệm + nguyên âm
– Âm đệm được ghi bằng con chữ u và o.
+ Ghi bằng con chữ u khi đứng trước các nguyên âm: y, ê, e, â.
+ Ghi bằng con chữ o khi đứng trước các nguyên âm: a, ă, e.
```
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
{ia} trước không có âm đệm, sau không có âm cuối.           VD: t{ia}, {ỉa}
{yê} trước có âm đệm hoặc không có âm nào, sau có âm cuối.  VD: {yê}u, chu{yê}n
{ya} trước có âm đệm, sau không có âm cuối.                 VD: khu{ya}
{iê} khi phía trước có phụ âm đầu, phía sau có âm cuối.     VD: t{iê}n, k{iế}ng

+ {uơ}:
{ươ} sau có âm cuối.       VD: mượn
{ưa} sau không có âm cuối. VD: ưa

+ {uô}:
{uô} sau có âm cuối.        VD: muốn
{ua} sau không có âm cuối.  VD: mua

- - - - - - - - - - - -

http://thtrungnguyen.vinhphuc.edu.vn/bai-viet-chuyen-mon/cau-tao-tieng-cau-tao-van-trong-tieng-viet-c7597-36557.aspx

1. Tiếng gồm 3 bộ phận: phụ âm đầu, vần và thanh điệu.

– 22 phụ âm : b, c (k,q), ch, d, đ, g (gh), h, kh, l, m, n, nh, ng (ngh), p, ph, r, s, t, tr, th, v, x.

2. Vần gồm có 3 phần: âm đệm, âm chính, âm cuối.
* Âm đệm:

– Âm đệm được ghi bằng con chữ u và o.
+ Ghi bằng con chữ o khi đứng trước các nguyên âm: a, ă, e.
+ Ghi bằng con chữ u khi đứng trước các nguyên âm y, ê, ơ, â.

– Âm đệm không xuất hiện sau các phụ âm b, m, v, ph, n, r, g. Trừ các trường hợp:
+ sau ph, b: thùng phuy, voan, ô tô buýt (là từ nước ngoài)
+ sau n: thê noa, noãn sào (2 từ Hán Việt)
+ sau r: roàn roạt (1 từ)
+ sau g: goá (1 từ)


* Âm chính:

– 11 nguyên âm đơn: i, e, ê, ư, u, o, ô, ơ, a, ă, â.
– Có 3 nguyên âm đôi iê, uơ, uô. Được tách thành 8 cách ghi âm sau:

+ {iê}:
{ia} trước không có âm đệm, sau không có âm cuối.           VD: t{ia}, {ỉa}
{yê} trước có âm đệm hoặc không có âm nào, sau có âm cuối.  VD: {yê}u, chu{yê}n
{ya} trước có âm đệm, sau không có âm cuối.                 VD: khu{ya}
{iê} trước có phụ âm đầu, sau có âm cuối.                   VD: t{iê}n, k{iế}ng

+ {uơ}:
{ươ} sau có âm cuối.       VD: mượn
{ưa} sau không có âm cuối. VD: ưa

+ {uô}:
{uô} sau có âm cuối.        VD: muốn
{ua} sau không có âm cuối.  VD: mua

* 12 âm cuối:

– 8 phụ âm cuối vần: p, t, c, ch, m, n, ng, nh
– 4 bán âm cuối vần: i, y, u, o

## Get more text to gen bi,tri-grams

https://sutamphap.com/category/thu-thay-tro/

[ DONE ]

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
