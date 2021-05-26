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
Typed   Showed
bgct    (1) bao giờ chúng ta (2) bây giờ chúng ta
cbtm    (1) cho bản thân mình (2) chính bản thân mình (3) của bản thân mình

Human   Computer
Choose  Finalize
1       bao giờ chúng ta
3       của bản thân mình

Finally:

Human   Computer
bgct1   bao giờ chúng ta
cbtm3   của bản thân mình

=> Very simple, intuitive UI / UX
=> And very simple data structure and algorithm too:

shortcuts = {
	"bgct" : "bao giờ chúng ta|bây giờ chúng ta",
	"cbtm" : "cho bản thân mình|chính bản thân mình|của bản thân mình"
}
