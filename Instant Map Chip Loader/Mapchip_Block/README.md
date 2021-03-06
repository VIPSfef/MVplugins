# DynamicMapEditor.js

This plugin provide by [LICENSE](/LICENSE)
<hr/>

Description
============

What is this?
------------
When you want dynamicly edit map in playing game, this plugin is maybe useful.

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
<hr/>

How to use
============

### 1. 에셋 파일을 만드세요

create asset"$any name you want".json file. ant edit map note to ```$anyoneyouwant```

에셋 파일은 RMMV에서 저장할 때 자동 생성되는 맵 데이터를 기반으로 합니다. 맵 데이터들은 기본적으로 ```<game folder>\data\MAPnnx.json```의 형태로 저장됩니다. 예를 들어 ID가 1번인 맵 데이터는 MAP001.json이라고 저장됩니다.
이때, 파일을 불러오기 할 에셋 이름을 맵 노트에 저장하세요. ```$님이원하는글자``` 이때, 2.번 항목에서 저장될 파일 이름과 동일해야 합니다.

### 2. 에셋 파일을 특정 형식으로 저장하세요

Save as... the "asset"map file. the form is... ```$anyoneyouwant.json```, and put ```<game folder>\data\assets```directory.(make when that is art not there)

불러오기 하고 싶은 에셋 파일을 ```<game folder>\data\assets```폴더에 저장합니다. 이때 해당 폴더가 없다면 만들어 주세요. 그런 다음 실제 불러올 맵 데이터 파일을 ```$님이원하는글자.json```의 형태로 저장해 주세요.

>프로그램은 에셋 데이터 여부를 파일 문자열 첫 글자인 $를 보고 판단하기 때문에, 이를 빼먹으면 정상적인 실행이 되지 않을 수가 있습니다.

### 3. 맵에디터에서 불러오기할 이벤트를 생성하세요

Make event on your 'real'map the playarea. when you save 'evnent note' to ```$anyoneyousavedassetname```, then plugin are load '$anyoneyousavedeventnote.json' on there.

이제 실제 지도 위에서 해당 에셋을 불러오기 할 좌표를 지정해야 합니다. 플러그인은 이벤트 페이지를 검사하여 '이벤트 노트'에 ```$저장된에셋파일이름```의 첫글자에 $표기가 있는지 확인하며, 있다면 해당 이벤트 노트대로, '$저장된에셋파일이름.json'파일을 그 자리에다 불러오기 합니다.

### 4. Done!

It is now safe to turn on your game.

이제 게임 전원을 켜셔도 됩니다.

IDK? Follow me
============
sorry this is only Korean doc.

### 1. 에셋파일 만들기

1. 가로 6, 세로 4칸의 작은 맵을 하나 생성합니다. 이 맵데이터는 나중에 불러오기 할 에셋 데이터로 활용될겁니다.
2. 적당한 집을 맵을 꽉 채워서 만드세요.
3. 다 되었다면 이제 맵 정보 편집창(맵 목록 우클릭 후 편집 클릭)을 열어주세요.
4. '지도 속성' 편집창의 하단을 보면 '메모'를 편집할 수 있습니다. 이 경우 ```$dummy```라고 저장하겠습니다.

### 2. 에셋파일 저장하기

1. 우선 저장을 하시면 해당 맵 ID의 번호에 맞는 맵 json파일이 ```<게임저장폴더>\data```에 저장될겁니다. 이를 확인해 주세요.
2. 만약 1.번에서 저장한 에셋파일 맵 ID가 ```23```이었다면, 맵 이름은 ```Map023.json```이런 식일 겁니다. 이것을 복사해 주세요.
3. ```<게임저장폴더>\data\assets```폴더를 만들고, 만들어져 있다면 이곳에 그 에셋파일을 붙여넣어 저장해 주세요.
4. 에셋파일의 이름을 수정해야 합니다. 이때 1.4.에서 저장했던 이름과 동일해야 합니다. 이 경우엔 ```$dummy.json```이라고 저장합니다.

### 3. 불러오기할 이벤트 만들기

1. 만들고 있던 게임 맵을 수정할 차례입니다. 해당 '에셋'을 불러오기 할 위치에 이벤트를 생성하세요. 꼭 새 이밴트여야 할 필요는 없습니다.
2. 이벤트의 '메모' 칸에 불러오기할 에셋 이름을 적으세요. 이 경우에는 ```$dummy```라고 저장하시면 됩니다.

### 4. 게임을 실행

1. 게임을 실행합니다.
2. 해당 이벤트가 저장된 맵으로 이동하여 에셋이 올바르게 불러와졌나 확인하세요.
3. 이제 되었습니다.

불가능은 없습니다.
================
자바스크립트의 다양한 기능을 활용하여 해당 플러그인을 향상시킬 수 있습니다. 에셋파일의 편집과 저장을 자동으로 간단하게 하는 프로그램도 만들 수 있고, 꼭 이벤트가 있어야 에셋파일을 불러올 필요도 없습니다(스크립트 콜을 통한 구현 등).

만일 원하는 기능이 있다면 홈페이지 등에 코멘트를 남겨 주시기 바랍니다. 여건이 된다면 업데이트 하겠습니다.
