<?php
/**
 * This class provides necessary URI's which are used in the DataCube vocabulary.
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Ivan Ermilov
 * @author Konrad Abicht
 */
class DataCube_UriOf
{    
    // namespace
    const Qb = "http://purl.org/linked-data/cube#";
    const Cube = "http://purl.org/linked-data/cube#";
    
    // cube concepts
    const DataStructureDefinition = "http://purl.org/linked-data/cube#DataStructureDefinition";
    const ComponentSpecification = "http://purl.org/linked-data/cube#ComponentSpecification";
    const ComponentProperty = "http://purl.org/linked-data/cube#ComponentProperty";
    const DimensionProperty = "http://purl.org/linked-data/cube#DimensionProperty";
    const MeasureProperty = "http://purl.org/linked-data/cube#MeasureProperty";
    const AttributeProperty = "http://purl.org/linked-data/cube#AttributeProperty";
    const DataSet = "http://purl.org/linked-data/cube#DataSet";
    const Observation = "http://purl.org/linked-data/cube#Observation";

    // cube properties
    const Attribute = "http://purl.org/linked-data/cube#attribute";
    const Component = "http://purl.org/linked-data/cube#component";
    const DataSetRelation = "http://purl.org/linked-data/cube#dataSet";
    const Dimension = "http://purl.org/linked-data/cube#dimension";
    const Measure = "http://purl.org/linked-data/cube#measure";
    const Order = "http://purl.org/linked-data/cube#order";
    const SliceKey = "http://purl.org/linked-data/cube#sliceKey";
    const SliceStructure = "http://purl.org/linked-data/cube#sliceStructure";
    const Structure = "http://purl.org/linked-data/cube#structure";
}
