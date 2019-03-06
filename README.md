# WordStream

Demo: https://iDataVisualizationLab.github.io/WordStream/

![ScreenShot](https://github.com/nnhuyen/WordStream/blob/master/images/Huffington.png)

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
 
 ## Control Panel and Metrics
 
 The tool allows users to customize:
  - *Width*, *height*, *font size* and *number of chosen words (top rank)*. 
  - *Flow* 
 and *Angle Variance* are preferences for text orientation.
 - Relationships: Toggle allows relationship is be displayed.
 
 The metrics includes measurements for the importance of the word displayed. In the process of placing word, some of 
 them are left out due to lack of space. For example, TF-IDF ratio means the rate between the words shown to all the 
 word. 
