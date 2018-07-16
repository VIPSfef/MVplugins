//=============================================================================
// DynamicMapEditor.js
//=============================================================================

/*:
 * @plugindesc DME is load asst(json) and patch on map
 * @author 베지테리안카카오(vcacao) #채식주의자 아님
 *
 * @param displayAttack
 * @desc Whether to display normal attack. 1:yes 0:no
 * @default 0
 *
 * @param position
 * @desc Skill name display position. 0:left, 1:center
 * @default 1
 *
 * @help This plugin does not provide plugin commands.
 * License by GPL.v3
 * 
 * Warning: this plugin edited "DataManager.onLoad" Method. maybe crush other plugin witch edit this method.
 * 
 * How To Use?
 * Please Read "README.md" file.
 */
/*:ko
 * @plugindesc DME는 동적 파일변환 플러그인입니다.
 * @author 神無月サスケ
 *
 * @param displayAttack
 * @desc 通常攻撃も表示するか (1:する 0:しない)
 * @default 0
 *
 * @param position
 * @desc 技名を表示する位置 (0:左寄せ, 1:中央)
 * @default 1
 *
 * @help このプラグインには、プラグインコマンドはありません。
 *
 * ログを表示せず、技名のみを表示することで、戦闘のテンポが若干高速になります。
 */

var $dataAsset = null;

(function () {
    
    var loadobj = {};
    var _loadingassets = 0;

    //---------------
    //수정된 메소드들
    //---------------

    

    DataManager.loadAssetData = function (assetname) {
        var filename = 'asset/' + assetname + '.json';
        this._mapLoader = ResourceHandler.createLoader('data/' + filename, this.loadDataFile.bind(this, '$dataAsset', filename));
        this.loadDataFile('$dataAsset', filename);
    };
    
    //xml 로딩이 끝났을 경우 실행됨
    DataManager.onLoad = function (object) {
        var array;
        if (object === $dataMap) {
            this.extractMetadata(object);
            array = object.events;
            this.mapParsing(); //수정된 코드
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
            _loadingassets--;
            if (!_loadingassets) {
                loadobj = {};
            }
        }
    };

    //---------------
    //커스텀 메소드들
    //---------------

    //데이터메니저에서 로딩이 끝났을 때 데이터값이 지도라면 실행
    //하는일: 지도의 이벤트를 분석해서 불러오기할 에셋 데이터 선정
    //취약점: 모르겠음
    DataManager.mapParsing = function () {

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
