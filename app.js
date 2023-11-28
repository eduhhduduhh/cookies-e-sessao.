const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'your_secret_key',
  resave: true,
  saveUninitialized: true
}));

const users = [
  { username: 'user1', password: 'password1', email: 'user1@example.com', loginAttempts: 0, lockedUntil: null },
  { username: 'user2', password: 'password2', email: 'user2@example.com', loginAttempts: 0, lockedUntil: null },
];

const maxLoginAttempts = 3;
const lockoutDuration = 30000;

app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('dashboard');
  } else {
    res.redirect('login');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.clearCookie('lastLogin');
  res.redirect('login');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (user && !isAccountLocked(user)) {
    if (user.password === password) {
      resetLoginAttempts(user);
      req.session.user = user;
      res.cookie('lastLogin', new Date().toLocaleString());
      res.redirect('dashboard');
    } else {
      incrementLoginAttempts(user);
      res.send(`Senha incorreta. Tentativas restantes: ${maxLoginAttempts - user.loginAttempts}`);
    }
  } else {
    res.send('Usuário não encontrado ou conta bloqueada.');
  }
});

app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    res.sendFile(__dirname + '/dashboard.html');
  } else {
    res.redirect('login');
  }
});

function isAccountLocked(user) {
  return user.lockedUntil && user.lockedUntil > Date.now();
}

function incrementLoginAttempts(user) {
  user.loginAttempts++;

  if (user.loginAttempts >= maxLoginAttempts) {
    user.lockedUntil = Date.now() + lockoutDuration;
  }
}

function resetLoginAttempts(user) {
  user.loginAttempts = 0;
  user.lockedUntil = null;
}

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

app.get('/cadastro', (req, res) => {
    res.sendFile(__dirname + '/cadastro.html');
  });
  
  
  app.post('/cadastro', (req, res) => {
    const { username, password, email } = req.body;
  
    users.push({ username, password, email, loginAttempts: 0, lockedUntil: null });
  
    res.send('Cadastro realizado com sucesso! <a href="/login">Faça login</a>');
  });
  
  
  