
var $dataAsset = null;

(function () {
    
    var loadobj = {};
    var _loadingassets = 0;

    DataManager.loadAssetData = function (assetname) {
        var filename = 'asset/' + assetname + '.json';
        this._mapLoader = ResourceHandler.createLoader('data/' + filename, this.loadDataFile.bind(this, '$dataAsset', filename));
        this.loadDataFile('$dataAsset', filename);
    };

    

    //Scene_Map.prototype.create = function () {
    //    Scene_Base.prototype.create.call(this);
    //    this._transfer = $gamePlayer.isTransferring();
    //    var mapId = this._transfer ? $gamePlayer.newMapId() : $gameMap.mapId();
    //    DataManager.loadMapData(mapId);
        
    //};

    Scene_Map.prototype.isReady = function () {
        if (!this._mapLoaded && DataManager.isMapLoaded() && !_loadingassets) {
            this.onMapLoaded();
            this._mapLoaded = true;
        }
        return this._mapLoaded && Scene_Base.prototype.isReady.call(this);
    };

    //Scene_Map.prototype.onMapLoaded = function () {
    //    if (this._transfer) {
    //        $gamePlayer.performTransfer();
    //    }

    //    this.createDisplayObjects();//기다리게 만들어야함
    //};
    
    //xml 로딩이 끝났을 경우 실행됨
    DataManager.onLoad = function (object) {
        var array;
        if (object === $dataMap) {
            this.extractMetadata(object);
            array = object.events;
            //수정된 부분
            this.mapParsing();
        } else {
            array = object;
        }
        if (Array.isArray(array)) {
            for (var i = 0; i < array.length; i++) {
                var data = array[i];
                if (data && data.note !== undefined) {
                    this.extractMetadata(data);
                }
            }
        }
        if (object === $dataSystem) {
            Decrypter.hasEncryptedImages = !!object.hasEncryptedImages;
            Decrypter.hasEncryptedAudio = !!object.hasEncryptedAudio;
            Scene_Boot.loadSystemImages();
        }
        if (object === $dataAsset) {
            DataManager.combinedataMap();
            _loadingassets--;
            if (!_loadingassets) {
                loadobj = {};
            }
        }
    };

    //커스텀 메소드들

    DataManager.mapParsing = function () {
        

        var loadkey = '';

        for (var idx = 0; idx < $dataMap.events.length; idx++) {
            if ($dataMap.events[idx] == null) {
            }
            else if ($dataMap.events[idx].note[0] == '$') {
                
                if (!Object.keys(loadobj).some(v => v == $dataMap.events[idx].note)) {
                    loadobj[$dataMap.events[idx].note] = [];
                }
                loadobj[$dataMap.events[idx].note].push($dataMap.events[idx].id);
            }
        }
        
        if (Object.keys(loadobj).length) {
            for (var idx = 0; idx < Object.keys(loadobj).length; idx++) {
                this.loadAssetData(Object.keys(loadobj)[idx]);
                _loadingassets++;
            }
        }

    };

    //무거움
    DataManager.combinedataMap = function () {
        var offset_x, offset_y;
        var idx_x, idx_y, idx_z;
        var asset_w, asset_h;
        var asset_w_real, asset_h_real, asset_idx;
        var map_w, map_h;
        var event_note, event_id;
        var _assetCordnate;
        var datalength;

        map_w = $dataMap.width;
        map_h = $dataMap.height;
        asset_w = $dataAsset.width;
        asset_h = $dataAsset.height;
        datalength = $dataAsset.data.length;


        for (var idx = 0; idx < loadobj[$dataAsset.note].length; idx++) {
                event_id = loadobj[$dataAsset.note][idx];
                offset_x = $dataMap.events[event_id].x
                offset_y = $dataMap.events[event_id].y

                asset_w_real = map_w - offset_x;
                asset_h_real = map_h - offset_y;

                for (var asset_idx = 0; asset_idx < datalength; asset_idx++) {
                    idx_z = Math.floor(asset_idx / (asset_w * asset_h));
                    idx_y = Math.floor(asset_idx / asset_w) % asset_h;
                    idx_x = (asset_idx % asset_w);

                    _assetCordnate = (idx_x + offset_x) + (idx_y + offset_y) * map_w + idx_z * (map_w * map_h);

                    if ((map_w > idx_x + offset_x) && (map_h > idx_y + offset_y))
                    $dataMap.data[_assetCordnate] = $dataAsset.data[asset_idx];
                }
        }
        
    }

    

})();
