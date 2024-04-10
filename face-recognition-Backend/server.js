/**
 * 1. Get response:This is working *
 * 2. Signin: POST = success/fail *
 * 3. Register: POST = user(object) *
 * 4. /profile/:userId : GET = user
 * 5. image:PUT => user
 */

import express from "express";
import bcrypt from "bcrypt";
import cors from "cors";
import knex from "knex";

//connect to the database
const database = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user:'norrentyu',
        password:'13454700702',
        database:'face-recognition'
    }
});

//create a express app
const app = express();

//middleware//
app.use(express.json());
app.use(cors());

app.get('/',(request, response) => {
    response.send(database.users);
})

app.post('/signin', (request, response) => {
    database.select('email', 'hash').from('login')
    .where('email', '=', request.body.email)
    .then(data => {
        const isValid = bcrypt.compareSync(request.body.password, data[0].hash);
        if(isValid){
            return database.select('*').from('users')
            .where('email', '=', request.body.email)
            .then(user => {response.json(user[0]);})
            .catch(error => {response.status(400).json('Unable to get user');})
        }else{
            response.status(400).json('Wrong credentials');
        }
    })
    .catch(error => {response.status(400).json('Wrong credentials');})
});

app.post('/register',(request,response) =>{
    const { email, name, password } = request.body; //ex: {email:123, name:123, password:123}
    const passwordSalt = 10;
    const hash = bcrypt.hashSync(password, passwordSalt);
    //使用transaction可以确保多个操作(比如插入多个表)要么全部成功，要么全部失败
    database.transaction(tx => {
        tx.insert({
            hash:hash,
            email:email // Use email.email to access the email value directly
        })
        .into('login')
        .returning('email') //表示在插入记录后，应返回 'email' 字段的值（一个数组）
        .then(async loginEmail => { //loginEmail是一个数组，里面只有一个元素email
            const user = await tx('users')
                .returning('*')
                .insert({
                    email: loginEmail[0].email,
                    name: name,
                    joined: new Date()
                });
            response.json(user[0]);
        })
        .then(tx.commit) //tx在insert之后，returning之前，所以这里要commit
        .catch(tx.rollback)
    })
    .catch(error => {
        response.status(400).json('fail to register');
    })
})

app.get('/profile/:id',(request, response) => {
    const { id } = request.params;//get the id from the url，ex: /profile/123中，id=123
    database.select('*').from('users')
    .where({
        id: id
    })
    .then(user => {
        if(user.length){ //一个空数组的bool值是true，所以这里要用数组的长度
            response.json(user[0]);
        }
    })
    .catch(error => {
        response.status(400).json('User not found');
    })
})

app.put('/image', (request, response) => {
    const { id } = request.body; //get the id from the request body，ex: {id:123}
    database('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        response.json(entries[0]);
    })
    .catch(error => {
        response.status(400).json('Unable to get entries');
    })
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});