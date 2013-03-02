<?php
/**
 * This class provide interface for querying the Data Cube
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Ivan Ermilov 
 * @author Konrad Abicht 
 */
class DataCube_Query 
{    
    protected $_model = null;
    protected $_store = null;
    
    /**
     * Constructor
     */
    public function __construct (&$model)
    {
        $this->_model = $model;
        $this->_store = $model->getStore();
    }
    
    /**
     * Check if there is at least one observation in the knowledgebase
     */
    public function containsDataCubeInformation () {
        $sparql = 'PREFIX qb:<http://purl.org/linked-data/cube#>
                    ASK FROM http://data.lod2.eu/scoreboard/ 
                    {
                        ?observation a qb:Observation .
                        ?observation qb:dataSet ?dataset .
                        ?observation ?dimension ?dimelement .
                        ?observation ?measure ?value .

                        ?dataset a qb:DataSet .
                        ?dataset qb:structure ?datastructuredefintion .

                        ?datastructuredefintion a qb:DataStructureDefinition .
                        ?datastructuredefintion qb:component ?dimensionspecification .
                        ?datastructuredefintion qb:component ?measurespecification .

                        ?dimensionspecification a qb:ComponentSpecification .
                        ?dimensionpecification qb:dimension ?dimension .

                        ?measurespecification a qb:ComponentSpecification .
                        ?measurespecification qb:measure ?measure .
                    }';
            
        return 1 == count ( $this->_model->sparqlQuery($sparql) ) ? true : false;
    }
    
    /**
     * Add additional fields to each entry of the given array. These fields are
     * heavily used in the UI. Each field starts with __cv_ and could be ignored
     * usally.
     * @param $assocSPOArray Usally the result of generateAssocSPOArrayFromSparqlResult
     * @return Array An enriched version of given $assocSPOArray
     */
    public function enrichResult($assocSPOArray) 
    {
        $return = array();
        $titleHelper = new OntoWiki_Model_TitleHelper ($this->_model);
        
        /**
         * go through all entries to add them to title helper
         */
        foreach($assocSPOArray as $mainKey => $entry) {
            $titleHelper->addResource($mainKey);
        }
        
        /**
         * enrich data with CubeViz specific stuff
         */
        foreach($assocSPOArray as $mainKey => $entry) {
            
            // URI of the element
            $entry ['__cv_uri'] = $mainKey;
            
            // hashed URI of the element
            $entry ['__cv_hashedUri'] = md5($mainKey);
            
            // Nice label using TitleHelper
            $entry ['__cv_niceLabel'] = $titleHelper->getTitle($mainKey);
            
            $return [] = $entry;
        }
        
        return $return;
    }
    
    /**
     * Transforms a given SPARQL result of Erfurt into an associative array.
     * @param $result SPARQL result
     * @param $mainKey Name of the subject whichs groups all the entries
     * @param $pKey Name of the predicate
     * @param $oKey Name of the object
     * @result Array
     */
    public function generateAssocSPOArrayFromSparqlResult($result, $mainKey, $pKey, $oKey) 
    {
        $return = array();
        
        $latestMainKey = '';
        
        /**
         * 
         */
        foreach ($result as $entry) {
            
            // same main key as before
            if($latestMainKey == $entry[$mainKey]) {
                
            // main key differs
            } elseif ($latestMainKey == $entry[$mainKey]) {
            
                $latestMainKey = $entry[$mainKey];
                $return [$latestMainKey] = array();
            
            // at the start ($latestDsd is empty)
            } else {
                $latestMainKey = $entry[$mainKey];
                $return [$latestMainKey] = array();
            }
            
            if (true === isset($entry[$pKey])) {
                
                /**
                 * [2]=>
                 *     array(3) {
                 *       ["dsd"]=>
                 *       string(39) "http://data.lod2.eu/scoreboard/dsd/year"
                 *       ["p"]=>
                 *       string(42) "http://purl.org/linked-data/cube#component"
                 *       ["o"]=>
                 *       string(41) "http://data.lod2.eu/scoreboard/cs/country"
                 *     }
                 */                
                // = http://purl.org/linked-data/cube#component
                $predicateValue = $entry[$pKey]; 
                
                // = http://data.lod2.eu/scoreboard/cs/country
                $objectValue = true === isset($entry[$oKey]) ? $entry[$oKey] : '';
                
                $return [$latestMainKey][$predicateValue] = $objectValue;
            }
        }
        
        return $return;
    }
    
    /**
     * Returns an array of components (Component) with md5 of URI, type and URI.
     * @param $dsdUri Data Structure Definition URI
     * @param $dsUri Data Set URI
     * @param $component DataCube_UriOf::Dimension or ::Measure
     * @return array
     */
    public function getComponents($dsdUri, $dsUri, $componentType) {
              
        if ( $componentType != DataCube_UriOf::Dimension && 
             $componentType != DataCube_UriOf::Measure ) {
            throw new CubeViz_Exception (
                'Invalid component type given! '. 
                'You have to use '. DataCube_UriOf::Dimension .' or '. DataCube_UriOf::Measure
            );
        }
            
        $result = $this->_model->sparqlQuery (
            'SELECT ?comp ?p ?o WHERE {
                <'.$dsdUri.'> <'.DataCube_UriOf::Component.'> ?comp.                
                ?comp <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <'.DataCube_UriOf::ComponentSpecification.'>.
                ?comp <'.$componentType.'> ?comptype.
                ?comp ?p ?o.
            }'
        );
        
        // generate associative array
        $result = $this->generateAssocSPOArrayFromSparqlResult($result, 'comp', 'p', 'o');
        
        // enrich array with CubeViz sugar
        $result = $this->enrichResult($result);
        
        // sort by label
        usort ( 
            $result, 
            function ($a, $b) { return strcasecmp ($a['__cv_niceLabel'], $b['__cv_niceLabel']); } 
        );
        
        /**
         * add component elements
         */
        $tmp = $result;
        $result = array();
        
        foreach ($tmp as $dimension) {
            
            $dimension ['__cv_elements'] = $this->getComponentElements(
                $dsUri, $dimension[$componentType]
            );
            
            $result [$dimension['__cv_uri']] = $dimension;
        }
        
        return $result;
    }
    
    /**
     * Returns an array of Resources which has a certain relation ($componentProperty) to a dataset.
     * @param $dataSetUri DataSet Uri
     * @param $componentProperty Uri of a certain dimension property
     * @return array
     */
    public function getComponentElements($dataSetUri, $componentProperty) 
    {
        $result = $this->_model->sparqlQuery('SELECT ?componentUri ?p ?o WHERE {
            ?observation <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <'.DataCube_UriOf::Observation.'>.
            ?observation <'.DataCube_UriOf::DataSetRelation.'> <'.$dataSetUri.'>.
            ?observation <'.$componentProperty.'> ?componentUri.
            ?componentUri ?p ?o.
        }');
        
        $result = $this->generateAssocSPOArrayFromSparqlResult($result, 'componentUri', 'p', 'o');
        
        $result = $this->enrichResult($result);
        
        return $result;
    }
    
    /**
     * 
     * 
     */
    public function getComponentElementCount($dsUri, $componentProperty) {

        return count ( $this->getComponentElements ( $dsUri, $componentProperty ) );
    }
    
    /**
     * Get all information about each data structure definition.
     * @return array
     */ 
    public function getDataStructureDefinitions ()
    {
        // get all data structure definitions from the store for this particular model
        $result = $this->_model->sparqlQuery('SELECT ?dsd ?p ?o WHERE {
            ?dsd ?p ?o.
            ?dsd <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <'. DataCube_UriOf::DataStructureDefinition .'>. 
        }');
        
        // generate an associated array where dsd is mainkey and using p and o for the rest
        // Example:
        // [1]=>
        //      array(5) {
        //        ["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"]=>
        //        string(56) "http://purl.org/linked-data/cube#DataStructureDefinition"
        //        ["http://www.w3.org/2000/01/rdf-schema#label"]=>
        //        string(13) "per Indicator"
        $result = $this->generateAssocSPOArrayFromSparqlResult($result, 'dsd', 'p', 'o');
        
        // enrich generated array with CubeViz sugar
        // Example:
        //      ["__cv_uri"]       => string(44) "http://data.lod2.eu/scoreboard/dsd/indicator"
        //      ["__cv_niceLabel"] => string(13) "per Indicator"
        $result = $this->enrichResult($result);
        
        // sort by label
        usort ($result, function ($a, $b) { 
                return strcasecmp ($a['__cv_niceLabel'], $b['__cv_niceLabel']); 
        }); 
        
        return $result;
    }  
    
    /**
     * Get all data sets for the given data structure definition
     * @param $dsUri Data Set Uri
     * @return array Array containing data sets
     */
    public function getDataSets($dsdUri) 
    {
        $result = $this->_model->sparqlQuery('SELECT ?ds ?p ?o WHERE {
            ?ds <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <'.DataCube_UriOf::DataSet.'>.
            ?ds <'.DataCube_UriOf::Structure.'> <'.$dsdUri.'>.
            ?ds ?p ?o.
        }');

        // generate an associated array where ds is mainkey and using p and o for the rest
        $result = $this->generateAssocSPOArrayFromSparqlResult($result, 'ds', 'p', 'o');
        
        // enrich generated array with CubeViz sugar
        $result = $this->enrichResult($result);
        
        // sort by label
        usort ($result, function ($a, $b) { 
                return strcasecmp ($a['__cv_niceLabel'], $b['__cv_niceLabel']); 
        }); 
        
        return $result;
    }
       
    /**
     * Get all observations which fits to given DSD, DS and selected compontents.
     * @param $dataSetUrl URL of a data set
     * @param $selectedComponentDimensions 
     */
    public function getObservations ($dataSetUrl, $selectedComponentDimensions) 
    {
        /**
         * Fill SimpleQuery object with live!
         */
        $queryObject = new Erfurt_Sparql_SimpleQuery();
        
        // CONSTRUCT
        $queryObject->setProloguePart('SELECT ?s ?p ?o');
    
        // FROM
        $queryObject->setFrom(array ($this->_model->getModelIri()));
        
        // WHERE
        $where = 'WHERE { ' ."\n" .'
            ?s ?p ?o .' ."\n" .'
            ?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <'. DataCube_UriOf::Observation.'> .' . "\n".'
            ?s <'.DataCube_UriOf::DataSetRelation.'> <'.$dataSetUrl.'> .' ."\n";
        
        // Set selected properties (e.g. ?s <http://data.lod2.eu/scoreboard/properties/year> ?d0 .)
        $i = 0;
        foreach ( $selectedComponentDimensions as $dimension ) {
            $where .= ' ?s <'. $dimension [DataCube_UriOf::Dimension] .'> ?d'. $i++ .' .'. "\n";
        }
        
        // Set FILTER
        // e.g.: FILTER (?d1 = "2003" OR ?d1 = "2001" OR ?d1 = "2002")
        // e.g. 2: FILTER ( ?d0 = <http://data.lod2.eu/scoreboard/indicators/bb_fcov_RURAL_POP__pop> OR 
        //                  ?d0 = <http://data.lod2.eu/scoreboard/indicators/bb_lines_TOTAL_FBB_nbr_lines> )
        $i = 0;
        foreach ( $selectedComponentDimensions as $dimension ) {
            
            $dimensionElements = $dimension ['__cv_elements'];
            
            if (0 < count ($dimensionElements)) {
            
                $filter = array ();
            
                foreach ($dimensionElements as $elementUri => $element) {
                    
                    // If __cv_uri is set and an URL
                    if(true ==  Erfurt_Uri::check($element ['__cv_uri'])) {
                        $value = '<'. $element ['__cv_uri'] .'>';
                    } else {
                        $value = '"'. $element ['__cv_niceLabel'] .'"';
                    }
                    
                    $filter [] = ' ?d'. $i .' = '. $value .' ';
                }
                
                $i++;
                $where .= ' FILTER (' . implode ( 'OR', $filter ) .') ' . "\n";
            }
        }
        
        $where .= '}';    
        
        $queryObject->setWherePart($where);
        
        // execute generated query
        $result = $this->_store->sparqlQuery ((string) $queryObject);
        
        // generate associative array out of given observation result
        $result = $this->generateAssocSPOArrayFromSparqlResult($result, 's', 'p', 'o');
        
        // enrich data with CubeViz sugar
        $result = $this->enrichResult($result);
        
        return $result;
    }
}
