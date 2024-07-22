const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: "trainingdiary"
})

// Регистрация

app.post('/signup', (req, res) => {
    // Проверяем, есть ли пользователь с таким именем в базе данных
    const checkUserSql = "SELECT * FROM users WHERE username = ?";
    db.query(checkUserSql, [req.body.username], (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при проверке пользователя' });
        }

        if (data.length > 0) {
            // Если пользователь с таким именем уже существует, возвращаем ошибку
            return res.status(400).json({ error: 'Пользователь с данным логином уже существует' });
        }

        // Если пользователя с таким именем нет, добавляем нового пользователя
        const sql = "INSERT INTO users (`username`, `password`) VALUES (?, ?)";
        const values = [
            req.body.username,
            req.body.password
        ];
        db.query(sql, values, (err, data) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка при регистрации пользователя' });
            }
            return res.json(data);
        });
    });
});

// Авторизация

app.post('/login', (req, res) => {
    const sql = "SELECT * FROM users WHERE `username` = ? AND `password` = ?";
    db.query(sql, [req.body.username, req.body.password], (err, data) => {
        if (err) {
            return res.json("Error");
        }
        if (data.length > 0) {
            return res.json("Success");
        } else {
            return res.json("Faile");
        }
    })
})


//  ЗаписЬ в дневник

app.post('/diary', (req, res) => {
    const { username, date, exercises } = req.body;
    const sql = "INSERT INTO diary (username, date, exercises) VALUES (?, ?, ?)";
    db.query(sql, [username, date, JSON.stringify(exercises)], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при сохранении записи в дневник' });
        }
        return res.json({ id: result.insertId });
    });
});

// Получение записей из дневника

app.get('/diary', (req, res) => {
    const sql = "SELECT * FROM diary WHERE username = ?";
    db.query(sql, [req.query.username], (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка при получении записей из дневника' });
        }


        return res.json(data);
    });
});

// получения данных из дневника для отображения на странице ComplGoal 

app.get('/diary', (req, res) => {
    const { username } = req.query;

    // Поиск записей в базе данных по username и date
    db.collection('diary').find({ username }).toArray((err, entries) => {
        if (err) {
            console.error('Error', err);
            res.status(500).send('Error');
        } else {
            res.json(entries);
        }
    });
});


app.listen(8081, () => {
    console.log('Слушаю порт 8081')
})