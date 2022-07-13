const scriptName = "test";
const ALLOWROOM = ["ㅈㅇㅎ"]; // 허용 채팅방
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
 
/*
 < 문제점 >
 수호의 공격패턴 수정 필요.
*/
 
function response(room, msg, sender, isGroupChat, replier, imageDB, packageName)
{
  if (ALLOWROOM.indexOf(room) >= 0)
  {
    if (msg.replace(REG, '').replace(/ /g, '').replace(/\\n/g, '') === "수호야눈치게임하자") init(room, sender, replier);
    else if (CHANNEL[room] !== undefined && CHANNEL[room]["host"] === sender && CHANNEL[room]["state"] === 0 && msg.replace(REG, '').replace(/ /g, '').replace(/\\n/g, '').length === 1)
    {
      CHANNEL[room]["state"] = 2;
      classSelect(room, "수호", '0');
      classSelect(room, sender, msg.replace(/ /g, '').replace(/\\n/g, '')[0]);
      
      let descript = "< 직업 결과 >\n수호 : " + CHANNEL[room]["수호"]["class"];
      descript += "\n" + sender +" : " + CHANNEL[room][sender]["class"];
      
      replier.reply(room, descript);
      java.lang.Thread.sleep(2000);
      
      descript = "❗️ 공격형태와 전술형태를 입력해주세요.";
      replier.reply(room, descript);
      
      CHANNEL[room]["state"] = 1;
    }
    else if(CHANNEL[room] !== undefined && CHANNEL[room]["host"] === sender && CHANNEL[room]["state"] === 1 && msg[0] === PREFIX && msg.replace(/ /g, '').replace(/\\n/g, '').length === 5)
    {
      CHANNEL[room]["state"] = 2;
      
      let suho_type = ["물리", "마법"][Math.floor(Math.random()*2)];
      let suho_tactics = ["공격", "방어"][Math.floor(Math.random()*2)];
      
      if (CHANNEL[room]["수호"]["psy"] !== '' && Math.floor(Math.random()*100)+1 >= 65)
      {
        suho_type = CHANNEL[room]["수호"]["psy"].slice(0,2);
        suho_tactics = CHANNEL[room]["수호"]["psy"].slice(2);
      }
      
      let user_type = (msg.indexOf("물리") >= 0) ? "물리" : "마법";
      let user_tactics = (msg.indexOf("공격") >= 0) ? "공격" : "방어";
      
      let descript = "주사위를 던질게요.\n\n\t👋\n\t\t  .\n\t\t\t   .\n\t\t\t\t  .\n\t\t\t\t.\n\t\t\t .\n\t\t\t.\n\t\t\t\t .\n\t\t\t\t 🎲";            
      replier.reply(room, descript);

      let suho = rollDice(room, "수호");
      let user = rollDice(room, sender);
      
      descript = "< 주사위 결과 >\n수호 : " + [0, "1️⃣","2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣"][suho] + "\n" + sender + " : " + [0, "1️⃣","2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣"][user];
      
      java.lang.Thread.sleep(2000);
      replier.reply(room, descript);
      
      suho += CHANNEL[room]["수호"]["acc"];
      user += CHANNEL[room][sender]["acc"];
      
      // 직업에 알맞게 공격력 증가효과 적용
      if (CHANNEL[room]["수호"]["class"] === "운동선수" && suho_type === "물리")
      {
        suho *= 2;
      }
      else if (CHANNEL[room]["수호"]["class"] === "점성술사" && suho_type === "마법")
      {
        suho = parseInt(suho * 1.5);
      }
      
      if (CHANNEL[room][sender]["class"] === "운동선수" && user_type === "물리")
      {
        user *= 2;
      }
      else if (CHANNEL[room][sender]["class"] === "점성술사" && user_type === "마법")
      {
        user = parseInt(user * 1.5);
      }

      // 중간 결과
      descript = "수호의 [" + suho_type + suho_tactics + "] : " + suho + "\n\n\t\t\t  ⚔️\n\n" + sender + "의 [" + user_type + user_tactics + "] : " + user;
      
      java.lang.Thread.sleep(1500);
      replier.reply(room, descript);
      
      // 다른 공격, 다른 전술일 경우 막기 1/2 효과
      let half_defense = false;
      if (suho_type !== user_type && suho_tactics !== user_tactics)
      {
        half_defense = true;
        if (suho_tactics === "공격")
        {
          user /= 2;
        }
        else
        {
          suho /= 2;
        }
      }
      
      // 체력 계산
      descript = "< 전투 기록 >\n";
      if (suho_tactics === user_tactics && suho_tactics === "공격")
      {
        // 서로 공격
        descript += damagedPlayer(room, "수호", sender, suho, half_defense, false) + "\n";
        descript += damagedPlayer(room, sender, "수호", user, half_defense, false);
      }
      else if (suho_tactics === user_tactics && suho_tactics === "방어")
      {
        // 다음 공격에 합산
        descript += '다음 힘 주사위 눈금에 합산됩니다.';
        CHANNEL[room]["수호"]["acc"] += suho - CHANNEL[room]["수호"]["acc"];
        CHANNEL[room][sender]["acc"] += user - CHANNEL[room][sender]["acc"];
      }
      else if (suho_tactics !== user_tactics)
      {
        // 공격에 대한 방어
        if (suho_tactics === "공격")
        {
          descript += damagedPlayer(room, "수호", sender, suho - user, half_defense, true);
        }
        else
        {
          descript += damagedPlayer(room, sender, "수호", user - suho, half_defense, true);
        }
      }

      descript += "\n< 남은 체력 >\n수호 : " + CHANNEL[room]["수호"]["health"] + "\n" + sender + " : " + CHANNEL[room][sender]["health"];
      
      if (CHANNEL[room]["수호"]["health"] <= 0 && CHANNEL[room][sender]["health"] <= 0)
      {
        descript += "\n\n🚩무승부";
        CHANNEL[room]["state"] = 3;
      }
      else if (CHANNEL[room]["수호"]["health"] <= 0)
      {
        descript += "\n\n🏳 " + sender + " 승!";
        CHANNEL[room]["state"] = 3;
      }
      else if (CHANNEL[room][sender]["health"] <= 0)
      {
        descript += "\n\n🏴 수호 승!";
        CHANNEL[room]["state"] = 3;
      }
      
      java.lang.Thread.sleep(3500);
      replier.reply(room, descript);
      
      if (CHANNEL[room]["state"] === 3)
      {
        CHANNEL[room] = undefined;
        return;
      }
      
      // 심리전
      psycho(room, replier);

      java.lang.Thread.sleep(1500);
      replier.reply(room, "❗️ 공격형태와 전술형태를 입력해주세요.");

      CHANNEL[room]["state"] = 1;
    }
    else if (CHANNEL[room] !== null && CHANNEL[room]["host"] === sender && msg[0] === PREFIX && msg.replace(/ /g, '').replace(/\\n/g, '').length === 5 && CHANNEL[room]["state"] === 2)
    {
      replier.reply(room, "🚫 지금은 할 수 없습니다.");
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
  if (CHANNEL[room] === undefined)
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
        "acc" : 0,
        "science" : false,
        "psy" : ''
        };
    CHANNEL[room][sender] = {
        "health" : 30,
        "class" : -1,
        "maxDice" : 6,
        "phys" : 1,
        "magic" : 1,
        "acc" : 0,
        "science" : false
        };
    descript += "📋 규칙 설명\n";
    descript += "1. 공격 형태를 선택합니다. 공격 형태는 '물리'와 '마법'이 있습니다.\n";
    descript += "2. 전술 형태를 선택합니다. 전술 형태는 '공격'과 '방어'가 있습니다.\n";
    descript += "3. 공격 형태와 전술 형태를 선택하면 자동으로 6면체 주사위(힘 주사위)가 굴려집니다.\n";
    descript += "예시) " + PREFIX + "물리방어 => 자동으로 주사위 굴려져서 5가 나옴 => 5만큼의 물리방어력을 갖게됨.\n";
    descript += "4. 기본 체력은 " + HEALTH + "입니다.\n";
    descript += "5. 같은 공격형태, 다른 전술일때 방어효과는 100% 입니다.\n";
    descript += "6. 다른 공격형태, 다른 전술일때 방어효과는 50% 입니다.\n";
    descript += "7. 서로 방어를 선택하면, 힘 주사위 눈금이 누적됩니다. 누적된 눈금은 전투 때 사용됩니다.\n";
    descript += "\n🧭 직업\n";
    descript += "1. 도박사 - 힘 주사위의 눈금이 크게 나올 확률이 높다.\n";
    descript += "2. 사기꾼 - 자신의 힘 주사위를 12면체 주사위로 바꿔치기 한다.\n";
    descript += "3. 운동선수 - 체력이 " + (HEALTH + 10) + "이고 물리관련 전술효과가 2배 증가하지만, 힘 주사위가 4면체 주사위이다.\n";
    descript += "4. 점성술사 - 마법관련 전술효과가 1.5배 증가한다.\n";
    descript += "5. 과학자 - 20% 확률로, 받은 피해만큼 체력을 회복한다. 효과는 연속으로 발동되지 않으며 발동 될 때마다 다음 턴 힘 주사위 눈금은 무조건 1이 나온다.\n";
    descript += "\n❗️ 선택한 직업의 번호를 입력해주세요\n";
  }
  else
  {
    descript += "⚠️ 게임이 이미 진행중입니다.";
  }
  replier.reply(room, descript);
}

function classSelect(room, name, arg)
{
  let classes = ["도박사", "사기꾼", "운동선수", "점성술사", "과학자"];
  let my = parseInt(arg);
  if (isNaN(my) || my <= 0 || my >= 6)
  {
    my = Math.floor(Math.random()*5)+1;
  }
  
  if (my === 2) CHANNEL[room][name]["maxDice"] = 12;
  else if (my === 3)
  {
    CHANNEL[room][name]["maxDice"] = 4;
    CHANNEL[room][name]["health"] = (HEALTH + 10);
    CHANNEL[room][name]["phys"] = 2;
  }
  else if (my === 4) CHANNEL[room][name]["magic"] = 1.5;
  
  CHANNEL[room][name]["class"] = classes[my-1];
}

function rollDice(room, name)
{
  /*
  도박사는 확률 업
  운동선수는 확률 다운
  */
  let result = -1;
  let cheat = Math.floor(Math.random()*100)+1;
  let job = CHANNEL[room][name]["class"];
    
  if (job === "도박사")
  {
    // 100 ~ 51
    // 50 ~ 26
    // 25 ~ 13
    // 12 ~ 6
    // 5 ~ 3
    // 2 ~ 1
    if (cheat >= 51) result = 6;
    else if (cheat >= 26) result = 5;
    else if (cheat >= 13) result = 4;
    else if (cheat >= 6) result = 3;
    else if (cheat >= 3) result = 2;
    else result = 1;
  }
  else if (job === "과학자" && CHANNEL[room][name]["science"])
  {
    CHANNEL[room][name]["science"] = false;
    result = 1;
  }
  else result = Math.floor(Math.random()*CHANNEL[room][name]["maxDice"])+1;
  
  return result;
}

function damagedPlayer(room, attacker, victim, damage, difType, defense)
{
  let result = '';
  
  CHANNEL[room][attacker]["acc"] = 0;
  CHANNEL[room][victim]["acc"] = 0;
  
  if (defense)
  {
    result += "공격 : " + attacker + "\t 방어 : " + victim + "\n\n"; 
  }
  else
  {
    result += "공격 : " + attacker + " 🗡 ⇒ " + victim + "\n\n";
  }
  
  if (difType)
  {
    result += "⚠️ 공격 형태가 서로 맞지 않습니다.\n" + victim + "의 방어력이 절반만 유효합니다.\n\n";
  }
  
  if (damage > 0)
  {
    // 과학자
    if (CHANNEL[room][victim]["class"] === "과학자" && !CHANNEL[room][victim]["science"] && Math.floor(Math.random()*100)+1 >= 80)
    {
      CHANNEL[room][victim]["health"] += damage;
      CHANNEL[room][victim]["science"] = true;
      result += "🧬 " + attacker + "의 공격이 회복으로 전환 되었습니다.\n " + victim + "의 체력을 " + damage + "만큼 회복했습니다.\n " + victim + "의 다음 턴 힘 주사위 눈금은 1️⃣ 입니다.\n";
    }
    else
    {
      CHANNEL[room][victim]["health"] -= damage;
      result += "🗡 " + victim + "에게 " + damage + "만큼 피해를 입혔습니다.\n";
      if (defense)
      {
        result += " 입은 피해량은 다음 힘 주사위 결과에 누적됩니다.\n";
        CHANNEL[room][victim]["acc"] += damage;
      }
    }
  }
  else
  {
    result += "🛡 " + attacker + "의 공격을 모두 막았습니다.\n";
  }
  
  return result;
}

function psycho(room, replier)
{
  if (CHANNEL[room]["수호"]["psy"] === '' && CHANNEL[room]["수호"]["health"] >= 10 && Math.floor(Math.random()*100)+1 >= 70)
  {
    CHANNEL[room]["수호"]["psy"] = ["물리", "마법"][Math.floor(Math.random()*2)] + ["공격", "방어"][Math.floor(Math.random()*2)];
    
    let msgs = [];
    msgs[0] = "전 이번에 " + CHANNEL[room]["수호"]["psy"] + (CHANNEL[room]["수호"]["psy"].indexOf("공격") >= 0 ? "을" : "를") + " 내겠습니다.";
    msgs[1] = "전 이번 턴에 " + CHANNEL[room]["수호"]["psy"] + (CHANNEL[room]["수호"]["psy"].indexOf("공격") >= 0 ? "을" : "를") + " 내겠습니다.";
    msgs[2] = "이번 턴에는 " + CHANNEL[room]["수호"]["psy"] + (CHANNEL[room]["수호"]["psy"].indexOf("공격") >= 0 ? "을" : "를") + " 내보일까요?";
    msgs[3] = "다음 턴에 " + CHANNEL[room]["수호"]["psy"] + (CHANNEL[room]["수호"]["psy"].indexOf("공격") >= 0 ? "은" : "는") + " 아무래도 치사하겠죠?";
    msgs[4] = "다다음 턴에 " + CHANNEL[room]["수호"]["psy"] + (CHANNEL[room]["수호"]["psy"].indexOf("공격") >= 0 ? "을" : "를") + " 내야겠어요.";
    msgs[5] = "흠... 이번 턴에는 " + CHANNEL[room]["수호"]["psy"] + (CHANNEL[room]["수호"]["psy"].indexOf("공격") >= 0 ? "을" : "를") + " 안 내겠습니다.";
    msgs[6] = "이번에는 " + CHANNEL[room]["수호"]["psy"] + (CHANNEL[room]["수호"]["psy"].indexOf("공격") >= 0 ? "을" : "를") + " 내드릴까요?";
    msgs[7] = "운이 안좋네요... " + CHANNEL[room]["수호"]["psy"] + (CHANNEL[room]["수호"]["psy"].indexOf("공격") >= 0 ? "을" : "를") + " 낼께요.";
    
    java.lang.Thread.sleep(500);
    replier.reply(room, msgs[Math.floor(Math.random()*msgs.length)]);
  }
  else
  {
    CHANNEL[room]["수호"]["psy"] = '';
  }
  return;
}

function numToIcon(n)
{
  let result = '';
  let strN = n + '';
  icon = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
  for (let i = 0; i < strN.length; i++)
  {
    if (isNaN(parseInt(strN[i])))
    {
      result += strN[i];
    }
    else
    {
      result += icon[parseInt(strN[i])];
    }
  }
  
  return result;
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