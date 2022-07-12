'use strict';
const $stage = document.getElementById('stage');
const $squareTemplate = document.getElementById('square-template');
const stoneStateList = [];

let currentColor = 1;
const currentTurnText = document.getElementById('current-turn');
const passButton = document.getElementById('pass');

const changeTurn = function() {
    currentColor = 3-currentColor;

    if(currentColor===1) {
        currentTurnText.textContent = '黒';
    }else{
        currentTurnText.textContent = '白';
    }
}

const getReversibleStones = function(idx) {
    const squareNums = [
        // 上
        (idx-(idx%8))/8,
        // 右上
        Math.min((idx-(idx%8))/8,7-idx%8),
        // 右
        7-idx%8,
        // 右下
        Math.min(7-(idx-(idx%8))/8,7-idx%8),
        // 下
        7-(idx-(idx%8))/8,
        // 左下
        Math.min(idx%8,7-idx%8),
        // 左
        idx%8,
        // 左上
        Math.min((idx-(idx%8))/8,idx%8)
    ] 

    // for文ループの規則を定めるためのパラメータ定義
    const parameters = [-8,-7,1,9,8,7,-1,-9];

    // ひっくり返せることが確定した石の情報をいれる
    let results = [];

    // 8方向への走査のためのfor
    for(let i = 0; i<8; i++) {
        // ひっくり返せる可能性がある石の情報を入れる配列
        const box = [];
            // 現在調べている方向にいくつマスがあるか
        const squareNum = squareNums[i];
        const param = parameters[i];
        // 一つ隣の石の状態
        const nextStoneState = stoneStateList[idx + param]
        // 隣に石があるか　及び　隣の石が相手の色か　->　どちらでもない場合ループへ
        if(nextStoneState === 0 || nextStoneState === currentColor) continue;
        box.push(idx + param);
        for(let j = 0; j<squareNum-1; j++) {
            const targetIdx = idx + param*2+param*j;
            const targetColor = stoneStateList[targetIdx];
            // さらに隣に石があるか->なければ次のループ
            if(targetColor===0) continue;
            // さらに隣にある石が相手の色か
            if(targetColor===currentColor) {
                // 自分の色なら仮ボックスの石がひっくり返せることが確定
                results = results.concat(box);
                break
            }else{
                // 相手の色なら仮ボックスにその石の番号を格納
                box.push(targetIdx);
            }
        }
    }
    // ひっくり返せると確定した石の番号を戻り値にする
    return results;
};
const onClickSquare = function (index) {
    // ひっくり返せる石の数を取得
    const reversibleStones = getReversibleStones(index);

    if(stoneStateList[index]!==0) {
        alert('ここには置けねえよ馬鹿が考えろ');
        return;
    }

    // 自分の石を置く
    stoneStateList[index] = currentColor;
    document
    .querySelector(`[data-index='${index}']`)
    .setAttribute('data-state', currentColor);

    // 相手の石をひっくり返えす
    reversibleStones.forEach(function(key) {
        stoneStateList[key] = currentColor;
        document.querySelector(`[data-index='${key}']`).setAttribute('data-state',currentColor);
    });

    // もし盤面がいっぱいなら集計してゲームを終了する
    if(stoneStateList.every((state) => state !== 0)) {
        const blackStonesNum = stoneStateList.filter(state => state === 1).length;
        const whiteStonesNum = 64-blackStonesNum;

        let winnerText = '';
        if(blackStonesNum>whiteStonesNum) {
            winnerText = '黒の勝ちです';
        }else if (blackStonesNum<whiteStonesNum){
            winnerText = '白の勝ちです';
        }else {
            winnerText ='引き分けです';
        }
        alert('ゲーム終了です。白${whiteStonesNum}、黒${blackStonesNum}で、${winnerText}')
    }

    // ゲーム続行なら相手のターン
    changeTurn();
};
const createSquares = () => {
    for (let i = 0; i<64; i++) {
        const square = $squareTemplate.cloneNode(true);//テンプレートから要素をクローン
        square.removeAttribute('id');//テンプレート用のid属性を削除
        $stage.appendChild(square);//マス目のHTML要素を盤に追加

        const $stone = square.querySelector('.stone');
        let defaultState;
        //iの値によってデフォルトの石の状態を分岐する
        if(i == 27 || i == 36) {
            defaultState = 1;
        }else if(i == 28 || i == 35) {
            defaultState = 2;
        }else{
            defaultState = 0;
        }

        $stone.setAttribute("data-state", defaultState);

        $stone.setAttribute("data-index",i); //インデックス番号をHTML要素に保持させる
        stoneStateList.push(defaultState);//初期値を配列に格納

        square.addEventListener('click', () => {
            onClickSquare(i);
        })
    }


};

window.onload = function() {
    createSquares();

    passButton.addEventListener('click', changeTurn);
};