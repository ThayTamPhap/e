## Get more text to gen bi,tri-grams

https://sutamphap.com/category/thu-thay-tro/


## https://vietnameseaccent.com/

Automatically inserting accent marks for Vietnamese words.
The free Web interface supports text up to 1000 characters.

"trong cuoc song chung ta phai biet tran trong nhung dieu nho nhat nhat, co le la khong nen lam gi ca" =>

"trong cuộc sống chúng ta phải biết trân trọng những điều nhỏ nhặt nhất, có lẽ là không nên làm gi cả""

view-source:https://vietnameseaccent.com/static/diacriticsmarker/insert_diacritics.js


=> Data to-do auto-masking mappings.js


[ SKIP ]

See shortcuts_mappings.js for data. Also need manually remove non-sense wordsx

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
