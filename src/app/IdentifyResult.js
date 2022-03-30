define([
    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/mouse',
    'dojo/on',
    'dojo/query',
    'dojo/text!app/templates/IdentifyResult.html',
    'dojo/_base/Color',
    'dojo/_base/declare',
    'dojo/_base/event',
    'dojo/_base/lang',

    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/SimpleLineSymbol'
],

function (
    config,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    mouse,
    on,
    query,
    template,
    Color,
    declare,
    event,
    lang,

    SimpleFillSymbol,
    SimpleLineSymbol
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //      summary

        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'identify-result',

        // lineSymbol: esri.symbol.SimpleLineSymbol
        lineSymbol: null,

        // highlightLineSymbol: esri.symbol.SimpleLineSymbol
        highlightLineSymbol: null,

        // highlightColor: Color
        //      The color that is used to highlight the features when the user
        //      hovers over the attributes
        highlightColor: null,

        // color: Color
        //      The color of the symbol used to display the identified symbols
        color: null,


        // Parameters to constructor

        // graphic: esri.Graphic
        graphic: null,

        constructor: function (/*params, div*/) {
            // summary:
            //    Constructor method
            // params: Object
            //    Parameters to pass into the widget. Required values include:
            // div: String|DomNode
            //    A reference to the div that you want the widget to be created in.
            console.log('app/IdentifyResult:constructor', arguments);

            // build symbols and colors
            this.color = new Color([1, 255, 255]);
            this.lineSymbol = new SimpleLineSymbol()
                .setWidth(5)
                .setColor(this.color);
            this.fillSymbol = new SimpleFillSymbol()
                .setStyle(SimpleFillSymbol.STYLE_NULL)
                .setOutline(this.lineSymbol);
            this.highlightColor = new Color([255, 1, 1]);
        },
        postCreate: function () {
            // summary:
            //    Overrides method of same name in dijit._Widget.
            // tags:
            //    private
            console.log('app/IdentifyResult:postCreate', arguments);

            this.featureTitle.innerHTML = this.graphic.getTitle();
            this.attributes.innerHTML = this.graphic.getContent();

            // toggle TMDL link visibility
            var tmdl = this.graphic.attributes[config.fields.assessmentUnits.TMDL_Info];
            if (!tmdl) {
                query('.tmdl-link').addClass('hidden');
            }

            // set symbol
            this.graphic.symbol = (this.graphic.geometry.type === 'polyline') ? this.lineSymbol : this.fillSymbol;

            config.app.map.graphics.add(this.graphic);

            this._wireEvents();
        },
        _wireEvents: function () {
            // summary:
            //    Wires events.
            // tags:
            //    private
            console.log('app/IdentifyResult:_wireEvents', arguments);

            on(this.zoomTo, 'click', lang.hitch(this, this.onZoomToClick));

            on(this.domNode, mouse.enter, lang.hitch(this, this.onMouseEnter));
            on(this.domNode, mouse.leave, lang.hitch(this, this.onMouseLeave));
        },
        onZoomToClick: function (evt) {
            // summary:
            //      Fires when the user clicks on the zoom to link
            console.log('app/IdentifyResult:onZoomToClick', arguments);

            event.stop(evt);

            config.app.map.setExtent(this.graphic.geometry.getExtent(), true);
        },
        onMouseEnter: function () {
            // summary:
            //      fires when the user mouses over the widget
            console.log('app/IdentifyResult:onMouseEnter', arguments);

            this.updateGraphicColor(this.highlightColor);
        },
        onMouseLeave: function () {
            // summary:
            //      fires when the user mouses out of the widget
            console.log('app/IdentifyResult:onMouseLeave', arguments);

            this.updateGraphicColor(this.color);
        },
        updateGraphicColor: function (color) {
            // summary:
            //      changes the color of the graphic
            // color: Color
            console.log('app/IdentifyResult:updateGraphicColor', arguments);

            if (this.graphic.geometry.type === 'polyline') {
                this.graphic.setSymbol(this.lineSymbol.setColor(color));
            } else {
                this.graphic.setSymbol(this.fillSymbol.setOutline(this.lineSymbol.setColor(color)));
            }
        }
    });
});
