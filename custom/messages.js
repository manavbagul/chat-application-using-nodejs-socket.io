const { pool } = require('./dbConfig');


const getUserMessages = function(name, done){

    try {
        pool.query(`select * from messages where sender = $1 or receiver = $2`,
        [name,name],
        (er,res)=>{
            if(er) throw er;
            else if(res.rowCount > 0) done(null, res.rows);
            else done(true, {message: "nothing found"});
        })
    } catch (er) {
        console.log({Function: 'getUserMessages', message:'database connection problem',error: er})
    }
}

const getAllMessages = function(done){
    try {
        pool.query(`select * from messages`,
        (er,res)=>{
            console.log(res.rowCount);
            if(er) throw er;
            else if(res.rowCount > 0) done(null, res.rows);
            else done(true, {message: "nothing found"});
        })
    } catch (er) {

        console.log({Function: 'getAllMessages', message:'database connection problem',error: er})
        
    }
}

const setUserMessages = (messagebox , done)=>{

    try {
        pool.query(`INSERT INTO messages (sender,receiver,message) VALUES ($1,$2,$3)`,
        [messagebox.sender, messagebox.receiver, messagebox.message],
        (er,res)=>{
            if(er) throw er;
            else if(res.rowCount > 0) done(null, {message: "message added"});
            else done(false, {message: "nothing found"});
        })
    } catch (er) {
        console.log({Function: 'setUserMessages', message:'database connection problem',error: er})
    }
}

module.exports = {getUserMessages, setUserMessages, getAllMessages}