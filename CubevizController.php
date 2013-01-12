<?php

/**
 * 
 */
class CubevizController extends OntoWiki_Controller_Component {

    protected $_configuration = null;
    
    public function init () {
        parent::init();
        $loader = Zend_Loader_Autoloader::getInstance();
        $loader->registerNamespace('CubeViz_');
        $loader->registerNamespace('DataCube_');
        $path = __DIR__;
        set_include_path(get_include_path() . PATH_SEPARATOR . $path . DIRECTORY_SEPARATOR .'classes' . DIRECTORY_SEPARATOR . PATH_SEPARATOR);

    }
    
    /**
     * 
     */
    public function indexAction () {
    
        // In case no model was selected, it redirect to the root url of OntoWiki
        if ( null == $this->_owApp->selectedModel ) {
            $this->_helper->redirector->gotoUrl('');
        }
        
    
        /**
         * Set paths
         */
        $basePath = $this->view->basePath = $this->_config->staticUrlBase . 'extensions/cubeviz/';
        $baseJavascriptPath = $basePath .'public/javascript/';
        $baseCssPath = $basePath .'public/css/';
        $this->view->cubevizImagesPath = $baseImagesPath = $basePath .'public/images/';
    
    
        /**
         * Including javascript files for this action
         */
        // Libraries
        $this->view->headScript()
            ->appendFile($baseJavascriptPath.'libraries/CryptoJs/md5-min.js', 'text/javascript')
            ->appendFile($baseJavascriptPath.'libraries/highcharts.js', 'text/javascript')
            ->appendFile($baseJavascriptPath.'libraries/highcharts-more.js', 'text/javascript');    
    
        /**
         * Including css files for this action
         */
        $this->view->headLink()
            ->prependStylesheet($baseCssPath.'/main.css')
            ->prependStylesheet($baseCssPath.'/IndexAction/header.css')
            ->prependStylesheet($baseCssPath.'/IndexAction/visualization.css')
            ->prependStylesheet($baseCssPath.'/IndexAction/visualizationSelector.css');
        
    
        /**
         * Load model information
         */
        $model = $this->_owApp->selectedModel;
        $modelIri = $model->getModelIri();
        $modelStore = $model->getStore();
        $modelInformation = $this->_getModelInformation($modelStore, $model, $modelIri);
                
        /**
         * Set view and some of its properties.
         */        
        // fill title-field
        $this->view->placeholder('main.window.title')
                   ->set('Visualization for '. $modelInformation ['rdfs:label']);
        
        $on = $this->_owApp->getNavigation();
        $on->disableNavigation (); // disable OntoWiki's Navigation    
        
        /**
         * Set backend container with backend related information
         */
        $context = null === $this->_privateConfig->get('context') 
            ? 'production' : $this->_privateConfig->get('context');
        
        /**
         * Get hashes from parameter list
         */
        // hash for data
        $dataHash = NULL == $this->_request->getParam ('cv_dataHash') 
            ? CubeViz_ConfigurationLink::$filePrefForDataHash 
            : $this->_request->getParam ('cv_dataHash');
        
        // hash for ui
        $uiHash = NULL == $this->_request->getParam ('cv_uiHash') 
            ? CubeViz_ConfigurationLink::$filePrefForUiHash 
            : $this->_request->getParam ('cv_uiHash');
        
        /**
         * Read information from files according to given hases
         */
        $c = new CubeViz_ConfigurationLink($this->_owApp->erfurt->getCacheDir());
        $config = array();
        $config['data'] = $c->read ($dataHash, $model);
        $config['ui'] = $c->read ($uiHash, $model);

        $config['backend'] = array(
            'context'           => $context, 
            'database'          => $this->_owApp->getConfig()->store->backend,
            'imagesPath'        => $baseImagesPath,
            'modelUrl'          => $modelIri,
            'uiParts'           => array(
                'module'        => array('isLoaded'=> false),
                'index'         => array('isLoaded'=> false)
            ),
            'url'               => $this->_config->staticUrlBase . 'cubeviz/',
            'sparqlEndpoint'    => 'local'
        );
                
        /**
         * Save model information
         */
        $this->view->CubeViz_ModelInformation = $modelInformation;
        
        /**
         * Set view and some of its properties.
         */
        $this->view->cubevizImagesPath = $baseImagesPath;
        
        $this->view->headScript()
            ->appendScript('cubeVizApp._ = '. json_encode($config, JSON_FORCE_OBJECT) .';')
            ->appendScript('cubeVizApp._.backend.chartConfig = CubeViz_ChartConfig;');
    }

    /**
     *
     */
    public function getobservationsAction() 
    {
        $this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();   
             
        // data hash
        $dataHash = NULL == $this->_request->getParam ('cv_dataHash') 
            ? '' : $this->_request->getParam ('cv_dataHash');
        
        // init Query and model
        $query = new DataCube_Query ( $this->_owApp->selectedModel );
        
        // load configuration which is associated with given linkCode
        $c = $this->_getConfiguration ()->read ($dataHash, $this->_owApp->selectedModel);
        
        // ... get and return observations
        $this->_response->setBody(
            json_encode($query->getObservations($c), JSON_FORCE_OBJECT)
        );
    }
    
    /**
     * 
     */
    public function getdatastructuredefinitionsAction() {
		$this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();
		
		$model = new Erfurt_Rdf_Model ($this->_request->getParam ('m'));
		
		$query = new DataCube_Query($model);
				
        $this->_response->setBody(json_encode($query->getDataStructureDefinitions()));
	}
	
	/**
	 * 
	 */
	public function getdatasetsAction() {
		$this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();
		
		$model = new Erfurt_Rdf_Model ($this->_request->getParam ('m'));
		$dsdUrl = $this->_request->getParam('dsdUrl'); // Data Structure Definition
						
		$query = new DataCube_Query($model);

        $this->_response
            ->setHeader('Cache-Control', 'no-cache, must-revalidate')
            ->setHeader('Content-Type', 'application/json')
            ->setHeader('Expires', 'Sat, 26 Jul 1997 05:00:00 GMT')
            ->setBody(json_encode($query->getDataSets($dsdUrl)));
	}
	
	/**
	 * 
	 */
	public function getcomponentsAction() {
		$this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();
		
		$model = new Erfurt_Rdf_Model ($this->_request->getParam ('m'));
		
        // Data Structure Definition
        $dsdUrl = $this->_request->getParam('dsdUrl');
		
        // Data Set
        $dsUrl = $this->_request->getParam('dsUrl');
        
        // can be DataCube_UriOf::Dimension or DataCube_UriOf::Measure
		$componentType = $this->_request->getParam('cT'); 
				
		if($componentType == 'measure') {
			$componentType = DataCube_UriOf::Measure;
		} else if($componentType == 'dimension') {
			$componentType = DataCube_UriOf::Dimension;
		} else {
            // stop execution, because it is not a $componentType that i understand
            $this->_response->setBody('Unknown cT parameter! Given was: '. $componentType);
            return;
        }
		
		$query = new DataCube_Query($model);
				
		try {
			$this->_response->setBody(json_encode($query->getComponents($dsdUrl, $dsUrl, $componentType)));
		} catch(CubeViz_Exception $e) {
			// send error message back
			$this->_response->setBody($e->getMessage());
		}        
	}
	
	/**
	 * 
	 */
	public function savecontenttofileAction() {
		$this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();
		
        // write given content to file
		$hash = $this->_getConfiguration()->write(
            $this->_request->getParam('content'),
            $this->_request->getParam('type')
        );
        
        // send back result
		$this->_response->setBody(json_encode($hash));
	}

    /**
     *
     */
    protected function _getConfiguration () {
        $cacheDir = $this->_owApp->erfurt->getCacheDir();
        if (null === $this->_configuration) {
    		$this->_configuration = new CubeViz_ConfigurationLink($cacheDir);
        } 
        return $this->_configuration;
    }

    /**
     * Get information about the selected model
     * @param $modelStore Store of selected model
     * @param $model Model itself
     * @param $modelIri Iri of the selected model
     * @return Array Array with fields about dc:creator, dc:description, 
     *               rdfs:label, doap:license, doap:revision, doap:shortdesc
     */
    protected function _getModelInformation ($modelStore, $model, $modelIri) {
        $modelResource = new OntoWiki_Model_Resource($modelStore, $model, $modelIri);
        $modelResource = $modelResource->getValues();
        
        $usedPredicates = array(
            'dc:creator', 'dc:description', 'rdfs:label', 'doap:license',
            'doap:revision', 'doap:shortdesc'
        );
        
        $modelInformation = array(
            'uri' => $modelIri
        );
        
        // Build array modelInformation which contains exactly the predicates from
        // $usedPredicates as keys and the content as value.
        foreach ($modelResource [$modelIri] as $predicateUri => $ele) {
            $compactPredicateUri = OntoWiki_Utils::compactUri($predicateUri);
            if(true == in_array($compactPredicateUri, $usedPredicates)) {
                $modelInformation [$compactPredicateUri] = 
                    $modelResource [$modelIri][$predicateUri][0]['content'];
            }
            if(false === isset($modelInformation [$compactPredicateUri])){
                $modelInformation [$compactPredicateUri] = '';
            }
        }
        return $modelInformation;
    }
}
