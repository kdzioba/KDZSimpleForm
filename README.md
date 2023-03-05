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
###### 3. Add the element configuration
Each element that we excpect dependency need to be added. To pleas use command

```
form.addElement({[paramters]});
```
where [paramters] is a dictionary with values:

|Key name|Description|Example|
|-----:|-----------|-----------|
| element_type | type of element. Possible values: select, input, button, html. "html" can be ised for all elements where content has be added dynamic and are not form elements | element_type':'button'|
|view           |used only for AJAX request. Need has url that will be executed| view':'https://myapi.com/rest/getvalues',|
|obj|element id. Have to be with prefix '#' (example #txtFirstName where element id is txtFirstName)| |
|type |Type of element. Possible values: nodepended - element no depended. Can be used as input for other elements,  depended_but_all - element depended on other elements but processing doesn't need any inputs from other element,  depended_full - element depended on other elements, inputrelated - elements depend on other parameters. Can be used for buttons or other HTML elements (not form) to load or process specyfic content
| | 
|triggered|Uses when we need to populate values on action on specyfica element. Example usage is load content only when button clicked.  | |        
|depended_pattern|List of elemenent that value will be provided when the change on particular element happen. Used in REST request to limit data or in other cases whene we need to provide the pattern to other filed| | 
|depended_key|List of elemenent that key (value or id from select-option) will be provided when the change on particular element happen | | 
|inputes|Dictionary of all inputes that are needed for particular element. Used in cases when the process required the paramters as the input. In the dictioranry need to be provided object name, value field, flag if value is mandatory | 'inputes': { '#txtFirstName':{ 'isMandatory':'Y', 'value':''}, ....  }| 
|preprocess_js| Javascript function that will be excuted before processing| | 
|postprocess_js|Javascript function that will be excuted after processing | | 

###### 4. Execute
Execute by command run
```
form.run();
```


