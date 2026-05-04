const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
const SENHA_DASHBOARD = "sunstone123";

const db = new sqlite3.Database("briefings.db");

db.run("ALTER TABLE briefings ADD COLUMN status TEXT DEFAULT 'novo'", (err) => {
  // ignora erro se já existir
});

db.run(`
  CREATE TABLE IF NOT EXISTS briefings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT,
    empresa TEXT,
    segmento TEXT,
    objetivo TEXT,
    publico TEXT,
    referencia TEXT,
    prazo TEXT,
    orcamento TEXT,
    detalhes TEXT,
    nome TEXT,
    whatsapp TEXT,
    email TEXT
  )
`);

app.post("/login-dashboard", (req, res) => {
  const { senha } = req.body;

  if (senha === SENHA_DASHBOARD) {
    return res.json({ autorizado: true });
  }

  res.status(401).json({ erro: "Senha incorreta" });
});

app.post("/briefing", (req, res) => {
  const {
    tipo,
    empresa,
    segmento,
    objetivo,
    publico,
    referencia,
    prazo,
    orcamento,
    detalhes,
    nome,
    whatsapp,
    email
  } = req.body;

  db.run(
    `INSERT INTO briefings 
    (tipo, empresa, segmento, objetivo, publico, referencia, prazo, orcamento, detalhes, nome, whatsapp, email)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [tipo, empresa, segmento, objetivo, publico, referencia, prazo, orcamento, detalhes, nome, whatsapp, email],
    function (err) {
      if (err) {
        return res.status(500).json({ erro: err.message });
      }

      res.json({ mensagem: "Briefing salvo com sucesso!" });
    }
  );
});

app.get("/briefings", (req, res) => {
  db.all("SELECT * FROM briefings ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }

    res.json(rows);
  });
});

app.put("/briefing/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run(
    "UPDATE briefings SET status = ? WHERE id = ?",
    [status, id],
    function (err) {
      if (err) {
        return res.status(500).json({ erro: err.message });
      }

      res.json({ mensagem: "Status atualizado" });
    }
  );
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});