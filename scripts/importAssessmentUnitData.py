"""
Using to import the data from water quality into the file geodatabase that the app is pointed at

Adds a new county field and populates is only for features that have duplicate au names to help
with the magic zoom in the app

Scott - 6-14-12
"""

import arcpy
from agrc import arcpy_helpers

wqdata = r'C:\inetpub\wwwroot\SurfaceWaterQuality\data\assess_units_all.shp'
AssessmentUnits = r'C:\inetpub\wwwroot\serverprojects\MapData\SurfaceWaterQuality\Data.gdb\AssessmentUnits'
counties = r'C:\inetpub\wwwroot\serverprojects\MapData\SGID10.gdb\Counties'

scratch = r'C:\PythonScripts\scratch\scratch.gdb'
tempJoin = r'{0}\tempJoin'.format(scratch)
tempFrequency = r'{0}\tempFrequency'.format(scratch)

fldAU_NAME = 'AU_NAME'
fldOBJECTID = 'OBJECTID'
fldTARGET_FID = 'TARGET_FID'
fldFID = 'FID'
fldCOUNTY = 'COUNTY'
fldNAME = 'NAME'
fldFREQUENCY = 'FREQUENCY'

wqdataLayer = 'wqdataLayer'
newLayer = 'newLayer'

print 'adding county field...'
arcpy.AddField_management(wqdata, fldCOUNTY, 'TEXT', '#', '#', 30)

print 'deleting temp data...'
arcpy_helpers.DeleteIfExists([tempJoin, tempFrequency])

print 'spatial joining...'
arcpy.SpatialJoin_analysis(wqdata, counties, tempJoin)

print 'making layer...'
arcpy.MakeFeatureLayer_management(wqdata, wqdataLayer)

print 'adding join join...'
arcpy.AddJoin_management(wqdataLayer, fldFID, tempJoin, fldTARGET_FID)

print 'calculating county field...'
arcpy.CalculateField_management(wqdataLayer, '{0}.{1}'.format('assess_units_all', fldCOUNTY), 
                                '!{0}.{1}!'.format('tempJoin', fldNAME), 'PYTHON')

print 'deleting layer...'
arcpy_helpers.DeleteIfExists([wqdataLayer])

print 'making new layer...'
arcpy.MakeFeatureLayer_management(wqdata, wqdataLayer)

print 'frequency analysis...'
arcpy.Frequency_analysis(wqdata, tempFrequency, fldAU_NAME)

print 'deleting old data...'
arcpy_helpers.DeleteIfExists([AssessmentUnits])

print 'copying new data...'
arcpy.CopyFeatures_management(wqdata, AssessmentUnits)

print 'creating new layer...'
arcpy.MakeFeatureLayer_management(AssessmentUnits, newLayer)

print 'adding freqency join...'
arcpy.AddJoin_management(newLayer, fldAU_NAME, tempFrequency, fldAU_NAME)

print 'selecting non-dups'
arcpy.SelectLayerByAttribute_management(newLayer, 'NEW_SELECTION', '{0} = 1'.format(fldFREQUENCY))

print 'deleting county values...'
arcpy.CalculateField_management(newLayer, 'COUNTY', 'None', 'PYTHON')
print arcpy.GetMessages()

print 'done'