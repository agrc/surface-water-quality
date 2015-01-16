/* jshint camelcase:false */
define([
	'agrc/widgets/locate/MagicZoom',
	'agrc/widgets/locate/ZoomToCoords',
	'agrc/widgets/map/BaseMap',
	'agrc/widgets/map/BaseMapSelector',

	'dijit/_TemplatedMixin',
	'dijit/_WidgetBase',
	'dijit/_WidgetsInTemplateMixin',
	'dijit/registry',

	'dojo/_base/Color',
	'dojo/_base/declare',
	'dojo/_base/lang',
	'dojo/aspect',
	'dojo/dom',
	'dojo/text!app/templates/App.html',
	'dojo/topic',

	'esri/layers/ArcGISDynamicMapServiceLayer',
	'esri/symbols/SimpleLineSymbol',

	'ijit/widgets/layout/PaneStack',
	'ijit/widgets/layout/SideBarToggler',

	'waterquality/Identify',
	'waterquality/Print',
	'waterquality/StreamSearch',

	'app/config',
	'dijit/layout/BorderContainer',
	'dijit/layout/ContentPane'
], function(
	MagicZoom,
	ZoomToCoords,
	BaseMap,
	BaseMapSelector,

	_TemplatedMixin,
	_WidgetBase,
	_WidgetsInTemplateMixin,
	registry,

	Color,
	declare,
	lang,
	aspect,
	dom,
	template,
	topic,

	ArcGISDynamicMapServiceLayer,
	SimpleLineSymbol,

	PaneStack,
	SideBarToggler,

	Identify,
	Print,
	StreamSearch
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

		constructor: function() {
			// summary:
			//      first function to fire after page loads
			console.log('app/App:constructor', arguments);

			// AGRC.errorLogger = new ErrorLogger({appName: 'ProjectName'});

			AGRC.app = this;

			this.inherited(arguments);
		},
		postCreate: function() {
			// summary:
			//      Fires when
			console.log('app/App:postCreate', arguments);

			// set version number
			this.version.innerHTML = AGRC.version;

			this.wireEvents();

			this.inherited(arguments);
		},
		startup: function() {
			// summary:
			//      Fires after postCreate when all of the child widgets are finished laying out.
			console.log('app/App:startup', arguments);

			// call this before creating the map to make sure that the map container is
			// the correct size
			this.inherited(arguments);

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
		initMap: function() {
			// summary:
			//      Sets up the map
			console.log('app/App:initMap', arguments);

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

			var lyr = new ArcGISDynamicMapServiceLayer(AGRC.urls.mapService);
			this.map.addLayer(lyr);
			this.map.addLoaderToLayer(lyr);

			// disable popup
			var that = this;
			this.map.on('load', function() {
				that.map.graphics.disableMouseEvents();
			});

			// create new print widget
			this.print = new Print({
				map: this.map,
				bmSelector: s
			}, this.printDiv);
		},
		wireEvents: function() {
			// summary:
			//      description
			console.log('app/App:wireEvents', arguments);

			topic.subscribe('agrc.widgets.locate.MagicZoom.onZoom', this, function() {
				this.identify.clearIdentifyResults();
			});
		},
		initSearchTools: function() {
			// summary:
			//      description
			console.log('app/App:initSearchTools', arguments);

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

			var ss = new StreamSearch(lang.mixin(commonParams, {
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
			this.map.on('click', function() {
				ss._graphicsLayer.clear();
				aName._graphicsLayer.clear();
				aID._graphicsLayer.clear();
			});
		},
		identifySearchResult: function(g) {
			// summary:
			//        sends the graphic that was zoomed to via the magic zoom to the identify class
			console.log('app/App:identifySearchResult', arguments);

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
