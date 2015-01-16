define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!waterquality/templates/Print.html',
    'dojo/_base/lang',
    'esri/tasks/Geoprocessor',
    'dojo/dom-construct',
    'dojo/dom-class',
    'esri/tasks/FeatureSet',
    'dojo/_base/array'

], 

function (
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    template,
    lang,
    Geoprocessor,
    domConstruct,
    domClass,
    FeatureSet,
    array
    ) {
    return declare('waterquality/Print', 
        [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], 
        {
        // description:

        // widgetsInTemplate: [private] Boolean
        //      Specific to dijit._Templated.
        widgetsInTemplate: true,
        
        // templateString: String
        templateString: template,

        // baseClass: [private] String
        //    The css class that is applied to the base div of the widget markup
        baseClass: 'print-widget',
            
        // gp: esri.tasks.Geoprocessor
        gp: null,

        // messages: Object
        messages: {
            printing: 'Printing map...',
            error: 'There was an error printing the map.',
            done: 'Click here for your map.'
        },


        // parameters passed in via the constructor

        // map: esri.Map
        map: null,

        // bmSelector: agrc.widgets.map.BaseMapSelector
        bmSelector: null,
        
        constructor: function(/*params, div*/) {
            // summary:
            //    Constructor method
            // params: Object
            //    Parameters to pass into the widget. Required values include:
            // div: String|DomNode
            //    A reference to the div that you want the widget to be created in.
            console.info(this.declaredClass + '::' + arguments.callee.nom, arguments);
        },
        postCreate: function() {
            // summary:
            //    Overrides method of same name in dijit._Widget.
            // tags:
            //    private
            console.info(this.declaredClass + '::' + arguments.callee.nom, arguments);

            this.wireEvents();
        },
        wireEvents: function () {
            // summary:
            //      description
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
        
            this.connect(this.btn, 'onClick', 'onPrintButtonClicked');
        },
        printMap: function () {
            // summary:
            //      description
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

            if (!this.gp) {
                this.initGP();
            }

            var params = {
                baseMap: this.bmSelector.currentTheme.label,
                extent: JSON.stringify(this.map.extent)
            };

            lang.mixin(params, this.getGraphics());

            this.gp.submitJob(params);
        },
        initGP: function () {
            // summary:
            //      description
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

            this.gp = new Geoprocessor(AGRC.urls.gpService);

            this.connect(this.gp, 'onJobComplete', 'onJobComplete');
            this.connect(this.gp, 'onStatusUpdate', 'onStatusUpdate');
            this.connect(this.gp, 'onError', 'onJobError');
            this.connect(this.gp, 'onGetResultDataComplete', 'onGetResultDataComplete');
        },
        onPrintButtonClicked: function () {
            // summary:
            //      description
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
        
            this.printMap();

            this.setMsg(this.messages.printing, true);
        },
        onJobComplete: function (response) {
            // summary:
            //      callback for print job
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
            
            if (response.jobStatus === 'esriJobSucceeded') {
                this.gp.getResultData(response.jobId, 'outFile');
            } else {
                this.onJobError({message: response.jobStatus});
            }
        },
        onStatusUpdate: function (/*response*/) {
            // summary:
            //      callback for status updates from server
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
        },
        onJobError: function (/*response*/) {
            // summary:
            //      callback for when server returns an error
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
        
            this.setMsg(this.messages.error, false);
        },
        onGetResultDataComplete: function (response) {
            // summary:
            //      callback for getResultData
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
            
            this.setMsg('', false);

            var a;
            a = domConstruct.create('a', {
                innerHTML: this.messages.done,
                href: response.value.url,
                target: '_blank'
            }, this.message);
        },
        setMsg: function (msg, showLoader) {
            // summary:
            //      description
            // msg: String
            // showLoader: Boolean
            //      Determines the visibility of the loading image
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
        
            // update text
            this.message.innerHTML = msg;
            
            // toggle image visibility
            if (showLoader) {
                domClass.remove(this.loader, 'hidden');
            } else {
                domClass.add(this.loader, 'hidden');
            }

            // toggle button disabled state
            this.btn.set('disabled', showLoader);
        },
        getGraphics: function () {
            // summary:
            //      description
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
            
            var polys = new FeatureSet();
            var lines = new FeatureSet();
            var atts = [];
            array.forEach(this.map.graphics.graphics, function (g) {
                if (g.visible) { 
                    if (g.geometry.type === 'polygon') {
                        polys.features.push(g);
                        for (var p in g.attributes) {
                            if (g.attributes.hasOwnProperty(p) && 
                                p !== 'Shape' &&
                                p !== 'OBJECTID' &&
                                p !== 'COUNTY') {
                                if (!AGRC.fields.aliases[p]) {console.log('p', p);}
                                atts.push(AGRC.fields.aliases[p] + ': ' + g.attributes[p]);
                            }
                        }
                    } else {
                        lines.features.push(g);
                    }
                }
            });

            return {
                selectedPolys: (polys.features.length > 0) ? polys : '',
                selectedLines: (lines.features.length > 0) ? lines : '',
                attributes: (atts) ? atts.join('\\r\\n') : ""
            };
        }
    });
});