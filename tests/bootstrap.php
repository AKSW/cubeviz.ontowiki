<?php

/**
 * Bootstrap file for PHPUnit
 */
if ( false == defined ('_TESTROOT') )
    define('_TESTROOT', rtrim(dirname(__FILE__), '\\/') . '/');

if ( false == defined ('_BASE') )
define('_BASE', rtrim(realpath(_TESTROOT . '../'), '\\/') . '/');

// OntoWiki related
if ( false == defined ('_OW') )
    define('_OW', rtrim(realpath(_BASE . '../../'), '\\/') . '/');

if ( false == defined ('BOOTSTRAP_FILE') )
    define('BOOTSTRAP_FILE', basename(__FILE__));

if ( false == defined ('ONTOWIKI_ROOT') )
    define('ONTOWIKI_ROOT', _OW);

if ( false == defined ('APPLICATION_PATH') )
    define('APPLICATION_PATH', ONTOWIKI_ROOT . 'application/');

if ( false == defined ('ONTOWIKI_REWRITE') )
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
$loader->registerNamespace('DataCube_');
$loader->registerNamespace('CubeViz_');
$loader->registerNamespace('Erfurt_');
$loader->registerNamespace('OntoWiki_');

require_once 'OntoWiki.php';
