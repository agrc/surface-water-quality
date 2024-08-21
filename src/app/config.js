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
        version: '1.3.6',

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
                TMDL_Info: 'TMDL_Info',
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
                ASSESSMENT: 'Assessment',
                IMPAIRMENT: 'Beneficial Use: Cause of Impairment',
                TMDL_APPRV: 'TMDL Approved: Cause of Impairment',
                TMDL_Info: 'TMDL Information',
                TMDL_REQRD: 'TMDL Required: 303d Cause of Impairment',
                HAB_IMPAIR: 'Aquatic Habitat Impairment',
                R317_2_13_reference: 'R317-2-13 Beneficial Use Reference',
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
            landOwnership: 'https://gis.trustlands.utah.gov/mapping/rest/services/Land_Ownership_WM/FeatureServer/0'
        },
        landOwnershipOpacity: 0.5,
        // lookup tables
        luts: {
            BEN_CLASS: {
                '1C': 'Use Class 1C = Domestic/Drinking Water Source',
                '2A': 'Use Class 2A = Frequent Primary Contact Recreation (e.g. swimming)',
                '2B': 'Use Class 2B = Infrequent Primary Contact Recreation (e.g. wading, fishing)',
                '3A': 'Class 3A = Cold Water Fishery/Aquatic Life',
                '3B': 'Use Class 3B = Warm Water Fishery/Aquatic Life',
                '3C': 'Use Class 3C = Nongame Fishery/Aquatic Life',
                '3D': 'Use Class 3D = Waterfowl, Shore Birds and Associated Aquatic Life',
                '4': 'Use Class 4 = Agriculture (crop irrigation, stock watering)',
                '5A': 'Use Class 5A = Great Salt Lake Gilbert Bay below 4208 feet elevation',
                '5B': 'Use Class 5B = Great Salt Lake Gunnison Bay below 4208 feet elevation',
                '5C': 'Use Class 5C = Great Salt Lake Bear River Bay below 4208 feet elevation, excluding evaporation ponds',
                '5D': 'Use Class 5D = Great Salt Lake Farmington Bay below 4208 feet elevation, excluding waterfowl management areas'
            }
        }
    };

    if (has('agrc-build') === 'prod') {
        config.urls.mapService = 'https://mapserv.utah.gov/arcgis/rest/services/SurfaceWaterQuality/MapService/MapServer';
        config.apiKey = 'AGRC-62420AEA530917';
        config.quadWord = 'editor-cinema-tango-hydro';
    } else if (has('agrc-build') === 'stage') {
        // *.dev.utah.gov
        config.urls.mapService = 'https://mapserv.utah.gov/arcgis/rest/services/SurfaceWaterQuality/MapService/MapServer';
        config.apiKey = 'AGRC-FE1B257E901672';
        config.quadWord = 'wedding-tactic-enrico-yes';
    } else {
        config.urls.mapService = 'https://mapserv.utah.gov/arcgis/rest/services/SurfaceWaterQuality/MapService/MapServer';
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
