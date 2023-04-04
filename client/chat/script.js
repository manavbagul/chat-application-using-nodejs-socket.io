var socket = io({
    transport: ["websocket","pooling"],
    // autoConnect: false
});

const myname =  getReq('/whoami');
var  friendname = "";
var MSG_DB = JSON.parse(getReq('/messages'));

$('#send_message').on('click', function(){
    if($('#message').val())
        send_message();
})

$('#message').keypress(function (e) {
    var key = e.which;
    if(key == 13)  // the enter key code
     {
       $('#send_message').click();
     }
});   

function send_message(){
    l('send_message '); 
    l({friendname: friendname, message: $('#message').val()});
    
    socket.emit('send_message',{friendname: friendname, message: $('#message').val()});
    
    $('#message').val('');

    $('#message').prop('value','');
}

function messages(typeofdata,message){
    
    if(typeofdata == 'array'){
        if(message){        
            l('array ');l(message);
            message.forEach(chat => {
                if(chat.sender == myname)
                    sender(chat.message)
                else{
                    friendname = chat.sender;
                    receiver(chat.message)
                }
            });
        }
    }   
    else if(typeofdata == 'object')
        if(message){
            l('Object 12');l(message);
            
            if(message.sender == myname)
                sender(message.message)
            else{
                receiver(message.message)
            }
        };
        l('message 3454');l(message);
    $('.msg_card_body').scrollTop($('.msg_card_body').prop('scrollHeight'));
}

socket.on('receive_message', function(raw) {
    l('array 6345');
    l(raw);
    messages('object',raw);
    console.log('Received message:', raw.message);
});

function sender(msg) {
    $('.msg_card_body').append(`<div class="d-flex justify-content-end mb-4">    <div class="msg_cotainer_send">${msg}</div></div>`)    
}

function receiver(msg) {
    $('.msg_card_body').append(`<div class="d-flex justify-content-start mb-4"><div class="msg_cotainer">${msg}</div></div>`)
}

function getReq(url){
    let http = new XMLHttpRequest();
    http.open('get', url, false);
    http.send(null);
    return http.responseText;
}

$(document).ready(function(){
    messages('array', MSG_DB);
});

function l(msg){
    console.log(msg);
}