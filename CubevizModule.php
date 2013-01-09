<?php

/**
 * OntoWiki module – Navigation
 *
 * this is the main navigation module
 *
 * @category   OntoWiki
 * @package    extensions_modules_navigation
 * @author     Sebastian Dietzold <sebastian@dietzold.de>
 * @copyright  Copyright (c) 2009, {@link http://aksw.org AKSW}
 * @license    http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 */
class CubevizModule extends OntoWiki_Module
{
    protected $session = null;

    public function init() 
    {
        $this->session = $this->_owApp->session;
        
		$loader = Zend_Loader_Autoloader::getInstance();
		$loader->registerNamespace('CubeViz_');
		$loader->registerNamespace('DataCube_');
		$path = __DIR__;
		set_include_path(get_include_path() . PATH_SEPARATOR . $path . DIRECTORY_SEPARATOR .'classes' . DIRECTORY_SEPARATOR . PATH_SEPARATOR);
	}

    public function getTitle() 
    {
        return 'Data Selection';
    }
    
    /**
     * Check if the current selected knowledgebase contains datacube information
     * @return bool True if selected model contains Data Cube information, false otherwise.
     */
    public function shouldShow()
    {
		if (true == isset($this->_owApp->selectedModel)) {
            $q = new DataCube_Query ( $this->_owApp->selectedModel );
            return $q->containsDataCubeInformation();
        } 
        return false;
    }

    /**
     * Returns the content
     */
    public function getContents() 
    {        
        /**
         * Set paths
         */
        $basePath = $this->view->basePath = $this->_config->staticUrlBase . 'extensions/cubeviz/';
        $baseCssPath = $basePath .'public/css/';
        $baseImagesPath = $basePath .'public/images/';
        $baseJavascriptPath = $basePath .'public/javascript/';
        
        
        /**
         * Including javascript files for this action
         */
        $this->view->headScript()
            ->prependFile ($baseJavascriptPath. 'libraries/json2.js',               'text/javascript')
            ->prependFile ($baseJavascriptPath. 'libraries/underscore.js',          'text/javascript')
            ->prependFile ($baseJavascriptPath. 'libraries/underscore.string.js',   'text/javascript')
            ->prependFile ($baseJavascriptPath. 'Main.js',                          'text/javascript')
            ->prependFile ($basePath.           'ChartConfig.js',                   'text/javascript');
            
        // If this module is in the development context
        if('development' === $this->_privateConfig->get('context')) {
            $this->view->headScript()
                ->appendFile ($baseJavascriptPath. 'libraries/qunit.js', 'text/javascript')
                ->appendFile ($baseJavascriptPath. 'Test.js', 'text/javascript');
        }
        
        /**
         * Including css files for this action
         */
        $this->view->headLink()
            ->prependStylesheet($baseCssPath.'main.css')
            ->prependStylesheet($baseCssPath.'CubeVizModule/component.css')
            ->prependStylesheet($baseCssPath.'CubeVizModule/dataSet.css')
            ->prependStylesheet($baseCssPath.'CubeVizModule/dataStructureDefinition.css')
            ->prependStylesheet($baseCssPath.'CubeVizModule/footer.css');
        
        
        /**
         * Model information
         */
        $model = $this->_owApp->selectedModel;
        $modelIri = $model->getModelIri();
        $modelStore = $model->getStore();
        
		// linkCode (each linkcode represents a particular configuration of CubeViz)
		$linkCode = NULL == $this->_request->getParam ('lC') ? '' : $this->_request->getParam ('lC');
                
        /**
         * Set view and some of its properties.
         */
        $this->view->cubevizImagesPath = $baseImagesPath;
        
        /**
         * Set data container with CubeViz related information
         */
        $c = new CubeViz_ConfigurationLink($this->_owApp->erfurt->getCacheDir());
        $config = $c->read ($linkCode, $model);
                				
        /**
         * Set backend container with backend related information
         */
        $config['backend'] = array(
            'context'           => 'development', // TODO get it from doap.n3
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
       
        $this->view->headScript()
            ->appendScript('cubeVizApp._ = '. json_encode($config, JSON_FORCE_OBJECT) .';')
            ->appendScript('cubeVizApp._.chartConfig = CubeViz_ChartConfig;');
        
        /**
         * fill template with content and give generated HTML back
         */
        return $this->render('public/templates/cubeviz/CubeVizModule');
    }

    public function layoutType() { return 'inline'; }
}


