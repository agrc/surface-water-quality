[![Build Status](https://travis-ci.org/agrc/surface-water-quality.svg?branch=master)](https://travis-ci.org/agrc/surface-water-quality)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/agrc-surface-water.svg)](https://saucelabs.com/u/agrc-surface-water)
# surface-water-quality
Beneficial Uses and Water Quality Assessment Map


Sauce User Name: `agrc-surface-water` (full project name was too long)

Test: [test.mapserv.utah.gov/surfacewaterquality/](http://test.mapserv.utah.gov/surfacewaterquality/)  
Prod: [mapserv.utah.gov/surfacewaterquality/](http://mapserv.utah.gov/surfacewaterquality/)  

## Deployment

1. Publish `maps/MapService.mxd` to `SurfaceWaterQuality/MapService`
1. Publish `maps/Toolbox.tbx/Print` to `SurfaceWaterQuality/Toolbox/Print` (as sync)
    1. Sample extent: `{"xmin": -12919532.7897878, "ymin": 4887717.877952026, "xmax": -11941138.8277378, "ymax": 5379360.843882151}`
