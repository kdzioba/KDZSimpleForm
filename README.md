# KDZSimpleForm
JavaScript library to build simple forms with depended elements. Create the dynamic forms in few easy steps.

## Description
The library was created to help with building dynamic forms where form elements depends on the values of another form element. Elements can be dependend on the values from external source (via RESTrequests) or on the values from other form elements.

## Prerequisites
The library used the JQUERY so it's should be add to the html script.

## How to
The process of adding can be done in few simple steps
###### 1. Create HTML page with all forms/page elements 
In this step you need to define the HTML page and add all elements (like form and page elements). The elements can be standard forms like select, inputs etc but also you can put other tags that can be used to load dynamic content based on values from other fields.

###### 2. Init KDZSimpleForm object
Init KDZSimple object:
```
var form=new KDZSimpleForm();
```


