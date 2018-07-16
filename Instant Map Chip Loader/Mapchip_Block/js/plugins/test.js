
var $dataAsset = null;

(function () {
    
    var loadobj = {};
    var _loadingassets = 0;

    DataManager.loadAssetData = function (assetname) {
        var filename = 'asset/' + assetname + '.json';
        this._mapLoader = ResourceHandler.createLoader('data/' + filename, this.loadDataFile.bind(this, '$dataAsset', filename));
        this.loadDataFile('$dataAsset', filename);
    };

    Scene_Map.prototype.onMapLoaded = function () {
        if (this._transfer) {
            $gamePlayer.performTransfer();
            this.mapParsing();
        }
        this.createDisplayObjects();
    };

    var DataManager_onLoad = DataManager.onLoad;
    DataManager.onLoad = function (object) {
        DataManager_onLoad.call(this);
        if (object === $dataAsset) {
            DataManager.combinedataMap();
            _loadingassets--;
            if (!_loadingassets) {
                loadobj = {};
            }
        }
    };

    //커스텀 메소드들

    Scene_Map.prototype.mapParsing = function () {
        var part_src_loc = new Array($dataMap.events.length);

        var loadkey = '';

        for (var idx = 0; idx < $dataMap.events.length; idx++) {
            if ($dataMap.events[idx] == null) {
            }
            else if ($dataMap.events[idx].note[0] == '$') {
                part_src_loc[idx] = [$dataMap.events[idx].note, $dataMap.events[idx].id];
                if (!Object.keys(loadobj).some(v => v == $dataMap.events[idx].note)) {
                    loadobj[$dataMap.events[idx].note] = [];
                }
                loadobj[$dataMap.events[idx].note].push($dataMap.events[idx].id);
            }
        }
        part_src = part_src_loc.filter(Boolean);//이벤트가 많아지면 성능하락 예상
        if (Object.keys(loadobj).length) {
            for (var idx = 0; idx < Object.keys(loadobj).length; idx++) {
                DataManager.loadAssetData(Object.keys(loadobj)[idx]);
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
                part_src.splice(idx, 1);

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
