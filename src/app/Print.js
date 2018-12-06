define([
    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/text!app/templates/Print.html',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'esri/tasks/FeatureSet',
    'esri/tasks/Geoprocessor'
],

function (
    config,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    domClass,
    domConstruct,
    template,
    array,
    declare,
    lang,

    FeatureSet,
    Geoprocessor
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
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

        postCreate: function () {
            // summary:
            //    Overrides method of same name in dijit._Widget.
            // tags:
            //    private
            console.log('waterquality/Print:postCreate', arguments);

            this.wireEvents();
        },
        wireEvents: function () {
            // summary:
            //      description
            console.log('waterquality/Print:wireEvents', arguments);

            this.connect(this.btn, 'onClick', 'onPrintButtonClicked');
        },
        printMap: function () {
            // summary:
            //      description
            console.log('waterquality/Print:printMap', arguments);

            if (!this.gp) {
                this.initGP();
            }

            var params = {
                baseMap: this.layerSelector.get('visibleLayers').widgets[0].name,
                extent: JSON.stringify(this.map.extent)
            };

            lang.mixin(params, this.getGraphics());

            this.gp.execute(params, this.onJobComplete.bind(this), this.onJobError.bind(this));
        },
        initGP: function () {
            // summary:
            //      description
            console.log('waterquality/Print:initGP', arguments);

            this.gp = new Geoprocessor(config.urls.gpService);
        },
        onPrintButtonClicked: function () {
            // summary:
            //      description
            console.log('waterquality/Print:onPrintButtonClicked', arguments);

            this.printMap();

            this.setMsg(this.messages.printing, true);
        },
        onJobComplete: function (response) {
            // summary:
            //      callback for print job
            console.log('waterquality/Print:onJobComplete', arguments);

            if (!response.jobStatus === 'esriJobSucceeded') {
                this.onJobError({message: response.jobStatus});
            }

            this.setMsg('', false);

            domConstruct.create('a', {
                innerHTML: this.messages.done,
                href: response[0].value.url,
                target: '_blank'
            }, this.message);
        },
        onJobError: function (/*response*/) {
            // summary:
            //      callback for when server returns an error
            console.log('waterquality/Print:onJobError', arguments);

            this.setMsg(this.messages.error, false);
        },
        setMsg: function (msg, showLoader) {
            // summary:
            //      description
            // msg: String
            // showLoader: Boolean
            //      Determines the visibility of the loading image
            console.log('waterquality/Print:setMsg', arguments);

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
            console.log('waterquality/Print:getGraphics', arguments);

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
                                var alias = config.fields.aliases[p] || p;
                                atts.push(alias + ': ' + g.attributes[p]);
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
                attributes: (atts) ? atts.join('\\r\\n') : ''
            };
        }
    });
});
