# WordStream

Demo: https://iDataVisualizationLab.github.io/WordStream/demo.html



Video: https://idatavisualizationlab.github.io/WordStream/

[![WS](https://github.com/nnhuyen/WordStream/blob/master/images/Huffington.png)](https://www.youtube.com/watch?v=DwaDMPhi2Ec "Everything Is AWESOME")

*WordStream* is a visualization technique for demonstrating the evolution of a topic over time. This is a hybrid 
technique from Wordle and StreamGraph, which conveys textual data with both global and local perpsectives. Global trends
 is described by the total stream, in which thickness represents amount of interest/concern in that specific 
 timepoint. Local trend is retrieved from an individual stream. 


Timeline is shown from 
left to right, in the bottom of the interface. The categories for textual data are color-encoded, for example:
- Blue for *person*
- Orange for *location*
- Green for *organization*
- Red for *others*

The importance of a word is represented by its font size and opacity. In this study, the importance of a word is its 
[Sudden 
attention](https://www.cs.uic.edu/~tdang/TimeArcs/EuroVis2016/TimeArcs_Dang_EuroVis2016.pdf): a word which appear repeatedly throughout the timeline conveys less and less meaning than in its first 
appearance. A word's sudden attention is a function of frequency, which is big when the previous timestep has small 
frequency and this current timestep has high frequency. 

![ScreenShot](https://github.com/nnhuyen/WordStream/blob/master/media/highlight.png)

WordStream shows the remarkable topics by emphasizing them with font size and opacity.  

In Mar 2012, users can quickly see the names such as Trayvon Martin - George Zimmerman (person) and Sanford (location), regarding the Trayvon Martin shooting by George Zimmerman. The event happened in Sanford in late February 2012, but the investigation and news appear in the next month, March.

In August 2012, some remarkable terms are Todd Akin and Paul Ryan (person), with Romney-Ryan (other). Romney-Ryan is Mitt Romney and Paul Ryan, the 2012 Republican presidential ticket. Todd Akin is a representative who had controversial statement during the Senate race, and Paul Ryan is a co-sponsored with him on the bill.

In December 2012, Sandy Hook, Newtown, Lanza and NRA are the emphasized terms. This relates to Sandy Hook Elementary School shooting in Newtown, Connecticut by the shooter Adam Lanza. The shooting caused many questions of gun control legislation to NRA (National Rifle Association).

The connection can be seen clearer by the relationship between them. Turning on feature “Relationship” will show the 
underlying relationships of terms. Here, we consider the relationship base on co-occurrences. Mouseover a link can highlight that connection and the pair of words.
 
 ## Control Panel and Metrics
 
 The tool allows users to customize:
  - *Width*, *height*, *font size* and *number of chosen words (top rank)*. 
  - *Flow* 
 and *Angle Variance* are preferences for text orientation.
 - Relationships: Toggle allows relationship is be displayed.
 
 The metrics includes measurements for the importance of the word displayed. In the process of placing word, some of 
 them are left out due to lack of space. For example, TF-IDF ratio means the rate between the words shown to all the 
 word. 
