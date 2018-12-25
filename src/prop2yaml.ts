// strictモードの宣言
// コード内のエラー判定が厳しくなり、あいまいなコードに制限がかかる
'use strict';

// VSCodeのモジュールをインポート。
import * as vscode from 'vscode';

// 拡張機能を作成するときには、「activate」関数をexportする必要があります。
// ロード時に一度だけ呼ばれます。
export function activate(context: vscode.ExtensionContext) {

    // コンソール出力
    console.log('Congratulations, your extension "prop2yaml.convert" is now active!');

    // vscodeモジュールのcommands.registerCommandの呼び出し
    // commandは、「prop2yaml.convert」で、実行時には、
    // 「（） => 」引数なしで呼び出され、「vscode.window.showInformationMessage('Hello World!');」が実行されます。
    let disposable = vscode.commands.registerCommand('prop2yaml.convert', () => {
        let editor = vscode.window.activeTextEditor; // エディタ取得
        if (typeof (editor) !== "undefined") {
            let doc = editor.document;            // ドキュメント取得
            let cur_selection = editor.selection; // 選択範囲取得
            if (editor.selection.isEmpty) {
                // 選択範囲が空であれば全てを選択範囲にする
                let startPos = new vscode.Position(0, 0);
                let endPos = new vscode.Position(doc.lineCount - 1, 10000);
                cur_selection = new vscode.Selection(startPos, endPos);
            }

            /**
             * ここでテキストを加工します。
             **/
            let text = doc.getText(cur_selection); //取得されたテキスト
            let properties = text.split(/\r\n|\r|\n/); //改行区切り

            let yaml = ""; //加工後のyaml
            let oldparams = [""]; //1行前のproperties

            for (let propertie of properties) { //propertiesを1行ずつ回す
                if (propertie !== "") {
                    let space = ""; //keyの前につける[space]
                    let matchFlag = true; //key一致フラグ
                    let sides = propertie.split("="); //key,valueい分割する
                    for (let i = 2; i < sides.length; i++) { //valueに "=" が設定されている場合の応急処置
                        sides[1] += "=" + sides[i];
                    }

                    let params = sides[0].split("."); //keyを "." で分割する

                    //valueの先頭と末尾のスペースを除去する
                    sides[1] = sides[1].trim();

                    for (let i = 0; i < params.length; i++) {
                        //keyの先頭と末尾のスペースを除去する
                        params[i] = params[i].trim();

                        let new1 = params[i];
                        let new2 = params[i].replace(/\[[0-9]+\]$/, "[]");
                        let old1 = "";
                        let old2 = "";
                        if (typeof (oldparams[i]) !== "undefined") {
                            old1 = oldparams[i];
                            old2 = oldparams[i].replace(/\[[0-9]+\]$/, "[]");
                        }
                        if (old2 !== new2) { //keyが一致していないなら以降の項目は出力する
                            matchFlag = false;
                        }
                        // 2つ前以前にある配列の数だけ"__"を入れる
                        let space2 = "";
                        for (let j = 0; j <= i - 2; j++) { //2つ前以前にある配列の数だけ"  "を入れる
                            if (params[j].match(/\[[0-9]+\]$/)) { //配列の場合
                                space2 += "  ";
                            }
                        }
                        // 1つ前が配列なら"-_"か"  "を入れる
                        let space1 = "";
                        if (i !== 0) {
                            if (params[i - 1].match(/\[[0-9]+\]$/)) { //配列の場合
                                if (typeof (oldparams[i]) !== "undefined" && params[i - 1] === oldparams[i - 1]) {
                                    space1 += "  ";
                                } else {
                                    space1 += "- ";
                                }
                            }
                        }
                        if (matchFlag === false) {
                            // 配列の判定
                            if (params[i].match(/\[[0-9]+\]$/)) {
                                let replaceParams = params[i].replace(/\[[0-9]+\]$/, ""); //keyの[x]を消す
                                // 配列の場合
                                // 最終項目の判定
                                if (i === params.length - 1) {
                                    // 最終項目の場合
                                    yaml += space + space2 + space1 + replaceParams + ":" + "\n"
                                        + space + "  " + space2 + "- " + sides[1] + "\n";
                                } else {
                                    // 最終項目ではない場合
                                    yaml += space + space2 + space1 + replaceParams + ":" + "\n";
                                }
                            } else {
                                // 配列ではない場合
                                // 最終項目の判定
                                if (i === params.length - 1) {
                                    // 最終項目の場合
                                    yaml += space + space2 + space1 + params[i] + ":" + " " + sides[1] + "\n";
                                } else {
                                    // 最終項目ではない場合
                                    yaml += space + space2 + space1 + params[i] + ":" + "\n";
                                }
                            }
                        } else {
                            if (new2 === old2 && new1 !== old1) {
                                // 配列の判定
                                if (params[i].match(/\[[0-9]+\]$/)) {
                                    // 配列の場合
                                    // 最終項目の判定
                                    if (i === params.length - 1) {
                                        // 最終項目の場合
                                        yaml += space + "  " + space2 + "- " + sides[1] + "\n";
                                    } else {
                                        matchFlag = false;
                                    }
                                }
                            }
                        }
                        space += "  ";
                    }
                    oldparams = params; //1行前の情報を保持する
                }
            }
            //エディタ選択範囲にテキストを反映
            editor.edit(edit => {
                edit.replace(cur_selection, yaml);
            });
        }
    });

    // 拡張機能が使用されなくなったときに、リソース開放を行うための、設定。
    // 今回は、registerCommandの指定をを開放する必要があるので、開放対象に追加する。
    context.subscriptions.push(disposable);
}

// 拡張機能が非アクティブ化されたときに、実行されます。
export function deactivate() {
}