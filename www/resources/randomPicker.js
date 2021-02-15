/*
Copyright 2021 HJOW

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

function RandomPicker() {
    // configs
    this.debugMode   = true;
    this.verboseMode = false;
    this.version = [0, 0, 3];

    // fields
    this.initialized = false;
    this.rootArea = null;
    this.events = {
        windowResize : []
    };
    this.targets = [];     // 선정 대상
    this.cols = 1;         // 선정 대상 데이터의 컬럼 최대 갯수
    this.running = false;  // 실행 중 여부
    this.timers = null;    // 랜덤 선정 타이머
    this.timerGap  = 50;   // 랜덤 선정 타이머 실행 주기 (밀리초)
    this.stopDelay = 4;    // 선정 버튼 클릭 시 지연 시간 (초)
    this.counterValue = 0; // 카운트다운 현재값 (0 이하이면 보이지 않음)
    this.counters = null;  // 카운트다운 타이머
    this.util = new Utilities();
    this.stringtable = new StringTable([
        {
            en : 'Reset',
            ko : '초기화'
        },
        {
            en : 'Run',
            ko : '실행'
        },
        {
            en : 'Stop',
            ko : '정지'
        },
        {
            en : 'Add',
            ko : '추가'
        },
        {
            en : 'There is no item choosed.',
            ko : '아무 항목도 선택되지 않았습니다.'
        },
        {
            en : 'Choose',
            ko : '선정'
        },
        {
            en : 'Choosed',
            ko : '선택됨'
        },
        {
            en : 'There is no item.',
            ko : '선정 대상이 없습니다.'
        },
        {
            en : 'Please add items to choose randomly.',
            ko : '랜덤 선정할 대상들을 추가해 주세요.'
        },
        {
            en : 'You can drag and drop "xlsx" file here to add items at once.',
            ko : '"xlsx" 파일을 이 영역 안으로 끌어 놓아 여러 대상을 한번에 추가할 수 있습니다.'
        },
        {
            en : 'Drop here',
            ko : '이 곳에 놓으면 파일을 읽습니다'
        },
        {
            en : 'There is only one item.',
            ko : '선정 대상이 하나밖에 없습니다.'
        },
        {
            en : 'There is no result',
            ko : '선정된 항목이 없습니다.'
        },
        {
            en : 'Add New',
            ko : '새 항목 추가'
        },
        {
            en : 'Random Picker is started.',
            ko : 'Random Picker 가 시작되었습니다.'
        },
        {
            en : 'Random Picker is stopped.',
            ko : 'Random Picker 가 취소되었습니다.'
        },
        {
            en : 'Random Picker is finished.',
            ko : 'Random Picker 가 작업을 완료하였습니다.'
        },
    ]);
    
    this.thirdparties = [
        { 
            name : 'jQuery',
            license : 'MIT',
            url : 'http://jquery.org/license'
        },
        { 
            name : 'jQuery UI',
            license : 'MIT',
            url : 'http://jquery.org/license'
        },
        {
            name : 'moment.js',
            license : 'MIT',
            url : 'https://momentjs.com/'
        },
        {
            name : 'SheetJS',
            license : 'Apache License 2.0',
            url : 'https://github.com/SheetJS/sheetjs/blob/master/LICENSE'
        },
        {
            name : 'Bootstrap',
            license : 'MIT',
            url : 'https://github.com/twbs/bootstrap/blob/v3-dev/LICENSE'
        }
    ];

    // process configs at first
    this.versionString = '';
    this.versionNumber = 0;
    for(var idx=0; idx<this.version.length; idx++) {
        if(idx >= 1) this.versionString += '.';
        this.versionString += this.version[idx];
    }
    var versionCalc = 0;
    for(var idx=this.version.length-1; idx>=0; idx--) {
        this.versionNumber += (this.version[idx] * Math.pow(100, versionCalc));
        versionCalc++;
    }
    var rABS = typeof FileReader !== 'undefined' && FileReader.prototype && FileReader.prototype.readAsBinaryString;

    // methods
    this.t = function(text) { return this.stringtable.t(text) };
    this.init = function init(roots) {
        if(this.initialized) {
            if(this.debugMode) return this;
            return null;
        }
        this.logFunction('init');

        this.rootArea = $(roots);
        this.prepareFirst();

        this.render();

        this.goto('main');
        this.initialized = true;

        if(this.debugMode) return this;
        return null;
    };

    this.find = function(selector) {
        return this.rootArea.find(selector);
    };

    this.putEvents = function() {
        this.logFunction('putEvents');

        this.removeEventAll();
        this.putGlogalEvents();

        var selfObj = this;
        this.find('.button-add').each(function() {
            var btnObj = $(this);
            if(btnObj.is('.binded')) return;

            btnObj.on('click', function() {
                var contents = selfObj.find('.input.adds').val();
                selfObj.addTarget(contents);
                selfObj.find('.input.adds').val('');
                selfObj.find('.input.adds').focus();
            });
            btnObj.addClass('binded').addClass('binded_click');
        });
        this.find('input.adds').each(function() { // binded_keypress
            var inputObj = $(this);
            if(inputObj.is('.binded_keypress')) return;
            inputObj.on('keypress', function(e) {
                var keyCode = e.keyCode;
                if(keyCode == 13) {
                    var content = inputObj.val();
                    inputObj.val('');
                    inputObj.focus();
                    selfObj.addTarget(content);
                }
            });
            inputObj.addClass('binded').addClass('binded_keypress');
        });
        this.find('.button-run').each(function() {
            var btnObj = $(this);
            if(btnObj.is('.binded_click')) return;
            btnObj.on('click', function() {
                selfObj.run();
            });
            btnObj.addClass('binded').addClass('binded_click');
        });
        this.find('.button-stop-direct').each(function() {
            var btnObj = $(this);
            if(btnObj.is('.binded_click')) return;
            btnObj.on('click', function() {
                selfObj.stop(true);
            });
            btnObj.addClass('binded').addClass('binded_click');
        });
        this.find('.button-stop').each(function() {
            var btnObj = $(this);
            if(btnObj.is('.binded_click')) return;
            btnObj.on('click', function() {
                selfObj.stop(false);
            });
            btnObj.addClass('binded').addClass('binded_click');
        });
        this.find('.button-reset').each(function() {
            var btnObj = $(this);
            if(btnObj.is('.binded_click')) return;
            btnObj.on('click', function() {
                selfObj.stop();
                selfObj.targets = [];
                selfObj.render();
            });
            btnObj.addClass('binded').addClass('binded_click');
        });
        this.find('.button-license').each(function() {
            var btnObj = $(this);
            if(btnObj.is('.binded_click')) return;
            btnObj.on('click', function() {
                if(selfObj.getCurrentPageName() == 'main') {
                    btnObj.val(selfObj.t('Back'));
                    selfObj.goto('third-party-lib');
                } else {
                    btnObj.val(selfObj.t('License'));
                    selfObj.goto('main');
                }
            });
            btnObj.addClass('binded').addClass('binded_click');
        });

        var tableTarget = this.getPage('main').find('.table.target');
        var tbody = tableTarget.find('tbody');
        tbody.find('.button-remove').each(function(){
            var btnObj = $(this);
            if(btnObj.is('.binded_click')) return;
            btnObj.on('click', function() {
                var btn   = $(this);
                var objId = btn.attr('data-id');
                for(var tdx=0; tdx<selfObj.targets.length; tdx++) {
                    var obj = selfObj.targets[tdx];
                    if(String(obj.id) != objId) continue;
                    selfObj.targets.splice(tdx, 1);
                    break;
                }
                selfObj.render();
            });
            btnObj.addClass('binded').addClass('binded_click')
        });

        this.putDnDEvents();
    };

    this.putDnDEvents = function() {
        var selfObj = this;
        this.find('.xls_dnd_target').each(function() {
            var target = $(this);
            if(target.is('.binded_dnd')) return;

            target.on('dragenter', function(e) {
                e.stopPropagation();
                e.preventDefault();
                target.addClass('drag_entered');
                return false;
            });

            target.on('dragleave', function(e) {
                e.stopPropagation();
                e.preventDefault();
                target.removeClass('drag_entered');
                return false;
            });

            target.on('dragover', function(e) {
                e.stopPropagation();
                e.preventDefault();
                return false;
            });

            target.on('drop', function(e) {
                e.preventDefault();
                target.removeClass('drag_entered');

                var fileList = e.originalEvent.dataTransfer.files;
                if(fileList == null || fileList.length <= 0) return false;

                for(var idx=0; idx<fileList.length; idx++) {
                    selfObj.readFile(fileList[idx], idx);
                }

                return true;
            });

            target.addClass('binded').addClass('binded_dnd');
        });
    };

    this.readFile = function(fileOne, index) {
        var selfObj    = this;
        var fileReader = new FileReader();
        var fileName   = fileOne.name;
        fileReader.onload = function(e) {
            var data = e.target.result;
            selfObj.processFileData(data, fileName, index);
        };
        if(rABS) fileReader.readAsBinaryString(fileOne);
        else     fileReader.readAsArrayBuffer(fileOne);
    };

    this.processFileData = function(fileData, fileName, index) {
        var readType = {};
        if(rABS) readType.type = 'binary';
        else     readType.type = 'base64';
        readType.cellDatas = true;

        var selfObj = this;
        var wb, arr, xls;
        var afterAction = function() {
            try {
                wb = XLSX.read(fileData, readType);
                selfObj.addTargetFromWorkbook(wb, index);
            } catch(e) {
                selfObj.error(e);
            }
        };

        if(fileData.length > 1e6) {
            selfObj.error('File size exceed : ' + fileName + ' (' + fileData.length + ')');
            return;
        }
        afterAction();
    };

    this.processWorkbook = function(wb) {
        var sheets = wb.SheetNames;

        var resultJson = [];
        for(var sdx=0; sdx<sheets.length; sdx++) {
            var sheetNameOne = sheets[sdx];
            var sheetOne     = {};
            sheetOne.name = sheetNameOne + '';
            sheetOne.data = XLSX.utils.sheet_to_json(wb.Sheets[sheetNameOne], {raw : false});

            resultJson.push(sheetOne);
        }

        return resultJson;
    };

    this.addTargetFromWorkbook = function(wb, index) {
        var resultJson = this.processWorkbook(wb);
        for(var idx=0; idx<resultJson.length; idx++) {
            var sheetOne  = resultJson[idx];
            var sheetData = sheetOne.data;

            for(var k1 in sheetData) {
                var rowBefore = sheetData[k1];
                var rowOne = [];

                for(var k2 in rowBefore) {
                    rowOne.push(rowBefore[k2]);
                }

                this.addTarget(rowOne, true);
            }
        }
        this.render();
    };

    this.removeEventAll = function() {
        this.logFunction('removeEventAll');

        try { $(window).off('resize'); } catch(e) { this.debug(e); }
        this.rootArea.find('.binded').each(function(){
            var elementOne = $(this);
            if(elementOne.is('.binded_click'   )) elementOne.off('click');
            if(elementOne.is('.binded_submit'  )) elementOne.off('submit');
            if(elementOne.is('.binded_keypress')) elementOne.off('keypress');
            if(elementOne.is('.binded_dnd'     )) {
                elementOne.off('dragenter');
                elementOne.off('dragleave');
                elementOne.off('dragover');
                elementOne.off('drop');
            }
            elementOne.removeClass('binded_click');
            elementOne.removeClass('binded_submit');
            elementOne.removeClass('binded_keypress');
            elementOne.removeClass('binded_dnd');
            elementOne.removeClass('binded');
        })
    };

    this.render = function render() {
        this.logFunction('render');

        var beforePage = this.getCurrentPageName();

        this.rootArea.addClass('random-picker');
        this.rootArea.addClass('lang_' + this.util.getLanguage());

        this.removeEventAll();

        this.renderFooter();
        this.renderMain();
        this.renderThirdPartyLibs();

        this.putEvents();

        var selfObj = this;
        this.find('.input-only-idle').each(function() {
            $(this).prop('disabled', selfObj.running);
            if(selfObj.running) $(this).addClass('disabled');
            else                $(this).removeClass('disabled');
        });
    }

    this.renderMain = function() {
        this.logFunction('renderMain');

        var target = this.getPage('main');
        target.html(this.buildPageStruct());

        var htmls = '';
        htmls += "<div class='area'>";
        htmls += "    <input type='text' class='input results' readonly/>";
        htmls += "</div>";
        if(this.running) {
            htmls += "<div class='area'>";
            htmls += "    <input type='button' class='button button-stop-direct button-disabled-on-choosing'/>";
            htmls += "    <input type='button' class='button big button-stop button-disabled-on-choosing'/>";
            htmls += "    <span class='counter'></span>";
            htmls += "</div>";
        } else {
            htmls += "<div class='area'>";
            htmls += "    <input type='button' class='button big button-run input-only-idle'/>";
            htmls += "    <span class='counter'></span>";
            htmls += "</div>";
        }
        
        htmls += "<div class='area'>";
        htmls += "    <input type='text' class='input adds input-only-idle'/>";
        htmls += "    <input type='button' class='button button-add input-only-idle'/>";
        htmls += "    <input type='button' class='button button-reset input-only-idle'/>";
        htmls += "</div>";
        htmls += "<div class='area'>";
        htmls += "    <table class='table target scroll_y'>";
        htmls += "        <tbody class='scroll_y'>";
        htmls += "        </tbody>";
        htmls += "    </table>";
        htmls += "</div>";

        target.find('.content').html(htmls);

        target.find('.button-reset').val(this.t('Reset'));
        target.find('.button-run').val(this.t('Run'));
        target.find('.button-stop').val(this.t('Choose'));
        target.find('.button-stop-direct').val(this.t('Stop'));
        target.find('.button-add').val(this.t('Add'));

        target.find('.input.adds').attr('placeholder', this.t('Add New') + '...');
        target.find('.input.results').attr('placeholder', this.t('There is no result') + '...');

        if(this.running) {
            target.find('.button-run').addClass('invisible');
        } else {
            target.find('.button-stop').addClass('invisible');
        }
        
        this.renderTargets();
    };

    this.renderTargets = function() {
        this.logFunction('renderTargets');

        var tableTarget = this.getPage('main').find('.table.target');
        var tbody = tableTarget.find('tbody');

        this.reCalculateMaxCols();
        tbody.empty();

        var htmls = '';
        if(this.targets.length <= 0) {
            htmls += "<tr class='tr_no_item'>";
            htmls += "<td colspan='" + (this.cols + 2) + "' class='xls_dnd_target'>";
            htmls += this.t('There is no item.');
            htmls += "<br/>";
            htmls += "<span class='hidden_on_dragenter'>" + this.t('Please add items to choose randomly.') + '</span>';
            htmls += "<br/>";
            htmls += "<span class='hidden_on_dragenter'>" + this.t('You can drag and drop "xlsx" file here to add items at once.') + '</span>';
            htmls += "<span class='shown_on_dragenter'>" + this.t('Drop here') + ' !</span>';
            htmls += "</td>";
            htmls += "</tr>";
        } else {
            for(var idx=0; idx<this.targets.length; idx++) {
                htmls += this.buildElement(this.targets[idx], idx);
            };
        }
        
        tbody.html(htmls);
    };

    this.renderThirdPartyLibs = function() {
        this.logFunction('renderThirdPartyLibs');

        var target = this.getPage('third-party-lib')
        target.html(this.buildPageStruct());

        var htmls = '';

        htmls += "<div class='area third_party'>";
        htmls += "    <h2>Random Picker</h2>";
        htmls += "    <pre>";

        htmls += "Copyright 2021 HJOW" + '\n';
        htmls += "" + '\n';
        htmls += "Licensed under the Apache License, Version 2.0 (the 'License')" + '\n';
        htmls += "you may not use this file except in compliance with the License." + '\n';
        htmls += "You may obtain a copy of the License at" + '\n';
        htmls += "" + '\n';
        htmls += "    http://www.apache.org/licenses/LICENSE-2.0" + '\n';
        htmls += "" + '\n';
        htmls += "Unless required by applicable law or agreed to in writing, software" + '\n';
        htmls += "distributed under the License is distributed on an 'AS IS' BASIS," + '\n';
        htmls += "WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied." + '\n';
        htmls += "See the License for the specific language governing permissions and" + '\n';
        htmls += "limitations under the License." + '\n';

        htmls += "    </pre>";
        htmls += "</div>";

        for(var idx=0; idx<this.thirdparties.length; idx++) {
            var thirdPartyOne = this.thirdparties[idx];
            htmls += "<div class='area third_party'>";
            htmls += "    <h2>" + thirdPartyOne.name + "</h2>";
            htmls += "    <div>" + thirdPartyOne.license + "</div>";
            htmls += "    <a href='" + thirdPartyOne.url + "'>See</a>"
            htmls += "</div>";
        }

        target.find('.content').html(htmls);
    };

    this.renderFooter = function() {
        this.logFunction('renderFooter');
        
        var logArea = this.getLogArea();

    };

    this.renderFirst = function() {
        var htmls = "";
        htmls += "<div class='page' data-page='main'>";
        htmls += "</div>";
        htmls += "<div class='page' data-page='third-party-lib'>";
        htmls += "</div>";
        htmls += "<div class='logarea'>";
        htmls += "    <textarea class='textarea log scroll_y' readonly></textarea>";
        htmls += "    <div class='footer'>" + this.buildFooter() + "</div>";
        htmls += "</div>";
        this.rootArea.html(htmls);
        this.find('.footer').find('.button-license').val(this.t('License'));
    };

    this.getPages = function() {
        this.logFunction('getPages');

        return this.find('> .page');
    };

    this.getCurrentPage = function() {
        this.logFunction('getCurrentPage');
        var matched = null;
        this.find('> .page').each(function() {
            var pageOne = $(this);
            if(pageOne.is('.active')) {
                matched = pageOne;
            }
        });
        if(matched == null) {
            this.movePage('main');
            return this.find('> .page.active');
        }
        return matched;
    };

    this.getCurrentPageName = function() {
        this.logFunction('getCurrentPageName');
        var curPage = this.getCurrentPage();
        return curPage.attr('data-page');
    };

    this.getPage = function(pageName) {
        this.logFunction('getPage');

        var selfs   = this;
        var results = null;
        this.getPages().each(function() {
            if(results != null) return;
            var cPageOne  = $(this);
            var cPageName = cPageOne.attr('data-page');
            if(cPageName == String(pageName)) results = cPageOne;
        });
        return results;
    };

    this.getLogArea = function() {
        return this.rootArea.find('.logarea');
    };

    this.getPageContentArea = function(pageName) {
        this.logFunction('getPageContentArea');

        return this.getPage(pageName).find('> .content');
    };

    this.goto = function(pageName) {
        this.logFunction('goto');

        this.movePage(pageName);
    };

    this.movePage = function(pageName) {
        this.logFunction('movePage');

        this.logPageMovements(pageName);
        this.rootArea.find('> .page').removeClass('active');
        this.getPage(pageName).addClass('active');
    };

    this.buildPageStruct = function(pageName) {
        this.logFunction('buildPageStruct');

        var htmls = '';
        htmls += "<div data-role='page'>";
        htmls += this.buildHeader();
        htmls += "<div class='content ui-content' role='" + String(pageName) + "'></div>";
        htmls += "</div>";
        return htmls;
    };

    this.buildHeader = function() {
        this.logFunction('buildHeader');

        var htmls = '';
        htmls += "<div class='header' data-role='header'>";

        htmls += "</div>";
        return htmls;
    };

    this.buildFooter = function() {
        this.logFunction('buildFooter');

        var htmls = '';
        htmls += "<input type='button' class='button button-license'/>";
        return htmls;
    };

    this.buildElement = function(obj, index) {
        this.logFunction('buildElement');

        var contents = obj.content;
        var htmls = '';

        var realContents = [];
        if(typeof(contents) == 'string') {
            realContents.push(String(contents))
        } else {
            for(var idx=0; idx<contents.length; idx++) {
                realContents.push(String(contents[idx]))
            }
        }
        for(var idx=0; idx<this.cols - realContents.length; idx++) {
            realContents.push('');
        }

        var classes = "tr tr_target tr_target_" + obj.id;
        if(obj.choosed) classes += ' choosed';

        htmls += "<tr class='" + classes + "' data-id=" + obj.id + ">";
        htmls += "<td class='td_index xls_dnd_target'><span class='float_left'>No.</span> " + (index + 1) + "</td>";

        for(var idx=0; idx<realContents.length; idx++) {
            htmls += "<td class='xls_dnd_target'>";
            htmls += String(realContents[idx]);
            htmls += "</td>";
        }

        htmls += "<td class='td_btn'>";
        htmls += "    <input type='button' class='button input-only-idle button-remove button-remove-" + obj.id + "' data-id='" + obj.id + "' value='X'/>";
        htmls += "</td>";
        
        htmls += "</tr>";

        return htmls;
    };

    this.prepareFirst = function() {
        this.logFunction('prepareFirst');

        var selfObj = this;
        this.renderFirst();

        this.events.windowResize.push(function(events) {
            var dim = this.util.dimension();
            selfObj.rootArea.height(dim.inner.height);
            selfObj.getPages().each(function(){
                var pageOne = $(this);
                pageOne.height(dim.inner.height - 1);
            });
        });

        this.executeOnWindowResize();
        this.log('Random Picker')
        this.log('    version ' + this.versionString);
    };

    this.putGlogalEvents = function() {
        this.logFunction('putGlogalEvents');

        var selfObj = this;
        $(window).on('resize', function(events) {
            selfObj.executeOnWindowResize(events);
        });

        var resizeFunc = function(areaHeight) {
            var logArea = selfObj.getLogArea();
            var txArea  = logArea.find('.textarea.log');
            txArea.height(areaHeight - logArea.find('.footer').height() - 10)
        };

        this.getLogArea().resizable({
            animate : false,
            handles : 'n',
            resize : function(event, ui) {
                resizeFunc(ui.size.height);
            }
        });

        resizeFunc(this.getLogArea().height());
    };

    this.executeOnWindowResize = function(event) {
        this.logFunction('executeOnWindowResize');

        var selfObj = this;
        for(var idx=0; idx<this.events.windowResize.length; idx++) {
            var funcOne = this.events.windowResize[idx];
            if(typeof(funcOne) == 'function') {
                var args = [];
                args.push(event);
                funcOne.apply(selfObj, args);
            }
        }
    };

    this.getNewTargetKey = function() {
        var max = 0;
        for(var idx=0; idx<this.targets.length; idx++) {
            var targetOne = this.targets[idx];
            if(targetOne.id > max) max = targetOne.id;
        }
        max++;
        return max;
    };

    this.addTarget = function(text, noRender) {
        var obj = {};
        obj.id = this.getNewTargetKey();
        obj.content = text;
        obj.choosed = false;

        this.targets.push(obj);
        
        if(noRender) return obj.id;

        this.renderTargets();
        this.putEvents();
        return obj.id;
    };

    this.removeTarget = function(id) {
        for(var idx=0; idx<this.targets.length; idx++) {
            var targetOne = this.targets[idx];
            if(targetOne.id == this.util.parseInt(id)) {
                this.targets.splice(idx, 1);
                this.renderTargets();
                this.putEvents();
                return;
            }
        }
    };

    this.reCalculateMaxCols = function() {
        var maxCols = 1;
        for(var idx=0; idx<this.targets.length; idx++) {
            var targetOne = this.targets[idx];
            var content   = targetOne.content;
            var colCount  = 1;
            if(typeof(content) == 'string') {
                colCount = 1;
            } else if(this.util.isArray(content)) {
                if(content.length <= 1) colCount = 1;
                else colCount = content.length;
            }
            if(maxCols < colCount) maxCols = colCount;
        }
        this.cols = maxCols;
    };

    this.onIntervals = function() {
        if(! this.running) {
            return;
        }

        this.chooseRandom();
    };

    this.onCounter = function() {
        var counterArea = this.find('.counter');
        if(this.counterValue <= 0) {
            counterArea.text('');
            counterArea.removeClass('counting');
        } else {
            counterArea.text(this.counterValue + '');
            counterArea.addClass('counting');
            this.counterValue--;
        }
    };

    this.chooseRandom = function() {
        var randoms = Math.floor(Math.random() * (this.targets.length + 1));
        if(randoms >= this.targets.length) randoms = this.targets.length - 1;

        for(var idx=0; idx<this.targets.length; idx++) {
            this.targets[idx].choosed = false;
        }
        this.targets[randoms].choosed = true;
        this.renderTargets();
    }

    this.run = function() {
        if(this.targets.length <= 0) {
            this.alert(this.t('There is no item.'));
            return;
        }

        if(this.targets.length <= 1) {
            this.alert(this.t('There is only one item.'));
            return;
        }

        this.running = true;
        this.find('.input-only-idle').each(function() {
            $(this).prop('disable', true);
        });
        var selfObj = this;
        if(this.timers == null) {
            this.timers = setInterval(function() {
                selfObj.onIntervals();
            }, this.timerGap);
        }
        if(this.counters == null) {
            this.counters = setInterval(function() {
                selfObj.onCounter();
            }, 1000);
        }
        this.log(this.t('Random Picker is started.'));
        this.render();
    };

    this.stop = function(immediate) {
        var selfObj = this;
        if(immediate) {
            this.stopAction(immediate);
            return;
        }

        var gaps = Math.floor(selfObj.stopDelay * 1000);
        this.counterValue = Math.floor(gaps / 1000);

        var btnDisabledOnStopDelay = this.find('.button-disabled-on-choosing');
        btnDisabledOnStopDelay.prop('disabled', true);
        btnDisabledOnStopDelay.addClass('disabled');

        setTimeout(function() {
            btnDisabledOnStopDelay.prop('disabled', false);
            btnDisabledOnStopDelay.removeClass('disabled');

            selfObj.stopAction(false);
        }, gaps);
    };

    this.stopAction = function(immediate) {
        this.running = false;
        if(this.timers != null) {
            clearInterval(this.timers);
            this.timers = null;
        }
        if(this.counters != null) {
            clearInterval(this.counters);
            this.counters = null;
        }
        this.find('.input-only-idle').each(function() {
            $(this).prop('disable', false);
        });

        if(immediate) this.log(this.t('Random Picker is stopped.'));
        else          this.log(this.t('Random Picker is finished.'));
        this.render();

        var choosedTarget = null;
        var choosedIndex  = 0;
        var inputRes = this.find('.input.results');
        inputRes.val('');

        for(var idx=0; idx<this.targets.length; idx++) {
            if(this.targets[idx].choosed) {
                choosedTarget = this.targets[idx];
                choosedIndex  = idx;
            }
        }
        if(choosedTarget != null) {
            var contents = choosedTarget.content;
            var realCont = '';

            if(typeof(contents) == 'string') {
                realCont = contents;
            } else {
                for(var cdx=0; cdx<contents.length; cdx++) {
                    if(cdx >= 1) realCont += ' \t';
                    realCont += contents[cdx];
                }
            }

            var msg = this.t('Choosed') + ' : ' + '(No. ' + (choosedIndex + 1) + ') \t' + realCont;
            inputRes.val(msg);
            this.log(msg);
        } else {
            var msg = this.t('There is no item choosed.');
            inputRes.val(msg);
            this.log(msg);
        }
    };

    this.log = function log(contents) {
        try { console.log(contents); } catch(e) {  }
        try {
            var logTf = this.getLogArea().find('.textarea.log');
            logTf.val(logTf.val() + '\n' + String(contents));
            logTf.scrollTop(logTf[0].scrollHeight - logTf.height());
        } catch(e) {

        }
    };

    this.verbose = function verbose(contents) {
        if(this.debugMode && this.verboseMode) this.log(contents);
    }

    this.debug = function debug(contents) {
        if(this.debugMode) this.log(contents);
    }

    this.error = function(contents) {
        this.log(contents);
    };

    this.logFunction = function(funcName) {
        this.verbose('---------- ' + funcName + ' ----------');
    };

    this.logPageMovements = function(pageName) {
        this.verbose('********** ' + pageName + ' **********');
    };

    this.alert = function(msg, callback) {
        alert(msg);
        if(typeof(callback) == 'function') callback();
    };

    this.confirm = function(msg, callback) {
        var yn = confirm(msg);
        if(typeof(callback) == 'function') callback(yn);
    };

    this.prompt = function(msg, callback) {
        var text = prompt(msg);
        if(typeof(callback) == 'function') callback(text);
    };
}