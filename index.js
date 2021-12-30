const tf = require('@tensorflow/tfjs-node-gpu');
const fs = require('fs');


var trainData = JSON.parse(fs.readFileSync('trainData.json'));

var x_raw = [];
var y_raw = [];
var seq = shuffle(Array.from(Array(1398).keys()))
for(let i = 0; i < 1398; i++){

    //let rand = getRandomInt(0, trainData.length - 2791);
    let rand = seq[i];
    let result = [];
    console.log('rand:' + rand + ', ' + (rand + 110));
    for(let d = 0; d < 100; d++){
        result.push([
            ((trainData[(d+rand+1)][0] - trainData[(d+rand)][0]) / trainData[(d+rand)][0]) * 100,
            ((trainData[(d+rand+1)][1] - trainData[(d+rand)][1]) / trainData[(d+rand)][1]) * 100,
            ((trainData[(d+rand+1)][2] - trainData[(d+rand)][2]) / trainData[(d+rand)][2]) * 100,
            ((trainData[(d+rand+1)][3] - trainData[(d+rand)][3]) / trainData[(d+rand)][3]) * 100,
            ((trainData[(d+rand+1)][4] - trainData[(d+rand)][4]) / trainData[(d+rand)][4]) * 100,
            ((trainData[(d+rand+1)][5] - trainData[(d+rand)][5]) / trainData[(d+rand)][5]) * 100,
            ((trainData[(d+rand+1)][6] - trainData[(d+rand)][6]) / trainData[(d+rand)][6]) * 100
        ]);
    }
    x_raw.push(result);
    console.log(result);
    result = [];
    for(let d = 100; d < 110; d++){
        result.push(((trainData[(d+rand+1)][0] - trainData[(d+rand)][0]) / trainData[(d+rand)][0]) * 100);
    }
    y_raw.push(result);
    console.log(result+'\n');
}


console.log(x_raw.length + ', ' + y_raw.length);

var x = tf.tensor(x_raw);
var y = tf.tensor(y_raw);
const inputMax = x.max()
const inputMin = x.min()
const labelMax = y.max()
const labelMin = y.min()

const normalizedInputs = x
    .sub(inputMin)
    .div(inputMax.sub(inputMin));
const normalizedLabels = y
    .sub(labelMin)
    .div(labelMax.sub(labelMin));


console.log(x.shape +'\n'+ y.shape);


console.log(x.shape+', '+y.shape);
//var model = tf.sequential()
var model = tf.loadLayersModel('file:///Users/user/Documents/GitHub/GurumCoinAi/my-model-1/model.json').then(model =>{



/*model.add(tf.layers.lstm({
    units:700,
    inputShape:[x.shape[1],x.shape[2]],
    returnSequences:true
}));
model.add(tf.layers.lstm({
    units:700,
    returnSequences:false
}));
model.add(tf.layers.dropout(0.25));
model.add(tf.layers.dense({
    units:10
}));*/

    model.summary();
    model.compile({loss: tf.losses.meanSquaredError, optimizer: tf.train.adam()});
    model.fit(x, y, {
        epochs: 10000,
        batchSize: 128,
        callbacks: {
            onEpochEnd: async (epoch, logs) => {

                if(epoch % 10 == 0){
                    const saveResult = model.save('file:///Users/user/Documents/GitHub/GurumCoinAi/my-model-1');
                    console.log('모델 저장됨');
                }
                console.log('epoch', epoch, logs);
                let result = [];
                let a = 1398;
                for(let d = 0; d < 100; d++){
                    result.push([
                        ((trainData[(d+a+1)][0] - trainData[(d+a)][0]) / trainData[(d+a)][0]) * 100,
                        ((trainData[(d+a+1)][1] - trainData[(d+a)][1]) / trainData[(d+a)][1]) * 100,
                        ((trainData[(d+a+1)][2] - trainData[(d+a)][2]) / trainData[(d+a)][2]) * 100,
                        ((trainData[(d+a+1)][3] - trainData[(d+a)][3]) / trainData[(d+a)][3]) * 100,
                        ((trainData[(d+a+1)][4] - trainData[(d+a)][4]) / trainData[(d+a)][4]) * 100,
                        ((trainData[(d+a+1)][5] - trainData[(d+a)][5]) / trainData[(d+a)][5]) * 100,
                        ((trainData[(d+a+1)][6] - trainData[(d+a)][6]) / trainData[(d+a)][6]) * 100
                    ]);
                }
                console.log('마지막 값: '+trainData[(100+a)])

                let val = tf.tensor([result]);
                const normalizedInputs = val
                    .sub(inputMin)
                    .div(inputMax.sub(inputMin));
                let predict = model.predict(val);
                const unNormPreds = predict.mul(labelMax.sub(labelMin)).add(labelMin)
                console.log(predict.arraySync());
                let lastValue = trainData[(100+a)][0];
                let predictResult = [];
                predict.arraySync()[0].forEach(e =>{
                    predictResult.push(lastValue * (e + 100) / 100);
                    lastValue = lastValue + e;
                });

                fs.writeFileSync('result.txt', JSON.stringify(predictResult));
            }
        }
    }).then((results) => {
        const saveResult = model.save('file:///Users/user/Documents/GitHub/GurumCoinAi/my-model-1');
    });

});


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}