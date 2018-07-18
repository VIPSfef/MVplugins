//=============================================================================
// DynamicMapEditor.js
//=============================================================================

/*:
 * @plugindesc DME is load asst(json) and patch on map
 * @author vcacao @resincosmos (베지테리안카카오)
 *
 * @help This plugin does not provide plugin commands.
 * License: MIT @resincosmos 2018
 * 
 * Warning: this plugin edited "DataManager.onLoad", 
 * "Scene_Map.prototype.isReady" Method.
 * maybe crush other plugin witch edit this method.
 * 
 * How To Use?
 * Please Read "README.md" file.
 * https://github.com/VIPSfef/MVplugins/blob/master/Instant%20Map%20Chip%20Loader/Mapchip_Block/README.md
 * 
 */
/*:ko
 * @plugindesc DME는 동적 맵 데이터 변환 플러그인입니다.
 * @author 베지테리안카카오(vcacao) #채식주의자 아님
 *
 *
 * @help 이 플러그인은 플러그인커맨드를 사용하지 않습니다.
 * License: MIT @resincosmos 2018
 * 
 * 주의: 이 플러그인은 "DataManager.onLoad"메서드와
 * "Scene_Map.prototype.isReady" 메서드를 수정합니다.
 * 때문에 이를 수정하는 다른 플러그인과 충돌할 수도 있습니다.
 * 
 * 사용법:
 * 동봉된 "README.md"파일을 읽어주세요
 * https://github.com/VIPSfef/MVplugins/blob/master/Instant%20Map%20Chip%20Loader/Mapchip_Block/README.md
 * 
 */

//---------------
//추가된 전역변수
//---------------

//로드된 에셋 데이터를 저장함
var $dataAsset = null;

(function () {

    //---------------
    //추가된 변수
    //---------------

    //로드할 에셋 목록을 저장
    var loadassets = {};

    //---------------
    //수정된 메소드들
    //---------------

    //xml 로딩이 끝났을 경우 실행됨
    DataManager.onLoad = function (object) {
        var array;
        if (object === $dataMap) {
            this.extractMetadata(object);
            array = object.events;
            this.mapParsing(object); //수정된 코드
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
        //수정된 코드
        if (object === $dataAsset) {
            DataManager.combinedataMap();
            delete loadassets[$dataAsset.note]
        }
    };

    //맵을 출력하는 (onMapLoaded)메서드가 실행되는 조건
    //없어도 작동할 수는 있지만 가끔 로딩이 안되는 등 안정성이 떨어짐
    Scene_Map.prototype.isReady = function () {
        if (!this._mapLoaded && DataManager.isMapLoaded() && !Object.keys(loadassets).length) {//수정된 부분
            this.onMapLoaded();
            this._mapLoaded = true;
        }
        return this._mapLoaded && Scene_Base.prototype.isReady.call(this);
    };

    //---------------
    //커스텀 메소드들
    //---------------

    //데이터메니저에서 로딩이 끝났을 때 데이터값이 지도라면 실행
    //하는일: 지도의 이벤트를 분석해서 불러오기할 에셋 데이터 선정
    //취약점: 모르겠음
    DataManager.mapParsing = function (object) {
        if (object === $dataMap) {
            for (var idx = 0; idx < $dataMap.events.length; idx++) {
                if ($dataMap.events[idx] == null) {
                }
                else if ($dataMap.events[idx].note[0] == '$') {

                    if (!Object.keys(loadassets).some(v => v == $dataMap.events[idx].note)) {
                        loadassets[$dataMap.events[idx].note] = [];
                    }
                    loadassets[$dataMap.events[idx].note].push($dataMap.events[idx].id);
                }
            }

            if (Object.keys(loadassets).length) {
                for (var idx = 0; idx < Object.keys(loadassets).length; idx++) {
                    this.loadAssetData(Object.keys(loadassets)[idx]);
                }
            }

            for (var idx = 0; idx < $dataMap.events.length; idx++) {
                if ($dataMap.events[idx] == null) {
                }
                else if ($dataMap.events[idx].note[0] == '$') {

                    if (!Object.keys(loadassets).some(v => v == $dataMap.events[idx].note)) {
                        loadassets[$dataMap.events[idx].note] = [];
                    }
                    loadassets[$dataMap.events[idx].note].push($dataMap.events[idx].id);
                }
            }
        }
    };
    
    //this.mapParsing에서 에셋 데이터를 불러오기 할 때마다 실행
    //하는일: this.loadMapData와 비슷하게 에셋 데이터를 로드함
    //취약점: 모르겠고, filename의 디렉토리를 파라미터 처리하는 방안이 있음
    DataManager.loadAssetData = function (assetname) {
        var filename = 'assets/' + assetname + '.json';
        this._mapLoader = ResourceHandler.createLoader('data/' + filename, this.loadDataFile.bind(this, '$dataAsset', filename));
        this.loadDataFile('$dataAsset', filename);
    };

    //데이터메니저에서 로딩이 끝났을 때 데이터값이 에샛이라면 실행
    //하는일: 에셋 데이터가 불러와질때마다 맵데이터 수정
    //취약점: 메소드에 하중이 가해지면 에셋 데이터가 변조될 수 있음
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


        for (var idx = 0; idx < loadassets[$dataAsset.note].length; idx++) {
                event_id = loadassets[$dataAsset.note][idx];
                offset_x = $dataMap.events[event_id].x
                offset_y = $dataMap.events[event_id].y

            if ($dataAsset.events[1] != undefined) {
                asset_w_real = offset_x - $dataAsset.events[1].x;
                asset_h_real = offset_y - $dataAsset.events[1].y;
            } else {
                asset_w_real = offset_x;
                asset_h_real = offset_y;
            }

                for (var asset_idx = 0; asset_idx < datalength; asset_idx++) {
                    idx_z = Math.floor(asset_idx / (asset_w * asset_h));
                    idx_y = Math.floor(asset_idx / asset_w) % asset_h;
                    idx_x = (asset_idx % asset_w);

                    
                    if ((map_w > idx_x + asset_w_real) && (idx_x + asset_w_real >= 0) && (map_h > idx_y + asset_h_real) && (idx_y + asset_h_real >= 0)) {
                        _assetCordnate = (idx_x + asset_w_real) + (idx_y + asset_h_real) * map_w + idx_z * (map_w * map_h);
                        $dataMap.data[_assetCordnate] = $dataAsset.data[asset_idx];
                    } 
                }
        }
        
    }

})();
