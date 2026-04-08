const express = require("express");
const { Pool } = require("pg");
const app = express();
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query(`CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  done BOOLEAN DEFAULT false
)`);

// Interfaz gráfica
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Task Manager</title>
      <style>
        body { font-family: Arial; max-width: 600px; margin: 40px auto; padding: 0 20px; }
        input { padding: 8px; width: 70%; border: 1px solid #ccc; border-radius: 4px; }
        button { padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button.delete { background: #f44336; }
        li { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #eee; }
        .done { text-decoration: line-through; color: #999; }
      </style>
    </head>
    <body>
      <h1>📝 Task Manager</h1>
      <div style="display:flex;gap:8px;margin-bottom:20px">
        <input id="title" placeholder="Nueva tarea..." />
        <button onclick="createTask()">Añadir</button>
      </div>
      <ul id="list"></ul>
      <script>
        async function loadTasks() {
          const res = await fetch("/tasks");
          const tasks = await res.json();
          document.getElementById("list").innerHTML = tasks.map(t => \`
            <li>
              <input type="checkbox" \${t.done ? "checked" : ""} onchange="toggleTask(\${t.id}, this.checked)" />
              <span class="\${t.done ? 'done' : ''}">\${t.title}</span>
              <button class="delete" onclick="deleteTask(\${t.id})">🗑</button>
            </li>
          \`).join("");
        }
        async function createTask() {
          const title = document.getElementById("title").value;
          if (!title) return;
          await fetch("/tasks", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({title}) });
          document.getElementById("title").value = "";
          loadTasks();
        }
        async function toggleTask(id, done) {
          await fetch(\`/tasks/\${id}\`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify({done}) });
          loadTasks();
        }
        async function deleteTask(id) {
          await fetch(\`/tasks/\${id}\`, { method: "DELETE" });
          loadTasks();
        }
        loadTasks();
      </script>
    </body>
    </html>
  `);
});

// API REST
app.get("/tasks", async (req, res) => {
  const r = await pool.query("SELECT * FROM tasks");
  res.json(r.rows);
});
app.post("/tasks", async (req, res) => {
  const { title } = req.body;
  const r = await pool.query("INSERT INTO tasks(title) VALUES($1) RETURNING *", [title]);
  res.json(r.rows[0]);
});
app.put("/tasks/:id", async (req, res) => {
  const { done } = req.body;
  const r = await pool.query("UPDATE tasks SET done=$1 WHERE id=$2 RETURNING *", [done, req.params.id]);
  res.json(r.rows[0]);
});
app.delete("/tasks/:id", async (req, res) => {
  await pool.query("DELETE FROM tasks WHERE id=$1", [req.params.id]);
  res.json({ deleted: true });
});

app.listen(3000, () => console.log("Running on :3000"));