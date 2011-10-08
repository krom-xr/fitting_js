var BASE_PATH = "http://176.9.30.143/"

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
                return "00"
            }
        }

        var getArrayHash = function(array) {
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

        window.location.hash = viewhash + '|' + facehash + '|' + bodyhash + '|' + itemshash + '|' + backhash + '|' + effecthash;
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
        TYPES[1] = "Face";
        TYPES[2] = "Body";
        TYPES[3] = "Item";
        TYPES[4] = "Background";
        TYPES[5] = "Effect";

        // 0 - view, 1 - face, 2 - body, 3 - items, 4 - background, 5 - effect
        var hash = window.location.hash.split('|');
        json = {};
        json['objects'] = Array();

        $.each(hash, function(i, _hash){
            switch(i) {
                case 0:
                    json['view'] = _hash.split('#')[1];
                    break;
                case 1:
                case 2:
                case 4:
                case 5:
                    json['objects'].push(getObjectFromHash(_hash, TYPES[i]));
                    break;
                case 3:
                    $.each(_hash.split('&'), function(j, item){
                        console.log('werwer');
                        json['objects'].push(getObjectFromHash(item, TYPES[i]));
                    })
                    break;
            }
        });
        return json;
    };


}

//вариант избражения для объекта
var Variant = function(data){
    this.id          = data.id;
    this.type        = data.type;
    this.parent_id   = data.parent_id;
    this.current_photo_id = data.photo_id;
    
    this.mini_thumb  = BASE_PATH +  data.mini_thumb;

    this.sendInfo = function(){
        if (this.current_photo_id == this.id) { return false }
        $(window).trigger('closeInfo');
        $(window).trigger('sendToServer', {action: 'new_photo', object: this});
    };
}

//собственно сам объект, назват так потому что в том числе строит из себя image map (но не всегда)
var Map = function(data){
    var it                  = this;
    this.id                 = data.id;
    this.type               = data.type;
    this.title              = data.title || data.type;
    this.description        = data.description;
    this.price              = data.price;

    this.image_maps         = data.image_map;

    if (typeof data.photo != 'undefined') {
        this.photo = BASE_PATH  + data.photo; // основная картинка
    } else {
        this.photo = '';
    }

    this.photo_id = data.photo_id;
    this.variants           = ko.observableArray();

    //показать картинку (при наведении)
    this.show_photo = ko.observable(false); 
    this.photo_left = '0px';//data.top_left[0] + 'px';
    this.photo_top  = '0px';// data.top_left[1] + 'px';

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

    // показать контур, убрать контур
    this.togglePhoto = function(){
        this.show_photo(!this.show_photo());
        $(window).trigger('darkey', this.show_photo());
    }

    // показавает всплывающее информационное окно под курсором
    this.itemInfo = function(e) {
        ko.cleanNode($('#item_info').get(0));
        $('#item_info').find('.variants img').remove();
        ko.applyBindings(this, $('#item_info').get(0));

        this.info_left(e.pageX + 1 + "px");
        this.info_top(e.pageY + 1 + "px");
        this.show_info(!this.show_info());
        $(window).trigger('darkey', {state: this.show_info(), hold: this.show_info()});
    }

    // закрывает высплываютщее информационно окно
    $(window).bind('closeInfo', function(e, data) {
        it.closeInfo();
    });
    this.closeInfo = function() {
        this.show_info(false);
        $(window).trigger('darkey', {state: this.show_info(), hold: this.show_info()});
    }

    this.removeMap= function(){
        this.closeInfo();
        $(window).trigger('removeMap', this)
    }
}

// главный объект. отвечает за общение с сервером и отрисовку себя и своих дочерних элементов
var ResultImage = function(){
    var it              = this;

    //TODO возможно стоит переделать на main-image, или imposition_url,
    //back_image - возможно выпилить
    this.front_image    = ko.observable();
    this.back_image     = ko.observable();

    this.view = ko.observable();// front, back or other

    // затемнить фон
    this.darkey = ko.observable(false);
    // удерживать фон затемненным
    this.hold_darkey = false;

    this.maps = ko.observableArray();

    // затемняет фон. Если передано свойство hold = true, то держит фон,
    // пока не придет hold = false
    $(window).bind('darkey', function(e, state){
        if (typeof(state.hold) != 'undefined') {
            it.hold_darkey = state.hold;
            it.darkey(state.state);
        } else if (!it.hold_darkey) {
            it.darkey(state);
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
        this.maps.push(new Map(map));
    }

    this.addMaps = function(maps){
        $.each(maps.reverse(), function(i, map) {
            it.addMap(map);
        })
    }

    // отрисовываем полученные данные
    $(window).bind('newDataAdded', function(e, data){
        //TODO здесь будет еще обнуление всего массива maps
        it.maps([]);
        it.setData(data);
    });


    // посылаем данные на сервер
    $(window).bind('sendToServer', function(e, data){

        // если выбрали новый рисунок у вещи
        if (data.action == 'new_photo'){
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

        // список объектов который мы будем отдавать серверу
        json['objects'] = Array();
        $.each(it.maps(), function(i, map) {
            json['objects'].push({
                id: map.id,
                type: map.type,
                photo_id: map.photo_id,
            })
        })

        console.log(ko.toJSON(json));

        $.get(
            '/proxy/fitting_room/looks/imposition',
            {
                method: 'get_data',
                format: 'json',
                v : '2',
                json: ko.toJSON(json) ,
                
            },
            function(data){
                $(window).trigger('newDataAdded', data);
            }, 'json'
        );
    });

    this.setData = function(data){
        this.front_image(data.imposition_url);
        this.addMaps(data.objects);
    }

    //TODO это возможно выпилить
    this.show_item_list = ko.observable(true);

    //TODO возможно это надо выпилить будет
    this.toggleItemList = function(){
        return false;
        this.show_item_list(!this.show_item_list());
    }

    this.freezeDarkey = function(){
        $(window).trigger('darkey', {state: true, hold: true});
    }

    this.unfreezeDarkey = function(){
        $(window).trigger('darkey', {state: false, hold: false});
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
     
    ko.applyBindings(this, $('#result_image').get(0))
}


$(window).ready(function(){

    new ResultImage();
    hash_manager = new HashManager();


    var json = {
            objects:[
                {
                    id: 2,
                    type: "Face",
                    photo_id: 2,
                },
                {
                    id: 60271,
                    type: "Item",
                    photo_id: 157
                    
                },
                {
                    id: 60302,
                    type: "Item",
                    photo_id: 92,
                },
                {
                  id: 60563,
                  type:"Item",
                  photo_id : 207
                },
                {
                  id:2,
                  type:"Background",
                  photo_id:2
                },
                {
                    id:6,
                    type: "Body"
                },
                
            ],
            new_object:{
                id: 60271,
                type: "Item",
                photo_id: 157
            },
            view: "front", //или back,
    };
    if (typeof window.location.hash != 'undefined') {
        json = hash_manager.hashToJson();
    }
    $.get(
        '/proxy/fitting_room/looks/imposition',
        {
            method: 'get_data',
            format: 'json',
            v : '2',
            json: ko.toJSON(json) ,
            
        },
        function(data){
            $(window).trigger('newDataAdded', data);
        }, 'json'
    );
    

    $('.product').click(function(){
        var id = $(this).attr('id').split('_')[0];
        //Upper = id[0].toUpperCase();
        //rest = id.substring(1);

        //console.log(test.substring(1));

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
