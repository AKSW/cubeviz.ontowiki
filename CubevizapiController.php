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
 * Basic controller for the Chartview component
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Tom-Michael Hesse <tommichael.hesse@googlemail.com>
 */
class CubevizapiController extends OntoWiki_Controller_Component
{
    /**
     * TODO: obsolete ?
     * 
     * Major action in the ChartView component: the analyzeAction()-method
     * runs all needed steps for creating a chart out of the given RDF DataCube 
     * model.
     * 
     * This action triggers a template to present the analysis, selection and
     * chart output to the user.
     */
    public function analyzeAction() {
		
        if($this->_owApp->selectedModel) {
            
            //$this->_resources = memory_get_usage(true);
            //$this->_time = microtime(tr	ue);
            
            //step 0: initialize all managers and helpers
            $translate = $this->_owApp->translate;
            $titleHelper = new OntoWiki_Model_TitleHelper($this->_owApp->selectedModel);
            $cubeHelper = new CubeHelper($this->_uris, $this->_owApp->selectedModel, 
                    $this->_uriPattern, $this->_uriElements);
            $parserHelper = new ParserHelper($this->_parser);
            $chartHelper = new ChartHelper();
            
            //initalize all variables used during the process
            $analysisResult = array();
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
            $isCreationAllowed = false;
            if($this->_erfurt->getAc()->isActionAllowed('ModelManagement')) {
				// writting access control allowed?
                $isCreationAllowed = true;
            }
            $isConfigSaveAllowed = false;
            $application = Erfurt_App::getInstance();
            if(!$application->getAuth()->getIdentity()->isAnonymousUser()) {
                $isConfigSaveAllowed = true;
            }
            
            //step 1: analyze the model and decide whether cube elements have to 
            //be constructed or can be read out; to increase the performance only 
            //the analysis is done by default
            $analysisResult = $cubeHelper->analyzeModel();
            
            $this->view->analysis = $analysisResult;
            if(isset($_POST['isCreateElementsSet']) && $isCreationAllowed) { 
                //elements have to be created
                
                //the following steps have high performance costs
                $observationPartition = $cubeHelper->
                        analyzeNeededObservationPartition($analysisResult);
                
                $creationTable = array_merge($analysisResult, 
                        $observationPartition);
                
                //evaluate the user input on names and uris if given
                if(isset($_POST['creationList'])) {
                    $creationTable = $this->_evaluateCreationForm($creationTable);
                }
                
                //create the elements and reset the analysis
                $cubeHelper->createStructureElements($creationTable);
                $analysisResult = $cubeHelper->analyzeModel();
                $this->view->analysis = $analysisResult;
            }
            
            //step 1a: check if a configuration file is given to the controller
            //for loading a prepared data selection
            
            if(isset($_POST['configurationFile'])) {
                if(!empty($_POST['configurationFile'])) {
                    try {
                        $resultChartSpec = array();
                        $configurationContent = 
                            file_get_contents($_POST['configurationFile']);
                        $resultChartSpec = unserialize($configurationContent);
                        
                        if($resultChartSpec['model'] == 
                                (string) $this->_owApp->selectedModel) {
                        
                            $_POST['dsd'] = $resultChartSpec['dsd'];
                            $_POST['ds'] = $resultChartSpec['ds']; 
                            $_POST['dim'] = $resultChartSpec['dim'];
                            $_POST['ms'] = $resultChartSpec['ms'];
                            $_POST['type'] = $resultChartSpec['chartType'];
                            $_POST['parser'] = $resultChartSpec['parser'];

                            //build the posts for all additional dimension options
                            foreach($_POST['dim'] as $dimension) {

                                $_POST['dim'.md5($dimension).'Axis']
                                        = $resultChartSpec['axisAllocation'][$dimension];
                                
                                if(isset($resultChartSpec['dimElemList'][$dimension])) {

                                    $_POST['dim'.md5($dimension).'elemList'] =
                                        $resultChartSpec['dimElemList'][$dimension]; 
                                }

                                if(isset($resultChartSpec['dimLimitList'][$dimension]['limit'])) {

                                    $_POST['dim'.md5($dimension).'Limit'] = 
                                        $resultChartSpec['dimLimitList'][$dimension]['limit'];

                                    $_POST['dim'.md5($dimension).'Offset'] =
                                        $resultChartSpec['dimLimitList'][$dimension]['offset'];
                                }

                                if(isset($resultChartSpec['dimOptionList'][$dimension]['order'])) {

                                    $_POST['dim'.md5($dimension).'Order'] =
                                        $resultChartSpec['dimOptionList'][$dimension]['order'];
                                }
                            }

                            //build the posts for all additional measure options
                            foreach($_POST['ms'] as $measure) {

                                //an aggregation method has to be set anyway
                                $_POST['meas'.md5($measure).'Aggr'] = 
                                    $resultChartSpec['measFunctionList'][$measure];

                                if(isset($resultChartSpec['measOptionList'][$measure]['order'])) {

                                    $_POST['meas'.md5($measure).'Order'] =
                                        $resultChartSpec['measOptionList'][$measure]['order'];
                                }

                                if(isset($resultChartSpec['measOptionList'][$measure]['round'])) {

                                    $_POST['meas'.md5($measure).'Round'] = true;
                                }
                            }
                        }
                    } catch (Exception $e) {
                        //the loading process was not successful, return to
                        //usual procedure
                    }
                }
            }
            
            //step 2: get the DSDs in the cube and send them to the view, then get
            //all data sets, dimensions and measures for selection
            if($analysisResult['rule']['structureGiven']) {
                $dsdTable = $cubeHelper->getDataStructureDefinition($titleHelper);
                $this->view->dsd = array();
                $this->view->dsd = $dsdTable;
                if(!isset($_POST['dsd'])) {
                    //if no DSD was chosen due to the first load, preselect one entry
                    $_POST['dsd'] = current($dsdTable);
                }
                
                $dsTable = $cubeHelper->getDataSets($_POST['dsd'], $titleHelper);
                $this->view->ds = array();
                $this->view->ds = $dsTable;
                if(!isset($_POST['ds'])) {
                    //if no DS was chosen due to the first load, preselect one entry
                    $_POST['ds'] = current($dsTable);
                }
                
                $dimTable = $cubeHelper->getComponents($_POST['dsd'], 
                        $_POST['ds'], 'dimension', $titleHelper);
                $this->view->dim = array();
                $this->view->dim = $dimTable;

                $measTable = $cubeHelper->getComponents($_POST['dsd'], 
                        $_POST['ds'], 'measure', $titleHelper);
                $this->view->ms = array();
                $this->view->ms = $measTable;
                $this->view->msAggr = array();
                $this->view->msAggr = $cubeHelper->provideAggregationFunctions();
            }
            
            //step 3: calculate the axis allocation of the selected dimensions
            if(isset($_POST['dim'])) {
                
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
                
                //$adaptedDimTable - elementCount = actual selected elements
                                
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
                      
            //step 4: analyze the selected dimensions and measures, 
            //preselect chart types
            if(isset($_POST['dsd']) 
                    && isset($_POST['ds']) 
                    && isset($_POST['dim']) 
                    && isset($_POST['ms'])) {
                
                $dataSpecTable['dimCount'] = count($finalAxisAllocation);
                $dataSpecTable['measCount'] = count($_POST['ms']);
                                
                $applicableCharts = $chartHelper->
                        retrieveApplicableChartTypes($dataSpecTable);
                
                $this->view->avCharts = array();
                $this->view->avChrts = $applicableCharts;
                
                if(!isset($_POST['type'])) {
                    $chartTypes = array_keys($applicableCharts);
                    $_POST['type'] = current($chartTypes);
                }
                else {
                    if(!(in_array($_POST['type'], array_keys($applicableCharts)))) {
                        $_POST['type'] = current($chartTypes);
                    }
                }
                
                //initialize all available parsers for the selected chart type
                $parserNames = $parserHelper->getParserNames($_POST['type']);
                // array(2) { ["HighChartsParser"]=> string(10) "HighCharts" ["PhplotParser"]=> string(6) "PHPlot" } 
                
                $this->view->parser = array();
                $this->view->parser = $parserNames;
                if(!isset($_POST['parser'])) {
                    $_POST['parser'] = current(array_keys($parserNames));
                }
                else {
                    if(!in_array($_POST['parser'], array_keys($parserNames))) {
                        $_POST['parser'] = current(array_keys($parserNames));
                    }
                }
            }
            
            //step 5: prepare the data for the chart
            $resultCubeSpec = array();
            if(isset($_POST['dsd']) 
                    && isset($_POST['ds']) 
                    && isset($_POST['dim']) 
                    && isset($_POST['ms'])) {
                
                //build the specification table for the data to get
                $resultCubeSpec['ds'] = $_POST['ds'];
                $resultCubeSpec['dim'] = array_keys($axisAllocation);
                $resultCubeSpec['dimtypes'] = $adaptedDimTable;
                $resultCubeSpec['ms'] = $_POST['ms'];
                $resultCubeSpec['mstypes'] = $measTable;
                
                //build the lists for all additional dimension options
                foreach(array_keys($axisAllocation) as $dimension) {
                    
                    if(isset($_POST['dim'.md5($dimension).'elemList'])) {
                        
                        $resultCubeSpec['dimElemList'][$dimension] 
                            = $_POST['dim'.md5($dimension).'elemList'];
                    }
                    
                    if(isset($_POST['dim'.md5($dimension).'Limit'])) {
                        
                        $resultCubeSpec['dimLimitList'][$dimension]['limit'] 
                            = $_POST['dim'.md5($dimension).'Limit'];
                        
                        $resultCubeSpec['dimLimitList'][$dimension]['offset'] 
                            = $_POST['dim'.md5($dimension).'Offset'];
                    }
                    
                    if(!isset($_POST['dim'.md5($dimension).'Order'])) {
                        
                        //start all dimensions without an element order
                        $_POST['dim'.md5($dimension).'Order'] = 'NONE';
                    }
                    
                    $resultCubeSpec['dimOptionList'][$dimension]['order'] 
                            = $_POST['dim'.md5($dimension).'Order'];
                }
                
                //build the lists for all additional measure options
                foreach($_POST['ms'] as $measure) {
                    
                    //an aggregation method has to be set anyway
                    if(!isset($_POST['meas'.md5($measure).'Aggr'])) {
                        
                        $_POST['meas'.md5($measure).'Aggr'] 
                            = current(array_keys($this->view->msAggr));
                    }
                    
                    $resultCubeSpec['measFunctionList'][$measure] 
                            = $_POST['meas'.md5($measure).'Aggr'];
                    
                    if(!isset($_POST['meas'.md5($measure).'Order'])) {
                        
                        //start all measure with descending order
                        $_POST['meas'.md5($measure).'Order'] = 'DESC';
                    } 
                    
                    $resultCubeSpec['measOptionList'][$measure]['order'] 
                            = $_POST['meas'.md5($measure).'Order'];
                    
                    if(isset($_POST['meas'.md5($measure).'Round'])) {
                        
                        $resultCubeSpec['measOptionList'][$measure]['round'] 
                            = true;
                    }
                    
                    if($titles['subtitle'] != '')
                        $titles['subtitle'] = substr($titles['subtitle'], 0, 
                                strlen($titles['subtitle'])-2).': ';
                    
                    $titles['subtitle'] .= $titleHelper->getTitle($measure).', ';
                }
                
                //create and serialize the result chart specification
                $resultChartSpec = array();
                $resultChartSpec = $resultCubeSpec;
                $resultChartSpec['model'] = (string) $this->_owApp->selectedModel;
                $resultChartSpec['dsd'] = $_POST['dsd'];
                $resultChartSpec['chartType'] = $_POST['type'];
                $resultChartSpec['axisAllocation'] = $axisAllocation;
                $resultChartSpec['parser'] = $_POST['parser'];
                //only used in service action:
                $resultChartSpec['finalAxisAllocation'] = $finalAxisAllocation;
                $resultChartSpec['subtitle'] = $titles['subtitle'];
                
                $this->view->serializedResultCubeSpec = serialize($resultChartSpec);
                
                //get and aggregate the data
                
                $resultObservations = $cubeHelper->getResultObservations($resultCubeSpec);
                
                $aggregatedObservationData 
                    = $cubeHelper->layoutObservationData($resultObservations, 
                            $resultCubeSpec['measOptionList']);
                
                //construct the titles and the chart
                $titles['title'] = $titleHelper->getTitle($_POST['dsd']);
                $titles['subtitle'] = substr($titles['subtitle'], 0, 
                        strlen($titles['subtitle'])-2);
                
                $chart = $chartHelper->createChart($_POST['type'], 
                        array('dimensionData' => $aggregatedObservationData['dimensionData'],
                              'measureData' => $aggregatedObservationData['measureData'], 
                              'nameTable' => $resultObservations['nameTable'],
                              'dimensions' => $finalAxisAllocation,
                              'measures' => $_POST['ms'],
                              'titles' => $titles, 
                              'model' => $this->_owApp->selectedModel));
                              
            }
            
            //step 6: show the chart with the selected chart library
            if($chart != null && !empty($_POST['parser'])) {
                
                $parser = $parserHelper->getParser($_POST['parser'], $chart, 
                        $this->_addon[$_POST['parser']], $translate);
                                
                //the result code might contain links 
                //which require the componentUrlBase-path
                $this->view->chart = '';
                $this->view->chart .= sprintf($parser->retrieveImportCode(), 
                        $this->_componentUrlBase);
                
                $this->view->chart .= $parser->retrieveChartResult();
                
                $addonCode = $parser->retrieveAddOnCode();
                
                if(!empty($addonCode))
                    $this->view->parserAddOns = $addonCode;
            }
            
            //step 7: prepare data for the view
            $this->view->isCreationAllowed = $isCreationAllowed;
            $this->view->isConfigSaveAllowed = $isConfigSaveAllowed;
            
            $this->view->submitUri = new OntoWiki_Url(array('controller'=>'cubeviz',
                                                            'action'=>'analyze'));
            $this->view->filterUri = new OntoWiki_Url(array('controller'=>'cubeviz',
                                                            'action'=>'filter'));
            $this->view->structureUri = new OntoWiki_Url(array('controller'=>'cubeviz',
                                                               'action'=>'structure'));
            $this->view->listElementsUri = $this->_createListElementsLink();
            $this->view->saveConfigurationUri 
                    = $this->_componentUrlBase.'output/configuration.php';
            $this->view->titleHelper = $titleHelper;
            $this->view->uriPattern = $this->_uriPattern;
            $this->view->uriElements = $cubeHelper->provideUriElementDescriptions();
            $this->view->options = $this->_options;
            $this->view->basePath = $this->_componentUrlBase;
            $this->view->placeholder('main.window.title')->set('CubeViz: '.
                    ((string)$this->_owApp->selectedModel));
            
            //$this->_resources = memory_get_usage(true) - $this->_resources;
            //$this->_time = microtime(true) - $this->_time;
            //echo "MEMORY: ".$this->_resources." bytes";
            //echo "TIME: ".$this->_time." msec";
        }
        
    }
}
