const tf = require('@tensorflow/tfjs-node-gpu');
const fs = require('fs');
var readline = require('readline');
var trainData = JSON.parse(fs.readFileSync('trainData.json'));

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});


var load = tf.loadLayersModel('file:///Users/user/Documents/GitHub/GurumCoinAi/my-model-1/model.json').then((result)=> {

    rl.question('인풋 데이터 시작 행(엑셀 차트 기준): ', (answer) => {
        prediction(Number(answer), result);
        rl.close();
    });


})


var prediction = function (a, model) {
    let result = [];
    a -= 2;
    for (let d = 0; d < 100; d++) {
        result.push([
            ((trainData[(d + a + 1)][0] - trainData[(d + a)][0]) / trainData[(d + a)][0]) * 100,
            ((trainData[(d + a + 1)][1] - trainData[(d + a)][1]) / trainData[(d + a)][1]) * 100,
            ((trainData[(d + a + 1)][2] - trainData[(d + a)][2]) / trainData[(d + a)][2]) * 100,
            ((trainData[(d + a + 1)][3] - trainData[(d + a)][3]) / trainData[(d + a)][3]) * 100,
            ((trainData[(d + a + 1)][4] - trainData[(d + a)][4]) / trainData[(d + a)][4]) * 100,
            ((trainData[(d + a + 1)][5] - trainData[(d + a)][5]) / trainData[(d + a)][5]) * 100,
            ((trainData[(d + a + 1)][6] - trainData[(d + a)][6]) / trainData[(d + a)][6]) * 100
        ]);
    }
    console.log('마지막 값: ' + trainData[(100 + a)])

    let val = tf.tensor([result]);
    let predict = model.predict(val);
    console.log(predict.arraySync());
    let lastValue = trainData[(100 + a)][0];
    console.log(lastValue);
    let predictResult = [];
    predict.arraySync()[0].forEach(e => {
        predictResult.push(lastValue * (e + 100) / 100);
        lastValue = lastValue + e;
    });

    console.log(predictResult);
}

