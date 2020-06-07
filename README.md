# Google-Apps-Script-line-bot-simple-version

# 特徴
管理者は、自身のgoolgeカレンダーに予定の追加をでき、他のユーザはgoolgeカレンダーに予定を追加できるURLを生成出来る。
また、管理者が許可したグループの特定のメンバーにだけ、botが代行でchatをできる。
明日の予定をbotがつぶやいてくれる（無料アカウントではグループにしかつぶやけない）

# 機能  
* 排他制御を付け、Line　botに複数人が同時に話しかけても干渉が起きないようにした。 
- line固有のIDと次に行う処理キャッシュで保存し、干渉が起きないようにした。 
* botがグループにchatするするには、管理者の許可が必要にし、悪用を未然に防げるようにした。   
（現状のbotの機能のままだと、不必要にbotが反応する仕様であるため、gruopIdが存在するかどうかで反応の仕方を変える必要がある）

* 年を跨ぐイベントはないこと（自分的に問題がないため）    
* 一連の流れ（カレンダ、投稿）の間、ユーザからの返信は6時間以内に来ること    
-　キャッシュを保てない為   
* cacheは100kBまでに収まること   
* Properties value sizeが9kB以内,かつProperties total storageが500kB以内であること
* lineのメッセージ送信が1000通以内（free　plan）
* プロパティの読み書きが50,000 / 日or　500,000 / 日（G　Suite）
* 全員がLINEバージョン7.4.x以上を利用していること
* lineアカウントは承認済みであること
* グループの最大ユーザ数は、100人であること（注）

を前提条件とする。
（注）100人を超えた場合は、「next」が配列で渡される
「memberIds」と同様に関数に渡せばよい



##参考文献  
こちらをベースとして作成させて頂きました。  
[Messaging APIとGASを使ったLINE Botでグループチャットの活発化](https://qiita.com/MxShun/items/7a563a795d41cdc0f1dc)    
[Google Apps Script](https://developers.google.com/apps-script)   
[line Developers](https://developers.line.biz/ja/docs/)   
[Googleカレンダーに追加するURLリンクを自動生成してくれるツール](http://webasterisk.sakura.ne.jp/wp/googlecalendar_eventbuttonsgenerator/)   
