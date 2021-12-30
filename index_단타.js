const tf = require('@tensorflow/tfjs-node-gpu');
const fs = require('fs');


var trainData = JSON.parse(fs.readFileSync('price.json'));

console.log('length: ' + trainData.price.length);
var x_raw = [];
var y_raw = [];
var seq = shuffle(Array.from(Array(trainData.price.length - 1 - 110).keys()))
for(let i = 0; i < trainData.price.length - 1 - 110; i++){

    //let rand = getRandomInt(0, trainData.length - 2791);
    let rand = seq[i];
    let result = [];
    console.log('rand:' + rand + ', ' + (rand + 110));
    for(let d = 0; d < 100; d++){
        result.push([0, trainData.price[(d+rand)]]);
    }
    x_raw.push(result);
    console.log(result);
    result = [];
    for(let d = 100; d < 110; d++){
        result.push(trainData.price[(d+rand)]);
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
var model = tf.sequential()
//var model = tf.loadLayersModel('file:///Users/user/Documents/GitHub/GurumCoinAi/my-model-1/model.json').then(model =>{



model.add(tf.layers.lstm({
    units:100,
    inputShape:[100, 2],
    returnSequences:false
}));
model.add(tf.layers.dropout(0.2));
model.add(tf.layers.dense({
    units:10
}));

    model.summary();
    model.compile({loss: tf.losses.meanSquaredError, optimizer: tf.train.adam()});
    model.fit(normalizedInputs, normalizedLabels, {
        epochs: 10000,
        batchSize: 64,
        callbacks: {
            onEpochEnd: async (epoch, logs) => {

                if(epoch % 10 == 0){
                    const saveResult = model.save('file:///Users/user/Documents/GitHub/GurumCoinAi/my-model-2');
                    console.log('모델 저장됨');
                }
                console.log('epoch', epoch, logs);
                let result = [];
                let a = trainData.price.length - 111;
                for(let d = 0; d < 100; d++){
                    result.push([0, trainData.price[(d+a)]])
                }
                console.log(result);
                let val = tf.tensor([result]);
                const normalizedInputs = val
                    .sub(inputMin)
                    .div(inputMax.sub(inputMin));
                let predict = model.predict(normalizedInputs);
                const unNormPreds = predict.mul(labelMax.sub(labelMin)).add(labelMin)
                fs.writeFileSync('result.txt', JSON.stringify(unNormPreds.arraySync()));
            }
        }
    }).then((results) => {
        const saveResult = model.save('file:///Users/user/Documents/GitHub/GurumCoinAi/my-model-2');
    });

//});


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