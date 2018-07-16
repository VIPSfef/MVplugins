# DynamicMapEditor.js

Description
============
What is this?
------------
When you want dynamicly edit map in playing game, this plugin is maybe useful
게임상에서 맵타일을 동적으로 수정할 수 있게끔 합니다.

EX: City builder game on RMMV
예: RMMV에서의 시티빌딩류의 게임
How it works?
------------
맵 데이터들은 RMMV 편집기에서 자동으로 생성됩니다.
이것들을 '에셋 맵 데이터'로 활용하여 최종적으로는 원래의 맵 데이터 위에 해당 데이터를 덧붙힙니다.

즉, 하나하나의 맵 데이터를 불러와서 원래 맵(플러그인 없을때도 불러오기 되던 원래 맵)의 특정 좌표에 불러오기 됩니다.

Am i care?
------------
This plugin are edit DataManager.onLoad method directly.
데이터를 불러왔을때마다 실행되는 DataManager.onLoad(object) 메소드를 직접적으로 편집하기 때문에, 이를 사용하는 다른 플러그인에 영향이 올 수 있습니다.

How to use
============
