define([
    'dojo/_base/declare',
    'dojo/_base/event',
    'dojo/_base/Color',
    'dojo/_base/lang',
    'dojo/query',
    'dojo/on',
    'dojo/mouse',
    'dojo/text!waterquality/templates/IdentifyResult.html',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/SimpleFillSymbol'

], 

function (
    declare,
    event,
    Color,
    lang,
    query,
    on,
    mouse,
    template,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    SimpleLineSymbol,
    SimpleFillSymbol
    ) {
    return declare("waterquality/IdentifyResult", 
        [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //      summary

        widgetsInTemplate: true,
        templateString: template,
        baseClass: "identify-result",
        
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
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
            
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
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
            
            this.featureTitle.innerHTML = this.graphic.getTitle();
            this.attributes.innerHTML = this.graphic.getContent();
            
            // toggle TMDL link visibility
            var tmdl = this.graphic.attributes[AGRC.fields.assessmentUnits.TMDL_INFO];
            if (!tmdl) {
                query('.tmdl-link').addClass('hidden');
            }
            
            // set symbol
            this.graphic.symbol = (this.graphic.geometry.type === 'polyline') ? this.lineSymbol : this.fillSymbol;
            
            AGRC.app.map.graphics.add(this.graphic);

            this._wireEvents();
        },
        _wireEvents: function () {
            // summary:
            //    Wires events.
            // tags:
            //    private
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
            
            on(this.zoomTo, 'click', lang.hitch(this, this.onZoomToClick));
            
            on(this.domNode, mouse.enter, lang.hitch(this, this.onMouseEnter));
            on(this.domNode, mouse.leave, lang.hitch(this, this.onMouseLeave));
        },
        onZoomToClick: function (evt) {
            // summary:
            //      Fires when the user clicks on the zoom to link
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
            
            event.stop(evt);
            
            AGRC.app.map.setExtent(this.graphic.geometry.getExtent(), true);
        },
        onMouseEnter: function () {
            // summary:
            //      fires when the user mouses over the widget
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
            
            this.updateGraphicColor(this.highlightColor);
        },
        onMouseLeave: function () {
            // summary:
            //      fires when the user mouses out of the widget
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
            
            this.updateGraphicColor(this.color);
        },
        updateGraphicColor: function (color) {
            // summary:
            //      changes the color of the graphic
            // color: Color
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
            
            if (this.graphic.geometry.type === 'polyline') {
                this.graphic.setSymbol(this.lineSymbol.setColor(color));
            } else {
                this.graphic.setSymbol(this.fillSymbol.setOutline(this.lineSymbol.setColor(color)));
            }
        }
    });
});

