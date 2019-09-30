import arcpy
import sys
from os.path import join


sde = sys.argv[1]
sdeStream = join(sde, 'SGID10.WATER.StreamsNHDHighRes')
waterQualityFGDB = sys.argv[2]
temp = join(waterQualityFGDB, 'temp')
temp2 = join(waterQualityFGDB, 'temp2')
temp3 = join(waterQualityFGDB, 'temp3')
streamsLocal = join(waterQualityFGDB, 'StreamsDissolved')
GNIS_Name = 'GNIS_Name'
COUNTY = 'COUNTY'
NAME = 'NAME'
counties = join(sde, 'SGID10.BOUNDARIES.Counties')
dissolveTempField = 'tempDissolve'

if arcpy.Exists(streamsLocal):
    print('deleting old streams local data')
    arcpy.Delete_management(streamsLocal)
    print(arcpy.GetMessages())

print('creating layer')
lyr = arcpy.MakeFeatureLayer_management(sdeStream, 'streamLayer', "\"%s\" is not null AND \"%s\" <> ''" % (GNIS_Name, GNIS_Name))
print(arcpy.GetMessages())

print('' + str(arcpy.GetCount_management(lyr)))

print('dissolving')
arcpy.Dissolve_management(lyr, temp, GNIS_Name)
print(arcpy.GetMessages())

print('Exploding lines')
arcpy.MultipartToSinglepart_management(temp, temp2)
print(arcpy.GetMessages())

print('identity')
arcpy.Identity_analysis(temp2, counties, temp3)
print(arcpy.GetMessages())

print('adding dissolve field')
arcpy.AddField_management(temp3, dissolveTempField, "TEXT", '', '', 50)
print(arcpy.GetMessages())

print('calculating dissolve field')
arcpy.CalculateField_management(temp3, dissolveTempField, '!%s! + !%s!' % (GNIS_Name, NAME), "PYTHON")
print(arcpy.GetMessages())

print('creating layer to filer outside of state')
lyr2 = arcpy.MakeFeatureLayer_management(temp3, 'tempLayer', "\"%s\" <> ''" % (NAME))
print(arcpy.GetMessages())

print('dissolving again')
arcpy.Dissolve_management(lyr2, streamsLocal, dissolveTempField)
print(arcpy.GetMessages())

print('joining fields')
arcpy.JoinField_management(streamsLocal, dissolveTempField, temp3, dissolveTempField, '%s;%s' % (GNIS_Name, NAME))
print(arcpy.GetMessages())

print('adding ' + COUNTY)
arcpy.AddField_management(streamsLocal, COUNTY, 'TEXT', '', '', 25)
print(arcpy.GetMessages())

print('calculating ' + COUNTY)
arcpy.CalculateField_management(streamsLocal, COUNTY, '!%s!' % (NAME), 'PYTHON')
print(arcpy.GetMessages())

print('deleting ' + NAME)
arcpy.DeleteField_management(streamsLocal, NAME)
print(arcpy.GetMessages())

print('delete')
arcpy.Delete_management(temp)
print(arcpy.GetMessages())
arcpy.Delete_management(temp2)
print(arcpy.GetMessages())
arcpy.Delete_management(temp3)
print(arcpy.GetMessages())

print('done')
