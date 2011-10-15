var SITE_PATH = "http://176.9.30.143/"
var AJAX_PATH = 'http://thestore.ru/fitting_room/looks/imposition/'

//Дефолтные данные которые загружаются при первой загрузке страницы
var default_json = {
    objects:[
        {
            id:2,
            type:"Face",
            photo_id:2
        },{
            id:60302,
            type:"Item",
            photo_id:92
        },{
            id:60563,
            type:"Item",
            photo_id:207
        },{
            id:2,
            type:"Background",
            photo_id:2
        },{
            id:6,
            type:"Body"
        }
    ],
    new_object:{
        id:60271,
        type:"Item",
        photo_id:157
    },
    view:"front",
};

//посылвает данные к серверу
var DataSender = function(json){
    $.getJSON(
        AJAX_PATH + '?jsoncallback=?', 
        {
            method: 'get_data',
            format: 'json',
            v : '2',
            json: ko.toJSON(json) ,
            
        },
        function(data){
            $(window).trigger('newDataAdded', data);
        });
}

// урпавляет состоянием хэша
var HashManager = function(){
    var it = this;

    $(window).bind('newDataAdded', function(e, data){
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
        window.location.hash = viewhash + '|' + facehash + '|' + itemshash + '|' + bodyhash + '|' + backhash + '|' + effecthash + '|' + zoomhash;

    }

    $(window).bind('hashchange', function(e, data){
        it.onHashChange();
    });

    this.hashChangeIam = false;

    this.onHashChange = function() {
        if(this.hashChangeIam) {
            this.hashChangeIam = false;
        } else {
            DataSender(it.hashToJson());
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
        var hash = window.location.hash.split('|');
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
        DataSender(this.hashToJson());
    }
}

//вариант избражения для объекта
var Variant = function(data){
    this.id          = data.id;
    this.type        = data.type;
    this.parent_id   = data.parent_id;
    this.current_photo_id = data.photo_id;
    
    this.mini_thumb  = SITE_PATH +  data.mini_thumb;

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
        this.photo_left = data.top_left[0] + 'px';
        this.photo_top  = data.top_left[1] + 'px';
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
    this.togglePhoto = function(){
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

        this.info_left(e.pageX + "px");
        this.info_top(e.pageY + "px");
        this.show_info(!this.show_info());
        $(window).trigger('blackout', {state: this.show_info(), hold: this.show_info()});
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
        $(window).trigger('blackout', {state: this.show_info(), hold: this.show_info()});
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
var ResultImage = function(data){
    var it = this;

    //TODO это потом вынести в конфиг
    this.main_image    = ko.observable();
    //data.image_width = 413;
    data.image_height = 538;
    this.coef = data.image_height/1000; 

    //this.main_image_width = ko.observable(data.image_width);
    this.main_image_height= ko.observable(data.image_height);

    this.view = ko.observable();// front, back or other

    // затемнить фон
    this.blackout = ko.observable(false);
    // удерживать фон затемненным
    this.hold_blackout = false;

    this.maps = ko.observableArray();

    // затемняет фон. Если передано свойство hold = true, то держит фон,
    // пока не придет hold = false
    $(window).bind('blackout', function(e, state){
        if (typeof(state.hold) != 'undefined') {
            it.hold_blackout = state.hold;
            it.blackout(state.state);
        } else if (!it.hold_blackout) {
            it.blackout(state);
        };
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
    }

    // отрисовываем полученные данные
    $(window).bind('newDataAdded', function(e, data){
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

        if (data.action == "new_item") {
            json['new_object'] = {
                id: data.object.id,
                type: data.object.type,
            };
        }

        if (it.zoom) {
            json['zoom'] = true;
        }

        if (data.action == 'remove_all_items') {
            it.maps.remove(function(map){
                return map.type == "Item";
            });
        }

        // список объектов который мы будем отдавать серверу
        json['objects'] = Array();
        $.each(it.maps(), function(i, map) {
            json['objects'].push({
                id: map.id,
                type: map.type,
                photo_id: map.photo_id,
            })
        })

        json['view'] = it.view();

        DataSender(json);
    });

    if (!window.location.hash) {
        DataSender(default_json);
    }

    this.setData = function(data){
        this.main_image(data.imposition_url);
        this.view(data.view || "front");
        this.addMaps(data.objects);

        //this.main_image_width($("#main_image").width());
        //this.main_image_height($("#main_image").height());
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
     
    ko.applyBindings(this, $('#result_image').get(0))
}


$(window).ready(function(){
    function sendToServer (object) {
        var type = $(object).attr('id').split('_')[0];
        $(window).trigger('sendToServer', {
            action: 'new_item',
            object: {
                type: type[0].toUpperCase() + type.substring(1),
                id:   $(object).attr('id').split('_')[1],
            }
        })
    }

    new ResultImage({});
    new HashManager();

    $('#preloader').ajaxStart(function(){
        $(this).show();
    })
    $('#preloader').ajaxStop(function(){
        $(this).hide();
    })

    $('ul li.model ul li div').live('click', function(){
        sendToServer(this);
        return false;
    });
    $('ul li.background ul li div').live('click', function(){
        sendToServer(this);
        return false;
    });
    $('ul li.effects ul li div').live('click', function(){
        sendToServer(this);
        return false;
    });


    $('ul.product-list li').live('click', function(){
        sendToServer(this);
        //var type = $(this).attr('id').split('_')[0];
        //$(window).trigger('sendToServer', {
            //action: 'new_item',
            //object: {
                //type: type[0].toUpperCase() + type.substring(1),
                //id:   $(this).attr('id').split('_')[1],
            //}
        //})
        return false;
    })

    $('.product').click(function(){
        var id = $(this).attr('id').split('_')[0];

        $(window).trigger('sendToServer', {
            action: 'new_item',
            object: {
                type: id[0].toUpperCase() + id.substring(1),
                id:   $(this).attr('id').split('_')[1],
            }
        })
        return false;
    });
});
