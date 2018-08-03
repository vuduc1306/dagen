var app   = require('express')();
var http  = require('http').Server(app);
var io    = require('socket.io')(http);
var redis = require('redis');
io.on('connection', function(socket){
    console.log('a user connected');
    console.log(socket.id);

    var redisClient = redis.createClient();
    
    redisClient.subscribe('store_order');
    redisClient.on('message', function(channel, value){
        console.log('new message in queue', channel, value);
        switch(channel){
            case "store_order":
                var store_id = JSON.parse(value).storeid;
                socket.emit('order_store_' + store_id, value);
                console.log(store_id);
                break;
        }
    });

    // redisClient.subscribe('order');
    // redisClient.on('order', function(channel, message){
    //    console.log('new message in queue', channel, message);
    //    socket.emit(channel, message);
    // });
    socket.on('store', function(data){
        console.log("Lắng nghe cửa hàng: " + data);
        redisClient.subscribe('order_store_' + data);
    });
    socket.on('disconnect', function(){
        redisClient.quit();
        console.log('user disconnected');
    });
});
http.listen(3000, function(){
    console.log('listening on *:3000');
});