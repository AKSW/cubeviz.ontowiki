<?php

/**
 * Bootstrap file for PHPUnit
 */
define('cubeviz_BASE', dirname (__FILE__) . '/../');

$includePath  = get_include_path()                      . PATH_SEPARATOR;
$includePath .= cubeviz_BASE                            . PATH_SEPARATOR;
$includePath .= cubeviz_BASE . 'classes/'               . PATH_SEPARATOR;
set_include_path($includePath);

require_once cubeviz_BASE .'../../application/tests/Bootstrap.php';

// Prepare namespaces
$loader->registerNamespace('CubeViz_');
$loader->registerNamespace('DataCube_');
