import arcpy

sdeStream = r'C:\inetpub\wwwroot\serverprojects\MapData\SGID10.gdb\StreamsNHDHighRes'
waterQualityFGDB = r'C:\inetpub\wwwroot\serverprojects\MapData\SurfaceWaterQuality\Data_1.gdb'
temp = waterQualityFGDB + '\\temp'
temp2 = waterQualityFGDB + '\\temp2'
temp3 = waterQualityFGDB + '\\temp3'
streamsLocal = waterQualityFGDB + '\\StreamsDissolved'
GNIS_Name = 'GNIS_Name'
COUNTY = 'COUNTY'
NAME = 'NAME'
counties = r'Database Connections\SGID10_DirectConnect.sde\SGID10.BOUNDARIES.Counties'
dissolveTempField = 'tempDissolve'

if arcpy.Exists(streamsLocal):
    print 'deleting old streams local data'
    arcpy.Delete_management(streamsLocal)
    print arcpy.GetMessages()

print '\n\ncreating layer'
lyr = arcpy.MakeFeatureLayer_management(sdeStream, 'streamLayer', "\"%s\" is not null AND \"%s\" <> ''" % (GNIS_Name, GNIS_Name))
print arcpy.GetMessages()

print '\n\n' + str(arcpy.GetCount_management(lyr))

print '\n\ndissolving'
arcpy.Dissolve_management(lyr, temp, GNIS_Name)
print arcpy.GetMessages()

print '\n\nExploding lines'
arcpy.MultipartToSinglepart_management(temp, temp2)
print arcpy.GetMessages()

print '\n\nidentity'
arcpy.Identity_analysis(temp2, counties, temp3)
print arcpy.GetMessages()

print '\n\nadding dissolve field'
arcpy.AddField_management(temp3, dissolveTempField, "TEXT", '', '', 50)
print arcpy.GetMessages()

print '\n\ncalculating dissolve field'
arcpy.CalculateField_management(temp3, dissolveTempField, '!%s! + !%s!' % (GNIS_Name, NAME), "PYTHON")
print arcpy.GetMessages()

print '\n\ncreating layer to filer outside of state'
lyr2 = arcpy.MakeFeatureLayer_management(temp3, 'tempLayer', "\"%s\" <> ''" % (NAME))
print arcpy.GetMessages()

print '\n\ndissolving again'
arcpy.Dissolve_management(lyr2, streamsLocal, dissolveTempField)
print arcpy.GetMessages()

print '\n\njoining fields'
arcpy.JoinField_management(streamsLocal, dissolveTempField, temp3, dissolveTempField, '%s;%s' % (GNIS_Name, NAME))
print arcpy.GetMessages()

print '\n\nadding ' + COUNTY
arcpy.AddField_management(streamsLocal, COUNTY, 'TEXT', '', '', 25)
print arcpy.GetMessages()

print '\n\ncalculating ' + COUNTY
arcpy.CalculateField_management(streamsLocal, COUNTY, '!%s!' % (NAME), 'PYTHON')
print arcpy.GetMessages()

print '\n\ndeleting ' + NAME
arcpy.DeleteField_management(streamsLocal, NAME)
print arcpy.GetMessages()

print '\n\ndelete'
#arcpy.Delete_management(temp)
#print arcpy.GetMessages()
#arcpy.Delete_management(temp2)
#print arcpy.GetMessages()
#arcpy.Delete_management(temp3)
#print arcpy.GetMessages()

print 'done'