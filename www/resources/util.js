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

function Utilities() {
    if(typeof(jQuery) == 'undefined') throw 'jQuery is not detected.';

    this.isArray = function(obj) {
        if(obj == null) return false;
        if(typeof(obj) != 'object') return false;
        if(typeof(obj.length) == 'number') return true;
        return false;
    };

    this.isValidObject = function(obj) {
        if(obj == null) return false;
        if(typeof(obj) == 'undefined') return false;
        return true;
    };

    this.isEmpty = function(obj) {
        if(! this.isValidObject(obj)) return true;
        if(this.isArray(obj)) return (obj.length <= 0);
        return (String(obj).length <= 0);
    };
    this.isNotEmpty = function(obj) {
        return (! this.isEmpty(obj));
    };

    this.parseBoolean = function(obj) {
        if(! this.isValidObject(obj)) return false;
        if(typeof(obj) == 'boolean') return obj;
        if(typeof(obj) == 'number') {
            if(isNaN(obj)) return false;
            return (! (obj == 0));
        }
        var str = String(obj).trim().toLowerCase();
        if(str == 'y' || str == 'yes' || str == 't' || str == 'true' ) return true;
        if(str == 'n' || str == 'no'  || str == 'f' || str == 'false') return false;

        throw "Cannot convert into boolean " + obj;
    };

    this.parseFloat = function(obj) {
        if(! this.isValidObject(obj)) return 0;
        if(typeof(obj) == 'number') return obj;
        var str = String(obj).trim();
        str = str.replaceAll(',', '').replaceAll(' ', '').trim();
        return parseFloat(str);
    };

    this.parseInt = function(obj) {
        if(! this.isValidObject(obj)) return 0;
        if(typeof(obj) == 'number') return Math.floor(obj);
        return Math.floor(this.parseFloat());
    };

    this.dimension = function() {
        var obj = {};
        
        obj.inner = {};
        obj.outer = {};
        obj.left  = {};

        obj.inner.width  = window.innerWidth;
        obj.inner.height = window.innerHeight;

        obj.outer.width  = window.outerWidth;
        obj.outer.height = window.outerHeight;

        obj.left.width  = obj.outer.width  - obj.inner.width;
        obj.left.height = obj.outer.height - obj.inner.height;

        return obj;
    };

    this.getLanguage = function() {
        if(window.navigator.userLanguage) return window.navigator.userLanguage;
        if(window.navigator.language    ) return window.navigator.language;
        return 'en';
    };
};