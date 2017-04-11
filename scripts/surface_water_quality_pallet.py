#!/usr/bin/env python
# * coding: utf8 *
'''
surface_water_quality_pallet.py

A module that contains a pallet definition for the surface water quality project
'''


from forklift.models import Pallet
from os.path import join


class SurfaceWaterQualityPallet(Pallet):
    def build(self, configuration):
        self.arcgis_services = [('SurfaceWaterQuality/MapService', 'MapServer'),
                                ('SurfaceWaterQuality/Toolbox', 'GPServer')]
        self.staging = 'C:\\Scheduled\\staging'

        self.sgid = join(self.garage, 'SGID10.sde')
        self.water = join(self.staging, 'water.gdb')

        self.copy_data = [self.water]

        self.add_crate(('StreamsNHDHighRes', self.sgid, self.water))