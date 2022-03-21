![GitHub package.json version](https://img.shields.io/github/package-json/v/mcneel/compute.rhino3d.appserver/main?label=version&style=flat-square)
![node-current (scoped)](https://img.shields.io/badge/dynamic/json?label=node&query=engines.node&url=https%3A%2F%2Fraw.githubusercontent.com%2Fmcneel%2Fcompute.rhino3d.appserver%2Fmain%2Fpackage.json&style=flat-square&color=dark-green)

# Deiliskipulag App
deiliskipulag - is the icelandic word for detailed city planning drawing in the country's capitol region (around Reykjavik)

Municipalities provide a specific plot and ask architects to design plot size, street layouts, building sizes and heights. 

This app has been created for the purposes of neighbourhood planning per guidelines and directives given by municipalities . It allows users to quickly rough out how many plots, at what size, and what buildable area can be placed on a site. 

This is designed for the initial schematic stages. 

It was designed for my co-workers. Our office often works on deiliskipulags, and having recently worked on one myself, I found the schematic stage to be filled with unecessary busy work. Using GH I was able to itterate and work through this step a lot faster than just manually iterating by hand or in CAD software. 
With the acception of one other person, no one in my office uses grasshopper, so I wanted to create user friendly app that would make GH more accessible, and reduce unecessary time spent on the initial stages of these kinds of projects. 

## Parameters
- **1-Grid Size**: Slider - Establish is the required number of plots can be achieved on site 
- **2-Plot Size**: Slider - Using a the slider establish typical plot size (in m)
- **3-Building Size**: Slider - Play around with sizes and establish typical buildable area/size (in m)
- **4-Building Height**: Choose 1 level 3.5m or 2 level 7m height
- **5-Streets**: Using gumball moves the cuves around to configure streets (this part needs further development, currently not working) 
- **DOWNLOAD**

## Pluggins
n/a - only native GH components used

## Credits
project by - zoé lewis
BIMSC 2.s.3 - cloud based data management 
march 21, 2022
instructor - david leon
teaching assistant - hesham shawqy
MACAD 2022
IAAC