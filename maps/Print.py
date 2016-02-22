import arcpy
from json import loads
from os.path import join
import os

'''
GP Parameters
0 - baseMap: String - name of the cached service (e.g. 'Streets')
1 - extent: {xmin: Number, ymin: Number, xmax: Number, ymax: Number}
2 - selectedPolys: featureSet (schema is BlankPoly)
3 - selectedLines: featureSet (schema is BlankLine)
4 - attributes: String - the text that shows up at the bottom of the map
5 - outFile: String (output parameter, path to pdf file)
'''

# variables
cwd = os.path.dirname(os.path.realpath(__file__))
mxdPath = join(cwd, 'PrintTemplate.mxd')
outFileName = 'map.pdf'
scratch = arcpy.env.scratchFolder
outPDF = join(scratch, outFileName)
scratchGDB = join(scratch, 'scratch.gdb')
if arcpy.Exists(scratchGDB) is False:
    arcpy.CreateFileGDB_management(scratch, 'scratch.gdb')
BlankPoly = join(scratchGDB, 'BlankPoly')
BlankLine = join(scratchGDB, 'BlankLine')


def scrub(parameter):
    if parameter == '#' or not parameter:
        return None
    else:
        return parameter


def addSelectedFeatures(features, targetFC, layerInd):
    name = targetFC.split('\\')[-1]
    arcpy.AddMessage('Adding selected %s' % name)
    arcpy.CopyFeatures_management(features, targetFC)
    lyr = lyrs[layerInd]
    lyr.replaceDataSource(scratchGDB, 'FILEGDB_WORKSPACE', name)
    lyr.visible = True


arcpy.AddMessage('Getting parameters')
baseMap = arcpy.GetParameterAsText(0)
extent = loads(arcpy.GetParameterAsText(1))
selectedPolys = scrub(arcpy.GetParameterAsText(2))
arcpy.AddMessage('selectedPolys: %s' % selectedPolys)
selectedLines = scrub(arcpy.GetParameterAsText(3))
attributes = scrub(arcpy.GetParameterAsText(4))

arcpy.AddMessage('Opening mxd')
mxd = arcpy.mapping.MapDocument(mxdPath)

arcpy.AddMessage('Displaying base map layer')
lyrs = arcpy.mapping.ListLayers(mxd)
for l in lyrs:
    if l.name == baseMap:
        l.visible = True

arcpy.AddMessage('Updating extent')
dataFrame = arcpy.mapping.ListDataFrames(mxd)[0]
mxdExtent = dataFrame.extent
mxdExtent.XMin = extent['xmin']
mxdExtent.YMin = extent['ymin']
mxdExtent.XMax = extent['xmax']
mxdExtent.YMax = extent['ymax']
dataFrame.extent = mxdExtent

if selectedPolys:
    addSelectedFeatures(selectedPolys, BlankPoly, 1)

if selectedLines:
    addSelectedFeatures(selectedLines, BlankLine, 0)

if attributes:
    txt = arcpy.mapping.ListLayoutElements(mxd, 'TEXT_ELEMENT', 'attributes')[0]
    arcpy.AddMessage('attributes: %s' % attributes)
    arcpy.AddMessage('attributes.decode: %s' % attributes.decode('string-escape'))
    txt.text = attributes.decode('string-escape')

arcpy.AddMessage('Exporting map to PDF')
arcpy.mapping.ExportToPDF(mxd, outPDF)

arcpy.SetParameterAsText(5, outPDF)

arcpy.AddMessage('Done.')
