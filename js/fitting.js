var SITE_PATH = "http://176.9.30.143"
var ajax_path = 'http://176.9.30.143/fitting_room/looks/imposition',

dataSender = function(json){
    //$('#preloader').show();
    $.ajax({
        url: ajax_path + '?jsoncallback=?',
        dataType: 'json',
        data: {
            method: 'get_data',
            format: 'json',
            v : '2',
            json: ko.toJSON(json) ,
        },
        success: function(data){
            $(window).trigger('newDataAdded', data);
        },
        error: function(xhr, ajaxOptions, throwStatus){
            alert('произошла неизвестная ошибка');
        }, 
    });    
}

//Добавляет функциональность отправки данных на сервер
//перед использование должны быть объявлены переменные ajax_path, preloader_selector
var DataSenderMixin = function(){
    this.dataSender = function(json){
        $(this.preloader_selector).show();
        $.ajax({
            url: this.ajax_path + '?jsoncallback=?',
            dataType: 'json',
            data: {
                method: 'get_data',
                format: 'json',
                v : '2',
                json: ko.toJSON(json) ,
            },
            success: function(data){
                $(window).trigger('newDataAdded', data);
            },
            error: function(xhr, ajaxOptions, throwStatus){
                alert('произошла неизвестная ошибка');
            }, 
        });    
    }
}

// урпавляет состоянием хэша
var HashManager = function(data){
    var it = this;

    this.ajax_path = data.ajax_path;
    this.preloader_selector = data.preloader_selector;

    DataSenderMixin.call(this);

    $(window).bind('newDataAdded', function(e, data){
        console.log('newDataAdd in hash');
        it.jsonToHash(data);
    });

    // когда мы получаем json, мы кодируем его в hash
    this.jsonToHash = function(data) {
        var getObjectHash = function(object) {
            if (object) {
                if (typeof object.photo_id != 'undefined') { 
                    return object.id + "," + object.photo_id;
                } else {
                    return object.id;
                };
            } else {
                return 0; 
            }
        }

        var getArrayHash = function(array) {
            if (!array.length) {
                return 0;
            }
            var result = Array();
            $.each(array, function(i, object){
                result.push(getObjectHash(object));
            })
            return result.join('&');
        }

        var viewhash    = data.view || 'front';
        var face        = false;
        var body        = false;
        var items       = Array();
        var background  = false;
        var effect      = false;
        var zoomhash    = data.zoom || '';

        $.each(data.objects, function(i, object){
            switch(object.type) {
                case 'Face':
                    face = object;
                    break;
                case 'Body':
                    body = object;
                    break;
                case 'Item':
                    items.push(object);
                    break;
                case 'Background':
                    background = object;
                    break;
                case 'Effect':
                    effect = object;
                    break;
            }
        })
        var facehash    = getObjectHash(face);
        var bodyhash    = getObjectHash(body);
        var itemshash   = getArrayHash(items);
        var backhash    = getObjectHash(background);
        var effecthash  = getObjectHash(effect);

        this.hashChangeIam = true;
        window.location.hash = viewhash + '-' + facehash + '-' + itemshash + '-' + bodyhash + '-' + backhash + '-' + effecthash + '-' + zoomhash;

    }

    $(window).bind('hashchange', function(e, data){
        it.onHashChange();
    });

    this.hashChangeIam = false;

    this.onHashChange = function() {
        if(this.hashChangeIam) {
            this.hashChangeIam = false;
        } else {
            if (!window.location.hash){
                dataSender(data.default_json);
            } else {
                dataSender(it.hashToJson());
            }
        }
    }


    this.hashToJson = function(){
        var getObjectFromHash = function(hash, type) {
            var result      = {}
            var splitted    = hash.split(',')
            result['id']    = splitted[0];
            result['type']  = type; 
            if (1 < splitted.length) {
                result['photo_id'] = splitted[1];
            }
            return result;
        }

        var TYPES = [];
        TYPES[0] = "view";
        TYPES[1] = "Face";
        TYPES[2] = "Item";
        TYPES[3] = "Body";
        TYPES[4] = "Background";
        TYPES[5] = "Effect";
        TYPES[6] = "zoom";

        // 0 - view, 1 - face, 2 - body, 3 - items, 4 - background, 5 - effect
        var hash = window.location.hash.split('-');
        json = {};
        json['objects'] = Array();

        $.each(hash, function(i, _hash){
            switch(i) {
                case 0:
                    json['view'] = _hash.split('#')[1];
                    break;
                case 6:
                    if (_hash) {
                        json['zoom'] = _hash; 
                    }
                    break;
                case 1:
                case 3:
                case 4:
                case 5:
                    if(_hash!='0'){
                        json['objects'].push(getObjectFromHash(_hash, TYPES[i]));
                    }
                    break;
                case 2:
                    if(_hash!='0'){
                        $.each(_hash.split('&'), function(j, item){
                            json['objects'].push(getObjectFromHash(item, TYPES[i]));
                        })
                    }
                    break;
            }
        });
        return json;
    };

    // если хэш есть, то парсим его и отсылваем данные на сервер
    if (window.location.hash != '') {
        dataSender(this.hashToJson());
    }
}

//вариант избражения для объекта
var Variant = function(data){
    this.id          = data.id;
    this.type        = data.type;
    this.parent_id   = data.parent_id;
    this.current_photo_id = data.photo_id;
    
    this.mini_thumb  = SITE_PATH +  data.mini_thumb;

    this.active = ko.observable(this.id == this.current_photo_id);

    this.sendInfo = function(){
        //if (this.current_photo_id == this.id) { return false }
        $(window).trigger('closeInfo');
        $(window).trigger('sendToServer', {action: 'new_photo', object: this});
    };
}

//собственно сам объект, назван так потому что в том числе строит из себя image map (но не всегда)
var Map = function(data) {
    var it                  = this;
    this.id                 = data.id;
    this.type               = data.type;
    this.title              = data.title;
    this.description        = data.description;
    this.price              = data.price;
    this.coef               = data.coef || 1;

    this.image_maps         = ko.observable(data.image_map || []);

    var temp = $.map(this.image_maps(), function(map, i) {
        map = $.map(map.split(','), function(coord, i){
            return Math.round(coord * it.coef);
        })
        return map.join(',');
    });
    this.image_maps(temp);

    this.can_display = false;
    if (data.type == 'Item') {
        this.can_display = true;
    }

    this.can_remove = true;
    if (data.type == 'Face' || data.type == 'Body' ) {
        this.can_remove = false;
    }

    if (data.type == 'Face') { this.title = 'Лицо' }; 
    if (data.type == 'Body') { this.title = 'Тело' }; 
        
    // основное фото объекта (если есть)
    if (typeof data.photo != 'undefined') {
        this.photo = SITE_PATH  + data.photo; // основная картинка
    } else {
        this.photo = '';
    }
    this.photo_id = data.photo_id;

    // координаты фото
    this.photo_left = false;
    this.photo_top = false;
    if (typeof data.top_left != 'undefined'){
        this.photo_left = data.top_left[0] * this.coef + 'px';
        this.photo_tp  = data.top_left[1] * this.coef + 'px';
    }

    // ширина высота основной фотографии
    this.photo_width = '';
    this.photo_height = '';
    if (typeof data.dimensions != 'undefined') {
        this.photo_width = data.dimensions[0] * this.coef;
        this.photo_height = data.dimensions[1] * this.coef;
    }

    this.index_under = false;
    this.index_below = false;
    if (typeof data.index_under != 'undefined') {
        this.index_under = data.index_under[0];
    }
    if (typeof data.index_below!= 'undefined') {
        this.index_below = data.index_below[0];
    }


    this.variants = ko.observableArray();

    //показать картинку (при наведении)
    this.show_photo = ko.observable(false); 

    //показать информацию о данном объекте
    this.show_info = ko.observable(false);
    this.info_left = ko.observable(0); 
    this.info_top  = ko.observable(0);
    
    // показать заголовок (при наведении)
    this.show_title = ko.observable(false);
    this.titleX = ko.observable();
    this.titleY = ko.observable();

    // показываем заголовок
    this.showTitle = function(e){
        if(!this.show_title()){ return false };
        var x = e.layerX || e.offsetX;
        var y = e.layerY || e.offsetY;
        this.titleX(x + 5 + 'px');
        this.titleY(y + 5 + 'px');
    }

    // добавляем варианты изображений для данного объекта
    this.addVariants = function(variants){
        if (typeof variants == "undefined") {return false };
        $.each(variants, function(i, variant){
            variant['parent_id'] = it.id;
            variant['photo_id'] = it.photo_id;
            variant['type'] = it.type;
            it.variants.push(new Variant(variant));
        })
    }(data.thumb_photos);


    this.freeze_info = ko.observable(false);


    // показать контур, убрать контур
    this.togglePhoto = function(e){
        this.show_title(!this.show_title());
        if(!this.photo){return false}
        if (this.freeze_info()) { return false };
        this.show_photo(!this.show_photo());
        $(window).trigger('blackout', this.show_photo());
    }

    // показавает всплывающее информационное окно под курсором
    this.itemInfo = function(e) {
        this.freeze_info(true);
        ko.cleanNode($('#item_info').get(0));
        $('#item_info').find('.variants img').remove();
        ko.applyBindings(this, $('#item_info').get(0));

        this.info_left(e.pageX - 5 + 'px');
        this.info_top(e.pageY - 5 + 'px');
        this.show_info(!this.show_info());
        $(window).trigger('blackout', {state: this.show_info(), hold: this.show_info()});
        $(window).trigger('displayItemInfo', true);
    }

    this.mouseLeave = function(e){
        it.closeInfo();
    }

    // закрывает выплывающее информационно окно
    $(window).bind('closeInfo', function(e, data) {
        it.closeInfo();
    });
    
    //обрабатываем esc
    $(window).keydown(function(e){
        if (e.keyCode == 27) {
            it.closeInfo();
        }
    })

    this.closeInfo = function() {
        this.freeze_info(false);
        this.show_photo(false);
        this.show_info(false);
        $(window).trigger('blackout', {state: !this.show_info(), hold: this.show_info()});
        $(window).trigger('displayItemInfo', false);
    }

    this.removeMap= function(){
        this.closeInfo();
        $(window).trigger('removeMap', this)
    }

    this.itemUp = function(){
        $(window).trigger('closeInfo');
        $(window).trigger('sendToServer', {action: 'item_up', object: this})
    }
    this.itemDown = function(){
        $(window).trigger('closeInfo');
        $(window).trigger('sendToServer', {action: 'item_down', object: this})
    }
}

// главный объект. отвечает за общение с сервером и отрисовку себя и своих дочерних элементов
var FittingRoom = function(data){
    new HashManager(data);
    var it = this;

    //this.ajax_path = data.ajax_path;
    this.preloader_selector = data.preloader_selector;
    //DataSenderMixin.call(this);

    // путь до главной картинки
    this.main_image    = ko.observable();


    this.coef = data.image_height/data.imposition_height; 

    //this.main_image_width = ko.observable(data.image_width);
    this.main_image_height= ko.observable(data.image_height);

    this.view = ko.observable();// front, back or other

    // затемнить фон
    this.blackout = ko.observable(false);
    // удерживать фон затемненным
    this.hold_blackout = false;

    this.maps = ko.observableArray();

    this.item_list_selector = data.item_list_selector;

    this.main_image_selector = data.main_image_selector;

    this.content_blocker = ko.observable(false);

    $(window).bind('displayItemInfo', function(e, state){
        it.content_blocker(state);
    });

    this.item_selector = data.item_selector;
    this.face_selector = data.face_selector;
    this.background_selector = data.background_selector;
    this.effects_selector = data.effects_selector;

    this.newObjectHandler = function (object, action) {
        var type = $(object).attr('id').split('_')[0];
        $(window).trigger('sendToServer', {
            action: action,
            object: {
                type: type[0].toUpperCase() + type.substring(1),
                id:   $(object).attr('id').split('_')[1],
            }
        })
    }

    $(this.item_selector).live('click', function(){
        it.newObjectHandler(this, 'new_item');
        return false;
    });
    $(this.face_selector).live('click', function(){
        it.newObjectHandler(this, 'replace_object');
        return false;
    });
    $(this.background_selector).live('click', function(){
        it.newObjectHandler(this, 'replace_object');
        return false;
    });
    $(this.effects_selector).live('click', function(){
        it.newObjectHandler(this, 'replace_object');
        return false;
    });

    this.blackout_color = data.blackout_color || gray;

    this.blackOut = function(){
        if(!data.use_blackout) {return false ;}
        return this.blackout();
    }

    // затемняет фон. Если передано свойство hold = true, то держит фон,
    // пока не придет hold = false
    $(window).bind('blackout', function(e, state){
        if (typeof(state.hold) != 'undefined') {
            it.hold_blackout = state.hold;
            it.blackout(state.state);
        } else if (!it.hold_blackout) {
            it.blackout(state);
        };

        if(data.use_blur){
            if(it.blackout()){
                Pixastic.revert($(it.main_image_selector).get(0));
                Pixastic.process($(it.main_image_selector).get(0), "blurfast", {amount: data.blur_amount});
            } else {
                Pixastic.revert($(it.main_image_selector).get(0));
            }
        }
    });

    $(window).bind('removeMap', function(e, map){
        var map = sm.detect(it.maps(), function(_map){
            return map == _map;
        })
        it.maps.remove(map);
        $(window).trigger('sendToServer', {action: "removeItem"})
    });

    this.getMap = function(id, type){
        return sm.detect(this.maps(),function(map){
            return map.id == id && map.type == type;
        });
    }
    
    this.addMap = function(map){
        map['coef'] = this.coef;
        this.maps.push(new Map(map));
    }

    this.addMaps = function(maps){
        $.each(maps.reverse(), function(i, map) {
            it.addMap(map);
        })
        this.setActiveClasses();
    }

    $(window).bind('itemsUpdate', function(){
        it.setActiveClasses();
    })

    // устанавливает класс active, для всех текущих вещей
    this.setActiveClasses = function() {
        var setActive = function(selector, map, type){
            if (map.type != type){ return false };
            $(selector).each(function(i, value){
                if(typeof $(value).attr('id') != 'undefined') {
                    if($(value).attr('id').split('_')[1] == map.id) {
                        $(value).addClass('active');
                    }
                }
            });
        }
        $(this.item_selector).removeClass('active');
        $(this.face_selector).removeClass('active');
        $(this.background_selector).removeClass('active');
        $(this.effects_selector).removeClass('active');
        $.each(this.maps(), function(i, map) {
            setActive(it.item_selector, map, 'Item');
            setActive(it.face_selector, map, 'Face');
            setActive(it.background_selector, map, 'Background');
            setActive(it.effects_selector, map, 'Effect');
        });
    }

    // отрисовываем полученные данные
    $(window).bind('newDataAdded', function(e, data){
        console.log('newDataAdded');
        if (typeof data.error != 'undefined') { 
            alert(data.error);
            return false;
        }
        it.maps([]);
        it.setData(data);
    });

    // посылаем данные на сервер
    $(window).bind('sendToServer', function(e, data){

        if (data.action == 'item_up') {
            var prev_index = 0;
            $.each(it.maps(), function(i, map) {
                if (map == data.object) {
                    it.maps()[i] = it.maps()[prev_index];
                    it.maps()[prev_index] = data.object;
                    return false;
                }
                prev_index = i;
            })
        }

        if (data.action == 'item_down') {
            var next_index = 0;
            $.each(it.maps(), function(i, map) {
                next_index = i + 1;
                if (map == data.object) {
                    it.maps()[i] = it.maps()[next_index];
                    it.maps()[next_index] = data.object;
                    return false;
                }
            })
        }

        // если выбрали новый рисунок у вещи
        if (data.action == 'new_photo'){
            if (data.object.id == data.object.current_photo_id) { return false };
            var map = it.getMap(data.object.parent_id, data.object.type);
            map['photo_id'] = data.object.id;
        }


        // здесь будет храниться весь json
        var json = {}
        json['objects'] = Array();

        // пришел новый объект
        if (data.action == "new_item") {
            var isset_object = sm.detect(it.maps(), function(map){
                return Boolean(map.type == data.object.type && map.id == data.object.id)
            });
            $(window).trigger('closeInfo'); 
            if (isset_object){
                it.maps.remove(isset_object);
            } else {
                json['new_object'] = {
                    id: data.object.id,
                    type: data.object.type,
                }
            }
        }

        if (data.action == 'replace_object') {
            it.maps.remove(function(map){
                return data.object.type == map.type;
            });
            json['objects'].push({
                id: data.object.id,
                type: data.object.type,
            })
        };

        if (it.zoom) {
            json['zoom'] = true;
        }

        if (data.action == 'remove_all_items') {
            it.maps.remove(function(map) {
                return map.type == "Item";
            });
        }

        // список объектов который мы будем отдавать серверу
        $.each(it.maps.reverse(), function(i, map) {
            json['objects'].push({
                id: map.id,
                type: map.type,
                photo_id: map.photo_id,
            })
        })

        json['view'] = it.view();


        dataSender(json);
    });

    if (!window.location.hash) {
        dataSender(data.default_json);
    }

    this.setData = function(data){
        //console.log(data.imposition_url);
        //this.main_image('');
        this.main_image(data.imposition_url);
        this.view(data.view || "front");
        this.addMaps(data.objects);
        //this.main_image('');
    }

    this.freezeBlackout = function(){
        $(window).trigger('blackout', {state: true, hold: true});
    }

    this.unfreezeBlackout= function(){
        $(window).trigger('blackout', {state: false, hold: false});
    }

    this.getFullPrice = function(){
        var price = 0;
        $.each(this.maps(), function(i, map){
            if (typeof(map.price) != 'undefined') {
                price = price + map.price;
            }
        })
        return price
    }
     
    this.zoom = data.zoom || false;

    this.zoomToggle = function(){
        this.zoom = !this.zoom;
        $(window).trigger('sendToServer', {action: 'zoom_toggle'});
    }

    this.toggleView = function() {
        if (this.view() == 'front') {
            this.view('back');
        } else {
            this.view('front');
        }
        $(window).trigger('sendToServer', {action: 'toggle_view'});
    }

    this.removeAllItems = function() {
        $(window).trigger('sendToServer', {action: 'remove_all_items'})
    }

    // закрываем прелоадер, когда загрузилась главная картинка
    //$('img' + it.main_image_selector).load(function(){
        //console.log('loaded');
        //$(it.preloader_selector).hide();
    //});

    $('img').load(function(){
        console.log('loaded');
        $(it.preloader_selector).hide();
    });
     
    ko.applyBindings(this, $('#result_image').get(0))
}
