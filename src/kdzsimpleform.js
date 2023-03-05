//==================================================
//  KDZSimpleForm - simple JS dynamic forms 
//  Krzysztof Dzioba version 0.0.1 (202303)
//=================================================


// form element objects
class FormElement {
    constructor(def={}) {
        this.element_type=def['element_type']; // information about element type (like select, input, etc.)
        this.obj_id=def['obj'];                // html element id 
        this.view=def['view'];                 // used to send rest requests
        this.type=def['type'];
        this.depended_from_p=def['depended_pattern'];
        this.depended_from_k=def['depended_key'];
        this.inputes=def['inputes'];
        this.triggered=def['triggered'];
        this.noactctive=def['noactive'];

        //defaul element status
        this.status='inactive';
        this.content='';

        //added to support the change in element view for active and inactive state
        this.active_class=def['active_class'];
        this.inactive_class=def['inactive_class'];

        //scipt triggered befor or after, can be use to caluclations or validations
        this.preprocess_js=def['preprocess_js'];
        this.postprocess_js=def['postprocess_js'];


        //add dedicated class 
        if (this.element_type=='button') {
            $(this.obj_id).addClass( "kdzform-buttons");
        } else if (this.element_type!='html') {
            $(this.obj_id).addClass( "kdzform-fields");
        }

        this.validStatus();
    }

    validStatus() {
        if (this.content!='') {
            //should be inactive
            $(this.obj_id).prop(this.noactctive,false);
            if ((this.active_class)&&(this.inactive_class)) {
                $(this.obj_id).toggleClass(this.active_class+' '+this.inactive_class);
            }
        } else if (this.noactctive!='') {
            //active
            if ((this.active_class)&&(this.inactive_class)) {
                $(this.obj_id).toggleClass(this.inactive_class+' '+this.active_class);
            }
            $(this.obj_id).prop(this.noactctive,true);
        }
    }

    sendRequest(url,request) {
        var obj=this.obj_id;
        var el=this;
        //add crs token
        request['csrfmiddlewaretoken']=$('input[name="csrfmiddlewaretoken"]').val();
        $.post(url,   // request url
              request,
              function (data) {// success callback function
                    el.content=data;
                    $(obj).html(data);
                    el.validStatus();

            }
        );
    }

    update(pattern,keys,author='') {
        //update attributes
        var send_depended=0;
        var request={};
        //1. check pattern
        if (pattern!='') {
            request['pattern']=pattern;
            send_depended=1;
        }
        //2. check keys
        if (keys.length>0) {
            for(var i=0;i<keys.length;i++) {
                request[keys[i]['name']]=keys[i]['value'];
                if (this.type=='inputrelated') {
                    if (this.inputes === undefined) {
                        //do nothing
                    } else {
                        this.inputes[keys[i]['name']].value=keys[i]['value'];
                    }
                }
            }
            send_depended=1;
        }

        //check triggered paramters
        if (this.triggered!='') {
            if (author!=this.triggered) {
                send_depended=0;
            }
        }

        if (this.view!='') {
            var url=this.view;
            if ((this.type=='nodepended')||(this.type=='depended_but_all')) {
                //do nothing load data
                this.sendRequest(url,request);
            } else if ((this.type=='depended_full')&&(send_depended==1)) {
               this.sendRequest(url,request);
            } else if ((this.type=='inputrelated')&&(send_depended==1)) {
                //check if all mandatory inputes provided
                var fl=0;
                var fl_cnt=0;
                var tmp_request={};
                for(var key in this.inputes) {
                    var inp=this.inputes[key];
                    fl_cnt++;
                    if ((inp['ismandatory']=='Y')&&(inp['value']!='')) {
                        fl++;
                        tmp_request[key]=inp['value'];
                    } else if (inp['ismandatory']=='N') {
                        fl++
                    }
                    
                }
               
                if (fl==fl_cnt) {
                    //add inputes to request and send
                    this.content='true';
                    for(var key in tmp_request) {
                        request[key]=tmp_request[key];
                    }
                    this.sendRequest(url,request);
                }
            } 

        } else {
            if  ((this.type=='inputrelated')&&(send_depended==1)) {
                //check if all mandatory inputes provided
                var fl=0;
                var fl_cnt=0;

                for(var key in this.inputes) {
                    var inp=this.inputes[key];
                    fl_cnt++;
                    if ((inp['ismandatory']=='Y')&&(inp['value']!='')) {
                        fl++;
                    } else if (inp['ismandatory']=='N') {
                        fl++
                    }
                    
                }
                
                if (fl==fl_cnt) {
                    this.content='true';
                    if (this.preprocess_js) {
                        this.preprocess_js(request);
                    }

                    this.validStatus();

                    if (this.postprocess_js) {
                        this.postprocess_js(request);
                    }

                }
            }
        }

        //clear button values
    }

};

class KDZSimpleForm {
    constructor() {
        this.name = 'KDZSimpleForm';
        this.description = 'Simple Form to support values update by rest';
        this.version='0.0.1';
        this.author='Krzysztof Dzioba';
        this.date='20230304';

        this.objects={}; //object dictionary
        this.dependency_p={};
        this.dependency_k={};

    }
    // paramters:
    //     - element_type - select,text
    //     - view -> request to update data, if view empty then ajax not send
    //     - obj ->  select object reference
    //     - type -> type of object
    //            - nodepended - values loaded without any dependency
    //            - depended_but_all - depended but defaul load all
    //            - depended_full    - full depended firs neeed pattern
    //     - depended_pattern - list of depended objects
    //     - depended_key     - list of depended objects
    addElement(def={}) {
        this.objects[def['obj']]=new FormElement(def);
    };

    updateDependency() {
        //get all added elements
        for(var key in this.objects) {
            //get dependecy objects
            var dependedon_p=this.objects[key].depended_from_p;
            if (Array.isArray(dependedon_p)) {
                for(var i=0;i<dependedon_p.length;i++) {
                   var itm=dependedon_p[i];
                   if (itm in this.dependency_p) {
                        this.dependency_p[itm].push(key);
                   } else {
                        this.dependency_p[itm]=[];
                        this.dependency_p[itm].push(key);
                   }
                }
            }
            var dependedon_k=this.objects[key].depended_from_k;
            if (Array.isArray(dependedon_k)) {
                for(var i=0;i<dependedon_k.length;i++) {
                   var itm=dependedon_k[i];

                   if (itm in this.dependency_k) {
                        this.dependency_k[itm].push(key);
                   } else {
                        this.dependency_k[itm]=[];
                        this.dependency_k[itm].push(key);
                   }
                }
            }
        }
    };

    addEvents() {
        var frm=this;
        $('.kdzform-fields').change(function() {
           
            //get element id
            var obj_id='#'+this.id;
           
            var element_type=this.type;
            var value='';
            if (element_type=='select-one') {
                value=$(obj_id).find(":selected").val();
            } else if (element_type!='html') {
                value=$(obj_id).val();
            }

            //check if object should be updated
            if (obj_id in frm.dependency_k) {
                var elments=frm.dependency_k[obj_id];
                for(var i=0;i<elments.length;i++) {
                    var itm=elments[i];
                    frm.objects[itm].update('',[{'name':obj_id,'value':value}]);
                }
            }

            if (obj_id in frm.dependency_p) {
                var elments=frm.dependency_p[obj_id];
                for(var i=0;i<elments.length;i++) {
                    var itm=elments[i];
                    frm.objects[itm].update(value,[]);
                }
            }

        });

        //send pattern after each click
        $('input.kdzform-fields').keyup(function(e) {
            //get element id
            var obj_id='#'+this.id;
                                  
            var element_type=this.type;
            var value='';
            if (element_type=='select-one') {
                value=$(obj_id).find(":selected").val();
            } else if (element_type!='html') {
                value=$(obj_id).val();
            }
           
            //check if object should be updated
            if (obj_id in frm.dependency_k) {
                var elments=frm.dependency_k[obj_id];
                for(var i=0;i<elments.length;i++) {
                    var itm=elments[i];
                    frm.objects[itm].update('',[{'name':obj_id,'value':value}]);
                }
            }

            if (obj_id in frm.dependency_p) {
                var elments=frm.dependency_p[obj_id];
                for(var i=0;i<elments.length;i++) {
                    var itm=elments[i];
                    frm.objects[itm].update(value,[]);
                }
            }
       });

        $('.kdzform-buttons').click(function() {
            var obj_id='#'+this.id;
            var value=$(obj_id).val();

            //check if object should be updated
            if (obj_id in frm.dependency_k) {
                var elments=frm.dependency_k[obj_id];
                for(var i=0;i<elments.length;i++) {
                    var itm=elments[i];
                    frm.objects[itm].update('',[{'name':obj_id,'value':value}],obj_id);
                    if (this.inputes === undefined) {
                        //do nothing
                    } else {
                        frm.objects[itm].inputes[obj_id].value='';
                    }
                }
            }

            if (obj_id in frm.dependency_p) {
                var elments=frm.dependency_p[obj_id];
                for(var i=0;i<elments.length;i++) {
                    var itm=elments[i];
                    frm.objects[itm].update(value,[],obj_id);
                    if (this.inputes === undefined) {
                        //do nothing
                    } else {
                        frm.objects[itm].inputes[obj_id].value='';
                    }
                }
            }

        });
    };

    load() {
        for(var key in this.objects) {
            this.objects[key].update('','');
        }
    };

    run() {
        this.updateDependency();
        this.addEvents();
        this.load();
    }
};