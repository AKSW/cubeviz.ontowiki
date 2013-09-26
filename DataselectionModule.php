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
class DataselectionModule extends OntoWiki_Module
{
    protected $session = null;    
    protected $_titleHelperLimit = -1;

    public function init() 
    {
        $this->session = $this->_owApp->session;
        
        $loader = Zend_Loader_Autoloader::getInstance();
        $loader->registerNamespace('CubeViz_');
        $loader->registerNamespace('DataCube_');
        $path = __DIR__;
        set_include_path(
            get_include_path() . PATH_SEPARATOR . 
            $path . DIRECTORY_SEPARATOR . PATH_SEPARATOR .
            $path . DIRECTORY_SEPARATOR .'classes' . DIRECTORY_SEPARATOR . PATH_SEPARATOR
        );
        
        // limit dimension element number
        $this->_dimensionElementLimit = 0 < (int) $this->_privateConfig->get('dimensionElementLimit')
            ? $this->_privateConfig->get('dimensionElementLimit')
            : 100;
        
        // max number of result entries to use title helper
        $this->_titleHelperLimit = 0 < $this->_privateConfig->get('titleHelperLimit')
            ? $this->_privateConfig->get('titleHelperLimit')
            : 400;
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
            $q = new DataCube_Query (
                $this->_owApp->selectedModel, 
                $this->_titleHelperLimit,
                $this->_dimensionElementLimit
            );
            return $q->containsDataCubeInformation();
        } 
        return false;
    }

    /**
     * Returns the content
     */
    public function getContents() 
    {
        $q = new DataCube_Query (
            $this->_owApp->selectedModel, 
            $this->_titleHelperLimit,
            $this->_dimensionElementLimit
        );
        if (false === $q->containsDataCubeInformation()) {
            return false;
        }
        
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
            ->appendFile ($baseJavascriptPath. 'libraries/CryptoJS_Md5.js',        'text/javascript')
            ->appendFile ($baseJavascriptPath. 'libraries/json2.js',               'text/javascript')
            
            ->appendFile ($baseJavascriptPath. 'libraries/d3js.min.js',            'text/javascript')
            
            ->appendFile ($baseJavascriptPath. 'libraries/underscore.js',          'text/javascript')
            ->appendFile ($baseJavascriptPath. 'libraries/underscore.string.js',   'text/javascript')
            ->appendScript ('_.mixin(_.str.exports());') // for underscore.string
            
            ->appendFile ($basePath.           'ChartConfig.js',                   'text/javascript');
            
        // If this module is in the "development" context
        if('development' === $this->_privateConfig->get('context')) {
            $this->view->headScript()
                ->appendFile ($baseJavascriptPath. 'libraries/munit.js', 'text/javascript')
                ->appendFile ($baseJavascriptPath. 'Test.js', 'text/javascript')
                ->appendFile ($baseJavascriptPath. 'Main.js', 'text/javascript');
        
        // otherwise it is in "production" context
        } else {
            $this->view->headScript()
                ->appendFile ($baseJavascriptPath. 'Main-production.js', 'text/javascript');
        }
        
        /**
         * Including css files for this action
         */
        $this->view->headLink()
            ->prependStylesheet($baseCssPath.'foreign/FontAwesome/css/font-awesome.min.css')
            ->prependStylesheet($baseCssPath.'main.css')
            ->prependStylesheet($baseCssPath.'DataselectionModule/attribute.css')
            ->prependStylesheet($baseCssPath.'DataselectionModule/component.css')
            ->prependStylesheet($baseCssPath.'DataselectionModule/dataSelectionModule.css')
            ->prependStylesheet($baseCssPath.'DataselectionModule/dataSet.css')
            ->prependStylesheet($baseCssPath.'DataselectionModule/footer.css')
            ->prependStylesheet($baseCssPath.'DataselectionModule/measure.css')
            ->prependStylesheet($baseCssPath.'DataselectionModule/slice.css');
        
        // IE specific CSS for fontawesome
        if (strpos($_SERVER['HTTP_USER_AGENT'], '(compatible; MSIE ')!==FALSE) {
            $this->view->headLink()
                 ->appendStylesheet($baseCssPath.'foreign/FontAwesome/css/font-awesome-ie7.min.css');
        }
        
        /**
         * Model information
         */
        $model = $this->_owApp->selectedModel;
        $modelIri = $model->getModelIri();
        $modelStore = $model->getStore();        
        
        // get cache dir
        if (true === method_exists ($this->_owApp->erfurt, 'getCacheDir')) {
            $cacheDir = $this->_owApp->erfurt->getCacheDir() . '/';
        } else {
            $cacheDir = $this->_owApp->erfurt->getTmpDir() . '/';
        }
        
        $serviceUrl = true === isset($_SESSION ['ONTOWIKI']['serviceUrl'])
            ? $_SESSION ['ONTOWIKI']['serviceUrl']
            : null;
        
        CubeViz_ViewHelper::$isCubeVizDataselectionModuleLoaded = true;
        
        // init cubeVizApp
        $config = CubeViz_ViewHelper::initApp(
            $this->view,
            $model,
            $this->_owApp->getConfig()->store->backend,
            $this->_privateConfig->get('context'),
            $modelIri,
            $serviceUrl,
            $this->_config->staticUrlBase,
            $baseImagesPath,
            $this->_request->getParam ('cv_dataHash'),
            $this->_request->getParam ('cv_uiHash'),
            $this->_titleHelperLimit,
            $this->_dimensionElementLimit
        );
        
        if(null !== $config) {
            $this->view->headScript()
                 ->appendScript('cubeVizApp._ = '. json_encode($config, JSON_FORCE_OBJECT) .';')
                 ->appendScript('cubeVizApp._.backend.chartConfig = CubeViz_ChartConfig;');
        }
        
        $this->view->translate = $this->_owApp->translate;
        
        /**
         * fill template with content and give generated HTML back
         */
        return $this->render('public/templates/cubeviz/DataselectionModule');
    }

    public function layoutType() { return 'inline'; }
}


