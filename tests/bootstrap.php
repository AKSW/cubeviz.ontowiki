<?php

/**
 * Bootstrap file for PHPUnit
 */
define('_TESTROOT', rtrim(dirname(__FILE__), '\\/') . '/');
define('_BASE', rtrim(realpath(_TESTROOT . '../'), '\\/') . '/');

// OntoWiki related
define('_OW', rtrim(realpath(_BASE . '../../'), '\\/') . '/');
define('BOOTSTRAP_FILE', basename(__FILE__));
define('ONTOWIKI_ROOT', _OW);
define('APPLICATION_PATH', ONTOWIKI_ROOT . 'application/');
define('ONTOWIKI_REWRITE', true); // TODO port version from OW/index.php

// add Erfurt lib to include path
$includePath  = get_include_path()                      . PATH_SEPARATOR;
$includePath .= _BASE                                   . PATH_SEPARATOR;
$includePath .= _BASE . 'classes/'                      . PATH_SEPARATOR;
$includePath .= _OW   . 'application/classes/'          . PATH_SEPARATOR;
$includePath .= _OW   . 'application/classes/OntoWiki/' . PATH_SEPARATOR;
$includePath .= _OW   . 'libraries/'                    . PATH_SEPARATOR;
$includePath .= _OW   . 'libraries/Erfurt/'             . PATH_SEPARATOR;
$includePath .= _OW   . 'libraries/Erfurt/Erfurt/'      . PATH_SEPARATOR;
$includePath .= _OW   . 'libraries/Zend/'               . PATH_SEPARATOR;
set_include_path($includePath);

// Zend_Loader for class autoloading
require_once 'Loader/Autoloader.php';
$loader = Zend_Loader_Autoloader::getInstance();
$loader->registerNamespace('CubeViz_');
$loader->registerNamespace('DataCube_');
$loader->registerNamespace('Erfurt_');
$loader->registerNamespace('OntoWiki_');

require_once 'OntoWiki.php';
