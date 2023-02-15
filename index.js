const express = require('express');
const app = express();
const bodyParser = require('body-parser')

app.use("/public",express.static("public"));

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

const conn = require('./connection');
var bcrypt = require('bcryptjs');
const { request } = require('express');
//const salt = bcrypt.genSalt(10);

//signup.hasMany(expense);
//expense.belongsTo(signup);

app.set('view engine', 'ejs');
app.set('views', 'views');

app.get('/',(req, res) =>{
    res.sendFile(__dirname +"/index.html");
});


app.post('/', (req,res)=>{
    const name = req.body.name;
    const email= req.body.email;
    var password= req.body.password;
    
    let errors = [];

    
    if(!name || !email || !password ){
        errors.push({msg: 'Please fill in all the fields'});
        res.send({message:'Please fill in all the fields'});
    }

    if(errors.length>0){

    }else{
        if(email){
            conn.query('SELECT * FROM signup WHERE email = ?', [email], 
            (error, results, fields)=>{
                if (results.length>0){
                    res.send('Email exists login now');
                }else{
                    res.redirect('/login');
                    bcrypt.hash(password, 10, (err, hash)=> {
                        if(err)throw err;
                        password = hash;
                        conn.query('INSERT INTO signup(name, email, password) VALUES("'+name+'", "'+email+'", "'+password+'")',
                        [name, email, password]);
                    });
                }
            });
            }else{
                res.send('Enter Email');
            };
    }
    });

app.get('/welcome',function(req,res){
    res.sendFile(__dirname+ "/welcome.html");
});

app.get('/login',function(req,res){
    res.sendFile(__dirname+ "/login.html");
});

app.get('/addexpense',function(req,res){
    res.sendFile(__dirname+ "/addexpense.html");
});

app.post("/login", (req, res)=> {
    const email = req.body.email;
    const password = req.body.password; 
    conn.query("SELECT * FROM signup WHERE email = ?;", email, (err, result)=> {
        if (err) {        
            res.send({err : err});    
        }
        if(result.length > 0){          
            bcrypt.compare(password, result[0].password, (error,response)=>{          
                if(response){           
                    res.redirect('/addexpense');         
                }else{            
                    res.send({message:"Email and password does not match"});
                }
            });       
        } else{
            res.send({message:"User does not exist"}); 
        }
    });
});  

app.post('/addexpense',(req,res)=>{
    let addexpense = req.body;
    //addexpense.user_id = req.signup.id;
    query = "insert into addexpense (amount,description,category,user_id) values(?,?,?,?)";
    conn.query(query,[addexpense.amount,addexpense.description,addexpense.category,req.signup.id],(err,results)=>{
        if(!err){
            //return res.status(200).json({message: "Expense Added Successfully"});
            res.redirect('/getexpense')
        }
        else
        return res.status(500).json(err);
    }) ;
});

app.get('/getexpense',(req,res)=>{
    var query = "select * from addexpense";
    conn.query(query,(err,results)=>{
        if(!err){
            //return res.status(200).json(results);
            res.render('getexpense',{addexpense:results});
        }
        else
        return res.status(500).json(err);
    }) ;
});


app.get('/delete/:id',(req,res)=>{
    const id = req.params.id;
    var query = "delete from addexpense where id=?";
    conn.query(query,[id],(err,results)=>{
        if(!err){
            if(results.affectedRows == 0){
                return res.status(404).json({message:"Expense id is not found"});
            }
            res.redirect('/getexpense');
        }
    });
});


app.listen(4000);