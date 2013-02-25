<?php

/**
 * 
 */
class CubevizController extends OntoWiki_Controller_Component 
{
    protected $_configuration = null;
    
    public function init () 
    {
        parent::init();
        
        $loader = Zend_Loader_Autoloader::getInstance();
        $loader->registerNamespace('CubeViz_');
        $loader->registerNamespace('DataCube_');
        $path = __DIR__;
        set_include_path(
            get_include_path() . PATH_SEPARATOR . 
            $path . DIRECTORY_SEPARATOR .'classes' . DIRECTORY_SEPARATOR . PATH_SEPARATOR
        );
    }
    
    /**
     * 
     */
    public function indexAction () 
    {
        // In case no model was selected, it redirect to the root url of OntoWiki
        if ( false === isset($this->_owApp->selectedModel)) {
            $this->_helper->redirector->gotoUrl('/');
            return;
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
            ->appendFile($baseJavascriptPath.'libraries/highcharts.js', 'text/javascript')
            ->appendFile($baseJavascriptPath.'libraries/highcharts-more.js', 'text/javascript');    
    
        /**
         * Including css files for this action
         */
        $this->view->headLink()
            ->prependStylesheet($baseCssPath.'foreign/Bootstrap/bootstrap.min.css')
            ->prependStylesheet($baseCssPath.'/main.css')
            ->prependStylesheet($baseCssPath.'/IndexAction/header.css')
            ->prependStylesheet($baseCssPath.'/IndexAction/legend.css')
            ->prependStylesheet($baseCssPath.'/IndexAction/visualization.css')
            ->prependStylesheet($baseCssPath.'/IndexAction/visualizationSelector.css');
        
    
        /**
         * Load model information
         */
        $model = $this->_owApp->selectedModel;
        $modelIri = $model->getModelIri();
        $modelStore = $model->getStore();
        $modelInformation = CubeViz_ViewHelper::getModelInformation($modelStore, $model, $modelIri);
        $modelInformation ['rdfs:label'] = true === isset($modelInformation ['rdfs:label'])
            ? $modelInformation ['rdfs:label']
            : $modelIri;
            
        /**
         * Set view and some of its properties.
         */        
        // fill title-field
        $this->view->placeholder('main.window.title')
                   ->set('Visualization for '. $modelInformation ['rdfs:label']);
        
        $on = $this->_owApp->getNavigation();
        $on->disableNavigation (); // disable OntoWiki's Navigation    
        
        CubeViz_ViewHelper::$isCubeVizIndexLoaded = true;
        
        // init cubeVizApp
        $config = CubeViz_ViewHelper::initApp(
            $this->view,
            $model,
            $this->_owApp->getConfig()->store->backend,
            $this->_owApp->erfurt->getCacheDir(),
            $this->_privateConfig->get('context'),
            $modelIri,
            $this->_config->staticUrlBase,
            $baseImagesPath,
            $this->_request->getParam ('cv_dataHash'),
            $this->_request->getParam ('cv_uiHash'),
            $modelInformation
        );
        
        if(null !== $config) {
            $this->view->headScript()
                 ->appendScript('cubeVizApp._ = '. json_encode($config, JSON_FORCE_OBJECT) .';')
                 ->appendScript('cubeVizApp._.backend.chartConfig = CubeViz_ChartConfig;');
        }
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
        
        // check model parameter
        $m = $this->_request->getParam ('m');
        $m = true === isset($m) ? $m : '';
        
        // use selected model if it is set and model parameter was empty
        if('' == $m && true === isset($this->_owApp->selectedModel)) {
            $m = $this->_owApp->selectedModel->getModelIri();
        }
        
        if (true === $this->_erfurt->getStore()->isModelAvailable($m) 
            && 44 == strlen($dataHash)) {
            
            $m = new Erfurt_Rdf_Model ($m);
            $query = new DataCube_Query ($m);

            // load configuration which is associated with given linkCode
            list($c, $hash) = $this->_getConfiguration ()->read ($dataHash, $this->_owApp->selectedModel);
            
            $content = json_encode($query->getObservations($c), JSON_FORCE_OBJECT);
            $responseCode = 200;
        } else {
            $responseCode = 404;
            $content = json_encode(
                "Model $m not available or cv_dataHash $dataHash is invalid"
            );
        }
        
        $this->_response
            ->setHeader('Cache-Control', 'no-cache, must-revalidate')
            ->setHeader('Content-Type', 'application/json')
            ->setHeader('Expires', 'Sat, 26 Jul 1997 05:00:00 GMT')
            ->setHttpResponseCode($responseCode)
            ->setBody($content);
    }
    
    /**
     * 
     */
    public function getdatastructuredefinitionsAction() 
    {
        $this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();
        
        // check model parameter
        $m = $this->_request->getParam ('m');
        $m = true === isset($m) ? $m : '';
        
        // use selected model if it is set and model parameter was empty
        if('' == $m && true === isset($this->_owApp->selectedModel)) {
            $m = $this->_owApp->selectedModel->getModelIri();
        }

        // execute function if model is available
        if(true === $this->_erfurt->getStore()->isModelAvailable($m)) {
            $model = new Erfurt_Rdf_Model ($m);
            
            $query = new DataCube_Query($model);

            $responseCode = 200;
            $content = $query->getDataStructureDefinitions();
        } else {
            $responseCode = 404;
            $content = "Model $m not available or you are not authorized";
        }
        
        $this->_response
            ->setHeader('Cache-Control', 'no-cache, must-revalidate')
            ->setHeader('Content-Type', 'application/json')
            ->setHeader('Expires', 'Sat, 26 Jul 1997 05:00:00 GMT')
            ->setHttpResponseCode($responseCode)
            ->setBody(json_encode($content));
    }
    
    /**
     * 
     */
    public function getdatasetsAction() 
    {
        $this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();
        
        // check model parameter
        $m = $this->_request->getParam ('m');
        $m = true === isset($m) ? $m : '';
        
        // use selected model if it is set and model parameter was empty
        if('' == $m && true === isset($this->_owApp->selectedModel)) {
            $m = $this->_owApp->selectedModel->getModelIri();
        }
        
        $dsdUrl = $this->_request->getParam('dsdUrl');

        // execute function if model is available
        if(true === $this->_erfurt->getStore()->isModelAvailable($m)
           && true === Erfurt_Uri::check($dsdUrl)) {
            $model = new Erfurt_Rdf_Model ($m);
                            
            $query = new DataCube_Query($model);
            
            $responseCode = 200;
            $content = $query->getDataSets($dsdUrl);
            
        } else {
            $responseCode = 404;
            $content = "Model $m not available or dsdUrl $dsdUrl is invalid";
        }
        
        $this->_response
            ->setHeader('Cache-Control', 'no-cache, must-revalidate')
            ->setHeader('Content-Type', 'application/json')
            ->setHeader('Expires', 'Sat, 26 Jul 1997 05:00:00 GMT')
            ->setHttpResponseCode($responseCode)
            ->setBody(json_encode($content));
    }
    
    /**
     * 
     */
    public function getcomponentsAction() 
    {
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
    public function savecontenttofileAction() 
    {
        $this->_helper->viewRenderer->setNoRender();
        $this->_helper->layout->disableLayout();
        
        // write given content to file
        $hash = $this->_getConfiguration()->write(
            $this->_request->getParam('stringifiedContent'),
            $this->_request->getParam('type')
        );
        
        // send back generated hash
        $this->_response->setBody(json_encode($hash));
    }

    /**
     *
     */
    protected function _getConfiguration () 
    {
        $cacheDir = $this->_owApp->erfurt->getCacheDir();
        if (null === $this->_configuration) {
            $this->_configuration = new CubeViz_ConfigurationLink($cacheDir);
        } 
        return $this->_configuration;
    }
}
