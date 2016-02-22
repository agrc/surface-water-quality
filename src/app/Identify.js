define([
    'app/config',
    'app/IdentifyResult',

    'dijit/registry',

    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/text!app/html/AssessmentUnitAttributes.html',
    'dojo/text!app/html/StreamAttributes.html',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'esri/InfoTemplate',

    'ijit/modules/Identify'
],

function (
    config,
    IdentifyResult,

    registry,

    domClass,
    domConstruct,
    AssessmentUnitAttributes,
    StreamAttributes,
    array,
    declare,
    lang,

    InfoTemplate,

    Identify
) {
    return declare([Identify], {
        // summary:
        //      Overridden in a few places to allow for custom info templates

        // identifyResults: app.IdentifyResult[]
        //      A list of the current identify results
        identifyResults: null,

        // resultsPane: dijit.TitlePane
        resultsPane: null,

        constructor: function (/*params*/) {
            // summary:
            //      description
            console.log('waterquality/Identify:constructor', arguments);

            this.resultsPane = registry.byId('identify-pane');

            this.identifyResults = [];
            this.inherited(arguments);
        },
        onTaskComplete: function (iResults) {
            // summary:
            //      overridden
            console.log('waterquality/Identify:onTaskComplete', arguments);

            this.clearIdentifyResults();

            if (iResults.length === 0) {
                this.map.hideLoader();
                return;
            }

            var hucs = [];
            var streams = [];
            array.forEach(iResults, function (result) {
                var g = result.feature;
                g.attributes = this.normalizeFieldNames(g.attributes);

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
        normalizeFieldNames: function (attributes) {
            // summary:
            //      strips out any tablename. from field names
            // attributes: Object
            console.log('waterquality/Identify:normalizeFieldNames', arguments);

            var newAtts = {};
            for (var key in attributes) {
                if (attributes.hasOwnProperty(key) && key.indexOf('.') > -1) {
                    var newKey = key.split('.')[1];
                    newAtts[newKey] = attributes[key];
                } else {
                    newAtts[key] = attributes[key];
                }
            }
            return newAtts;
        },
        setMap: function (map) {
            // summary:
            //      overridden to set theme
            console.log('waterquality/Identify:setMap', arguments);

            this.map = map;

            map.on('click', lang.hitch(this, this.onMapClick));

            domClass.add(map.infoWindow.domNode, 'myTheme');
        },
        formatAttributes: function (result) {
            // summary:
            //      Calls format value on the appropriate fields
            // result: esri.tasks.IdentifyResult
            // returns: {}
            //      an object formatted the same as esri.Graphic.attributes
            console.log('waterquality/Identify:formatAttributes', arguments);
            var attributes = result.feature.attributes;
            var field;      // place holder for field names

            // look for assessment unit layer
            if (result.layerId === 1 || result.layerId === 4) {
                field = config.fields.assessmentUnits.BEN_CLASS;
                attributes[field] = this.formatValue(attributes, field);
                field = config.fields.assessmentUnits.CAT_2014;
                attributes[field] = this.formatValue(attributes, field);
                field = config.fields.assessmentUnits.Anti_DEGRD;
                attributes[field] = this.formatValue(attributes, field);
            } else {
                // format stream name if none
                field = config.fields.streams.GNIS_Name;
                if (attributes[field] === '') {
                    attributes[field] = 'unknown';
                }
            }

            return attributes;
        },
        formatValue: function (attributes, fld) {
            // summary:
            //      replaces codes with the more friendly values provided in
            //      'DWQ web look up attribute specifications.XLSX'
            // attributes: {}
            //      an object formatted the same as esri.Graphic.attributes
            // fld: String
            //      The field that we want to format
            // returns: String
            //      The newly formatted value
            console.log('waterquality/Identify:formatValue', arguments);
            var values;     // the values returned from the field
            var lut;        // look up table object

            values = attributes[fld].split(', ');
            lut = config.luts[fld];

            return array.map(values, function (i) {
                return lut[i];
            }).join('; ');
        },
        clearIdentifyResults: function () {
            // summary:
            //      clears the identify result widgets and graphics on the map
            console.log('waterquality/Identify:clearIdentifyResults', arguments);

            this.map.graphics.clear();

            array.forEach(this.identifyResults, function (result) {
                result.destroy();
            });
        },
        loadIdentifyResult: function (g) {
            // summary:
            //      Creates an identify result and places it in the pane
            // g: esri.Graphic
            console.log('waterquality/Identify:loadIdentifyResult', arguments);

            var iResult = new IdentifyResult({
                graphic: g
            }, domConstruct.create('div', null, 'identify-results'));
            this.identifyResults.push(iResult);
        },
        onTaskError: function (er) {
            // summary:
            //      override
            // er: Error Object
            console.log('waterquality/Identify:onTaskError', arguments);

            console.error(er);
        }
    });
});
