define([
    'dojo/has',
    'dojo/request/xhr'
], function (
    has,
    xhr
) {
    var config = {
        // app: app.App
        //      global reference to App
        app: null,

        // version.: String
        //      The version number.
        version: '1.3.3',

        fields: {
            streams: {
                GNIS_Name: 'GNIS_Name',
                COUNTY: 'COUNTY'
            },
            assessmentUnits: {
                AU_NAME: 'AU_NAME',
                ASSESS_ID: 'ASSESS_ID',
                BEN_CLASS: 'BEN_CLASS',
                ASSESSMENT: 'ASSESSMENT',
                TMDL_INFO: 'TMDL_INFO',
                Anti_DEGRD: 'ANTI_DEGRD',
                COUNTY: 'COUNTY'
            },
            aliases: {
                AU_NAME: 'Assessment Unit Name',
                ASSESS_ID: 'Unit ID',
                AU_DESCRIP: 'Unit Description',
                MGMT_UNIT: 'Watershed Management Unit',
                ANTI_DEGRD: 'Anti-Degradation Category',
                BEN_CLASS: 'Beneficial Uses',
                ASSESSMENT: '2016 Assessment',
                IMPAIRMENT: 'Beneficial Use: Cause of Impairment',
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
        },
        urls: {
            gpService: 'https://mapserv.utah.gov/arcgis/rest/services/SurfaceWaterQuality/Toolbox/GPServer/Print',
            landOwnership: 'https://tlamap.trustlands.utah.gov/arcgis/rest/services/UT_SITLA_LandOwnership/MapServer'
        },
        landOwnershipOpacity: 0.5,
        // lookup tables
        luts: {
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
                '5A': 'Use Class 5A = Frequent primary and secondary contact recreation, waterfowl, shore birds and aquatic wildlife',
                '5B': 'Use Class 5B = Infrequent primary and secondary contact recreation, waterfowl, shore birds and aquatic wildlife',
                '5C': 'Use Class 5C = Infrequent primary and secondary contact recreation, waterfowl, shore birds and aquatic wildlife',
                '5D': 'Use Class 5D = Infrequent primary and secondary contact recreation, waterfowl, shore birds and aquatic wildlife'
            }
        }
    };

    if (has('agrc-build') === 'prod') {
        config.urls.mapService = 'https://mapserv.utah.gov/arcgis/rest/services/SurfaceWaterQuality/MapService/MapServer';
        config.apiKey = 'AGRC-62420AEA530917';
        config.quadWord = 'ivory-telecom-person-medusa';
    } else if (has('agrc-build') === 'stage') {
        // *.dev.utah.gov
        config.urls.mapService = 'https://test.mapserv.utah.gov/arcgis/rest/services/SurfaceWaterQuality/MapService/MapServer';
        config.apiKey = 'AGRC-FE1B257E901672';
        config.quadWord = 'wedding-tactic-enrico-yes';
    } else {
        config.urls.mapService = 'http://localhost/arcgis/rest/services/SurfaceWaterQuality/MapService/MapServer';
        xhr(require.baseUrl + 'secrets.json', {
            handleAs: 'json',
            sync: true
        }).then(function (secrets) {
            config.quadWord = secrets.quadWord;
        }, function () {
            throw 'Error getting secrets!';
        });
    }

    return config;
});
