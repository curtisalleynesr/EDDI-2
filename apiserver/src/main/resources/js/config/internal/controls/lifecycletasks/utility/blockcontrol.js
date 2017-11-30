function BlockControl(model) {
    let textCSSClassPostfix = '_text';
    let editableIdPrefix = 'editable_';
    let deleteableIdPrefix = 'deleteable_';
    let editableCSSClassPostfix = '_editable';
    let deleteableCSSClassPostfix = '_deleteable';
    let rightSideCSSClassPostfix = '_right';
    let secondRowPostfix = '_secondrow';

    let instance = this;

    this.observable = new Observable();
    this.observer = new Observer(function (event) {
        switch (event.command) {
            case 'UpdatedModel':
                instance.observable.notify(new Event(instance, event.command));
                break;
        }
    });

    let getOnlyPropertyKey = function (object) {
        for (let property in object) {
            return property;
        }
    };

    let isResourceUriKey = function (configEntry) {
        let kResourceIdentifier = 'eddi://';

        /** A configElement is a uri-selector if it starts with the __eddi://__ identifier. */
        if (configEntry.type.indexOf(kResourceIdentifier) === 0) {
            return true;
        } else {
            return false;
        }
    };

    let configDefinitionContainsOnlyOneUriElement = function (configDefinition) {
        if (ObjectUtils.prototype.getNumberOfProperties(configDefinition) === 1) {
            let property = getOnlyPropertyKey(configDefinition);

            return isResourceUriKey(configDefinition[property]);
        }

        return false;
    };

    this.createRepresentation = function () {
        let representation = '<div id="' + model.idPrefix + model.id + '" class="' + model.CSSClassBase + '">' +
            '<div class="' + model.CSSClassBase + textCSSClassPostfix + '">' + model.text + '</div>';

        representation += '<div class="' + model.CSSClassBase + rightSideCSSClassPostfix + '">';

        if (model.deleteable) {
            representation += '<a href="#"><div id="' + model.idPrefix + deleteableIdPrefix + model.id + '"' +
                ' class="' + model.CSSClassBase + deleteableCSSClassPostfix + '"></div></a>';
        }
        representation += '<div class="clear"></div></div>';

        representation += '<div class="clear"></div>';

        for (let key in model.configDefinition) {
            let elem = model.configDefinition[key];

            if (isResourceUriKey(elem)) {
                let form = new ResourceURIFormElement('resourceuri_white', true, key, elem.type, elem.displayKey, model.task.getModel()[key], model.task.getModel());
                form.observable.addObserver(application.actionHandler.observer);
                form.observable.addObserver(instance.observer);

                representation += '<div class="' + model.CSSClassBase + secondRowPostfix + '">';
                representation += form.createRepresentation();
                representation += '</div>';

                model.children.push(form);
            } else {
                let form = new GenericResourceElement('resourceconfig_white', key, elem.displayKey, model.task.getModel()[key], model.task.getModel());
                form.observable.addObserver(application.actionHandler.observer);
                form.observable.addObserver(instance.observer);

                representation += '<div class="' + model.CSSClassBase + secondRowPostfix + '">';
                representation += form.createRepresentation();
                representation += '</div>';

                model.children.push(form);
            }
        }

        representation += '</div>';

        return representation;
    };

    this.registerButtonEvents = function () {
        if (model.editable) {
            $('#' + model.idPrefix + editableIdPrefix + model.id).click(function () {
                let event = new Event(instance, 'EditElement');

                event.configDefinition = model.configDefinition;

                instance.observable.notify(event);
                return false;
            });
        }

        if (model.deleteable) {
            $('#' + model.idPrefix + deleteableIdPrefix + model.id).click(function () {
                instance.observable.notify(new Event(instance, 'DeleteElement'));
                return false;
            });
        }

        for (let i = 0; i < model.children.length; ++i) {
            model.children[i].registerButtonEvents();
        }

        /** Preserve additional state classes. */
        for (let i = 0; i < model.additionalClasses.length; ++i) {
            $('#' + model.idPrefix + model.id).addClass(model.additionalClasses[i]);
        }
    };

    this.getModel = function () {
        return model;
    }
}

function BlockControlModel(id, idPrefix, CSSClassBase, text, editable, deleteable, type, task) {
    this.id = id;
    this.idPrefix = idPrefix;
    this.CSSClassBase = CSSClassBase;
    this.text = text;
    this.editable = editable;
    this.deleteable = deleteable;
    this.type = type;
    this.configDefinition = application.jsonBuilderHelper.fetchExtension(type).configDefinition;
    this.children = [];
    this.task = task;

    this.additionalClasses = [];

    this.addClass = function (className) {
        if (this.additionalClasses.indexOf() === -1) {
            this.additionalClasses.push(className);
        }
    };

    this.removeClass = function (className) {
        try {
            this.additionalClasses.removeElement(className);
        } catch (ex) {
            if (ex instanceof InconsistentStateDetectedException) {
                console.log(ex.message);
            } else {
                throw ex;
            }
        }
    }
}