var BASE_PATH = "http://176.9.30.143/"
var HashManager = function(hash) {
    var it = this;
    this.hash = hash;

    this.nav_hash = new NavHash(hash.split('?')[0]);
    this.data_hash = new DataHash(hash.split('?')[1]);
    this.view_hash = new ViewHash(hash.split('?')[2]);

    var t = new Transmitter();
    t.loadData([
        {type:'face'},
            
    ]);


    this.setHash = function(hash, type, params){
        switch(type) {
            case 'navigation':
                this.nav_hash.setHash(hash, params);
                break;
            default:
                // code
        }

        window.location.hash = '#' + this.nav_hash + '?' + this.data_hash + "?" + this.view_hash;
    }

    this.getHash = function(hash){
        return window.location.hash;
    }


    this.setNavigationHash = function(hash, params){
        if(params['section'] == '1'){
            nav_hash = hash;
        };

    };
}
 
var BaseHash = function(hash){
    this.hash = hash;

    this.setHash = function(hash, params){
        this.hash = hash;
        $(window).trigger('hashchange', this);
    }

    this.toString = function(){
        return this.hash;
    }
}

var NavHash = function(hash){
    NavHash.superClass.apply(this, arguments); 
}
NavHash.inheritsFrom(BaseHash);

var DataHash = function(hash){
    DataHash.superClass.apply(this, arguments); 
}
DataHash.inheritsFrom(BaseHash);

var ViewHash = function(hash){
    ViewHash.superClass.apply(this, arguments); 
}
ViewHash.inheritsFrom(BaseHash);

var Transmitter = function(){
    var it = this;
    this.items = ko.observableArray();

    $(window).bind('hashchange', function(e, hash){
        if ( hash instanceof NavHash ) {
            it.sendData(hash, 'navigation');
        };
    });

    this.sendData = function(hash, action){
        console.log('action');
    }
    
    this.loadData = function(data){
        $.each(data, function(i, item){
            it.items.push(new Item(item));
        })
    }
}

var Item = function(data){
    var it = this;

    this.id      = data.id;
    this.type    = data.type;
    this.title   = data.title;
    this.preview = data.preview;
    this.image   = data.image;

    this.clickHandler = function(){
        console.log('clickHandler ');
    }
}

var ItemsCollection = function(){
    var it = this;
    this.items = ko.observableArray();

    this.addItem = function(item){
        this.items.push(new Item(item));
    }

    this.addItems = function(items){
        $.each(items, function(i, item){
            it.addItem(item);
        })
    }

    ko.applyBindings(this, $('#items').get(0));
}




var Variant = function(data){
    this.id          = data.id;
    this.type        = data.type;
    this.parent_id   = data.parent_id;
    this.current_transparent_id = data.transparent_id;
    
    this.mini_thumb  = BASE_PATH +  data.mini_thumb;

    this.sendInfo = function(){
        if (this.current_transparent_id == this.id) { return false }
        $(document).trigger('sendToServer', {action: 'new_transparent', object: this});
    };
}

var Map = function(data){
    var it                  = this;
    this.id                 = data.id;
    this.type               = data.type;
    this.title              = data.title || 'одеждочка';
    this.description        = data.description;
    this.price              = data.price;

    this.image_maps         = data.image_map;
    this.transparent_url    = BASE_PATH  + data.transparent_url; // основная картинка
    this.transparent_id     = data.transparent_id;
    this.variants           = ko.observableArray();

    this.denied             = data.denied;
    this.position           = data.position;
    this.href               = data.href;

    //показать контур (при наведении)
    this.show_circuit = ko.observable(false); 
    this.transparent_url_left = '0px';//data.top_left[0] + 'px';
    this.transparent_url_top  = '0px';// data.top_left[1] + 'px';

    //показать информацию о данном объекте
    this.show_info = ko.observable(false);
    this.info_left = ko.observable(0); 
    this.info_top  = ko.observable(0);
    
    this.addVariants = function(variants){
        $.each(variants, function(i, variant){
            variant['parent_id'] = it.id;
            variant['transparent_id'] = it.transparent_id;
            variant['type'] = it.type;
            it.variants.push(new Variant(variant));
        })
    }(data.front.thumb_photos);


    this.toggleCircuit = function(){
        this.show_circuit(!this.show_circuit());
        $(window).trigger('darkey', this.show_circuit());
    }

    this.itemInfo= function(e) {
        ko.cleanNode($('#item_info').get(0));
        $('#item_info').find('.variants img').remove();
        ko.applyBindings(this, $('#item_info').get(0));

        this.info_left(e.pageX + 1 + "px");
        this.info_top(e.pageY + 1 + "px");
        this.show_info(!this.show_info());
        $(window).trigger('darkey', {state:this.show_info(), hold:this.show_info()});
    }

    this.testing = function() {
        console.log('test');
    }

    this.sendInfo = function(){
        console.log('there we are send info');
    
    }



}

var ResultImage = function(){
    var it              = this;
    this.front_image    = ko.observable();
    this.back_image     = ko.observable();

    this.state          = ko.observable();// front, back or other

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

    this.getMap = function(id, type){
        return sm.detect(this.maps(),function(map){
            return map.id == id && map.type == type;
        });
    }
    
    this.addMap = function(map){
        this.maps.push(new Map(map));
    }

    this.addMaps = function(maps){
        $.each(maps.reverse(), function(i, map){
            it.addMap(map);
        })
    }

    // отрисовываем полученные данные
    $(document).bind('newDataAdded', function(e, data){
        it.setData(data);
    });

    // посылаем данные на сервер
    $(document).bind('sendToServer', function(e, data){
        if (data.action == 'new_transparent'){
            var map = it.getMap(data.object.parent_id, data.object.type);
            map['transparent_id'] = data.object.id;
        }

        if (data.action == "new_item") {
            var new_object = {
                id: data.object.id,
                type: data.object.type,
            };
        }


        var objects = Array();
        $.each(it.maps(), function(i, map) {
            objects.push({
                id: map.id,
                type: map.type,
                transparent_id: map.transparent_id,
            })
        
        })
        console.log(ko.toJSON(objects));
        console.log(new_object);
    });

    this.setData = function(data){
        this.front_image(data.imposition_url);
        this.addMaps(data.objects);
    }

    this.show_item_list = ko.observable(false);
    this.toggleItemList = function(){
        this.show_item_list(!this.show_item_list());
    }

    this.freezeDarkey= function(){
        $(window).trigger('darkey', {state: true, hold: true});
    }

    this.unfreezeDarkey = function(){
        $(window).trigger('darkey', {state: false, hold: false});
    }


     
    ko.applyBindings(this, $('#result_image').get(0))
}


$(window).ready(function(){
    //176.9.30.143/fitting_room/looks/imposition?ids[]=60463&ids[]=60551&format=json&new_item=60463&v=2
    $.get('/proxy/fitting_room/looks/imposition?ids%5B%5D=60270&ids%5B%5D=60321&format=json&new_item=60321&v=2',
        {},
        function(data){
            $(document).trigger('newDataAdded', data);
        }, 'json'
    );
    
    new ResultImage();

    $('.product').click(function(){
        $(document).trigger('sendToServer', {
            action: 'new_item',
            object: {
                type: $(this).attr('id').split('_')[0],
                id:   $(this).attr('id').split('_')[1],
            }
        })
        return false;
    });




    itemColl = new ItemsCollection();
    itemColl.addItems([
        {
            id:111,
            type: 'face',
            title: 'лицо1',
            preview: "path_to_preview",
            image: "path_to_full_image"
        },
        {
            id:222,
            type: 'face',
            title: 'лицо2',
            preview: "path_to_preview",
            image: "path_to_full_image"
        },
        {
            id:333,
            type: 'face',
            title: 'лицо3',
            preview: "path_to_preview",
            image: "path_to_full_image"
        },
    ]);

});
                //<area shape="poly" data-bind="attr: {href: href, alt: title, title: title, coords: image_maps[0]},
                //event: {mouseover: toggleCircuit, mouseout: toggleCircuit}, click: itemInfo" >
