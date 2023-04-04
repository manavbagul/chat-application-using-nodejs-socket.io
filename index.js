const   express = require('express'),
        app = express(),
        server = require('http').createServer(app),
        bodyParser = require('body-parser');
        
const   flash = require('express-flash'),
        session = require('express-session'),
        passport = require('passport'),
        initializePassport = require('./custom/passportConfig'),        
        sessionMiddleware = session({ secret: "changeit", resave: false, saveUninitialized: false });

const {getUserMessages,setUserMessages,getAllMessages} = 
        require('./custom/messages');
const PORT = process.env.PORT || 8080;

const   io =    require('socket.io')(server,{
                cors: {
                origin:'*'
                }}),
        wrap =  middleware => (socket, next) => 
                middleware(socket.request, {}, next);
var messages = [],
    users = [];

app.use('/public',express.static(__dirname + '/client'));
app.use(sessionMiddleware);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
        
initializePassport(passport);
app.use(flash());  
app.use(passport.initialize());
app.use(passport.session());

app.get('/',(req, res)=>{
    const isAuthenticated = !!req.user;
    if (isAuthenticated) {
      console.log(`user is authenticated, session is ${req.session.id}`);
      res.redirect('chat');
    } else {
      console.log("unknown user\nredirected to login");
      res.redirect('login');
    }
})

app.post('/logout',(req, res) =>{
    console.log(`logout ${req.session.id}`);
    const socketId = req.session.socketId;
    if (socketId && io.of("/").sockets.get(socketId)) {
      console.log(`forcefully closing socket ${socketId}`);
      io.of("/").sockets.get(socketId).disconnect(true);
    }
    req.logout((err)=> {
        if (err) { return next(err); }
      });
    res.cookie("connect.sid", "", { expires: new Date() });
    res.redirect("/login");
})
app.route('/login')
.get(checkAuthentication, (req, res) => {
    res.sendFile(__dirname + "/client/login/login.html");
})
.post(
    passport.authenticate("local",{
        successRedirect: "/chat",
        failureRedirect: "/login",
        failureFlash: true
    })
);

app.get('/chat',checkNotAuthentication, (req, res)=>{
    res.sendFile(__dirname + "/client/chat/chat.html");
});

app.get('/clients',(req, res)=>{
    res.send('<h1>' + io.engine.clientsCount.toString() + '</h1>');
})
app.get('/users', (req, res)=>{
    res.json(users);
});

app.get("/whoami",(req,res)=>{
    if(req.user)
        res.send(req.user.name);
    else
        res.send("Please Kindly Login");
})

app.get("/messages",(req,res)=>{
    getAllMessages((er, result)=>{
        messages = result;
        if(er) throw er
        else res.json(result)
    })
})

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));
io.use((socket, next) => {
  if (socket.request.user) {
    next();
  } else {
    next(new Error('unauthorized'))
  }
});

io.on('connect', (socket) => {
    console.log(`new connection ${socket.id}`);

    addUser(socket.request.user.name, socket.id);

    socket.on('whoami', () => {
        io.to(socket.id).emit('whoamis',socket.request.user.name)
    });
  
    const session = socket.request.session;
    console.log(`saving sid ${socket.id} in session ${session.id}`);
    session.socketId = socket.id;
    session.save();

    socket.on('disconnect',() => {
        if(socket.request.user.name)
            removeUser(socket.request.user.name);
        console.log(socket.request.user.name + ": disconnected")
    })

    socket.on('select_friend', (name) => {
        socket.rooms.forEach(room => socket.leave(room));
        socket.join(socket.request.user.name)
    })

    socket.on('send_message', function(raw) {    
        l("socket.on('send_message'");
        l(raw);
        
        
        io.emit("receive_message", {
        sender: socket.request.user.name,
        receiver: raw.friendname ,
        message: raw.message})

        console.log('Message Received\nFrom: ' + socket.request.user.name + '\nTo: ' + raw.friendname +'\nMessage: ' + raw.message);
        
        messages.push({
            sender:socket.request.user.name,
            receiver: raw.friendname ,
            message: raw.msg
        })

        setUserMessages({
            sender:socket.request.user.name,
            receiver: raw.friendname,
            message: raw.message
        },(er,message)=>{
            if(er) throw er ;
            else l(message);
        })
    });
      
    socket.on('send message', (message) =>{
        if(message){
            console.log({name: socket.request.user.name, message: message});
            io.to(socket.rooms[1]).emit(message);
        }
    })
  });
server.listen(PORT, () => {
    console.log(`listening on  *:${PORT}`);
});

function addUser(name, id){
    const found = users.find(user => user.name === name);
    if(!found) 
        users.push({id, name}) 
    else
        for (let i = 0; i < users.length; i++) {
            if(users[i].name === name && users[i].id != id ){
                users.id = id;
                break;
            }
        }
}

function removeUser(name){    
    const found = users.find(user => user.name === name);
    if(found) 
        for (let i = 0; i < users.length; i++) {
            if(users[i].name === name){
                users.splice(i, 1);
                break;
            }
        }
}

function checkAuthentication(req, res, next){
    if(req.isAuthenticated())
        return res.redirect('/chat');
    next();
}

function checkNotAuthentication(req, res, next){
    if(req.isAuthenticated())
        return next();
    res.redirect('/login');
}

function l(msg){
    console.log(msg);
}
