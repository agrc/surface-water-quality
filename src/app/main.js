define([
    'dojo/parser',

    'app/App'
],

function (
    parser
    ) {
    window.AGRC = {
        // errorLogger: ijit.modules.ErrorLogger
        errorLogger: null,

        // app: app.App
        //      global reference to App
        app: null,

        // version: String
        //      The version number.
        version: '1.1.1'
    };

    AGRC.fields = {
        streams: {
            GNIS_Name: 'GNIS_Name',
            COUNTY: 'COUNTY'
        },
        assessmentUnits: {
            AU_NAME: 'AssessmentUnits.AU_NAME',
            ASSESS_ID: 'AssessmentUnits.ASSESS_ID',
            BEN_CLASS: 'BEN_CLASS',
            CAT_2010: 'CAT_2010',
            TMDL_INFO: 'TMDL_INFO',
            Anti_DEGRD: 'Anti_DEGRD',
            COUNTY: 'AssessmentUnits.COUNTY'
        },
        aliases: {
            AU_NAME: 'Assessment Unit Name',
            ASSESS_ID: 'Unit ID',
            AU_DESCRIP: 'Unit Description',
            MGMT_UNIT: 'Watershed Management Unit',
            Anti_DEGRD: 'Anti-Degradation Category',
            BEN_CLASS: 'Beneficial Uses',
            CAT_2010: '2010 Assessment',
            CAUSE_2010: 'Beneficial Use: Cause of Impairment',
            TMDL_APPRV: 'TMDL Approved: Cause of Impairment',
            TMDL_INFO: 'TMDL Information',
            TMDL_REQRD: 'TMDL Required: 303d Cause of Impairment',
            HAB_IMPAIR: 'Aquatic Habitat Impairment',
            BLU_RIBBON: 'Blue Ribbon Fishery',
            Coordinator: 'Watershed Scientist',
            Email: 'Email',
            Phone: 'Phone',
            Address: 'Address',
            City: 'City',
            ZIP4: 'Zip4'
        }
    };
    AGRC.urls = {
        mapService: 'http://mapserv.utah.gov/ArcGIS/rest/services/SurfaceWaterQuality/MapService/MapServer',

        // hardcoded because I couldn't get the urlrewrite to work with posts on the server. :(
        gpService: 'http://mapserv.utah.gov/ArcGIS/rest/services/SurfaceWaterQuality/Toolbox/GPServer/Print'
    };
    // esri.config.defaults.io.proxyUrl = '/proxy/proxy.ashx';
    // lookup tables
    AGRC.luts = {
        BEN_CLASS: {
            '1C': 'Use Class 1C = Domestic/Drinking Water',
            '2A': 'Use Class 2A = Frequent primary contact recreation (e.g. swimming)',
            '2B': 'Use Class 2B = Infrequent primary contact recreation (e.g. wading, fishing)',
            '3A': 'Use Class 3A = Cold water fishery/aquatic life',
            '3B': 'Use Class 3B = Warm water fishery/aquatic life',
            '3C': 'Use Class 3C = Nongame fishery/aquatic life',
            '3D': 'Use Class 3D = Waterfowl, shore birds and associated aquatic life',
            '3E': 'Use Class 3E = Habitat limited waters',
            '4': 'Use Class 4 = Agricultural uses (crop irrigation and stock watering)',
            '5A': 'Use Class 5A = Infrequent primary and secondary contact recreation, waterfowl and shore birds',
            '5B': 'Use Class 5B = Infrequent primary and secondary contact recreation, waterfowl and shore birds',
            '5C': 'Use Class 5C = Infrequent primary and secondary contact recreation, waterfowl and shore birds',
            '5D': 'Use Class 5D = Infrequent primary and secondary contact recreation, waterfowl and shore birds'
        },
        CAT_2010: {
            '1': 'Assessment Category 1 = Not Impaired: all beneficial uses are supported',
            '2': 'Assessment Category 2 = Not impaired: assessed beneficial uses are supported, at least 1 use not assessed',
            '3': 'Assessment Category 3 = No assesssment (more data required)',
            '4A': 'Assessment Category 4A = Impaired: TMDL Approved',
            '4C': 'Assessment Category 4C = Impaired: TMDL not required (aquatic habitat impairment)',
            '5': 'Assessment Category 5 = Impaired: TMDL required (303d list)'
        },
        Anti_DEGRD: {
            '1': 'Category 1 = No point discharges allowed within U.S. Forest Service outer boundary or to other specified waters of R317-2-12',
            '2': 'Category 2 = No water quality degradation allowed',
            '3': 'Category 3 = Water quality degradation may be allowed outside USFS boundary pursuant to antidegradation review',
            '4': 'Category 1 = No point discharges within U.S. Forest Service outer boundary except Deer Creek = Category 2 (No degradation allowed from Forest Service boundary upstream 4800 feet)',
            '5': 'Category 1 = No point discharges within U.S. Forest Service outer boundary or to other specified waters of R317-2-12; Category 3 = degradation may be allowed for non-Category 1 waters pursuant to antidegradation review'
        }
    };


    // lights...camera...action!
    parser.parse();
});