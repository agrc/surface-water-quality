define([
    'dojo/_base/declare',
    'ijit/modules/Identify',
    'waterquality/IdentifyResult',
    'dijit/registry',
    'dojo/_base/array',
    'esri/InfoTemplate',
    'dojo/text!waterquality/html/StreamAttributes.html',
    'dojo/text!waterquality/html/AssessmentUnitAttributes.html',
    'dojo/_base/lang',
    'dojo/dom-class',
    'dojo/dom-construct'

],

function (
    declare,
    Identify,
    IdentifyResult,
    registry,
    array,
    InfoTemplate,
    StreamAttributes,
    AssessmentUnitAttributes,
    lang,
    domClass,
    domConstruct
    ) {
    return declare("waterquality/Identify", [Identify], {
        // summary:
        //      Overridden in a few places to allow for custom info templates

        // identifyResults: waterquality.IdentifyResult[]
        //      A list of the current identify results
        identifyResults: null,

        // resultsPane: dijit.TitlePane
        resultsPane: null,

        constructor: function(/*params*/){
            // summary:
            //      description
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

            this.resultsPane = registry.byId('identify-pane');

            this.identifyResults = [];
            this.inherited(arguments);
        },
        onTaskComplete: function (iResults) {
            // summary:
            //      overridden
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

            this.clearIdentifyResults();

            if (iResults.length === 0) {
                this.map.hideLoader();
                return;
            }

            var hucs = [], streams = [];
            array.forEach(iResults, function (result) {
                var g = result.feature;

                var template;
                var parts = result.displayFieldName.split('.');
                var titleField = parts[parts.length - 1];
                var titleString = result.layerName + ': ${' + titleField + '}';

                // what layer is this?
                if (result.layerId === 0 || result.layerId === 3) {
                    template = new InfoTemplate(titleString, StreamAttributes);
                    streams.push(g);
                } else { // assessment unit
                    template = new InfoTemplate(titleString, AssessmentUnitAttributes);
                    hucs.push(g);
                }
                g.setInfoTemplate(template);
                g.attributes = this.formatAttributes(result);

            }, this);

            // load all streams first
            array.forEach(streams, function (str) {
                this.loadIdentifyResult(str);
            }, this);

            if (hucs.length > 0) {
                // load only one huc to prevent confusion
                this.loadIdentifyResult(hucs[0]);
            }

            // show pane
            if (!this.resultsPane.get('open')) {
                this.resultsPane.toggle();
            }

            this.map.hideLoader();
        },
        setMap: function (map) {
            // summary:
            //      overridden to set theme
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

            this.map = map;

            map.on("click", lang.hitch(this, this.onMapClick));

            domClass.add(map.infoWindow.domNode, 'myTheme');
        },
        formatAttributes: function (result) {
            // summary:
            //      Calls format value on the appropriate fields
            // result: esri.tasks.IdentifyResult
            // returns: {}
            //      an object formatted the same as esri.Graphic.attributes
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
            var attributes = result.feature.attributes;
            var field;      // place holder for field names

            // look for assessment unit layer
            if (result.layerId === 1 || result.layerId === 4) {
                field = AGRC.fields.assessmentUnits.BEN_CLASS;
                attributes[field] = this.formatValue(attributes, field);
                field = AGRC.fields.assessmentUnits.CAT_2014;
                attributes[field] = this.formatValue(attributes, field);
                field = AGRC.fields.assessmentUnits.Anti_DEGRD;
                attributes[field] = this.formatValue(attributes, field);
            } else {
                // format stream name if none
                field = AGRC.fields.streams.GNIS_Name;
                if (attributes[field] === '') {
                    attributes[field] = 'unknown';
                }
            }

            return attributes;
        },
        formatValue: function (attributes, fld) {
            // summary:
            //      replaces codes with the more friendly values provided in 'DWQ web look up attribute specifications.XLSX'
            // attributes: {}
            //      an object formatted the same as esri.Graphic.attributes
            // fld: String
            //      The field that we want to format
            // returns: String
            //      The newly formatted value
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
            var values;     // the values returned from the field
            var lut;        // look up table object

            values = attributes[fld].split(', ');
            lut = AGRC.luts[fld];

            return array.map(values, function (i) {
                return lut[i];
            }).join('; ');
        },
        clearIdentifyResults: function(){
            // summary:
            //      clears the identify result widgets and graphics on the map
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

            this.map.graphics.clear();

            array.forEach(this.identifyResults, function (result) {
                result.destroy();
            });
        },
        loadIdentifyResult: function (g) {
            // summary:
            //      Creates an identify result and places it in the pane
            // g: esri.Graphic
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

            var iResult = new IdentifyResult({
                graphic: g
            }, domConstruct.create('div', null, 'identify-results'));
            this.identifyResults.push(iResult);
        }
    });
});
