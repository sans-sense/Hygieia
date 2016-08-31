/**
 * Build widget configuration
 */
(function () {
    'use strict';

    angular
        .module(HygieiaConfig.module)
        .controller('BuildWidgetConfigController', BuildWidgetConfigController);

    BuildWidgetConfigController.$inject = ['modalData', '$scope', 'collectorData', '$modalInstance'];
    function BuildWidgetConfigController(modalData, $scope, collectorData, $modalInstance) {
        var ctrl = this;
        var widgetConfig = modalData.widgetConfig;

        // public variables
        ctrl.toolsDropdownPlaceholder = 'Loading Build Jobs...';
        ctrl.toolsDropdownDisabled = true;

        ctrl.buildDurationThreshold = 3;
        ctrl.buildConsecutiveFailureThreshold = 5;
        ctrl.buildOption = "Travis-CI";

        // set values from config
        if (widgetConfig) {
            
            if (widgetConfig.options.buildOption) {
                ctrl.buildOption = widgetConfig.options.buildOption;
            }
            if (widgetConfig.options.buildDurationThreshold) {
                ctrl.buildDurationThreshold = widgetConfig.options.buildDurationThreshold;
            }

            if (widgetConfig.options.consecutiveFailureThreshold) {
                ctrl.buildConsecutiveFailureThreshold = widgetConfig.options.consecutiveFailureThreshold;
            }
        }

        // public methods
        ctrl.submit = submitForm;
        ctrl.submitted = false;

		// Request collectors
        collectorData.collectorsByType('Build').then(processCollectorsResponse);

        function processCollectorsResponse(data) {
            ctrl.collectors = data;
            ctrl.buildOptions = createBuildOptions(data);
            ctrl.toolsDropdownDisabled = false;
        }

        function createBuildOptions(data) {
            var options = [];
            if (data && data.length > 0) {
                for (var i =0; i < data.length; i++) {
                    options.push({"name":data[i].name, "value":data[i].id});
                }
            }
            return options;
        }
        
        function submitForm(valid) {
            var buildOption = 
                ctrl.submitted = true;
            if (valid && ctrl.collectors.length) {
                createCollectorItem(buildOption).then(processCollectorItemResponse);
            }
        }

        function processCollectorItemResponse(response) {
            var form = document.buildConfigForm;
            var postObj = {
                name: 'build',
                options: {
                    id: widgetConfig.options.id,
                    buildOption: widgetConfig.options.buildOption,
                    buildDurationThreshold: parseFloat(form.buildDurationThreshold.value),
                    consecutiveFailureThreshold: parseFloat(form.buildConsecutiveFailureThreshold.value)
                },
                componentId: modalData.dashboard.application.components[0].id,
                collectorItemId: response.data.id
            };

            // pass this new config to the modal closing so it's saved
            $modalInstance.close(postObj);
        }

        function createCollectorItem(buildOption) {
            var item = {};
            item = {
                collectorId : ctrl.buildOption.value
            }
            return collectorData.createCollectorItem(item);
        }
    }
})();
