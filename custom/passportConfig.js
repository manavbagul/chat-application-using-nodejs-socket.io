const   LocalStrategy = require('passport-local').Strategy,
        { pool } = require('./dbConfig'),
        bcrypt = require('bcrypt');

function initialize(passport){
    const authenticateUser = (username,password, done) => {
        pool.query(
            `SELECT * FROM users WHERE name = $1`,
            [username],
            (er, res) => {
                if (er)
                    throw er
                if(res.rowCount > 0){
                    const user = res.rows[0];

                    bcrypt.compare(password, user.password, (er, match) => {
                        if(er)
                            throw er
                        if(match)
                            return done(null, user);
                        else
                            return done(null, false,{message: "Password is not correct"});
                    });
                }
                else
                    return done(null, false,{message: "User not found"});
            }
        );
    }

    passport.use(
        new LocalStrategy(
            {
                usernameField: "username",
                passwordField: "password"
            },	
            authenticateUser
        )
    )

    passport.serializeUser((user, done)=> done(null, user.id));
    passport.deserializeUser((id, done)=>{
        pool.query(
            `SELECT * FROM users WHERE id = $1`,
            [id],
            (er, res)=>{
                if(er)
                    throw er
                return done(null, res.rows[0]);
            }
        );
    });
};

module.exports = initialize;