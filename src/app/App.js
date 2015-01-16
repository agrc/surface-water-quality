define([
    'dijit/registry', 
    'dojo/dom', 
    'dojo/_base/declare',
    'dijit/_WidgetBase', 
    'dijit/_TemplatedMixin', 
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!app/templates/App.html',
    'agrc/widgets/map/BaseMap',
    'ijit/widgets/layout/SideBarToggler',
    'ijit/widgets/layout/PaneStack',
    'agrc/widgets/map/BaseMapSelector',
    'waterquality/Identify',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'waterquality/Print',
    'dojo/topic',
    'dojo/_base/Color',
    'esri/symbols/SimpleLineSymbol',
    'waterquality/StreamSearch',
    'dojo/_base/lang',
    'dojo/aspect',
    'agrc/widgets/locate/MagicZoom',
    'agrc/widgets/locate/ZoomToCoords',
    'dojo/_base/fx',
    'dojo/dom-style',

    'dijit/layout/BorderContainer',
    'dijit/layout/ContentPane'
], 

function (
    registry, 
    dom, 
    declare, 
    _WidgetBase, 
    _TemplatedMixin, 
    _WidgetsInTemplateMixin, 
    template, 
    BaseMap, 
    SideBarToggler, 
    PaneStack,
    BaseMapSelector,
    Identify,
    ArcGISDynamicMapServiceLayer,
    Print,
    topic,
    Color,
    SimpleLineSymbol,
    StreamSearch,
    lang,
    aspect,
    MagicZoom,
    ZoomToCoords,
    fx,
    domStyle
    ) {
    return declare("app/App", 
        [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], 
        {
        // summary:
        //      The main widget for the app

        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'app',

        // map: agrc.widgets.map.Basemap
        map: null,

        // identify: waterquality.Identify
        identify: null,
        
        constructor: function(){
            // summary:
            //      first function to fire after page loads
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

            // AGRC.errorLogger = new ErrorLogger({appName: 'ProjectName'});
            
            AGRC.app = this;

            this.inherited(arguments);
        },
        postCreate: function () {
            // summary:
            //      Fires when 
            console.log(this.declaredClass + "::" + arguments.callee.nom, arguments);
        
            // set version number
            this.version.innerHTML = AGRC.version;

            this.wireEvents();

            this.hideLoadingOverlay();

            this.inherited(arguments);
        },
        startup: function () {
            // summary:
            //      Fires after postCreate when all of the child widgets are finished laying out.
            console.log(this.declaredClass + "::" + arguments.callee.nom, arguments);

            // call this before creating the map to make sure that the map container is 
            // the correct size
            this.inherited(arguments);
            
            var ps;
            var sb;

            this.paneStack = new PaneStack(null, this.paneStack);
            
            this.initMap();
            this.initSearchTools();
            
            sb = new SideBarToggler({
                sidebar: this.sideBar.domNode,
                mainContainer: this.mainContainer,
                map: this.map,
                centerContainer: this.centerContainer.domNode
            }, this.sidebarToggle);

            this.inherited(arguments);
        },
        initMap: function(){
            // summary:
            //      Sets up the map
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
            
            this.identify = new Identify({
                url: AGRC.urls.mapService
                // errorLogger: AGRC.errorLogger
            });

            this.map = new BaseMap(this.mapDiv, {
                useDefaultBaseMap: false
            });

            var s;

            s = new BaseMapSelector({
                map: this.map,
                id: 'claro',
                position: 'TR',
                defaultThemeLabel: 'Lite'
            });

            this.identify.setMap(this.map);
            
            var lyr = ArcGISDynamicMapServiceLayer(AGRC.urls.mapService);
            this.map.addLayer(lyr);
            this.map.addLoaderToLayer(lyr);
            
            // disable popup
            var that = this;
            this.map.on('load', function () {
                that.map.graphics.disableMouseEvents();
            });

            // create new print widget
            this.print = new Print({
                map: this.map,
                bmSelector: s
            }, this.printDiv);
        },
        wireEvents: function () {
            // summary:
            //      description
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
            
            topic.subscribe('agrc.widgets.locate.MagicZoom.onZoom', this, function() {
                this.identify.clearIdentifyResults();
            });
        },
        initSearchTools: function(){
            // summary:
            //      description
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
            
            var color = new Color([255, 127, 1]);
            var lineSymbol = new SimpleLineSymbol()
                .setWidth(3)
                .setColor(color);
            
            var commonParams = {
                map: this.map,
                mapServiceURL: AGRC.urls.mapService,
                tooltipPosition: 'after',
                maxResultsToDisplay: 12
            };
            
            var ss = new StreamSearch(lang.mixin(commonParams,{
                promptMessage: 'Please begin typing a stream name...',
                searchLayerIndex: 2,
                searchField: AGRC.fields.streams.GNIS_Name,
                placeHolder: '',
                outFields: [AGRC.fields.streams.GNIS_Name, AGRC.fields.streams.COUNTY],
                countyField: AGRC.fields.streams.COUNTY
            }), 'stream-search');
            // set this after the constructor fires to prevent it from being overwritten
            ss.symbolLine = lineSymbol;
            
            var aName = new StreamSearch(lang.mixin(commonParams, {
                promptMessage: 'Please begin typing an assessment unit name...',
                searchLayerIndex: 1,
                searchField: AGRC.fields.assessmentUnits.AU_NAME,
                placeHolder: '',
                outFields: ['*'],
                countyField: AGRC.fields.assessmentUnits.COUNTY
            }), 'au-name-search');
            aName.symbolLine = lineSymbol;
            aspect.after(aName, 'onZoomed', lang.hitch(this, this.identifySearchResult), true);
            
            var aID = new MagicZoom(lang.mixin(commonParams, {
                promptMessage: 'Please begin typing an assessment unit id...',
                searchLayerIndex: 1,
                searchField: AGRC.fields.assessmentUnits.ASSESS_ID,
                placeHolder: ''
            }), 'au-id-search');
            aID.symbolLine = lineSymbol;
            aspect.after(aID, 'onZoomed', lang.hitch(this, this.identifySearchResult), true);
            
            var coords;
            coords = new ZoomToCoords({
                map: this.map
            }, 'zoom-to-coords');
            
            // clear search boxes when the user clicks on the map
            this.map.on("click", function () {
                ss._graphicsLayer.clear();
                aName._graphicsLayer.clear();
                aID._graphicsLayer.clear();
            });
        },
        hideLoadingOverlay: function(){
            // summary:
            //      fades out the loader overlay
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
            
            fx.fadeOut({
                node: 'loading-overlay',
                onEnd: function(n) {
                    domStyle.set(n, 'display', 'none');
                }
            }).play();
        },
        identifySearchResult: function (g) {
            // summary:
            //        sends the graphic that was zoomed to via the magic zoom to the identify class
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
            
            var newAtts = {};
            for (var key in g.attributes) {
                if (g.attributes.hasOwnProperty(key)) {
                    var newKey = key.split('.')[1];
                    newAtts[newKey] = g.attributes[key];
                }
            }
            g.attributes = newAtts;
            this.identify.onTaskComplete([{
                layerId: 1,
                feature: g,
                layerName: 'Assessment Unit',
                displayFieldName: 'AU_NAME'
            }]);
        }
    });
});