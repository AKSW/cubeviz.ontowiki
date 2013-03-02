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
                
        $titleHelper = new OntoWiki_Model_TitleHelper ($this->_model);
                
        //search for the components specified by the parameters
        $sparql = 'SELECT ?comp ?comptype ?order WHERE {
            <'.$dsdUri.'> <'.DataCube_UriOf::Component.'> ?comp.                
            ?comp <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <'.DataCube_UriOf::ComponentSpecification.'>.
            ?comp <'.$componentType.'> ?comptype.
            
            OPTIONAL {?comp <'.DataCube_UriOf::Order.'> ?order.}
        }
        ORDER BY ASC(?order);';

        $queryresultComp = $this->_model->sparqlQuery($sparql);
                
        $result = array();
        
        // iterate through all found results
        foreach($queryresultComp as $comp) {
            if(false == empty($comp['comp'])) {
                $titleHelper->addResource($comp['comp']);
            }
        }
        
        // iterate through all found results again and add title
        foreach($queryresultComp as $comp) {
            if(false == empty($comp['comp'])) {
                //add the component properties to the result set
                $element = array ( 
                    'label'     => str_replace('"', "'", $titleHelper->getTitle($comp['comp'])),
                    'order'     => isset($comp['order']) ? $comp['order'] : -1,
                    'url'       => $comp['comp'],
                    'hashedUrl' => md5($comp['comp']),
                    'typeUrl'   => $comp['comptype']
                );
                
                if ( DataCube_UriOf::Dimension == $componentType ) {
                    $element ['elements'] = $this->getComponentElements($dsUri, $comp['comptype']);
                }
                
                $result [] = $element;
            }
        }
        
        usort ( 
            $result, 
            function ($a, $b) { return strcasecmp ($a['label'], $b['label']); } 
        ); 
        
        return $result;
    }
    
    /**
     * Returns an array of Resources which has a certain relation ($componentProperty) to a dataset.
     * @param $dataSetUri DataSet Uri
     * @param $componentProperty Uri of a certain dimension property
     * @param $limit Limit number of result entries
     * @param $offset Start position in result 
     * @return array
     */
    public function getComponentElements($dataSetUri, $componentProperty, $limit = 0, $offset = 0) 
    {
        $sparql = 'SELECT ?componentUri ?p ?o WHERE {
            ?observation <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <'.DataCube_UriOf::Observation.'>.
            ?observation <'.DataCube_UriOf::DataSetRelation.'> <'.$dataSetUri.'>.
            ?observation <'.$componentProperty.'> ?componentUri.
            ?componentUri ?p ?o.
        }';
        
        // TODO: are they really neccessary?
        $sparql .= 0 < $limit ? ' LIMIT '. $limit : '';
        $sparql .= 0 < $limit && 0 <= $offset ? ' OFFSET '. $offset .';' : '';
        
        $componentElements = $this->_model->sparqlQuery($sparql);
        
        $groupedComponentElements = array();
        $currentComponentUri = '';
        
        // group elements by componentUri
        foreach ($componentElements as $componentElement) {
            
            // only on the start, when nothing was set
            if('' == $currentComponentUri) {
                $currentComponentUri = $componentElement ['componentUri'];
                $groupedComponentElements[$currentComponentUri] = array(
                    '__cv_uri' => $currentComponentUri,
                    '__cv_hashedUri' => md5($currentComponentUri)
                );
                
            // if last used componentUri differs from current one
            } elseif ($currentComponentUri != $componentElement ['componentUri']) {
                $currentComponentUri = $componentElement ['componentUri'];
                $groupedComponentElements[$currentComponentUri] = array(
                    // adding this is necessary to have a unique identifier for
                    // these element and be able to use at for UI elements
                    '__cv_uri' => $currentComponentUri,
                    '__cv_hashedUri' => md5($currentComponentUri)
                );
            
            // last componentUri and current one are equal
            } else {
            }
            
            // set predicate and object (overriding is allowed)
            $groupedComponentElements[$currentComponentUri][$componentElement['p']] =
                $componentElement ['o'];
        }
        
        return $groupedComponentElements;
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
     * Function for getting datasets for this data structure
     * @param $dsUri Data Set Uri
     * @return array
     */
    public function getDataSets($dsdUri) 
    {
        $titleHelper = new OntoWiki_Model_TitleHelper ($this->_model);
        
        //get all data sets in the cube for the given DataStructureDefinition
        $sparql = 'SELECT ?ds WHERE {
            ?ds <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <'.DataCube_UriOf::DataSet.'>.
            ?ds <'.DataCube_UriOf::Structure.'> <'.$dsdUri.'>.
        };';

        $queryResultDS = $this->_model->sparqlQuery($sparql);

        $result = array();

        foreach($queryResultDS as $ds) {
            if(false == empty($ds['ds'])) {
                $titleHelper->addResource($ds['ds']);
            }
        }

        foreach($queryResultDS as $ds) {
            if(false == empty($ds['ds'])) {
                $result[] = array (
                    'url'       => $ds['ds'],
                    'hashedUrl' => md5($ds['ds']),
                    'label'     => str_replace('"', "'", $titleHelper->getTitle($ds['ds']))
                );
            }
        }
        
        usort ( 
            $result, 
            function ($a, $b) { return strcasecmp ($a['label'], $b['label']); } 
        ); 
        
        return $result;
    }
       
    /**
     * 
     */
    public function getObservations ($linkConfiguration) 
    {
        // Case: link configuration was found and loaded
        if ( 0 < count ( $linkConfiguration ) ) {
            // Extract and save neccessary parameters from link configuration
            $selectedComponents = $linkConfiguration['selectedComponents'];
            $dataSetUrl = $linkConfiguration['selectedDS']['url'];        
            $selCompDims = $linkConfiguration['selectedComponents']['dimensions'];
        } 
        
        // Case: no link configuration was given
        else {
            
            // set default values for DSD
            $dataStructureDefinitionUrl = $this->getDataStructureDefinitions();
            $dataStructureDefinitionUrl = $dataStructureDefinitionUrl [0]['url'];
            
            // ... and DS
            $dataSetUrl = $this->getDataSets($dataStructureDefinitionUrl);
            $dataSetUrl = $dataSetUrl [0]['url'];
            
            $tmp = $this->getComponents (
                $dataStructureDefinitionUrl, $dataSetUrl, DataCube_UriOf::Dimension
            );
            
            $selCompDims = array ();
            
            foreach ( $tmp as $dimension ) {
                $dimension ['elements'] = array($dimension ['elements'][0]);
                $selCompDims [] = $dimension;
            }
        }
    
        /**
         * Fill SimpleQuery object with live!
         */
        $queryObject = new Erfurt_Sparql_SimpleQuery();
        
        // CONSTRUCT
        $queryObject->setProloguePart('CONSTRUCT {?s ?p ?o}');
    
        // FROM
        $queryObject->setFrom(array ($this->_model->getModelIri()));
        
        // WHERE
        $where = 'WHERE { ' ."\n" .'
            ?s ?p ?o .' ."\n" .'
            ?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <'. DataCube_UriOf::Observation.'> .' . "\n".'
            ?s <'.DataCube_UriOf::DataSetRelation.'> <'.$dataSetUrl.'> .' ."\n";
        
        $i = 0;
        // Set selected properties (e.g. ?s <http://data.lod2.eu/scoreboard/properties/year> ?d0 .)
        foreach ( $selCompDims as $ele ) {
            $where .= ' ?s <'. $ele ['typeUrl'] .'> ?d'. $i++ .' .'. "\n";
        }
        
        // Set FILTER
        // e.g.: FILTER (?d1 = "2003" OR ?d1 = "2001" OR ?d1 = "2002")
        // e.g. 2: FILTER ( ?d0 = <http://data.lod2.eu/scoreboard/indicators/bb_fcov_RURAL_POP__pop> OR 
        //                  ?d0 = <http://data.lod2.eu/scoreboard/indicators/bb_lines_TOTAL_FBB_nbr_lines> )
        $i = 0;
        foreach ( $selCompDims as $dim ) {
            
            $dimElements = $dim ['elements'];
            
            if ( 0 < count ( $dimElements ) ) {
            
                $filter = array ();
            
                foreach ($dimElements as $elementUri => $element) {
                    
                    // If __cv_uri is set and an URL
                    if(true ==  Erfurt_Uri::check($element ['__cv_uri'])) {
                        $value = '<'. $element ['__cv_uri'] .'>';
                    } elseif (true === isset($element ['http://www.w3.org/2000/01/rdf-schema#label'])) {
                        $value = '"'. $element ['http://www.w3.org/2000/01/rdf-schema#label'] .'"';
                    }
                    
                    $filter [] = ' ?d'. $i .' = '. $value .' ';
                }
                
                $i++;
                $where .= ' FILTER (' . implode ( 'OR', $filter ) .') ' . "\n";
            }
        }
        
        $where .= '}';    
        
        $queryObject->setWherePart($where);
        
        // echo (string) $queryObject;
        
        // send query, return result as JSON
        $result = json_decode ( $this->_store->sparqlQuery (
            $queryObject, 
            array('result_format' => 'json')
        ), true );
        
        $tmp = array ();
        $titleHelper = new OntoWiki_Model_TitleHelper ($this->_model); 
        
        foreach ( $result as $entry ) {
            $count = count ( $entry );
            foreach ( $entry as $key => $ele ) { 
                if ( 'uri' == $entry [$key] [0]['type'] ) {
                    $titleHelper->addResource ( $ele [0]['value'] );
                }
            }
        }
        
        foreach ( $result as $observationUri => $entry ) {
            
            $count = count ( $entry );
            $tmpEntry = $entry;
            
            // check whether observation's type has a label, if so get it
            foreach ( $entry as $key => $ele ) {
                if ( 'uri' == $entry [$key] [0]['type'] ) {
                    $tmpEntry [$key][0]['label'] = str_replace('"', "'", $titleHelper->getTitle($ele [0]['value']));
                }
                $entry [$key] [0]['typeUrl'] = $entry [$key] [0]['type'];
                unset($entry [$key] [0]['type']);
            }            
            
            // set observation uri
            $tmpEntry['observationUri'][0] = array(
                'type'  => 'uri',
                'value' => $observationUri
            );
            
            $tmp [] = $tmpEntry;
        }
        
        return $tmp;
    }
}
