<?php
/**
 * This file is part of the {@link http://ontowiki.net OntoWiki} project.
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @package Extensions
 */

/**
 * The superclass-file providing the component controller class skeleton 
 * for this class file
 */
require_once 'OntoWiki/Controller/Component.php';

/**
 * The file providing the simple sparql query class
 */
require_once 'Erfurt/Sparql/SimpleQuery.php';

/**
 * The file providing the title helper class for elements of a knowledge base
 */
require_once 'OntoWiki/Model/TitleHelper.php';

/**
 * The parser helper class file which class is used by the controller to 
 * acquire appropriate parsers for a chart model
 */
require_once 'ParserHelper.php';

/**
 * The cube helper class file which class is used by the controller to operate 
 * on the data cube vocabulary
 */
require_once 'model/CubeHelper.php';

/**
 * The chart helper class file which class is used by the controller to create 
 * and handle chart models
 */
require_once 'model/ChartHelper.php';

/**
 * Static class CubeQuery. Contains database requests.
 */
require_once 'model/CubeQuery.php';

/**
 * Static class AuxilaryFunctions. Contain transformation and adapter functions. 
 */
require_once 'model/AuxilaryFunctions.php';

/**
 * Basic controller for the Chartview component
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Tom-Michael Hesse <tommichael.hesse@googlemail.com>
 */
class CubevizController extends OntoWiki_Controller_Component
{

    /**
     * Holds the uris from the configuration file to access the graph
     * @var array contains all uris: elementId => uri
     */
    private $_uris = array();
    
    /**
     * Holds the uri patterns from the configuration file for creating new elements
     * @var array contains all uri pattertns: elementType => pattern
     */
    private $_uriPattern = array();
    
    /**
     * Holds the uri elements from the configuration file as the components of
     * uri patterns
     * @var array contains all enabled uri elements for uri patterns: uriElement => true
     */
    private $_uriElements = array();
    
    /**
     * Holds all configurable options from the configuration file, i.e. the 
     * pagination limit 
     * @var array contains all options: optionKey => optionValue
     */
    private $_options = array();
    
    /**
     * Holds all registered and thereby enabled parser classes
     * @var array contains all parser files: parserClass => parserName 
     */
    private $_parser = array();
    
    /**
     * Holds all registered and thereby enabled addon classes for the parsers
     * @var array contains all addon files: parserClass => { addonClass => true }
     */
    private $_addon = array();
    
    private $_resources = 0;
    private $_time = 0.00;
    
    /**
     * URI of the graph to visualize
     * @var string - example http://data.lod2.eu/scoreboard/
     */
    private $_graph_uri;
    
    /**
     * Data structure definition for the Graph
     * @var string - example http://data.lod2.eu/scoreboard/DSD_a110cc8322b900af0121c5860fc1d9fe
     */
    private $_data_structure_definition;
     
    /**
     * DataSet
     * @var string - example http://data.lod2.eu/scoreboard/DS_6b611b19ff2a0b58057966f04dd1ddcb
     */
    private $_data_set;
     
    /**
     * Initializes the controller with all configured options from the default.ini.
     */
    public function init() {
        
        parent::init();        
                
        //prepare URI-array for use by loading the ini configuration
        foreach($this->_privateConfig->uris as $entity => $uri) {
            $this->_uris[$entity] = $uri;
        }
        
        //add the qb-namespace to all uris
        foreach($this->_uris as $entity => $uri) {
            if($entity != "qb" && $entity != "rdfType" && $entity != "rdfsLabel") 
				// TODO: BUG
				// !!! qb, rdfType, rdfsLabel are hard-coded and new ones can't be added in the config file
				// default.ini [special entities] section:
				// uris["someotherstuff"] = "http://www.example.org/2000/01/rdf-schema#"
				// will be concatenated as well
				// why is it even in the one array?
                $this->_uris[$entity] = $this->_uris['qb'].$this->_uris[$entity];
        }
        
        //prepare the uri creation rules
        foreach($this->_privateConfig->uripattern as $spec => $pattern)
            $this->_uriPattern[$spec] = $pattern;
        
        //load the uri pattern elements
        foreach($this->_privateConfig->urielement as $uriElement)
            $this->_uriElements[$uriElement] = true;
        
        //load all other options
        foreach($this->_privateConfig->options as $key => $value)
            $this->_options[$key] = $value;
        
        //if a manual adaption of uri patterns was made, take these values
        if(isset($_POST['isUriPatternSet'])) { 
                
                $newPattern = array();
                foreach($this->_uriPattern as $spec => $pattern) {
                    $newPattern[$spec] = $_POST[$spec];
                }
                $this->_uriPattern = $newPattern;
        }
        
        //prepare parser-array with the given parser class names
        foreach($this->_privateConfig->parser as $parser => $name)
            $this->_parser[$parser] = $name;
        
        //prepare the parser-specific addons
        foreach($this->_parser as $parser => $name) {
            foreach($this->_privateConfig->parseraddon as $addon => $parserKey) {
                if($parserKey == $parser) {
                    $this->_addon[$parser][$addon] = true;
                }
            }
        }
        
    }
    
    /**
     * AJAX-called action for getting filter elements: the filterAction()-method
     * returns for a given component and the datasets where its used in all the
     * elements of that component, so that i.e. a filter list can be created.
     * 
     * This action returns a JSON container and has no direct GUI output.
     */
    public function filterAction() {
        
        if(isset($this->_owApp->selectedModel)) {
            
            //avoid the template to be set
            $this->_helper->viewRenderer->setNoRender();
            $this->_helper->layout->disableLayout();
            
            $elements = array();
            $result = array();
            
            $titleHelper = new OntoWiki_Model_TitleHelper($this->_owApp->selectedModel);
            $cubeHelper = new CubeHelper($this->_uris, $this->_owApp->selectedModel, 
                    $this->_uriPattern, $this->_uriElements);
            
            //if a component is provided, return all elements
            if(isset($_POST['component']) && isset($_POST['ds'])) {
                
                $elements = $cubeHelper->getComponentElements($_POST['ds'], 
                        $_POST['component'], $titleHelper);
                
                foreach($elements as $element) {
                    $result[$element]['uri'] = $element;
                    $result[$element]['name'] = $titleHelper->getTitle($element);
                }
                
                //create a JSON result instead of GUI output
                $this->_response->setBody(json_encode($result));
            }
        }
    }
    
    /**
     * AJAX-called action for getting the data analysis results: 
     * the structureAction()-method returns the analysis results of the selected
     * model so that the created uris for the needed elements can be processed
     * in further user interaction, i.e. to allow user adaptions of the created
     * uris for the new elements.
     * 
     * This action returns a JSON container and has no direct GUI output.
     */
    public function structureAction() {
        
        if(isset($this->_owApp->selectedModel)) {
            
            //avoid the template to be set
            $this->_helper->viewRenderer->setNoRender();
            $this->_helper->layout->disableLayout();
            
            //create the helpers
            $titleHelper = new OntoWiki_Model_TitleHelper($this->_owApp->selectedModel);
            $cubeHelper = new CubeHelper($this->_uris, $this->_owApp->selectedModel, 
                    $this->_uriPattern, $this->_uriElements);
            
            //get the analysis and partition of the unstructured data
            $analysis = $cubeHelper->getCreationAnalysis();
            
            //create a JSON result instead of GUI output
            $this->_response->setBody(json_encode($analysis));
        }
    }
    
    /**
     * HTTP-called action for getting the chart result without OntoWiki code:
     * the serviceAction()-method returns the chart result code only by a given
     * configuration either as configuration file uri or serialized configuration
     * array via GET 'configurationFile' or 'configuration'. 
     * 
     * Due to the different methods of parsing and the variety of result code 
     * formats this action returns HTML code containing all needed source links 
     * provided by the parser for single use without OntoWiki.
     */
    public function serviceAction() {
        
        //$this->_resources = memory_get_usage(true);
        //$this->_time = microtime(true);
        
        //avoid the template to be set
        $this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();
        
        if((isset($_GET['configurationFile']) xor isset($_GET['configuration'])) && 
                $this->_options['provideService'] == true) {
            try {
                
                //load the result cube specification
                $resultChartSpec = array();
                if(isset($_GET['configurationFile'])) {
                    $configurationFile = file_get_contents(urldecode($_GET['configurationFile']));
                    $resultChartSpec = unserialize($configurationFile);
                }
                if(isset($_GET['configuration'])) {
                    $resultChartSpec = unserialize(urldecode($_GET['configuration']));
                }
                
                //initialize the model
                $application = Erfurt_App::getInstance();
                $store = $application->getStore();
                $model = $store->getModel($resultChartSpec['model']);
                
                //create the helpers
                $titleHelper = new OntoWiki_Model_TitleHelper($model);
                $cubeHelper = new CubeHelper($this->_uris, $model, 
                        $this->_uriPattern, $this->_uriElements);
                $parserHelper = new ParserHelper($this->_parser);
                $chartHelper = new ChartHelper();
                
                //get the data
                $resultObservations = $cubeHelper->getResultObservations($resultChartSpec);
                $aggregatedObservationData 
                    = $cubeHelper->layoutObservationData($resultObservations, 
                            $resultChartSpec['measOptionList']);
                
                //construct the labels
                $titleHelper->addResource($resultChartSpec['dsd']);
                $titleHelper->addResource($resultChartSpec['ms']);
                $titles = array('title'=>$titleHelper->getTitle($resultChartSpec['dsd']), 
                    'subtitle'=>substr($resultChartSpec['subtitle'], 0, 
                        strlen($resultChartSpec['subtitle'])-2));
                
                //create the chart object
                $chart = $chartHelper->createChart($resultChartSpec['chartType'], 
                        array('dimensionData' => $aggregatedObservationData['dimensionData'],
                              'measureData' => $aggregatedObservationData['measureData'], 
                              'nameTable' => $resultObservations['nameTable'],
                              'dimensions' => $resultChartSpec['finalAxisAllocation'],
                              'measures' => $resultChartSpec['ms'],
                              'titles' => $titles, 
                              'model' => $model));
                
                //create the parser object
                $parser = $parserHelper->getParser($resultChartSpec['parser'], $chart, 
                        array(), $this->_owApp->translate);
                
                $result = $parser->retrieveServiceCode();
                $result .= sprintf($parser->retrieveImportCode(), 
                        $this->_componentUrlBase);
                $result .= $parser->retrieveChartResult();
                
                //output of the resulting chart code
                echo $result;
            }
            catch(Exception $e) {
                
            }
            
            //$this->_resources = memory_get_usage(true) - $this->_resources;
            //$this->_time = microtime(true) - $this->_time;
            //echo "MEMORY: ".$this->_resources." bytes";
            //echo "TIME: ".$this->_time." msec";
        }
    }
    
    /*
     * Refactored AnalyzeAction
     */
    
    public function makeAction() {
		
		// check for $_REQUEST variables
		$this->_graph_uri = $_REQUEST['graph_uri'];
		$this->_data_structure_definition = $_REQUEST['data_structure_definition'];
		$this->_data_set = $_REQUEST['data_set'];
		
		
		//initalize all variables used during the process
		$analysisResult = array();
			/*
			 * array(3) {
				  ["counts"]=>
				  array(10) {
				    ["dsd"]=> ["ds"]=> ["cs"]=> ["allobs"]=> ["csdp"]=> 
				    ["csmp"]=> ["dp"]=> ["mp"]=> ["ap"]=> ["obs"]=>
				  }
				  ["ap"]=>
				  array(3) {
				    [0]=>
				    array(2) {
				      ["uri"]=> string(49) "http://data.lod2.eu/scoreboard/properties/brkdown"
				      ["name"]=> string(10) "break down"
				    }
				    [1]=>
				    array(2) {
				      ["uri"]=> string(50) "http://data.lod2.eu/scoreboard/properties/variable"
				      ["name"]=> string(8) "variable"
				    }
				    [2]=>
				    array(2) {
				      ["uri"]=> string(46) "http://data.lod2.eu/scoreboard/properties/unit"
				      ["name"]=> string(4) "unit"
				    }
				  }
				  ["rule"]=>
				  array(4) {
				    ["noProcessing"]=> bool(false)
				    ["completionNeeded"]=> bool(false)
				    ["structureGiven"]=> bool(true)
				    ["completeStructure"]=> bool(true)
				  }
				} 
			*/
		$parserNames = array();
		$dsdTable = array(); // [0]=> string(67) "http://data.lod2.eu/scoreboard/DSD_a110cc8322b900af0121c5860fc1d9fe"
		$dsTable = array();  // [0]=> string(66) "http://data.lod2.eu/scoreboard/DS_6b611b19ff2a0b58057966f04dd1ddcb"
		
		$dimTable = array(); // contains dimentions and count of elements in every dimention
							 // "http://data.lod2.eu/scoreboard/CS_6446b89c16157a57572faf63ae3abe39" => {
							 // "uri" => , "type" => , "elemCount" => , "order" =>}
		$adaptedDimTable = array();
		
		$measTable = array(); // "http://data.lod2.eu/scoreboard/CS_96a30f4c16b4bcbfba54658ec7a99046" => {
							  // "uri" => , "type" => , "order" =>}
		
		$axisAllocation = array(); // Example:
								   // ["http://data.lod2.eu/scoreboard/CS_6446b89c16157a57572faf63ae3abe39"]=> string(1) "z" 
								   // ["http://data.lod2.eu/scoreboard/CS_f50ed29d32cfe1eee6d686359c96f3c5"]=> string(1) "x"
		$finalAxisAllocation = array();
		$dataSpectTable = array(); // not used!
		$titles = array('title' => '', 'subtitle' => '');
		$chart = null;
		
		//step 0: initialize all managers and helpers
        $translate = $this->_owApp->translate;
        $titleHelper = new OntoWiki_Model_TitleHelper($this->_owApp->selectedModel);
        $cubeHelper = new CubeHelper($this->_uris, $this->_owApp->selectedModel, 
                 $this->_uriPattern, $this->_uriElements);
        $parserHelper = new ParserHelper($this->_parser);
        $chartHelper = new ChartHelper();
        
        // $this->_erfurt and Erfurt_App::getInstance() are the same objects!
        // var_dump($this->_erfurt === Erfurt_App::getInstance());
        $isCreationAllowed = $this->isCreationAllowed($this->_erfurt);
        $isConfigSaveAllowed = $this->isConfigSaveAllowed(Erfurt_App::getInstance());
		
		
		//step 1: analyze the model and decide whether cube elements have to 
		//be constructed or can be read out; to increase the performance only 
		//the analysis is done by default
		$analysisResult = $cubeHelper->analyzeModel();		
		
		//step 1a: check if a configuration file is given to the controller
		//for loading a prepared data selection
		//loading config file through the #configurationLoad
		
		
		//step 2: get the DSDs in the cube and send them to the view, then get
		//all data sets, dimensions and measures for selection
		// if $analysisResult['rule']['structureGiven']
		// and there are no $_POST['dsd'], $_POST['ds']
		$dsdTable = $cubeHelper->getDataStructureDefinition($titleHelper);		
		$dsTable = $cubeHelper->getDataSets(current($dsdTable), $titleHelper);
		$dimTable = $cubeHelper->getComponents(current($dsdTable), current($dsTable), 'dimension', $titleHelper);
		$measTable = $cubeHelper->getComponents(current($dsdTable), current($dsTable), 'measure', $titleHelper);
		
		//step 3: calculate the axis allocation of the selected dimensions
		//get selected dimentions as:
		// array(2) { [0]=> string(66) "http://data.lod2.eu/scoreboard/CS_6446b89c16157a57572faf63ae3abe39" 
		// [1]=> string(66) "http://data.lod2.eu/scoreboard/CS_f50ed29d32cfe1eee6d686359c96f3c5" } 
		
		$dimensions = $this->dummyGetDimensions($dimTable); // get all dimensions from the dimTable		
		
		$axisAllocation = $cubeHelper->getAxisAllocation($dimensions, $dimTable);
		
		//var_dump($finalAxisAllocation); die;				
				
		// send to the view!
		$this->view->analysis = $analysisResult;
		$this->view->dsd = $dsdTable;
		$this->view->ds = $dsTable;
		$this->view->dim = $dimTable;
		$this->view->ms = $measTable;
		$this->view->msAggr = $cubeHelper->provideAggregationFunctions();
		$this->view->axisAllocation = $axisAllocation;
		$this->view->basePath = $this->_componentUrlBase;
		
		//var_dump($isCreationAllowed); 
		//die;
	}
	
	private function isCreationAllowed($erfurt) {
		$isCreationAllowed = false;
        if($erfurt->getAc()->isActionAllowed('ModelManagement')) {
			// writting access control allowed?
            $isCreationAllowed = true;
        }
		return $isCreationAllowed;
	}
	
	private function isConfigSaveAllowed($erfurt_instance) {
		$isConfigSaveAllowed = false;
        if(!$erfurt_instance->getAuth()->getIdentity()->isAnonymousUser()) {
            $isConfigSaveAllowed = true;
		}
		return $isConfigSaveAllowed;
	}
      
    /**
     * Helper method to generate an updated creation table for the element creation
     * process with all changes made by the user. The changes are read out of the
     * POST entries of the GUI form.
     * @param array $creationTable The creation table to be parsed
     * @return array The updated creation table with all user changes via the form 
     */
    private function _evaluateCreationForm($creationTable) {
        
        $result = $creationTable;
        
        if(isset($_POST['creationList'])) {
        
            foreach($creationTable['dp'] as $index => $dp) {
                $result['dp'][$index]['csuri'] = $_POST['dp'.$index.'uri'];
                $result['dp'][$index]['name'] = $_POST['dp'.$index.'name'];
            }
            
            foreach($creationTable['mp'] as $index => $mp) {
                $result['mp'][$index]['csuri'] = $_POST['mp'.$index.'uri'];
                $result['mp'][$index]['name'] = $_POST['mp'.$index.'name'];
            }
            
            foreach($creationTable['ds'] as $index => $ds) {
                $result['ds'][$index]['dsuri'] = $_POST['ds'.$index.'uri'];
                $result['ds'][$index]['dsname'] = $_POST['ds'.$index.'name'];
                $result['ds'][$index]['dsduri'] = $_POST['dsd'.$index.'uri'];
                $result['ds'][$index]['dsdname'] = $_POST['dsd'.$index.'name'];
            }
        }
        
        return $result;
    }
    
    /**
     * Helper method providing the link to trigger the instance list view with
     * a filter on instances linked with a certain property indicated by the
     * placeholder PROPERTYURI
     * @return string The link providing a list view on all elements linked by
     * a certain property 
     */
    private function _createListElementsLink() {
        
        //create a link and configuration object
        $link = '';
        $configuration = array();
        
        //create the OW link and set the init command for the instance list
        $link = (string) new OntoWiki_Url(array('route' => 'instances'), array());
        
        $link .= '?init';
        
        //create the filter that delivers all instances bound with the
        //property for which the elements shall be listed
        $configuration['filter'][] = array('mode' => 'box', 
                                           'property' => 'PROPERTYURI',
                                           'isInverse' => true,
                                           'filter' => 'bound');
        
        //encode the resulting configuration
        $link .= '&instancesconfig='.urlencode(json_encode($configuration));
        
        return $link;
    }
    
    /**
     * Dummy functions
     */
    private function dummyGetDimensions($dimTable) {
		$dimensions = array();
		
		foreach($dimTable as $url => $properties) {
			array_push($dimensions, $url);
		}
		
		return $dimensions;
	}
	
	/**
	 * AJAX calls
	 */
	 
	public function getdimensionsAction() {
        //step 3: calculate the axis allocation of the selected dimensions
        //if(isset($_POST['dim'])) {
            
        $dsdTable = $cubeHelper->getDataStructureDefinition($titleHelper);		
        $dsTable = $cubeHelper->getDataSets(current($dsdTable), $titleHelper);
        $dimTable = $cubeHelper->getComponents(current($dsdTable), current($dsTable), 'dimension', $titleHelper);
        
        
        //calculate the selected dimension elements
        $adaptedDimTable = $dimTable;
        
        foreach($_POST['dim'] as $dimension) {
            
            if(isset($_POST['dim'.md5($dimension).'elemList'])) {
                $adaptedDimTable[$dimension]['elemCount']
                        = count($_POST['dim'.md5($dimension).'elemList']);
            }
            
            if($dimTable[$dimension]['elemCount'] 
                    > $this->_options['paginationLimit']) {
                $adaptedDimTable[$dimension]['elemCount']
                        = (((int) $this->_options['paginationLimit'])/10)*10;
            }
            
            if(isset($_POST['dim'.md5($dimension).'Limit'])) {
                $adaptedDimTable[$dimension]['elemCount']
                        = (int) $_POST['dim'.md5($dimension).'Limit'];
            }
        }
        
        $axisAllocationOld = array();
        $axisAllocation = $cubeHelper->getAxisAllocation($_POST['dim'], 
                $adaptedDimTable);
        
        //copy all axis allocations of the data selection form
        foreach($_POST['dim'] as $dimension) {
            if(isset($_POST['dim'.md5($dimension).'Axis'])) {
                $axisAllocationOld[$dimension] = $_POST['dim'.
                        md5($dimension).'Axis'];
            }
        }
        
        //check if the old axis allocation can be still used               
        if((array_keys($axisAllocation) == array_keys($axisAllocationOld)) 
                && (in_array('x', $axisAllocationOld))) {
            foreach($axisAllocationOld as $axis => $entry) {
                if(($axisAllocation[$axis] != '-') && ($entry != '-'))
                    $axisAllocation[$axis] = $entry;
            }
        }
        
        //check if a change is needed
        if(in_array('change', $axisAllocation)) {
            $changeKey = array_search('change', $axisAllocation);
            $oldXKey = array_search('x', $axisAllocation);
            $axisAllocation[$changeKey] = 'x';
            $axisAllocation[$oldXKey] = 'z';
        }
        
        //build the final axis allocation without the dimensions for
        //which only one element is selected
        foreach($axisAllocation as $axis => $entry) {
            if($entry != '-') {
                $finalAxisAllocation[$axis] = $entry;
            }
            else {
                //add the one element as fixed information to the
                //subtitle
                $elementTitleHelper 
                    = new OntoWiki_Model_TitleHelper($this->_owApp->selectedModel);
                $element = '';
                
                if($dimTable[$axis]['elemCount']
                        > $this->_options['paginationLimit']) {
                    
                    $element = current($cubeHelper->getComponentElements($_POST['ds'], 
                            $dimTable[$axis]['type'], $elementTitleHelper, 
                            array('limit' => 1, 
                                  'offset' => $_POST['dim'.md5($axis).
                                'Offset'])));
                }
                else {
                    $elementTitleHelper->addResource(current(
                            $_POST['dim'.md5($axis).'elemList']));
                    $element = current($_POST['dim'.md5($axis).'elemList']);
                }

                $titles['subtitle'] .= $elementTitleHelper->
                        getTitle($element).', ';
            }
        }
        
        $this->view->axisAllocation = $axisAllocation;
        
    }
		
    /**
     * Init function and all related AJAX calls etc.
     */
    public function initAction() {
        //if $_REQUEST is not defined - do nothing!
        //everything is going by AJAX calls!
        
        //Check the availability of ODBC
        //var_dump($this->_owApp);
        
        /**
         * Setting the variables to the view
         */
        // http://localhost/cubeviz/
        $this->view->cubevizPath = $this->getComponentPath();
        $this->view->basePath = $this->_componentUrlBase;
        $this->view->backend = $this->_owApp->getConfig()->store->backend;
        $this->view->modelUri = $_REQUEST['m'];
    }
    
    private function getComponentPath() {
        $componentUrlBase_temp = explode("//",$this->_componentUrlBase);
        $prefix = $componentUrlBase_temp[0];
        $postfix = $componentUrlBase_temp[1];
        $postfix = explode("/",$postfix);
        unset($postfix[sizeof($postfix) - 3]);
        $postfix = implode($postfix, "/");
        $componentPath = $prefix . "//" . $postfix;
        
        return $componentPath;
    }
    
    /**
     * TODO: still a dummy function
     */
    public function getgraphnamesAction() {
        //avoid the template to be set
        $this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();
        
        $sparqlEndpoint = $_REQUEST['sparqlEndpoint'];
        $graphNames = array();
        
        //var_dump($sparqlEndpoint); die;
        
        //array_push($graphNames, "graphName1");
        //array_push($graphNames, "graphName2");
        array_push($graphNames, "graphName3");
        
        $this->_response->setBody(json_encode($graphNames));
    }
    
    public function getdatastructuresAction() {
        //avoid the template to be set
        $this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();
        
        $graphName = $_REQUEST['graphName'];
        $dataStructures = array();
        
        $dataStructures = CubeQuery::getDataStructureDefinition();
        
        $dataStructures = $this->_getLabelsFor($dataStructures, $this->_owApp);
        
        $this->_response->setBody(json_encode($dataStructures));
    }
    
    public function getdatasetsAction() {
        //avoid the template to be set
        $this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();
        
        $dataStructure = $_REQUEST['dataStructure'];
        $dataSets = CubeQuery::getDataSets($dataStructure);
                
        $dataSets = $this->_getLabelsFor($dataSets, $this->_owApp);
                
        $this->_response->setBody(json_encode($dataSets));
    }
    
    public function getdimensionsandmeasuresAction() {
        //avoid the template to be set
        $this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();
        
        $dataStructure = $_REQUEST['dataStructure'];
        $dataSet = $_REQUEST['dataSet'];
        $dimensions_output = array();
        $measures_output = array();
        
        
        $dimensions = CubeQuery::getComponents($dataStructure, $dataSet, "dimension");
        $dimension_uri = array();
        foreach($dimensions as $uri => $value) {
            $dimension_uri[] = $uri;
        }
        $dimensionLabels = $this->_getLabelsFor($dimension_uri, $this->_owApp);
        
        foreach($dimensions as $uri => $value) {
            $dimensions[$uri]["label"] = $dimensionLabels[$uri];
            array_push($dimensions_output,$dimensions[$uri]);				
        }			
        
        $measures = CubeQuery::getComponents($dataStructure, $dataSet, "measure");
        $measure_uri = array();
        foreach($measures as $uri => $value) {
            $measure_uri[] = $uri;
        }
        $measureLabels = $this->_getLabelsFor($measure_uri, $this->_owApp);
        
        foreach($measures as $uri => $value) {
            $measures[$uri]["label"] = $measureLabels[$uri];
            array_push($measures_output,$measures[$uri]);	
        }	
        
        $this->_response->setBody(json_encode(array("dimensions" => $dimensions_output, "measures" => $measures_output)));
    }
    
    public function getcomponentelementsAction() {
        
        /***********************************************
         * TODO: modelUri should be always here        *
         * not here on initial load (config file load) *
         ***********************************************/
        
        $this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();
        
        $dimensionLabel = $_REQUEST['dimensionLabel'];
        $dataSet = $_REQUEST['dataSet'];
        $dataStructure = $_REQUEST['dataStructure'];
        $targetDimension = array();
        
        $dimensions_output = array();
        $dimensions = CubeQuery::getComponents($dataStructure, $dataSet, "dimension");
        
        $dimension_uri = array();
        foreach($dimensions as $uri => $value) {
            $dimension_uri[] = $uri;
        }
        
        $dimensionLabels = $this->_getLabelsFor($dimension_uri, $this->_owApp);
        
        foreach($dimensions as $uri => $value) {
            $dimensions[$uri]["label"] = $dimensionLabels[$uri];
            array_push($dimensions_output,$dimensions[$uri]);				
        }
        
        foreach($dimensions_output as $num => $dimension) {
            if($dimension["label"] == $dimensionLabel) {
                $targetDimension = $dimension;
            }
        }
        
        //test data
        //$componentProperty = '[{"uri":"http://data.lod2.eu/scoreboard/CS_33d0a97e3c617f70e2474b8cd77c04b2","type":"http://data.lod2.eu/scoreboard/properties/year"},{"uri":"http://data.lod2.eu/scoreboard/CS_f50ed29d32cfe1eee6d686359c96f3c5","type":"http://data.lod2.eu/scoreboard/properties/indicator"}]';
        //$dataSet = '{"name":"http://data.lod2.eu/scoreboard/DS_6b611b19ff2a0b58057966f04dd1ddcb","number":"0"}';
        
        $componentElements = CubeQuery::getComponentElements($dataSet, $targetDimension["type"], $this->_owApp->selectedModel);
        $componentElementLabels = CubeQuery::getLabels($componentElements, $this->_owApp->selectedModel);
        
        $componentElementsWithLabels = array();			
        foreach($componentElements as $key => $element) {
            $componentElementsWithLabels[$key]["value"] = $element;
            $componentElementsWithLabels[$key]["label"] = $componentElementLabels[$key];
        }
                    
        $componentElements_all[$targetDimension["label"]]["label"] = $targetDimension["label"];
        $componentElements_all[$targetDimension["label"]]["list"] = $componentElementsWithLabels;
        
        //var_dump($componentElements_all); die;

        $this->_response->setBody(json_encode($componentElements_all));
    }
    
    public function saveconfigurationAction() {
        //avoid the template to be set
        $this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();
        
        if ( true == isset ( $_REQUEST['modelUri'] ) && '' != $_REQUEST['modelUri'] ) {
            $modelUri = $_REQUEST['modelUri'];
            
            //pack $configuration array
            $configuration = array();
            
            $configuration['modelUri'] = $modelUri;
            $configuration['sparqlEndpoint'] = $_REQUEST['sparqlEndpoint'];
            $configuration['selectedGraph'] = $_REQUEST['selectedGraph'];
            $configuration['selectedDSD'] = $_REQUEST['selectedDSD'];
            $configuration['selectedDS'] = $_REQUEST['selectedDS'];
            $configuration['selectedMeasures'] = $_REQUEST['selectedMeasures'];
            $configuration['selectedDimensions'] = $_REQUEST['selectedDimensions'];
            $configuration['selectedDimensionComponents'] = $_REQUEST['selectedDimensionComponents'];
            $configuration['selectedChartType'] = $_REQUEST['selectedChartType'];
            
            $hashCode = AuxilaryFunctions::writeConfiguration($configuration);	
            
            //redirect user to new URI\
            //TODO: get rid of hardcoded URI of scoreboard
            $loc = $this->getComponentPath() . "?m=http://data.lod2.eu/scoreboard/&hC=$hashCode";  
            
            $this->_response->setBody($loc);
        }
    }
		
    public function uriinterfaceAction() {
        
        //$modelUri = $_REQUEST['m']; // ?m= - the name of the graph
        $sparqlEndpoint = json_decode($_REQUEST['sparqlEndpoint']); //string
        $selectedGraph = json_decode($_REQUEST['selectedGraph']);
        $selectedDSD = json_decode($_REQUEST['selectedDSD']);
        $selectedDS = json_decode($_REQUEST['selectedDS']);
        $selectedMeasures = json_decode($_REQUEST['selectedMeasures']);
        $selectedDimensions = json_decode($_REQUEST['selectedDimensions']);
        $selectedDimensionComponents = json_decode($_REQUEST['selectedDimensionComponents']);
        
        /********************
         * Get Observations *
         ********************/
        
        $resultCubeSpec = AuxilaryFunctions::resultCubeSpecAdapter($selectedDS,$selectedDimensions,
                                            $selectedDimensionComponents,$selectedMeasures);
        
        $resultObservations = CubeQuery::getResultObservations($resultCubeSpec, $this->_owApp->selectedModel);
        
        /*******************
         * Axis allocation *
         *******************/
            
        $selectedDimensions = AuxilaryFunctions::setLimits($selectedDimensions);
        $axisAllocationFinal = AuxilaryFunctions::getAxisAllocationFinal($selectedDimensions);
        
        /***************
         * Chart Types *
         ***************/
        
        $chartHelper = new ChartHelper();
        $dataSpecTable["dimCount"] = sizeof($selectedDimensions);
        $dataSpecTable["measCount"] = sizeof($selectedMeasures);
        $applicableCharts = $chartHelper->retrieveApplicableChartTypes($dataSpecTable); 
        
        //TODO: define ChartTypeSelection Algorithm
        $selectedChartType = array_keys($applicableCharts);
        $selectedChartType = $selectedChartType[0];
        
        $parserHelper = new ParserHelper($this->_parser);
        $parserNames = $parserHelper->getParserNames($selectedChartType);
        //TODO: define parser selection Algorithm
        $selectedParser = array_keys($parserNames);
        $selectedParser = $selectedParser[0];
        
        /********************
         * Some other stuff *
         ********************/
        
        $resultChartSpec = array();
        $resultChartSpec = $resultCubeSpec;
        $resultChartSpec['model'] = (string) $this->_owApp->selectedModel;
        $resultChartSpec['dsd'] = $selectedDSD->uri;
        $resultChartSpec['chartType'] = $selectedChartType;
        $resultChartSpec['axisAllocation'] = $axisAllocationFinal;
        $resultChartSpec['parser'] = $selectedParser;
        $resultChartSpec['finalAxisAllocation'] = $axisAllocationFinal;
        $resultChartSpec['subtitle'] = "Subtitle";
        
        $this->view->serializedResultCubeSpec = serialize($resultChartSpec);
        
        $aggregatedObservationData = AuxilaryFunctions::layoutObservationData(
                                        $resultObservations, 
                                        $resultCubeSpec['measOptionList']
                                    );
        
        //construct the titles and the chart
        //$titles['title'] = $titleHelper->getTitle($_POST['dsd']);
        //$titles['subtitle'] = substr($titles['subtitle'], 0, 
        //		strlen($titles['subtitle'])-2);
                    
        $chart = $chartHelper->createChart($selectedChartType, 
                array('dimensionData' => $aggregatedObservationData['dimensionData'],
                      'measureData' => $aggregatedObservationData['measureData'], 
                      'nameTable' => $resultObservations['nameTable'],
                      'dimensions' => $axisAllocationFinal,
                      'measures' => array($selectedMeasures[0]->uri),
                      'titles' => $titles, 
                      'model' => $this->_owApp->selectedModel));
                
        $selectedParser_addon = array( "AttributeConfigurationHighChartsParserAddOn" => true);
        $translate = $this->_owApp->translate;
        
        $parser = $parserHelper->getParser($selectedParser, $chart, $selectedParser_addon, $translate);
                
        //the result code might contain links 
        //which require the componentUrlBase-path
        
        $this->view->chart = '';
        $this->view->chart .= sprintf($parser->retrieveImportCode(), 
                $this->_componentUrlBase);
        
        $this->view->chart .= $parser->retrieveChartResult();
        
        $addonCode = $parser->retrieveAddOnCode();
        
        if(!empty($addonCode))
            $this->view->parserAddOns = $addonCode;		
        
        /*
        $dsd = CubeQuery::getDataStructureDefinition();
        $ds = CubeQuery::getDataSets($dsd[0]);
        //$type = dimension | measure
        $type = "dimension";
        $components = CubeQuery::getComponents($dsd[0], $ds[0], $type);
        
        $componentProperty = array();
        foreach($components as $uri => $property) {
            array_push($componentProperty, $components[$uri]['type']);
        }
        
        $componentElement = CubeQuery::getComponentElements($ds[0], $componentProperty[0]);
        */
    }
    
    private function _getLabelsFor($array, $owApp) {
        $titleHelper = new OntoWiki_Model_TitleHelper($this->_owApp->selectedModel);
        $titleHelper->addResources($array);
        
        $output = array();
        
        foreach($array as $key => $uri) {			
            $output[$uri] = $titleHelper->getTitle($uri);
        }
        return $output;
    }
    
    private function checkSparqlEndpoint($sparqlEndpoint) {
        if($sparqlEndpoint == $this->_owApp->getConfig()->store->backend);
            return true;
    }
    
    public function getchartAction() {
        $this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();
        
        $hashCode = $_REQUEST['hC'];
        $configuration = AuxilaryFunctions::readConfiguration($hashCode);
        
        $chart = $this->getChart($configuration);
        
        $this->_response->setBody($chart);
    }
    
    public function getapplicablechartsAction() {
        $this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();
        
        $numberof_selectedDimensions = $_REQUEST['numberof_selectedDimensions'];
        $numberof_selectedMeasures = $_REQUEST['numberof_selectedMeasures'];
        
        $chartHelper = new ChartHelper();
        $dataSpecTable["dimCount"] = $numberof_selectedDimensions;
        $dataSpecTable["measCount"] = $numberof_selectedMeasures;
        //var_dump($dataSpecTable); die;
        $applicableCharts = $chartHelper->retrieveApplicableChartTypes($dataSpecTable); 
        
        $this->_response->setBody(json_encode($applicableCharts));
    }
		
    private function getChart($configuration, $chartType) {
        $sparqlEndpoint = json_decode($configuration['sparqlEndpoint']); //string
        $selectedGraph = json_decode($configuration['selectedGraph']);
        $selectedDSD = json_decode($configuration['selectedDSD']);
        $selectedDS = json_decode($configuration['selectedDS']);
        $selectedMeasures = json_decode($configuration['selectedMeasures']);
        $selectedMeasures = $selectedMeasures->measures;
        $selectedDimensions = json_decode($configuration['selectedDimensions']);
        $selectedDimensions = $selectedDimensions->dimensions;
        $selectedDimensionComponents = json_decode($configuration['selectedDimensionComponents']);
        $selectedChartType = $configuration['selectedChartType'];

        /***********************
         * Model Analysis part *
         ***********************/
         
        //$analysisResult = CubeQuery::analyzeModel($this->_owApp->selectedModel);
        
        //$observationPartition = CubeQuery::analyzeNeededObservationPartition($this->_owApp->selectedModel);
            
        //$creationTable = array_merge($analysisResult, $observationPartition);
        
        //$creationTable = $this->_evaluateCreationForm($creationTable);
        
        //create the elements and reset the analysis
        //CubeQuery::createStructureElements($creationTable, $this->_owApp->selectedModel);
        //$analysisResult = CubeQuery::analyzeModel($this->_owApp->selectedModel);
        
        /************************
         * Feed URI to the view *
         ************************/
        /*
        $this->view->sparqlEndpoint = json_decode($_REQUEST['sparqlEndpoint']);
        $this->view->selectedGraph = json_decode($_REQUEST['selectedGraph']);
        $this->view->selectedDSD = json_decode($_REQUEST['selectedDSD']);
        $this->view->selectedDS = json_decode($_REQUEST['selectedDS']);
        $this->view->selectedMeasures = $_REQUEST['selectedMeasures'];
        $this->view->selectedDimensions = $_REQUEST['selectedDimensions'];
        $this->view->selectedDimensionComponents = $_REQUEST['selectedDimensionComponents'];
        $this->view->modelUri = $_REQUEST['m'];

        //var_dump($selectedDimensions); die;
        
        /********************
         * Get Observations *
         ********************/
        $selectedDimensionComponents = json_decode($configuration['selectedDimensionComponents']);
        
        $resultCubeSpec = AuxilaryFunctions::resultCubeSpecAdapter($selectedDS,$selectedDimensions,
                                            $selectedDimensionComponents,$selectedMeasures);
        
        $resultObservations = CubeQuery::getResultObservations($resultCubeSpec, $this->_owApp->selectedModel);
                    
        /*******************
         * Axis allocation *
         *******************/
            
        $selectedDimensions = AuxilaryFunctions::setLimits($selectedDimensions);
        $axisAllocationFinal = AuxilaryFunctions::getAxisAllocationFinal($selectedDimensions);
        
        /***************
         * Chart Types *
         ***************/
        
        $chartHelper = new ChartHelper();
        $dataSpecTable["dimCount"] = sizeof($selectedDimensions);
        $dataSpecTable["measCount"] = sizeof($selectedMeasures);
        //var_dump($dataSpecTable); die;
        $applicableCharts = $chartHelper->retrieveApplicableChartTypes($dataSpecTable); 
                            
        //TODO: define ChartTypeSelection Algorithm

        $chartTypes = array_keys($applicableCharts);
        if(array_key_exists($chartType,$applicableCharts)) {
			$selectedChartType = $chartType;
		} else {
			die("This chart type is not applicable for the current choice!");
		}
        
        //var_dump($true); die;
        //$selectedChartType = $chartTypes[$selectedChartType];
                
        $parserHelper = new ParserHelper($this->_parser);
        $parserNames = $parserHelper->getParserNames($selectedChartType);
        //TODO: define parser selection Algorithm
        $selectedParser = array_keys($parserNames);
        $selectedParser = $selectedParser[0];
        
        $resultChartSpec = array();
        $resultChartSpec = $resultCubeSpec;
        $resultChartSpec['model'] = (string) $this->_owApp->selectedModel;
        $resultChartSpec['dsd'] = $selectedDSD->uri;
        $resultChartSpec['chartType'] = $selectedChartType;
        $resultChartSpec['axisAllocation'] = $axisAllocationFinal;
        $resultChartSpec['parser'] = $selectedParser;
        $resultChartSpec['finalAxisAllocation'] = $axisAllocationFinal;
        $resultChartSpec['subtitle'] = "Subtitle";
        
        //$this->view->serializedResultCubeSpec = serialize($resultChartSpec);
        
        $aggregatedObservationData = AuxilaryFunctions::layoutObservationData(
                                        $resultObservations, 
                                        $resultCubeSpec['measOptionList']
                                    );
        
        //construct the titles and the chart
        //$titles['title'] = $titleHelper->getTitle($_POST['dsd']);
        //$titles['subtitle'] = substr($titles['subtitle'], 0, 
        //		strlen($titles['subtitle'])-2);
        
        // TODO set this variable correctly!
        $titles = array ('title' => '', 'subtitle' => '');
                    
        $chart = $chartHelper->createChart($selectedChartType, 
                array('dimensionData' => $aggregatedObservationData['dimensionData'],
                      'measureData' => $aggregatedObservationData['measureData'], 
                      'nameTable' => $resultObservations['nameTable'],
                      'dimensions' => $axisAllocationFinal,
                      'measures' => array($selectedMeasures[0]->uri),
                      'titles' => $titles, 
                      'model' => $this->_owApp->selectedModel));
                
        $selectedParser_addon = array( "AttributeConfigurationHighChartsParserAddOn" => true);
        $translate = $this->_owApp->translate;
        
        $parser = $parserHelper->getParser($selectedParser, $chart, $selectedParser_addon, $translate);
                
        //the result code might contain links 
        //which require the componentUrlBase-path
        
        $chart = '';
        $chart .= sprintf($parser->retrieveImportCode(), 
                $this->_componentUrlBase);
        
        $chart .= $parser->retrieveChartResult();
        
        $addonCode = $parser->retrieveAddOnCode();
        
        if(!empty($addonCode))
            $this->view->parserAddOns = $addonCode;
            
        return array("chart" => $chart, "AddonCode" => $addonCode);
    }
		
    public function indexAction() {
        $this->view->basePath = $this->_config->staticUrlBase . "extensions" . DS . "cubeviz" . DS;
        $this->view->cubevizPath = $this->_config->staticUrlBase . "cubeviz" . DS;
        $this->view->backend = $this->_owApp->getConfig()->store->backend;
        $this->view->isModelSelected = true;
        
        if( isset($this->_owApp->selectedModel) ) {
			$_REQUEST['m'] = $this->_owApp->selectedModel->getBaseIri();
		}
        
        if ( '0777' != substr(decoct( fileperms(dirname (__FILE__) .'/links/') ), 1) )
        {
            echo 'Cubeviz links folder is <b>not</b> writeable! You have to set it to <b>0777</b>.';
            exit;
        }
                
        if(false == isset( $_REQUEST ['m'] ) ) {
            $this->view->isModelSelected = false;
            
            //false view parameters to null
            //nothing is set
            $this->view->sparqlEndpoint = "";
            $this->view->selectedGraph = "";
            $this->view->selectedDSD = "";
            $this->view->selectedDS = "";
            $this->view->selectedMeasures = "";
            $this->view->selectedDimensions = "";
            $this->view->selectedDimensionComponents = "";
            $this->view->modelUri = "";
            $this->view->chartType = "";
        } 
        
        else {         
            
            // Get and save title of the current called model
            $titleHelper = new OntoWiki_Model_TitleHelper(new Erfurt_Rdfs_Model( $_REQUEST ['m'] ));
            $titleHelper->addResource ( $_REQUEST ['m'] );
            $this->view->header = array (
                'selectedModelLabel' => $titleHelper->getTitle ( $_REQUEST ['m'] )
            );
            
            /*******************************
             * Get chart type from the URI *
             * Possible values:            *
             * bar pie line area splines   *
             * scatterplot table           *
             *******************************/
                        
            $chartType = true == isset ( $_REQUEST ['chartType'] ) ? $_REQUEST ['chartType'] : 'bar';
            switch($chartType) {
				case 'bar':
					break;
				case 'pie':
					break;
				case 'line':
					break;
				case 'area':
					break;
				case 'splines':
					break;
				case 'scatterplot':
					break;
				case 'table':
					break;
				default:
					die("Unsupported chart type. Please specify another URI!");
					break;
			}
        
            /**********************
             * Load from the file *
             **********************/
            
            // suggesting that the getcwd() pointing to the ontowiki root folder			
            $hashCode = true == isset ( $_REQUEST ['hC'] ) ? $_REQUEST ['hC'] : 'default';
            
            $configuration = AuxilaryFunctions::readConfiguration($hashCode);
                        
            $chart = $this->getChart($configuration, $chartType);
            
            /***********************
             * Model Analysis part *
             ***********************/
            /* 
            $analysisResult = CubeQuery::analyzeModel($this->_owApp->selectedModel);
            
            $observationPartition = CubeQuery::analyzeNeededObservationPartition($this->_owApp->selectedModel);
                
            $creationTable = array_merge($analysisResult, $observationPartition);
            
            $creationTable = $this->_evaluateCreationForm($creationTable);
            
            //create the elements and reset the analysis
            CubeQuery::createStructureElements($creationTable, $this->_owApp->selectedModel);
            $analysisResult = CubeQuery::analyzeModel($this->_owApp->selectedModel);
            */
            /************************
             * Feed URI to the view *
             ************************/
             
            $this->view->sparqlEndpoint = json_decode($configuration['sparqlEndpoint']);
            $this->view->selectedGraph = json_decode($configuration['selectedGraph']);
            $this->view->selectedDSD = json_decode($configuration['selectedDSD']);
            $this->view->selectedDS = json_decode($configuration['selectedDS']);
            $this->view->selectedMeasures = $configuration['selectedMeasures'];
            $this->view->selectedDimensions = $configuration['selectedDimensions'];
            $this->view->selectedDimensionComponents = $configuration['selectedDimensionComponents'];
            $this->view->chartType = $chartType;
            
            //duplicate
            //$this->view->modelUri = json_decode($configuration['selectedGraph']);
            
            /***********************************************
             * Initialize model from the selectedGraph URI *
             ***********************************************/
            //$modelUri = json_decode($configuration['selectedGraph']);
            //$owApp->selectedResource = $modelUri;
  
            $this->view->modelUri = $_REQUEST['m'];
            
            /*****************************
             * Forward stuff to the view *
             *****************************/
            
            $this->view->chart = $chart['chart'];
        }
    }
    
    public function getlabelsforAction() {
        //avoid the template to be set
        $this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();
        
        $uris = json_decode($_REQUEST['uris']);
        
        $uris = $this->_getLabelsFor($uris, $this->_owApp);
                    
        $this->_response->setBody(json_encode($uris));
    }
    
    /**
     * Include a plain PHP/HTML site
     */
    public function pageAction () {
        $this->view->cubevizPath = $this->getComponentPath($this->_componentUrlBase);
    }
}
