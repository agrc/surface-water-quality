define([
    'agrc/widgets/locate/ZoomToCoords',
    'agrc/widgets/map/BaseMap',

    'app/config',
    'app/Identify',
    'app/Print',

    'dijit/registry',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/aspect',
    'dojo/dom',
    'dojo/text!app/templates/App.html',
    'dojo/topic',
    'dojo/_base/Color',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'esri/geometry/Extent',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/symbols/SimpleLineSymbol',

    'ijit/widgets/layout/PaneStack',
    'ijit/widgets/layout/SideBarToggler',

    'layer-selector',

    'sherlock/providers/MapService',
    'sherlock/providers/WebAPI',
    'sherlock/Sherlock',

    'dijit/layout/BorderContainer',
    'dijit/layout/ContentPane'
], function (
    ZoomToCoords,
    BaseMap,

    config,
    Identify,
    Print,

    registry,
    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    aspect,
    dom,
    template,
    topic,
    Color,
    declare,
    lang,

    Extent,
    ArcGISDynamicMapServiceLayer,
    SimpleLineSymbol,

    PaneStack,
    SideBarToggler,

    LayerSelector,

    MapService,
    WebAPI,
    Sherlock
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //      The main widget for the app

        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'app',

        // map: agrc.widgets.map.Basemap
        map: null,

        // identify: waterquality.Identify
        identify: null,

        constructor: function () {
            // summary:
            //      first function to fire after page loads
            console.log('app/App:constructor', arguments);

            config.app = this;

            this.inherited(arguments);
        },
        postCreate: function () {
            // summary:
            //      Fires when
            console.log('app/App:postCreate', arguments);

            // set version number
            this.version.innerHTML = config.version;

            this.wireEvents();

            this.inherited(arguments);
        },
        startup: function () {
            // summary:
            //      Fires after postCreate when all of the child widgets are finished laying out.
            console.log('app/App:startup', arguments);

            // call this before creating the map to make sure that the map container is
            // the correct size
            this.inherited(arguments);

            this.paneStack = new PaneStack(null, this.paneStack);

            this.initMap();
            this.initSearchTools();

            new SideBarToggler({
                sidebar: this.sideBar.domNode,
                mainContainer: this.mainContainer,
                map: this.map,
                centerContainer: this.centerContainer.domNode
            }, this.sidebarToggle);

            this.inherited(arguments);
        },
        initMap: function () {
            // summary:
            //      Sets up the map
            console.log('app/App:initMap', arguments);

            this.identify = new Identify({
                url: config.urls.mapService
            });

            this.map = new BaseMap(this.mapDiv, {
                useDefaultBaseMap: false,
                extent: new Extent({
                    xmax: -11762120.612131765,
                    xmin: -13074391.513731329,
                    ymax: 5225035.106177688,
                    ymin: 4373832.359194187,
                    spatialReference: {
                        wkid: 3857
                    }
                }),
                showAttribution: false
            });

            var layerSelector = new LayerSelector({
                map: this.map,
                quadWord: config.quadWord,
                baseLayers: ['Lite', 'Hybrid', 'Terrain', 'Topo'],
                overlays: [{
                    Factory: ArcGISDynamicMapServiceLayer,
                    url: config.urls.landOwnership,
                    id: 'Land Ownership',
                    opacity: config.landOwnershipOpacity
                }]
            });
            layerSelector.startup();

            this.identify.setMap(this.map);

            var lyr = new ArcGISDynamicMapServiceLayer(config.urls.mapService);
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
                layerSelector: layerSelector
            }, this.printDiv);
        },
        wireEvents: function () {
            // summary:
            //      description
            console.log('app/App:wireEvents', arguments);

            topic.subscribe('agrc.widgets.locate.MagicZoom.onZoom', this, function () {
                this.identify.clearIdentifyResults();
            });
        },
        initSearchTools: function () {
            // summary:
            //      description
            console.log('app/App:initSearchTools', arguments);

            var color = new Color([255, 127, 1]);
            var lineSymbol = new SimpleLineSymbol()
                .setWidth(3)
                .setColor(color);

            var commonParams = {
                map: this.map,
                tooltipPosition: 'after',
                maxResultsToDisplay: 12
            };

            var streamProvider = new MapService(
                config.urls.mapService + '/2',
                config.fields.streams.GNIS_Name,
                {
                    contextField: config.fields.streams.COUNTY
                });
            var ss = new Sherlock(lang.mixin(commonParams, {
                provider: streamProvider,
                promptMessage: 'Please begin typing a stream name...',
                placeHolder: ''
            }), 'stream-search');
            // set this after the constructor fires to prevent it from being overwritten
            ss.symbolLine = lineSymbol;

            var assessmentUnitNameProvider = new MapService(
                config.urls.mapService + '/1',
                'AssessmentUnits.' + config.fields.assessmentUnits.AU_NAME,
                {
                    outFields: ['*']
                });
            var aName = new Sherlock(lang.mixin(commonParams, {
                provider: assessmentUnitNameProvider,
                promptMessage: 'Please begin typing an assessment unit name...',
                placeHolder: ''
            }), 'au-name-search');
            aName.symbolLine = lineSymbol;
            aspect.after(aName, 'onZoomed', lang.hitch(this, this.identifySearchResult), true);

            var assessmentUnitIdProvider = new MapService(
                config.urls.mapService + '/1',
                'AssessmentUnits.' + config.fields.assessmentUnits.ASSESS_ID,
                {
                    outFields: ['*']
                });
            var aID = new Sherlock(lang.mixin(commonParams, {
                provider: assessmentUnitIdProvider,
                promptMessage: 'Please begin typing an assessment unit id...',
                placeHolder: ''
            }), 'au-id-search');
            aID.symbolLine = lineSymbol;
            aspect.after(aID, 'onZoomed', lang.hitch(this, this.identifySearchResult), true);

            new ZoomToCoords({
                map: this.map
            }, 'zoom-to-coords');

            // clear search boxes when the user clicks on the map
            this.map.on('click', function () {
                ss.graphicsLayer.clear();
                aName.graphicsLayer.clear();
                aID.graphicsLayer.clear();
            });
        },
        identifySearchResult: function (g) {
            // summary:
            //        sends the graphic that was zoomed to via the magic zoom to the identify class
            console.log('app/App:identifySearchResult', arguments);

            this.identify.onTaskComplete([{
                layerId: 1,
                feature: g,
                layerName: 'AssessmentUnits',
                displayFieldName: 'AU_NAME'
            }]);
        }
    });
});
