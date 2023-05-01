const client = require("../config/scylla-client");
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const secretKey = 'secretKey';


// FOR SECURE PASSWORD
const securePassword = async(password) => {
    try {
      const hashedPwd = await bcrypt.hash(password, 3);
      return hashedPwd;
    }catch(error){
        res.status(400).json(error);
    }
};

// FOR SENDING MAIL
const sendMailToUser = async(userName, password, email) => {
    try {
      const transporter =  nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure: false,
            requireTLS: true,
            auth:{
                user:'mohdmahebubia5@gmail.com',
                pass:'fvohwkzktpmilmwp'
            }
        });
        const mailOptions = {
            from : 'mohdmahebubia5@gmail.com',
            to : email,
            subject : 'Save username and password',
            html: '<p> Username : '+ userName+'<br>Password : '+ password+'</p>'
        }
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                cres.status(400).json(error);
            }
            else{
                res.status(400).json(
                    {
                        message:"Email has sent :",
                        ifo: info.response
                    });
            }
        });

    } catch (error) {
        res.status(400).json(error);
    }
}


const insertUserInfo = async (req, res) => {
    const { userName, email, firstName, lastName, roles, phone, isActive, password, isAadmin } = req.body;
    const pwd = await securePassword(password);
    const query = `INSERT INTO users(user_name, email, first_name, last_name, roles,  phone, is_active, password, is_admin) VALUES('${userName}', '${email}', '${firstName}', '${lastName}', '${roles}', '${phone}', ${isActive}, '${pwd}', ${isAadmin})`;
    client.execute(query, (err, result) => {
        if (err) {
            res.status(400).json({ message: 'Failed to create user info' });
            return;
        }
        sendMailToUser(userName, password,  email);
        res.status(200).json({ message: 'Your registration has been successful, please check your mail.'});
    });
};

const getUsersInfo = async (req, res) => {
    const query = 'SELECT * FROM users;';
    client.execute(query, (err, result) => {
        if(err){
            res.status(400).json({message :'Failed to get users info'});
            return;
        }
        res.status(200).json(result.rows);
    });
};

// login user

const userLogin = async(req, res) => {
    try {
        const {userName, password } = req.body;
        const query = `SELECT * FROM users WHERE user_name = '${userName}'`;
        client.execute(query, async (err, result) => {
          const passCheck = await bcrypt.compare(password, result.rows[0].password);  
          if(err){
                res.status(400).json({message : 'An error occured'});
                return;
            }else{
                if(result.rowLength > 0 || passCheck){
                   result.rows[0].password = "";
                //    res.status(201).json(result.rows);
                   jwt.sign({ user: result.rows[0] }, secretKey, { expiresIn: '300s' }, (err, token) => {
                    res.json({
                       token,
                       result: result.rows[0]
                    });
                });

                }
                else{
                    res.status(400).json({message : 'Incorrect username and password'});
                }
            }
        });
    } catch (error) {
        res.status(400).json(error);
    }
};

const userLogout = async(req,res) =>{
    try {
        if (condition) {
            res.status(400).json(error);
        }
    } catch (error) {
        res.status(400).json(error);
    }
};


module.exports = { insertUserInfo, getUsersInfo, userLogin, userLogout };