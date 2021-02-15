function StringTable(dataset) {
    this.data = [];
    if(typeof(dataset) != 'undefined' && dataset != null) this.data = dataset;

    this.getLanguage = function() {
        if(window.navigator.userLanguage) return String(window.navigator.userLanguage).length >= 2 ? String(window.navigator.userLanguage).substring(0, 2) : 'en';
        if(window.navigator.language    ) return String(window.navigator.language    ).length >= 2 ? String(window.navigator.language    ).substring(0, 2) : 'en';
        return 'en';
    };
    this.language = this.getLanguage();
    this.append = function(english, dataset) {
        var stringOne = null;
        if(typeof(english) == 'object') {
            stringOne = {};
            for(var k in english) {
                if(k == 'en') continue;
                stringOne[k] = english[k];
            }
        } else {
            stringOne = {
                en : String(english)
            };
            for(var k in dataset) {
                if(k == 'en') continue;
                stringOne[k] = dataset[k];
            }
        }
        this.data.push(stringOne)
    };
    this.translate = function(english) {
        var str = String(english);
        
        for(var idx=0; idx<this.data.length; idx++) {
            var stringOne = this.data[idx];
            if(stringOne.en == str) {
                var res = stringOne[this.language];
                if(typeof(res) == 'undefined' || res == null) res = str; 
                return res;
            }
        }
        return str;
    };
    this.t = function(english) {
        return this.translate(english);
    };
};