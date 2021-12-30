var WebsocketClient = require('websocket').client;
var fs = require('fs');

const D3Node = require('d3-node')
const d3n = new D3Node()

var client = new WebsocketClient();
var params = {
    type:"ticker",
    symbols: ["DOGE_KRW"],
    tickTypes: ["30M"]
}

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    let price = JSON.parse(fs.readFileSync('price.json'));
    console.log('WebSocket Client Connected');
    if(connection.connected){
        connection.sendUTF(JSON.stringify(params));
    }

    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            let parsed = JSON.parse(message.utf8Data);
            if(parsed.type === 'ticker'){
                console.log(parsed.content.time+' : '+parsed.content.openPrice);
                price.time.push(Number(parsed.content.time));
                price.price.push(Number(parsed.content.openPrice));
            }
        }
        fs.writeFileSync('price.json', JSON.stringify(price));
    });

});

client.connect('wss://pubwss.bithumb.com/pub/ws');