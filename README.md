# Auto pull guide by github webhook

> 아래의 포스팅과 깃을 참조하였으며, 리눅스(CentOS) 서버를 기준으로 작성하였습니다.
- [VELOPERT님 블로그](https://velopert.com/739)
- [VELOPERT님 Git](https://github.com/velopert/nodejs-github-webhook/blob/master/index.js)

## SSH KEY 생성
- 사용하고자 하는 PC의 home 디렉토리에 .ssh 디렉토리가 있는지 확인합니다. home 디렉토리에서 아래의 커맨드를 이용하면 숨김 파일들까지 확인합니다.

        ls -al ~
    
- 위 과정에서 이미 .ssh 디렉토리가 있다면 SSH KEY 생성 과정은 그대로 건너 뛰시면 되고, 그렇지 않은 경우에는 아래의 커맨드를 따라서 KEY를 우선 생성해 주셔야 합니다. 중간의 passphrase는 비워둬야 합니다.

        ssh-keygen

## SSH KEY 등록
- Github 계정에 해당 키를 추가하기 위해서 `ssh-keygen` 커맨드로 생성된 `~/.ssh` 디렉토리 내부의 `id_rsa.pub`의 내용을 그대로 복사합니다.
- Github 계정의 Setting 메뉴로 접근하여 "SSH and GPG keys" 탭으로 들어갑니다.
- title을 적당히 정해 주신 후, `id_rsa.pub` 에 있던 내용 그대로를 Key 에 넣고 "Add SSH Key" 버튼을 눌러 저장합니다.

## Auto Pull을 적용할 repository clone

- 아래와 같은 방식으로 pull을 받고자 하는 디렉토리에 github repository를 clone 해 줍니다. 제 경우에는 현재 README.md 파일이 작성되고 있는 이 repository를 기준으로 작성하겠습니다.

        git clone https://github.com/cliche90/webhook_autopull.git
    
## hook.sh 파일 생성

- hook.sh 는 실제로 git pull을 받도록 작성한 sh 파일입니다.
- 위치는 상관 없으나 편의상 index.js와 같은 위치에 넣어주시면 편합니다.
- hook.sh 파일에 해당 repository의 위치를 변수에 설정합니다. 제 레포지토리의 이름 그대로 디렉토리를 작성하였습니다.
- 이후 해당 레포지토리로 이동하여 `git pull`을 받도록 처리합니다. REPOSITORY 변수의 경우는 원하시는 레포지토리로 설정하시면 됩니다.

        REPOSITORY = "../webhook_autopull"     // REPOSITORY 변수에 git pull 받고자 하는 repository 설정
        cd $REPOSITORY      // 해당 디렉토리로 이동
        git pull            // git pull

## 포트와 Secret Key 설정

- 해당 내용을 듣고자 하는 포트와 Webhook에 적용할 Secret Key를 아래와 같이 index.js 파일에 작성합니다.

    let secret = "secretkey";
    let port = 8081;

## Webhook 추가

> 아래 내용은 읽어만 보신 후 마지막에 하시고, 코드 작성을 우선시 하시는 편을 권장드립니다.

- Github에서 push를 받을 경우 메세지를 던져주기 위해 해당 repository로 접근합니다.
- repository의 setting 메뉴의 Webhooks 탭으로 들어가 webhook을 추가합니다.
- Payload의 경우는 서비스의 url을 적어주시면 됩니다. 문구를 읽어보면 Payload는 POST 형식으로 보내지며, 저는 `~/push`라는 식으로 url을 작성하였습니다.
- Content-Type의 경우 임의대로 설정하셔도 좋지만 제 경우에는 body-parser를 이용하여 json 형태로 받을 것이기 때문에 application/json로 설정해 주었습니다.
- 마지막으로 Secrey은 위에서 만드셨던 Secret Key를 적어주시면 됩니다. 추후 hash code를 만들 때 사용됩니다.

## POST 서비스 작성

> 이제 해야 할 것은 명백합니다. `/push`라는 url로 POST 서비스를 작성해야 하며, 여기서 받은 Data를 가지고 hook.sh를 실행시키도록 해야합니다.

- express : 서비스 작성에 사용
- body-parser : jsonData parsing 에 사용
- spawn : sh 파일 실행에 사용
- crypto : hash code 작성에 사용

> 위 항목들이 필요하므로 해당 패키지들은 npm을 통해 설치해 줍니다.

    npm install express
    npm install body-parser
    npm install spawn
    npm install crypto

> 이후에는 아래의 내용을 수행합니다. 이하 내용은 index.js 파일을 참고하시면 됩니다.
- body-parser를 이용하여 request body에 담겨있는 data를 수신
- data의 string 값을 sha1 알고리즘을 통해 hash code로 변경
- Request의 헤더에 담겨있는 `x-hub-signature`와 비교하여 Validation 처리
>
    let jsonString = JSON.stringify(req.body)
    let hash = 'sha1=' + crypto.createHmac('sha1', secret).update(jsonString).digest('hex');

    if (hash != req.get('x-hub-signature')){
        // Exception, Error Return
        ....
    }

> hash code의 비교가 끝났다면, 올바른 요청임이 확인된 것이므로, 이제 sh 파일을 실행시켜 pull을 받도록 작성하면 됩니다.

    let deploySh = spawn('sh', ['hook.sh']);
        deploySh.stdout.on('data', function (data) {
        let buff = new Buffer(data);
        console.log(buff.toString('utf-8'));
    });

> git pull까지 실행된 후에는 이제 success 한 내용을 data에 담에 response에 담아 보내주면 서비스가 마무리됩니다.

    let data = JSON.stringify({ "success": true });
    return res.end(data);

## 서비스 실행 및 확인

> 이제 필요한 모든 내용의 작성은 종료되었고, 원하는 서버에서 `node index.js` 커맨드로 node server를 띄운 뒤, 원하는 github repository에 push를 하게되면 자동으로 수정사항이 반영되는 것을 확인 할 수 있습니다.