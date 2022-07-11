const scriptName = "test";
const allow_room = ["ㅈㅇㅎ"]; // 허용 채팅방
const REG = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi; // 특수문자 제거
const CHANNEL = {}; // 게임 채널
const HEALTH = 30; // 기본 체력
const PREFIX = '.'; // 명령어 구분자
/**
 * (string) room
 * (string) sender
 * (boolean) isGroupChat
 * (void) replier.reply(message)
 * (boolean) replier.reply(room, message, hideErrorToast = false) // 전송 성공시 true, 실패시 false 반환
 * (string) imageDB.getProfileB  ase64()
 * (string) packageName
 */
function response(room, msg, sender, isGroupChat, replier, imageDB, packageName)
{
  if (allow_room.indexOf(room) >= 0)
  {
    if (msg.replace(REG, '').replace(/ /g, '').replace(/\\n/g, '') === "수호야눈치게임하자") init(room, sender, replier);
    else if (CHANNEL[room] !== null && CHANNEL[room]["host"] === sender && CHANNEL[room]["state"] === 0 && msg.replace(/ /g, '').replace(/\\n/g, '').indexOf(',') === 1)
    {
      CHANNEL[room]["state"] = 2;
      classSelect(room, "수호", '0');
      classSelect(room, sender, msg.replace(/ /g, '').replace(/\\n/g, '')[0]);
      itemSelect(room, "수호", '0');
      itemSelect(room, sender, msg.replace(/ /g, '').replace(/\\n/g, '')[2]);
      
      let descript = "수호\n직업 : " + CHANNEL[room]["수호"]["class"] + "\n아이템 : " + CHANNEL[room]["수호"]["item"];
      descript += "\n\n" + sender +"\n직업 : " + CHANNEL[room][sender]["class"] + "\n아이템 : " + CHANNEL[room][sender]["item"];
      descript += "\n.\n.\n저는 이미 선택했어요! 입력해주세요.";
      replier.reply(room, descript);
      CHANNEL[room]["state"] = 1;
    }
    else if(CHANNEL[room] !== null && CHANNEL[room]["host"] === sender && CHANNEL[room]["state"] === 1 && msg[0] === PREFIX && msg.replace(/ /g, '').replace(/\\n/g, '').length === 5)
    {
      CHANNEL[room]["state"] = 2;
      
      let suho_type = ["물리", "마법"][Math.floor(Math.random()*2)];
      let suho_tactics = ["공격", "방어"][Math.floor(Math.random()*2)];
      
      let user_type = (msg.indexOf("물리") >= 0) ? "물리" : "마법";
      let user_tactics = (msg.indexOf("공격") >= 0) ? "공격" : "방어";
      
      // 타이머
      let descript = "주사위를 던질게요. 🎲👋";            
      replier.reply(room, descript);
      
      let suho = rollDice(CHANNEL[room]["수호"]["class"]);
      let user = rollDice(CHANNEL[room][sender]["class"]);
      
      // 타이머
      descript = "주사위결과\n수호 : " + suho + "\n" + sender + " : " + user;      
      replier.reply(room, descript);
            
      
      // 직업에 알맞게 공격력 증가효과 적용
      if (CHANNEL[room]["수호"]["class"] === "전사" && suho_type === "물리")
      {
        suho *= 2;
      }
      else if (CHANNEL[room]["수호"]["class"] === "마법사" && suho_type === "마법")
      {
        suho = parseInt(suho * 1.5);
      }
      
      if (CHANNEL[room][sender]["class"] === "전사" && user_type === "물리")
      {
        user *= 2;
      }
      else if (CHANNEL[room][sender]["class"] === "마법사" && user_type === "마법")
      {
        user = parseInt(user * 1.5);
      }
      
      // 결과
      descript = "수호의 " + suho_type + suho_tactics + " - " + suho + "\n\n  vs\n\n" + sender + "의 " + user_type + user_tactics + " - " + user; 
      replier.reply(room, descript);
      
      // 아이템 사용
      
      
      // 합산
      if (suho_tactics === user_tactics && suho_tactics === "공격")
      {
        // 서로 공격
        CHANNEL[room]["수호"]["health"] -= user;
        CHANNEL[room][sender]["health"] -= suho;
      }
      else if (suho_tactics === user_tactics && suho_tactics === "방어")
      {
        // 다음 공격에 합산
      }
      else if (suho_tactics !== user_tactics)
      {
        if (suho_type === user_type)
        {
          // 공격에 대한 방어
          if (suho_type === "공격")
          {
            CHANNEL[room][sender]["health"] -= ((suho - user) > 0 ? (suho - user) : 0);
          }
          else
          {
            CHANNEL[room]["수호"]["health"] -= ((user - suho) > 0 ? (user - suho) : 0);
          }
        }
        else
        {
          // 일방적인 공격
          if (suho_type === "공격")
          {
            CHANNEL[room][sender]["health"] -= suho;
          }
          else
          {
            CHANNEL[room]["수호"]["health"] -= user;
          }
        }
      }
      
      descript = "수호의 남은체력 : " + CHANNEL[room]["수호"]["health"] + "\n" + sender + "의 남은체력 : " + CHANNEL[room][sender]["health"];
      
      if (CHANNEL[room]["수호"]["health"] <= 0)
      {
        descript = sender + " 승!";
        CHANNEL[room] = null;
        return true;
      }
      else if (CHANNEL[room][sender]["health"] <= 0)
      {
        descript = "수호 승!";
        CHANNEL[room] = null;
        return false;
      }
      
      replier.reply(room, descript);
      
      // 심리전
      
      CHANNEL[room]["state"] = 1;
    }
    else if (CHANNEL[room] !== null && CHANNEL[room]["host"] === sender && msg[0] === PREFIX && msg.replace(/ /g, '').replace(/\\n/g, '').length === 5 && CHANNEL[room]["state"] === 2)
    {
      replier.reply(room, "지금은 할 수 없습니다.");
    }
  }
  /*
  눈치 주사위 게임
  물리, 마법 선택
  공격, 방어 선택
  파란주사위 - 공격/방어력 수치 결정
  
  직업 선택
  1. 도박사 - 주사위 눈금이 크게 나올 확률이 높음
  2. 사기꾼 - 공격/마법력 주사위 상한선 눈금이 큼 <1~9>
  3. 전사 - 물리공격, 물리방어력 2배, 하지만 눈금이 크게 나올확률이 적음
  4. 마법사 - 마법공격, 마법방어력 2배, 하지만 눈금이 크게 나올확률이 적음
  5. 상인 - 지정한 아이템을 5회까지 사용가능
  
  아이템 : 상인을 제외한 나머지 직업군은 1회만 사용 가능
  1. 공격뒤집개 - 나의 공격 유형을 전환시킨다. (물리 <-> 마법)
  2. 전술뒤집개 - 나의 전술 유형을 전환시킨다. (공격 <-> 방어)
  3. 바꿔치기 - 적 주사위를 정사면체로 바꾼다.
  */
}

function init(room, sender, replier)
{
  /*
  state
  0 - 직업, 아이템선택 기다리는 중
  1 - 게임 시작, 입력대기중
  2 - 계산 중, 행동불가
  */
  let descript = '';
  if (CHANNEL[room] === null)
  {
    CHANNEL[room] = {
      "turn" : false,
      "host" : sender,
      "state" : 0
      };
    CHANNEL[room]["수호"] = {
        "health" : 30,
        "class" : -1,
        "maxDice" : 6,
        "phys" : 1,
        "magic" : 1,
        "item" : -1,
        "itemCount" : 1
        };
    CHANNEL[room][sender] = {
        "health" : 30,
        "class" : -1,
        "maxDice" : 6,
        "phys" : 1,
        "magic" : 1,
        "item" : -1,
        "itemCount" : 1
        };
    descript += "-규칙 설명-\n";
    descript += "1. 공격 형태를 선택합니다. 공격 형태는 '물리'와 '마법'이 있습니다.\n";
    descript += "2. 전술 형태를 선택합니다. 전술 형태는 '공격'과 '방어'가 있습니다.\n";
    descript += "3. 공격 형태와 전술 형태를 선택하면 자동으로 6면체 주사위(힘 주사위)가 굴려집니다.\n";
    descript += "예시) " + PREFIX + "물리방어 => 자동으로 주사위 굴려져서 5가 나옴 => 5만큼의 물리방어력을 갖게됨.\n";
    descript += "기본 체력은 " + HEALTH + "입니다.\n";
    descript += "공격 형태에 알맞게 상호작용을 합니다. 예를들면 물리공격은 마법방어로 막을 수 없습니다.\n";
    descript += "\n-직업-\n";
    descript += "1. 도박사 - 힘 주사위의 눈금이 크게 나올 확률이 높다.\n";
    descript += "2. 사기꾼 - 힘 주사위의 눈금 상한선이 커진다.\n";
    descript += "3. 전사 - 체력이 " + (HEALTH * 2) + "이 되고 물리관련 전술효과가 2배가 되지만, 힘 주사위 눈금이 크게 나올 확률이 작다.\n";
    descript += "4. 마법사 - 마법관련 전술효과가 1.5배가 된다.\n";
    descript += "5. 상인 - 선택한 아이템을 5회까지 사용 가능하다.\n";
    descript += "\n-아이템-\n";
    descript += "1. 공격뒤집개 - 나의 공격 유형을 전환한다. (물리 <-> 마법)\n";
    descript += "2. 전술뒤집개 - 나의 전술 유형을 전환한다. (공격 <-> 방어)\n";
    descript += "3. 바꿔치기 - 적 주사위를 정사면체로 바꾼다.\n";
    descript += "\n직업과 아이템 번호를 입력해주세요\n";
    descript += "예시) 1,3 => 도박사와 바꿔치기 선택\n";
  }
  else
  {
    descript += "게임이 이미 진행중입니다.";
    CHANNEL[room] = null; // ***************************************************** 다만들고 지울 것
  }
  replier.reply(room, descript);
}

function classSelect(room, name, arg)
{
  let classes = ["도박사", "사기꾼", "전사", "마법사", "상인"];
  let my = parseInt(arg);
  let descript = "";
  if (my === null || my <= 0 || my >= 6)
  {
    my = Math.floor(Math.random()*5)+1;
  }
  
  if (my === 2) CHANNEL[room][name]["maxDice"] = 9;
  else if (my === 3)
  {
    CHANNEL[room][name]["health"] = (HEALTH * 2);
    CHANNEL[room][name]["phys"] = 2;
  }
  else if (my === 4) CHANNEL[room][name]["magic"] = 1.5;
  else if (my === 5) CHANNEL[room][name]["itemCount"] = 5;
  
  CHANNEL[room][name]["class"] = classes[my-1];
}

function itemSelect(room, name, arg)
{
  let items = ["공격뒤집개", "전술뒤집개", "바꿔치기"];
  let my = parseInt(arg);
  let descript = "";
  if (my === null || my <= 0 || my >= 4)
  {
    my = Math.floor(Math.random()*3)+1;
  }
  
  CHANNEL[room][name]["item"] = items[my-1];
}

function rollDice(job)
{
  /*
  도박사는 확률 업
  전사는 확률 다운
  */
  let result = -1;
  let cheat = Math.floor(Math.random()*100)+1;
    
  if (job === "도박사")
  {
    /*
    30 20 20 10 10 10
    */ 
    
    if (cheat >= 70) result = 6;
    else if (cheat >= 50) result = 5;
    else if (cheat >= 30) result = 4;
    else if (cheat >= 20) result = 3;
    else if (cheat >= 10) result = 2;
    else result = 1;
  }
  else if (job === "전사")
  {
    if (cheat >= 90) result = 6;
    else if (cheat >= 80) result = 5;
    else if (cheat >= 70) result = 4;
    else if (cheat >= 50) result = 3;
    else if (cheat >= 30) result = 2;
    else result = 1;
  }
  else result = Math.floor(Math.random()*6)+1;
  
  return result;
}


// item functions

function attackReverse()
{
  
}

function tacticsReverse()
{
  
}

function swapDice()
{
  
}

function psycho()
{
  
  return Math.floor(Math.random()*10);
}

//아래 4개의 메소드는 액티비티 화면을 수정할때 사용됩니다.
function onCreate(savedInstanceState, activity) {
  var textView = new android.widget.TextView(activity);
  textView.setText("Hello, World!");
  textView.setTextColor(android.graphics.Color.DKGRAY);
  activity.setContentView(textView);
}

function onStart(activity) {}

function onResume(activity) {}

function onPause(activity) {}

function onStop(activity) {}