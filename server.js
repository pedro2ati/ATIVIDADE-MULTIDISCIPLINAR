require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'produtividade';

if (!MONGODB_URI) {
  console.error('MONGODB_URI não configurado. Crie um arquivo .env com MONGODB_URI.');
  process.exit(1);
}

async function start() {
  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
  console.log('Conectado ao MongoDB');

  app.post('/api/signup', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || name.trim().length < 2) return res.status(400).json({ error: 'Nome inválido' });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) return res.status(400).json({ error: 'Email inválido' });
    if (!password || password.length < 6) return res.status(400).json({ error: 'Senha muito curta' });

    try {
      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ error: 'Email já cadastrado' });

      const passwordHash = await User.hashPassword(password);
      const user = new User({ name, email, passwordHash });
      await user.save();

      return res.status(201).json({ message: 'Cadastro realizado', user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro interno' });
    }
  });

  // Serve static frontend files
  app.use(express.static(path.join(__dirname)));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}

start().catch(err => {
  console.error('Falha ao iniciar a aplicação', err);
  process.exit(1);
});
