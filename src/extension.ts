// strictモードの宣言
// コード内のエラー判定が厳しくなり、あいまいなコードに制限がかかる
'use strict';

// VSCodeのモジュールをインポート。
import * as vscode from 'vscode';

// 拡張機能を作成するときには、「activate」関数をexportする必要があります。
// ロード時に一度だけ呼ばれます。
export function activate(context: vscode.ExtensionContext) {

    // コンソール出力
    console.log('Congratulations, your extension "helloworld" is now active!');

    // vscodeモジュールのcommands.registerCommandの呼び出し
    // commandは、「extension.sayHellow」で、実行時には、
    // 「（） => 」引数なしで呼び出され、「vscode.window.showInformationMessage('Hello World!');」が実行されます。
    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
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
            let lines = text.split(/\r\n|\r|\n/); //改行区切り

            let yaml = "";
            let oldparams = [""];
            for (let line of lines) {
                let space = "";
                let matchFlag = false;
                let arrayFlag = false;
                let sides = line.split("=");
                for (let i = 2; i < sides.length; i++) { //値に「=」が設定されている場合の応急処置
                    sides[1] += "=" + sides[i];
                }
                let params = sides[0].split(".");

                for (let i = 0; i < params.length; i++) {
                    if (params[i].match(/\[[0-9]+\]$/)) { //配列の場合
                        params[i].replace(/\[[0-9]+\]$/, "");
                        arrayFlag = true;
                    }
                    if (oldparams[i] !== params[i]) { //設定値名が一致していないなら移行の項目は出力する
                        matchFlag = true;
                    }
                    if (matchFlag === true) {
                        let yamlLine = "";
                        yamlLine += space;
                        yamlLine += params[i];

                        if (i === params.length - 1) { //最終パラメータ
                            //console.log(yamlLine + ": " + sides[1]);
                            yaml += yamlLine + ": " + sides[1] + "\n";
                        } else { //最終パラメータ
                            //console.log(yamlLine + ": ");
                            yaml += yamlLine + ": " + "\n";
                        }
                    }
                    space += "  "; //次行のスペースを設定
                }
                oldparams = params; //1行前の情報を保持する
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