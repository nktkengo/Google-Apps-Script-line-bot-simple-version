const CHANNEL_ACCESS_TOKEN = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const calender_id = 'xxxxx';
const yesExp = /^(y|yes|はい|ok|おｋ)$/;

function doPost(e) {
  const json = JSON.parse(e.postData.contents).events[0];
  const replyToken = json.replyToken;
  const lineType = json.type;
  const userID = json.source.userId;
  const userMessage = json.message.text;
  const Groupid = json.source.groupId;

  //regular expressions
  const noExp = /^(n|no|いいえ)$/;
  const clearExp = /^(キャンセル|やめる)$/;
  const followExp = /(follow|unfollow)/;
  const yearExp = /(19[0-9]{2}|20[0-9]{2})/;
  const dateExp = /([01][1-2]|[1][0-2]|[1-9])[\/月]([0][1-9]|[12][0-9]|3[01]|[1-9])/; //うるう年などには対応できない。
  const hourMinExp = /([01][0-9]|[2][0-3]|[0-9])[:時]([01][0-9]|[2-5][0-9]|[0-9]|)/;

  // ボットの状態遷移をstateという変数名でキャッシュに保存する。
  const state = retrivePrivate(userID);
  //フォロー時に返事をする。
  if (typeof replyToken === 'undefined' || followExp.test(lineType)) {
    if (lineType === 'follow') {
      const message = 'followしてくださりありがとうございます。\n本アカウントはBotとなっております。\nユーザによっては本機能の一部しかお使いになられませんのでご了承ください。詳しくは管理者にお問い合わせください。\nまた、このbotに生じる責任は、すべて自己責任となっております。同意いただけない場合は、ご利用頂けませんのでご了承ください。';
      replyChatprivate(replyToken, message);
    }
    return;
  }

  //play_a_park(userID);//利用する場合は、コメントアウトを外す。

  // replyChatprivate(replyToken,"a");
  if (state === null) {
    if (userMessage === '予定の追加') {
      const message = '開始日付を教えてください！\n形式は：「1/23」「1月23日」\n上記の形式に従いご入力ください。\nキャンセルされる場合は「やめる」と入力してください。';
      replyChatprivate(replyToken, message);
      resisterPrivate(userID, 0);
    } else if (userMessage === 'グループに投稿') {
      end = isValid(userID, replyToken);
    } else {
      replyChatprivate(replyToken, '予定の追加\nグループに投稿\nのいずれかの機能しかございません。予定の追加\nグループに投稿\のどちらかをお選びください');
    }
  } else {
    if (noExp.test(userMessage)) {
      replyChatprivate(replyToken, 'キャンセルしました一つ前の質問にお答えください。');
      const statedata = retrivePrivate(userID) - 1;
      resisterPrivate(userID, statedata);
    }
    //キャッシュをすべて削除する。
    if (clearExp.test(userMessage)) {
      replyChatprivate(replyToken, "キャンセルしました。一からやり直してください。");
      cleardata(userID);
      return;
    }

    switch (state) {
      // 予定の日付
      case '0':
        const matched = userMessage.match(dateExp);
        if (matched != null) {
          const message = '次に開始時刻は？\n形式：「1:23」「12時」「12時34分」\nカレンダーへの登録をキャンセルする場合は、\n「キャンセル」,「やめる」と入力してください'
          replyChatprivate(replyToken, message);
          const date = matched[1] + "/" + matched[2];//キャッシュ容量削減のために一つにまとめて保存。
          resisterPrivate(userID, 1);
          const key1 = userID + 1;
          resisterPrivate(key1, date);
        } else {
          differentMessages(replyToken);
        }
        break;
      // 予定の開始時刻
      case '1':
        const matched1 = userMessage.match(hourMinExp);
        if (matched1 != null) {
          const message = '次に終了日付を教えてください！\n形式は：「1/23」「1月23日」\n上記の形式に従いご入力ください。\nキャンセルされる場合は「やめる」と入力してください。';
          replyChatprivate(replyToken, message);
          const date = matched1[1] + ":" + matched1[2];//キャッシュ容量削減のために一つにまとめて保存。
          resisterPrivate(userID, 2);
          const key2 = userID + 2;
          resisterPrivate(key2, date);
        } else {
          differentMessages(replyToken);
        }
        break;
      // 終了日付
      case '2':
        const matched2 = userMessage.match(dateExp);
        if (matched2 != null) {
          const message = '次に終了時刻を教えてください！\n形式指定：「1:23」「12時」「12時34分」\nキャンセルする場合は、\n「キャンセル」,「やめる」と入力してください';
          replyChatprivate(replyToken, message);
          const date = matched2[1] + "/" + matched2[2];//キャッシュ容量削減のために一つにまとめて保存。
          resisterPrivate(userID, 3);
          const key3 = userID + 3;
          resisterPrivate(key3, date);
        } else {
          differentMessages(replyToken);
        }
        break;
      // 予定の終了時刻
      case '3':
        const matched3 = userMessage.match(hourMinExp);
        if (matched3 != null) {
          const message = '次に予定の名前を教えてください！\nキャンセルする場合は、\n「キャンセル」,「やめる」と入力してください';
          replyChatprivate(replyToken, message);
          const date = matched3[1] + ":" + matched3[2];//キャッシュ容量削減のために一つにまとめて保存。
          resisterPrivate(userID, 4);
          const key4 = userID + 4;
          resisterPrivate(key4, date);
          errorMeaasege(retrivePrivate(key4))
        } else {
          differentMessages(replyToken);
        }
        break;
      // 予定の名前
      case '4':
        const year = new Date().getFullYear();
        const message = '西暦は' + year + '年でよろしいでしょうか？\よろしければ「y」を変更する場合は西暦を入力ください。\nキャンセルする場合は、「キャンセル」,「やめる」と入力してください';
        replyChatprivate(replyToken, message);
        resisterPrivate(userID, 5);
        const key5 = userID + 5;
        resisterPrivate(key5, userMessage);
        break;
      // 予定の確認
      case '5':
        const matched4 = userMessage.match(yearExp);
        if (yesExp.test(userMessage)) {
          const notchange = null;
          const [title, startDate, endDate] = createEventData(userID, notchange);
          const message = '\nで間違いないでしょうか？\よろしければ「y」を入力してください。\nキャンセルする場合は、\n「キャンセル」,「やめる」と入力してください';
          replyChatprivate(replyToken, JapanTime_title(title, startDate, endDate) + message);
          resisterPrivate(userID, 6);
        } else if (matched4 != null) {
          const notchange = 1;
          const [title, startDate, endDate] = createEventData(userID, notchange);
          const message = '\nで間違いないでしょうか？\よろしければ「y」を入力してください。\nキャンセルする場合は、\n「キャンセル」,「やめる」と入力してください';
          const key6 = userID + 6;
          resisterPrivate(key6, matched4[1]);
          replyChatprivate(replyToken, JapanTime_title(title, startDate, endDate) + message);
          resisterPrivate(userID, 7);
        } else {
          differentMessages(replyToken);
        }
        break;
      //実行(notchange = nul) case '5'の時にnotchange = nullで実行された場合こちらで実行。
      case '6':
        const notchange = null;
        storeCalender(userMessage, notchange, replyToken, userID);
        break;
      //実行(notchange = 1)  case '5'の時にnotchange = 1で実行された場合こちらで実行。
      case '7':
        const notchange1 = 1;
        storeCalender(userMessage, notchange1, replyToken, userID);
        break;
      // 匿名でグループに投稿する内容
      case '10':
        const numberExp = /[0-9]{1,2}/;
        const matchmessage = userMessage.match(numberExp);
        if (matchmessage == null) {
          const message = "正しく入力されていません。\nもう一度入力してください。\nグループに投稿をやめる場合は「キャンセル」と入力してください。";
          replyChatprivate(replyToken, message);
        } else {
          const GroupID = chooseGroup(userID, matchmessage[0]);
          replymessage = retriveGroup(GroupID);
          replyChatprivate(replyToken, replymessage + '\nで間違いないでしょうか？よろしければ「y」を、異なる場合は「n」と入力してください！\nグループに投稿をやめる場合は「キャンセル」と入力してください。');
          resisterPrivate(userID, 11);
          const key1 = userID + 1;
          resisterPrivate(key1, replymessage);//送信するルームを登録する。
        }
        break;
      // グループに投稿する内容の確認
      case '11':
        if (yesExp.test(userMessage)) {
          const message = "グループに投稿する内容を教えてください。\nグループに投稿をやめる場合は「キャンセル」と入力してください。"
          replyChatprivate(replyToken, message);
          resisterPrivate(userID, 12);
        } else {
          const message = "正しく入力されていません。\nもう一度入力してください。\nグループに投稿をやめる場合は「キャンセル」と入力してください。"
          replyChatprivate(replyToken, message);
          deletecache()
        }
        break;
      case '12':
        const message1 = userMessage + "\nで間違いないでしょうか？よろしければ「y」を、異なる場合は「n」と入力してください！\nグループに投稿をやめる場合は「キャンセル」と入力してください。"
        replyChatprivate(replyToken, message1);
        const key2 = userID + 2;
        resisterPrivate(key2, userMessage);//送信するdataを登録する
        resisterPrivate(userID, 13);
        break;
      case '13':
        if (yesExp.test(userMessage)) {
          const key1 = userID + 1;
          const key2 = userID + 2;
          const room = retrivePrivate(key1);//グループIDを格納
          const messagedata = retrivePrivate(key2);//送信するデータを取り出す。
          replyChatGroup(messagedata, room);
        } else if (noExp.test(userMessage)) {
          replyChatprivate(replyToken, 'グループに投稿しませんでした。');
          cleardata(userID);
        } else {
          if (countNotexsitAno < 5) {
            replyChatprivate(replyToken, userMessage + '/nは選択肢にございません。よろしければ「y」を、やめる場合は「n」と入力してください！');
            countNotexsitAno += 1;
            const count = userID + 0;
            resisterPrivate(userID, count);
            break;
          } else {
            replyChatprivate(replyToken, '強制終了いたします。');
            cleardata(userID);
          }
        }
        break;
    }
  }
  getUserName(userID);
  if (Groupid != undefined) {
    getUsersinfo(Groupid);
  }
}

//入力を求められた値と異なる値を入力した場合に使用する。
function differentMessages(replyToken) {
  const message = '値の入力が正しくありません。\nカレンダーへの登録をキャンセルする場合は、\n「キャンセル」,「やめる」と入力してください';
  replyChatprivate(replyToken, message);
}

//カレンダーに予定を追加する。
//カレンダーに追加できない人は、URLを生成して、クリックで登録できるようになっている。
function storeCalender(userMessage, notchange, replyToken, userID) {
  //デバック用//errorMeaasege("突入");
  if (yesExp.test(userMessage)) {
    //デバック用//errorMeaasege("突入");
    const targetIDExp = /xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/;//xxxを変更することで、他人に自分のカレンダに登録できないようにする。
    if (targetIDExp.test(userID)) {
      //デバック用//errorMeaasege("突入");
      const [title, startDate, endDate] = createEventData(userID, notchange);
      errorMeaasege(endDate);
      CalendarApp.getCalendarById(CALENDER_ID).createEvent(title, startDate, endDate);
      const message = "予定を追加しました";
      replyChatprivate(replyToken, message);
      cleardata(userID);
    } else {
      const [title, startDate, endDate] = createEventData(userID, notchange);
      errorMeaasege(title);
      const startDATE = exchangeTIME(startDate);
      errorMeaasege(startDATE);
      const endDATE = exchangeTIME(endDate);
      const url = generateURL(title, startDATE, endDATE);
      replyChatprivate(replyToken, url);
      cleardata(userID);
    }
  } else {
    differentMessages(replyToken);
  }
}

//googleカレンダーのURLを発行する為に書式を変える。
function exchangeTIME(startDate) {
  errorMeaasege(startDate);
  const startDATE =
    //文字列化しないといけない為、0を足して変形（0を足す必要がないことに途中で気づいたが、速度に問題を感じないため放置）
    startDate.getFullYear() + ("0" + (startDate.getMonth() + 1)).slice(-2) +
    ("0" + startDate.getDate()).slice(-2) + 'T' + ("0" + startDate.getHours()).slice(-2) +
    ("0" + startDate.getMinutes()).slice(-2) + ("0" + startDate.getSeconds()).slice(-2);

  return startDATE;
}

// 追加する予定の日付、開始時刻、終了時刻、名前の作成・保管
function createEventData(userID, notchange) {

  let year = new Date().getFullYear();

  if (notchange != null) {
    year = retrivePrivate(userID + 6);
  }

  const setDate1 = year + "/" + retrivePrivate(userID + 1) + " " + retrivePrivate(userID + 2);
  const setDate2 = year + "/" + retrivePrivate(userID + 3) + " " + retrivePrivate(userID + 4);
  errorMeaasege(setDate1);
  errorMeaasege(setDate2);
  const startDate = new Date(setDate1);
  const endDate = new Date(setDate2);
  const title = retrivePrivate(userID + 5);
  return [title, startDate, endDate];
}

// Japan Standard Time(JST)
//時間の変換を行う
function transformJSTtime(time) {
  return Utilities.formatDate(time, 'JST', 'yyyy年M月d日 H時m分');//timeを日本時刻に変換する（xx時yy分ss秒）
}

function JapanTime_title(title, startDate, endDate) {
  const start = transformJSTtime(startDate);
  const end = transformJSTtime(endDate);
  const str = title + ':/n' + start + ' ~ ' + end;
  return str;
}

//goolge calendarに登録できるURLを生成する。
//今回は、description,placeは聞き取りを行っていない為、空欄となっている。
function generateURL(title, start_date, end_date) {
  //   "start_date": start_date,  //20201010T1530xx ←2020年10月10日15時30分xx秒
  //   "end_date": end_date       //20201210T153000 ←2020年12月10日15時30分00秒
  //    + "&details=" + description
  //    + "&location=" + place
  const url =
    "http://www.google.com/calendar/event?"
    + "action=TEMPLATE"
    + "&text=" + title
    + "&dates=" + start_date + "/" + end_date;

  return url;
}

//個人チャット用:返信(グループから来たメッセージもこちらから返信する。)
function replyChatprivate(replyToken, message) {
  const line_endpoint = 'https://api.line.me/v2/bot/message/reply';

  const headers = {
    'Content-type': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
  };
  const payloadArgument = {
    'replyToken': replyToken,
    'messages': [{
      'type': 'text',
      'text': message,
    }],
  };
  const payload = JSON.stringify(payloadArgument);
  const options = {
    'method': 'post',
    'headers': headers,
    'payload': payload,
  };
  const urlfetch = UrlFetchApp.fetch(line_endpoint, options);
}

//グループ内のメンバーを保管するためのプログラム。
function getUsersinfo(Groupid) {
  const line_endpoint = "https://api.line.me/v2/bot/group/" + Groupid + "/members/ids";
  const options = {
    "method": "get",
    "headers": {
      'Content-type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer' + CHANNEL_ACCESS_TOKEN,
    }
  };
  const ans = UrlFetchApp.fetch(line_endpoint, options);
  const memberIds = JSON.parse(ans).memberIds;
  resisterGroup(memberIds, Groupid);
}

//userの名前を入手する為のプログラム。
function getUserName(userID) {
  const line_endpoint = "https://api.line.me/v2/profile" + '/' + userID;
  const options = {
    "method": "get",
    "headers": {
      'Content-type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer' + CHANNEL_ACCESS_TOKEN,
    }
  };
  const ans = UrlFetchApp.fetch(line_endpoint, options);
  const userName = JSON.parse(ans).displayName;
  resisterTospreadsheet(userID, userName);
}

//プッシュメッセージを送信する。
//free planではできない。
function Chatpush(userID, message) {
  const line_endpoint = 'https://api.line.me/v2/bot/message/push';

  const headers = {
    'Content-type': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
  };
  const payloadArgument = {
    "to": userID,
    'messages': [{
      'type': 'text',
      'text': message,
    }],
  };
  const payload = JSON.stringify(payloadArgument);
  const options = {
    'method': 'post',
    'headers': headers,
    'payload': payload,
  };
  const urlfetch = UrlFetchApp.fetch(line_endpoint, options);
}

//グルーブチャット用:返信
function replyChatGroup(body, GroupID) {
  const line_endpoint = 'https://api.line.me/v2/bot/message/Pull';

  const headers = {
    'Content-type': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
  };
  const payloadArgument = {
    'to': GroupID,
    'messages': [{
      'type': 'text',
      'text': body,
    }],
  };
  const payload = JSON.stringify(payloadArgument);
  const options = {
    'method': 'post',
    'headers': headers,
    'payload': payload,
  };
  UrlFetchApp.fetch(line_endpoint, options);
}

//明日の予定
//(scriptの実行者、scrippt実行者に対して自身のカレンダーへのアクセスを認めている場合、他のアカウントでも利用可能)
//今回は、scriptの実行者が一人である為、私のtalkに自分の予定を通知する仕様
//また、pushメッセージはfree planではできないため、自分一人に明日の予定を通知する場合は、自分一人だけのグループを作成しておく必要がある。
function getEvents() {
  const date = new Date();
  date.setDate(date.getDate() + 1);//dateを設定する（google calendarに入れる値は明日なので1を足す）
  const events = CalendarApp.getCalendarById(calendar_id).getEventsForDay(date);

  if (events.length !== 0) {
    const message = '明日の予定\n';
    events.forEach(function (event) {
      const title = event.getTitle();
      const start = transformJST(event.getStartTime());
      const end = transformJST(event.getEndTime());
      body += title + ': ' + '\n' + start + ' ~ ' + end + '\n' + 'だ！';
    });
  } else {
    const message = '明日の予定はgoogle calenderには登録されていません。\n'
  }
  const GroupID = xxxx;//ここの設定を変更することで、送信先を変更できる
  replyChatGroup(body, GroupID);
}

//spreadsheetにユーザ名とIDをためておくプログラム。
function resisterTospreadsheet(userID, userName) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.lastRow();
  const firstcolum = sheet.getRange(2, 1, lastRow).getValues();
  const firstcolumflat = firstcolum.flat();
  const hasID = firstcolumflat.includes(userID);
  if (hasID);
  else {
    sheet.appendRow([userID, userName]);
  }
}

function errorMeaasege(data) {
  const sheet1 = SpreadsheetApp.openById('1iy6XwuhsZIaBkOVuXslwbpmnmrN9SbBK_3UtYh-6hZg');
  const sheet = sheet1.getActiveSheet();
  const date = new Date();
  sheet.appendRow([date, data]);
}

//キャッシュに状態を保存する。
//状態；次の処理を定める
function resisterPrivate(userID, state) {
  const cache = CacheService.getScriptCache();
  cache.put(userID, state, 21600); //21600 seconds (6 hours)chashが保たれる
}

//プロパティにグループの所属情報を保管する。
function resisterGroup(memberIds, GroupID) {
  const scriptProperties = PropertiesService.getScriptProperties();
  for (let i = 0; i < memberIds.length; i++) {
    const value = retriveGroup(memberIds[i]);
    if (value == null) {
      scriptProperties.setProperty(memberIds[i], GroupID);
    } else {
      const valueExp = "/" + value + "/"
      if (value.match(valueExp) == null) {
        const values = value + "," + GroupID;
        scriptProperties.setProperty(memberIds[i], values);
      }
    }
  }
}

//今のstateの状態を返す。
function retrivePrivate(userID) {
  const cache = CacheService.getScriptCache();
  const state = cache.get(userID);
  return state;
}

//所属しているグループを引き出す。orグループ名を取り出す。(GroupIDを引数として渡す。)
function retriveGroup(userID) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const value = scriptProperties.getProperty(userID);
  return value;
}

//プロパティを削除する
function deleteProperty(key) {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.deleteProperty(key)
}

//キャッシュを削除する。
function deletecache(key) {
  const cache = CacheService.getScriptCache();
  cache.remove(key);
}

//userIDに紐づいているデータをすべて破棄する。
function cleardata(userID) {
  const keys = [userID];
  for (let i = 0; i < 6; i++) {
    keys.push(userID + i);
    deletecache(keys[i]);
  }
}

//許可された者だけが投稿機能を使えるようにする。
function isValid(userID, replyToken) {
  const GroupID = retriveGroup(userID);
  let message;

  if (GroupID == null) {
    message = 'あなたは、グループに投稿する機能を利用することは出来ません。ご利用には管理者の許可が必要です。詳しくは、管理者にお尋ねください。';
    replyChatprivate(replyToken, message);
    return;
  }

  replyChatprivate(replyToken, "a");
  const result = GroupID.split(',');
  for (let i = 0; i < result.length; i++) {
    const name = retriveGroup(result[i]);
    if (name != null) {
      message += i + '.' + name + '\n';
    }
  }

  message += '上記の番号の内一つを選択してください。\n「1」,「2」のように数字を単独で入力ください。'
  replyChatprivate(replyToken, message);
  resisterPrivate(userID, 10);
}

//グループIDを取り出して、該当する値を返す。
function chooseGroup(userID, message) {
  const GroupID = retriveGroup(userID);
  const result = GroupID.split(',');
  const number = Number(message);
  const id = result[number];
  return id;
}

/*
手動で動かす
グループ名の取得を出来ない為にグループIDと紐づけすることができない
手動で動かすことにより、自分が知らないグループ下では、グループに投稿機能を制限することもできる。
*/
function munual() {
  const groupName = xxxx;//グループ名をxxxxに記入
  const GroupID = xxxx;//グループIDをxxxxに記入
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty(GroupID, groupName);
}

//特定のユーザに向かってxxを行う。
function play_a_park(userID) {

  //xxxに対象となるユーザのuserIDを貼り付ける。
  //ID =xxx,yyyのように2人以上の場合、data = "xxxyyy"シームレスで問題ない
  const data = "xxx";
  const userIDExp = "/" + userID + "/";
  const instantdata = data.match(userIDExp);
  if (instantdata != null) {
    random = Math.floor(Math.random() * 100);
    if (random > 98) {
      //実行したい命令を書く
    } else if (random > 50) {
      //実行したい命令を書く
    } else {
      //実行したい命令を書く
    }
  }
}
