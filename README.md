# Readme

## Introduction

Trying to collaboratively encode texts in TEI XML on Google Docs, but frustrated by the sheer number of keystrokes it takes? EasyTEI is a Google Apps Script that allows an easier markup scheme which it then transforms into TEI (Text Encoding Initiative) XML format. You may have to adapt the script for the text you're trying to encode.

![ezgif-5-37d002df9e](https://github.com/suhasm/easytei/assets/3070998/15c0f4d5-c52c-496f-b3a3-36ff47e00377)

For instance, you can quickly jot down the following while transcribing from two manuscripts:
```
tāva{nB5}cciya gaṇaï phuḍaṁ | kulavavaēsaṁ [B=narō, A=tarō] [A #B=vi dhīro, ~Jinadatta=samatthō] vi{oA6}
jāva ṇa [AO=ṇivaḍaï, B=ṇavaḍaï,A=ṇi{nA5}ṇivaḍaï] hiyaē | mayara-ddhaya-mukka-sara-ṇivahō ||6
parallel=Jinadatta, p.76
```
EasyTEI can then transform it into TEI XML:
```
<lg n="x" xml:id="RaGāKō.xx">

<l>tāva<lb ed="#B" n="5"/>cciya gaṇaï phuḍaṁ | kulavavaēsaṁ <app><lem wit="#B">narō </lem><rdg wit="#A">tarō</rdg></app> <app><lem resp="#A #B">vi dhīro </lem><rdg source="#Jinadatta">samatthō</rdg></app> vi<app type="punct"><lem wit="#A"><space type="binding-hole" quantity="6"/></lem></app></l>
<l>jāva ṇa <app><lem resp="#AO">ṇivaḍaï </lem><rdg wit="#B">ṇavaḍaï</rdg><rdg wit="#A">ṇi<lb ed="#A" n="5"/>ṇivaḍaï</rdg></app> hiyaē | mayara-ddhaya-mukka-sara-ṇivahō ||6</l>

<note type="parallel"><ptr target="#Jinadatta"/>p.76</note>

</lg>
```

## Syntax
1. The syntax is two lines of verse followed by one or more optional lines for parallels:
````
verse line 1
verse line 2
parallel=TextName1, Reference1
parallel=TextName2, Reference2
parallel=TextName3, Reference3
````
````
tāva{nB5}cciya gaṇaï phuḍaṁ | kulavavaēsaṁ [B=narō, A=tarō] [A #B=vi dhīro, ~Jinadatta=samatthō] vi{oA6}
jāva ṇa [AO=ṇivaḍaï, B=ṇavaḍaï,A=ṇi{nA5}ṇivaḍaï] hiyaē | mayara-ddhaya-mukka-sara-ṇivahō ||6
parallel=Jinadatta, p.76
````

2. ```{oAn}``` represents binding holes. ```{oA6}``` represents a binding hole in Ms A of size 6.
3. ```{nAx}``` represents a line number. ```{nB9}``` represents that line 9 has just begun in Ms. B.
4. ```parallel=TextName, Reference``` represents a parallel. For example ```parallel=Jinadatta, p.76```
5. ```<pb n="1r" img="2" ed="#A"/>```
6. ```[A=reading1, B=reading2, C= reading3]```represents variants in manuscripts A,B and C. Lemma goes first.
    * Use single letters (such ```A```) to represent manuscripts. Represent editors by two letters (such as ```SM```): ```[SM=reading1, A=reading2, B=reading3]```
    * While using a reading from a different text, put a tilde before the textname: ```[A=reading1, ~meghadūta=reading2, B=reading3]```
    * If you want to specify orthographic or punctuation variants: ```[punct, A=reading1, SM=reading2]```, ```[orthographic, A=reading1, SM=reading2]```
   

## Usage
This script is to be used within Google Apps Script connected to a Google Document. To use the script, follow these steps:

1. Open a Google Document.
2. Select Extensions > Apps Script.
3. Copy the functions into the Apps Script editor and save the project.
4. Reload the Google Document.
5. A new menu item 'EasyTEI' will appear in the toolbar.
6. Select the text you want to transform and then choose 'Transform to TEI' from the 'EasyTEI' menu.
7. The selected text will be replaced with the TEI format transformation.

It's also worth noting that the regex used for the transformations are based on assumptions about the structure of the input text. If your input text does not conform to these assumptions, the script may not behave as expected.


## Functions
The script contains the following functions:

### `wrapLines(text)`
This function wraps every line of the input text with `<l></l>` tags.

### `replaceParallel(text)`
This function identifies instances of the format "parallel=X, Y" and replaces them with `<note type="parallel"><ptr target="#X"/>Y</note>`.

### `replaceLineNo(text)`
This function looks for any `{nAx}` in the input text and replaces them with `<lb ed="#A" n="x"/>`.

### `replaceAo(text)`
This function identifies any `{oAn}` in the input text and replaces it with `<app type="punct"><lem wit="#A"><space type="binding-hole" quantity="n"/></lem></app>`.

### `replaceReadings(text)`
This function handles more complex transformations of text enclosed in square brackets `[]` into a form of `<app>`, `<lem>`, and `<rdg>` tags with multiple attributes. The function logic handles various formats and conditions within the square brackets.

### `onOpen()`
This function is intended to be used within Google Docs to add a new menu item 'EasyTEI' with an option 'Transform to TEI' that will run the text transformation on selected text.

### `replaceReadingsInDoc()`
This function is the main text transformation handler in a Google Docs context. It gets the active document, retrieves the selected text, applies all the text transformations and then replaces the original text with the transformed text.
