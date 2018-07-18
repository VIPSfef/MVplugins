//=============================================================================
// ActionMovemont.js
//=============================================================================

/*:
 * @plugindesc 방향키를 짧게 누르면 이동하는 대신 시선을 돌립니다.
 * @author 베지테리안카카오(vcacao) #채식주의자 아님
 *
 * @param 시작시 적용
 * @desc true로 해놓으면 시작할 때부터 플러그인이 실행됩니다.
 * @default true
 *
 * @param 시작시 대시 플러그인 적용
 * @desc true로 해놓으면 시작할 때부터 두 번 입력으로 대시 모드가 실행됩니다.
 * @default true
 *
 * @param 화면 클릭 이동 방지
 * @desc false로 해놓으면 대시 모드 사용 중에 화면 클릭으로 이동이 되지 않게 할 수 있습니다.
 * @default false
 * 
 * @param 이동 방향키 입력 대기시간
 * @desc 아마도 3프레임일겁니다. 아니면 3milsec이거나...
 * @default 3
 * 
 * @help 이 플러그인은 플러그인커맨드를 사용하지 않습니다.
 * Provid by MIT lisence @restincosmos 2018
 * 
 * 시간 단위는 기본적으로 프레임이나 milsec일겁니다.
 * 주어진 스크립트 메서드입니다. 
 * 
 * Action_mov.start(); 일반모드에서 플러그인 적용 모드로 전환합니다. 이때 마우스 클릭이 제대로 작동되지 않을 수 있습니다.
 * Action_mov.stop(); 플러그인 이동모드에서 일반모드로 전환됩니다.
 * Action_mov.allstop(); 플러그인의 모든 기능을 끕니다.
 * Action_mov.dashmode(boolean?); 두번 눌러 대시하는 기능을 켜거나 끕니다. 파라미터로 true값을 넣으면 true로 고정 설정됩니다.
 * Action_mov.touchoff(boolean?); 마우스 클릭이 대시모드를 무시하고 실행될지 결정합니다. this.dashmode()와 마찬가지로 켜고 끄거나 직접 설정할 수 있습니다.
 * Action_mov.waittime(int); 플러그인 기능 중 키 입력 대기시간입니다. 길어질수록 오래 눌러야 합니다.
 * Action_mov.dashkeywait(int); 대시모드 중 더블 클릭을 기다리는 시간입니다.
 * 
 * Action_mov.system.safemarge(int); 기본값은 0입니다. 랙이 심해서 대쉬기능에 문제가 있다면 크기를 키워보세요. 하지만 건드리지 않는 게 좋습니다. 값이 커지면 너무 빨리 더블클릭할때 대쉬가 안되게 합니다.
 * 
 */


(function () {
    var parameters = PluginManager.parameters('ActionMovemont');

    var _state = Number(parameters['시작시 적용'] || true);
    var _dashingmode = Number(parameters['시작시 대시 플러그인 적용'] || true);
    var _touchmove = Number(parameters['화면 클릭 이동 방지'] || false);
    var _watingtime = Number(parameters['이동 방향키 입력 대기시간'] || 3);

    var _pressingMargin = 10;
    var _safemarge = 0;

    var _unpressedTimeMax = 1000;
    var _latestButton_ed = null;
    var _dashtrigger = true;


    var Input_clear = Input.clear;
    Input.clear = function () {
        Input_clear.call(this);
        this._unpressedTime = 0;
    };

    //움직임 핵심부분
    Game_Player.prototype.moveByInput = function () {
        if (!this.isMoving() && this.canMove()) {
            var direction = this.getInputDirection();
            if (direction > 0) {
                $gameTemp.clearDestination();
            } else if ($gameTemp.isDestinationValid()) {
                var x = $gameTemp.destinationX();
                var y = $gameTemp.destinationY();
                direction = this.findDirectionTo(x, y);
            }
            if (direction > 0 && (((Input._pressedTime > _watingtime) * !!_state) || ($gameTemp.isDestinationValid()&&_touchmove))) {//이동조건 추가
                this.executeMove(direction);
            } else if (direction > 0) {//입력시간이 초과되지 않았을 경우
                this.setDirection(direction);
            }
        }
    };
    //더블클릭 등을 위한 수정
    Input.update = function () {
        this._pollGamepads();
        if (this._currentState[this._latestButton]) {
            this._pressedTime++;
        } else {
            if (this._unpressedTime < _unpressedTimeMax) {
                this._unpressedTime++;
            }
            this._latestButton = null;
        }
        for (var name in this._currentState) {
            if (this._currentState[name] && !this._previousState[name]) {
                this._latestButton = name;
                this._pressedTime = 0;
                this._date = Date.now();
                if ((this._latestButton != null) && (this._pressedTime > _safemarge)) {
                    _latestButton_ed = name;
                }
            } else if (this._pressedTime > 0){
                this._unpressedTime = 0;
            }
            this._previousState[name] = this._currentState[name];
        }
        this._updateDirection();
    };
    Game_Player.prototype.isDashButtonPressed = function () {
        if (!_dashingmode) {
            var shift = Input.isPressed('shift');
            if (ConfigManager.alwaysDash) {
                return !shift;
            } else {
                return shift;
            }
        }
        else {

            if ((Input._pressedTime > 0) && (Input._unpressedTime < _pressingMargin)) {
                if (Input._latestButton == _latestButton_ed) {
                    _dashtrigger = !_dashtrigger;
                }
            }else            if (!(Input.isPressed('right') || Input.isPressed('left') || Input.isPressed('up') || Input.isPressed('down')) && (Input._unpressedTime > 5)) {
                _dashtrigger = false
            }

            return _dashtrigger;
        }
    };
    Action_mov.start = function () {
        _state = 1;
    }
    Action_mov.stop = function () {
        _state = 0;
    }
    Action_mov.allstop = function () {
        _state = 0;
        this.dash(false);
        this.touchoff(true);
    }
    Action_mov.dashmode = function(value){
        if (value != null) {
            if (!(typeof value === "number" && typeof value === "boolean")) { throw new Error('dashmode에 전달되는 파라미터는 숫자나 불리언이어야 합니다.') }
            else {
                _dashingmode = value;
                return _dashingmode;
            }
        } else {
            _dashingmode = !_dashingmode;
            return _dashingmode;
        }
    }
    Action_mov.touchoff = function (value) {
        if (value != null) {
            if (!(typeof value === "number" && typeof value === "boolean")) { throw new Error('touchmod에 전달되는 파라미터는 숫자나 불리언이어야 합니다.') }
            else {
                _touchmove = value;
                return _touchmove;
            }
        } else {
            _touchmove = !_touchmove;
            return _touchmove;
        }
    }
    Action_mov.waittime = function (time) {
        if (time != null)
            _watingtime = time;

        return _watingtime;
    }

    Action_mov.dashkeywait = function (time) {
        if (time != null)
            _pressingMargin = time;

        return _pressingMargin;
    }
    Action_mov.system.safemarge = function (value) {
        if (time != null)
            _safemarge = value;

        return _safemarge;
    }


})();

function Action_mov() {
    throw new Error('This is a static class');
};

