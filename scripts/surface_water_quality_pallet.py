#!/usr/bin/env python
# * coding: utf8 *
'''
surface_water_quality_pallet.py

A module that contains a pallet definition for the surface water quality project
'''


from forklift.models import Pallet
from os.path import join, dirname, realpath


class SurfaceWaterQualityPallet(Pallet):
    def build(self, configuration):
        self.arcgis_services = [('SurfaceWaterQuality/MapService', 'MapServer'),
                                ('SurfaceWaterQuality/Toolbox', 'GPServer')]

        self.sgid = join(self.garage, 'SGID10.sde')
        self.water = join(self.staging_rack, 'water.gdb')

        self.copy_data = [self.water]

        self.add_crate(('StreamsNHDHighRes', self.sgid, self.water))

        self.static_data = [join(dirname(realpath(__file__)), '..', 'data', 'surfacewaterquality.gdb')]
