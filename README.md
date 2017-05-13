# Auto pull guide by github webhook

> 아래의 포스팅과 깃을 참조하였으며, 리눅스를 기준으로 작성하였습니다.
- [VELOPERT님 블로그](https://velopert.com/739)
- [VELOPERT님 Git](https://github.com/velopert/nodejs-github-webhook/blob/master/index.js)

## SSH KEY 생성
- 사용하고자 하는 PC의 home 디렉토리에 .ssh 디렉토리가 있는지 확인합니다. home 디렉토리에서 아래의 커맨드를 이용하면 숨김 파일들까지 확인합니다.

        ls -al ~
    
- 위 과정에서 이미 .ssh 디렉토리가 있다면 SSH KEY 생성 과정은 그대로 건너 뛰시면 되고, 그렇지 않은 경우에는 아래의 커맨드를 따라서 KEY를 우선 생성해 주셔야 합니다. 중간의 passphrase는 비워둬야 합니다.

        ssh-keygen

## Auto Pull을 적용할 repository clone

- 아래와 같은 방식으로 원하는 디렉토리에 github repository를 clone 해 줍니다. 제 경우에는 현재 README.md 파일이 작성되고 있는 이 repository를 기준으로 작성하겠습니다.

        git clone https://github.com/cliche90/autopull_by_webhook_guide.git
    
## hook.sh 파일 생성

- hook.sh 는 실제로 git pull을 받도록 작성한 sh 파일입니다.
- 위치는 상관 없으나 편의상 index.js와 같은 위치에 넣어주시면 편합니다.
- hook.sh 파일에 해당 repository의 위치를 변수에 설정합니다. 제 레포지토리의 이름 그대로 디렉토리를 작성하였습니다.
- 이후 해당 레포지토리로 이동하여 `git pull`을 받도록 처리합니다. REPOSITORY 변수의 경우는 원하시는 레포지토리로 설정하시면 됩니다.

        REPOSITORY = "../autopull_by_webhook_guide"     // REPOSITORY 변수에 git pull 받고자 하는 repository 설정
        cd $REPOSITORY      // 해당 디렉토리로 이동
        git pull            // git pull

## 포트와 Secret Key 설정

- 해당 내용을 듣고자 하는 포트와 Secret Key를 아래와 같이 index.js 파일에 작성합니다.

        var secret = "amazingkey";
        var port = 8081;

// ttetests