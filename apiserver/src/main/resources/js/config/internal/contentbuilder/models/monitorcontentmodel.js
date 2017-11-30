function MonitorContentModel(dataProvider, actionHandler) {
    let botId;
    let botVersion;

    this.getBotId = function () {
        return botId;
    };

    this.getBotVersion = function () {
        return botVersion;
    };

    this.makeContentModel = function (sizeCallbackInstance, selectionCallbackInstance) {
        let models = [];

        let conversationLog = dataProvider.readActiveConversationLog();
        botId = conversationLog.botId;
        botVersion = conversationLog.botVersion;

        let conversationStepColumns = [
            new TableControlColumnModel({columnIdentifier: 'selection'}, window.lang.convert('MONITOR_CONVERSATION_TABLE_COL_SELECTION'), 'table_col_selection', false, false),
            new TableControlColumnModel({columnIdentifier: 'date'}, window.lang.convert('MONITOR_CONVERSATION_TABLE_COL_DATE'), 'table_col_date', false, false),
            new TableControlColumnModel({columnIdentifier: 'input'}, window.lang.convert('MONITOR_CONVERSATION_TABLE_COL_INPUT'), 'table_col_input', false, false),
            new TableControlColumnModel({columnIdentifier: 'output'}, window.lang.convert('MONITOR_CONVERSATION_TABLE_COL_OUTPUT'), 'table_col_output', false, false)
        ];

        let packageTableControls = [];
        let packageColumns = [
            new TableControlColumnModel({columnIdentifier: 'selection'}, window.lang.convert('MONITOR_PACKAGE_TABLE_COL_SELECTION'), 'table_col_selection', false, false),
            new TableControlColumnModel({columnIdentifier: 'name'}, window.lang.convert('MONITOR_PACKAGE_TABLE_COL_NAME'), 'table_col_name', false, false),
            new TableControlColumnModel({columnIdentifier: 'duration'}, window.lang.convert('MONITOR_PACKAGE_TABLE_COL_DURATION'), 'table_col_duration', false, false),
            new TableControlColumnModel({columnIdentifier: 'count'}, window.lang.convert('MONITOR_PACKAGE_TABLE_COL_COUNT'), 'table_col_count', false, false)
        ];

        let lifeCycleTaskTableControls = [];
        let lifeCycleTaskColumns = [
            new TableControlColumnModel({columnIdentifier: 'key'}, window.lang.convert('MONITOR_LIFECYCLETASK_TABLE_COL_KEY'), 'table_col_key', false, false),
            new TableControlColumnModel({columnIdentifier: 'result'}, window.lang.convert('MONITOR_LIFECYCLETASK_TABLE_COL_RESULT'), 'table_col_result', false, false)
        ];

        let conversationStepData = [];
        let packageData = [];
        let lifeCycleTaskData = [];

        let input;
        let output;
        let date;

        for (let i = 0; i < conversationLog.conversationSteps.length; i++) {
            lifeCycleTaskTableControls = [];
            packageData = [];
            input = null;
            output = null;
            date = null;

            let packagesArray = conversationLog.conversationSteps[i].packages;
            let package;
            let lifeCycleTasksArray;
            let name;
            let duration;
            let count;
            for (let j = 0; j < packagesArray.length; j++) {
                lifeCycleTaskData = [];
                package = packagesArray[j];
                lifeCycleTasksArray = package.lifecycleTasks;
                name = package.context;
                count = lifeCycleTasksArray.length;
                duration = lifeCycleTasksArray.length > 0 ? lifeCycleTasksArray[lifeCycleTasksArray.length - 1].timestamp - lifeCycleTasksArray[0].timestamp : 0;

                let lifeCycleTask;
                let key;
                let result;
                let outputFoundInThisPackagesLifeCycleTaskArray = false;
                for (let k = 0; k < lifeCycleTasksArray.length; k++) {
                    lifeCycleTask = lifeCycleTasksArray[k];
                    key = lifeCycleTask.key;
                    result = lifeCycleTask.result;

                    lifeCycleTaskData.push([key, result]);

                    if (input === null && lifeCycleTask.key.indexOf('input') === 0) {
                        input = lifeCycleTask.result;
                        date = (new Date(lifeCycleTask.timestamp)).toLocaleTimeString();
                    }

                    //output for conversationStep = the last lifeCycleElement which name begins with 'output' IN the first package which contains a lifecycle-element with a name beginning with 'output'
                    if ((output === null || outputFoundInThisPackagesLifeCycleTaskArray) && lifeCycleTask.key.indexOf('output') === 0) {
                        output = lifeCycleTask.result;
                        outputFoundInThisPackagesLifeCycleTaskArray = true;
                    }
                }

                let lifeCycleTaskTableDataModel = new TableControlDataModel({dataType: 'lifeCycleTask'}, lifeCycleTaskData);
                let lifeCycleTaskTableModel = new TableControlModel(0, 'lifecycletask_table_', true, true, lifeCycleTaskColumns, lifeCycleTaskTableDataModel);
                lifeCycleTaskTableModel.setShowControlHeaders(false);

                lifeCycleTaskTableControls.push(new TableControl(lifeCycleTaskTableModel));

                packageData.push(['<img class="dataTables_dotbutton" src="/binary/img/config/dotbutton.png"/>', name, duration, count]);
            }

            let packageTableDataModel = new TableControlDataModel({dataType: 'package'}, packageData);
            packageTableDataModel.setDetailRowsTableControls(lifeCycleTaskTableControls);
            let packageTableModel = new TableControlModel(0, 'package_table_', true, true, packageColumns, packageTableDataModel);
            packageTableModel.setShowControlHeaders(false);

            packageTableControls.push(new TableControl(packageTableModel));

            conversationStepData.push(['<img class="dataTables_dotbutton" src="/binary/img/config/dotbutton.png"/>', date, input, output]);
        }

        let tableDataModel = new TableControlDataModel({dataType: 'conversationLog'}, conversationStepData);
        tableDataModel.setDetailRowsTableControls(packageTableControls);
        let tableModel = new TableControlModel(0, 'conversationLog_table_', true, true, conversationStepColumns, tableDataModel);
        tableModel.setShowControlHeaders(false);


        let tableControl = new TableControl(tableModel);
        tableControl.observable.addObserver(actionHandler.observer);
        models.push(tableControl);

        return models;
    }
}