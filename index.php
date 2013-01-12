<?php
	/*
	 *	Modular HTML/CSS/JS Loader with shared global resources
	 *	for things like header/footer and css/js libraries that
	 *  will be used across all modules.
	 */

	//script execution timing
	$script_execution_start = microtime(true);

	/*
	 *	DIRECTORY CONSTANTS
	 */
	define('MODULES_DIR', './modules/');
	define('GLOBAL_DIR', MODULES_DIR.'global/');

	/*
	 *	Special Character CONSTANTS
	 */
	define('NL', "\n");


	/*
	 *	Global Module CSS Resources
	 *	Begin by listing building a list of all css files in the modules/global/css/ directory
	 *  The files are then built into <link rel="stylesheet"> tags
	 *
	 *	Any files preceded with an ! or . will be ignored.  This is so they can be referenced manually
	 *  and used in a location other than the $css variable or not at all
	 */
	$css_includes = array_diff(scandir(GLOBAL_DIR.'css/'), array('..', '.'));

	//ignore any files preceded with a ! or .
	$css_includes = array_filter($css_includes,function($file){
		if( strpos($file, '!') === 0 || strpos($file, '.') === 0 ){
			return false;
		} else {
			return true;
		}
	});

	//Build the CSS tags
	$css = array_map(
		function($css_file){
			return '<link rel="stylesheet" href="'.GLOBAL_DIR.'css/'.$css_file.'">';
		},
		$css_includes
	);
	$css = implode(NL, $css);


	/*
	 *	Global Module JS Resources
	 *	Begin by listing building a list of all js files in the modules/global/js/ directory
	 *  The files are then built into <script src=""></script> tags to be embeded on a template
	 *
	 *	Any files preceded with an ! or . will be ignored.  This is so they can be referenced manually
	 *  and used in a location other than the $js variable or not at all
	 */
	$js_includes = array_diff(scandir(GLOBAL_DIR.'js/'), array('..', '.'));

	//ignore any files preceeded with an ! or . character 
	$js_includes = array_filter($js_includes,function($js_file){
		if( strpos($js_file, '!') === 0 || strpos($js_file, '.') === 0 ){
			return false;
		} else {
			return true;
		}
	});

	//Build the script html tags
	$js = array_map(
		function($js_file){
			return '<script src="'.MODULES_DIR.'global/js/'.$js_file.'"></script>';
		},
		$js_includes
	);
	$js = implode(NL, $js);

	/*
	 *	Component Modules
	 *  Begin by building a list of available modules
	 *  A module is simply a sub directory in the modules folder
	 *  For obvious reasons, the name "global" is reserved and thus not included in the list
	 */
	$modules = array_diff(scandir(MODULES_DIR), array('..', '.', 'global'));

	/*
	 *	Simple Router, either we show a list of available modules
	 *  or load the requested module if it exists
	 */
	if( count($_GET) === 0 ){
		//show list of modules :D
		$module_list = array_map(
			function($module){
				return '<a class="modules" href="?'.$module.'">'.$module.'</a>';
			},
			$modules
		);
	}else{
		//echo '<header>'.key($_GET).'</header>';
		if( in_array(key($_GET), $modules) ){
			$module_html = MODULES_DIR.key($_GET).'/'.key($_GET).'.html';
			$css .= '<link rel="stylesheet" href="'.MODULES_DIR.key($_GET).'/'.key($_GET).'.css">';
			$js .= NL.'<script src="'.MODULES_DIR.key($_GET).'/'.key($_GET).'.js"></script>';
		} else {
			header("HTTP/1.0 404 Not Found");
			require(GLOBAL_DIR.'html/404.html');
		}
	}

	//Start building the html output, begenning with the header
	if( file_exists(GLOBAL_DIR.'html/header.html') ){ 
		require(GLOBAL_DIR.'html/header.html'); 
	}

	if( isset($module_list) ){
		echo implode('', $module_list);
	}
	if( isset($module_html) ){
		require($module_html);
	}

	$script_execution_end = microtime(true);
	$execution_time = $script_execution_end - $script_execution_start;

	if( file_exists(GLOBAL_DIR.'html/footer.html') ){ 
		require(GLOBAL_DIR.'html/footer.html');
	}