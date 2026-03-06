const express = require('express');
const app = express();
const port = 3000;

// 1. [핵심] 'public' 폴더를 정적 파일 루트로 지정
// 이제 public 폴더 안의 파일들이 http://localhost:3000/ 바로 아래에 있는 것처럼 동작합니다.
app.use(express.static('public'));

// JSON 데이터 처리를 위한 설정
app.use(express.json());

// 사용자 데이터 (이전과 동일)
let users = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' }
];

// API 라우트 (이전과 동일)
app.get('/users', (req, res) => {
    res.json(users);
});

app.post('/users', (req, res) => {
    const { name, email } = req.body;
    const newUser = { id: users.length + 1, name, email };
    users.push(newUser);
    res.status(201).json(newUser);
});

app.listen(port, () => {
    console.log(`서버 실행 중: http://localhost:${port}`);
});