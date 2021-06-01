# Vietnamese Syllables

âm tiết tiếng việt = ```
      phụ âm đầu (26) 2^5  tr|th|ph|ng|ngh|nh|kh|gh|ch|[bckqdđghlmnprstvx]
    + âm đệm     (02) 2^1  [uo]
    | âm chính   (14) 2^4  [ieêưuoôơaăâ]|(?:iê|ia|yê)|(?:ươ,ưa)|(?:uô|ua)
    | âm cuối    (12) 2^4  nh|ng|ch|[ptcmniyuo]
    + thanh điệu (06) 2^3  sfrxj
```

=> cần 17 bits để ghi riêng từng thành phần.
Và cần ít hơn nữa nếu dùng từ điển (22*2*14*12*6 = 44352 < 16 bits)
Bỏ đi thanh điệu và dấu có lẽ cần khoảng 13 bit là đủ.

=> uint16 (65535) là đủ để mã hoá.

=> Dùng rule-based (hoặc FST) để dịch từ mã hoá thành văn bản sẽ ko cần
phải lưu từ điển dưới dạng text, có lẽ sẽ tiết kiệm dc 1MB dữ liệu.

=> Dùng cách tương tự để lưu và giải mã các file text nữa, vừa bảo mật vừa tiết kiệm.

- - - - - - - - - - - -

http://thtrungnguyen.vinhphuc.edu.vn/bai-viet-chuyen-mon/cau-tao-tieng-cau-tao-van-trong-tieng-viet-c7597-36557.aspx

1. Tiếng gồm 3 bộ phận: phụ âm đầu, vần và thanh điệu.

– 22 phụ âm : b, c (k,q), ch, d, đ, g (gh), h, kh, l, m, n, nh, ng (ngh), p, ph, r, s, t, tr, th, v, x.

2. Vần gồm có 3 phần : âm đệm, âm chính , âm cuối.

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

+ IÊ:

Ghi bằng IA khi phía trước không có âm đệm và phía sau không có âm cuối
VD: mía, tia, kia

Ghi bằng YÊ khi phía trước có âm đệm hoặc không có âm nào, phía sau có âm cuối
VD: yêu, chuyên

Ghi bằng ya khi phía trước có âm đệm và phía sau không có âm cuối
VD: khuya

Ghi bằng IÊ khi phía trước có phụ âm đầu, phía sau có âm cuối
VD: tiên, kiến

+ UƠ:

Ghi bằng ƯƠ khi sau nó có âm cuối
VD: mượn

Ghi bằng ƯA khi phía sau nó không có âm cuối
VD: ưa

+ UÔ:

Ghi bằng UÔ khi sau nó có âm cuối
VD: muốn

Ghi bằng UA khi sau nó không có âm cuối
VD: mua

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
