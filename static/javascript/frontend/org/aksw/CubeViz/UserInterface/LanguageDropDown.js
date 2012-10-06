Namespacedotjs('org.aksw.CubeViz.UserInterface.LanguageDropDown', {
	
	initUserInterface: function() {
		$("#edit-lang-dropdown-select_arrow").click(function() {
			$("#edit-lang-dropdown-select_child").toggle();
		});
		$(".ddTitleText").click(function() {
			$("#edit-lang-dropdown-select_titletext").html($(this).html());
			$("#edit-lang-dropdown-select_child").hide();
		});
	}
});
