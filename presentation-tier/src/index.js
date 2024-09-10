import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';

const PORT = process.env.PORT || 3000

let app = express()
const APPLICATION_LOAD_BALANCER = process.env.APPLICATION_LOAD_BALANCER;

app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

app.get('/', async (req, res) => {
  fetch('http://169.254.169.254/latest/meta-data/hostname').then(async(response) => {
    const hostname = await response.text();
    res.send(`Hello from ${hostname}`)
  })
})

app.get('/init', async (req, res) => {
  fetch(`http://${APPLICATION_LOAD_BALANCER}/init`).then(async (response) => {
    const data = await response.json();
    res.send(data)
  })
})

app.get('/users', async (req, res) => {
  fetch(`http://${APPLICATION_LOAD_BALANCER}/users`).then(async (response) => {
    const data = await response.json();
    res.send(data)
  })
})

// Serve HTML interface
app.get('/gui', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>Manage Users</h1>
        <form id="createUserForm">
          <h2>Create User</h2>
          <input type="text" id="lastname" placeholder="Last Name" required />
          <input type="text" id="firstname" placeholder="First Name" required />
          <input type="email" id="email" placeholder="Email" required />
          <button type="submit">Create User</button>
        </form>
        <h2>Update User</h2>
        <input type="number" id="updateId" placeholder="User ID" required />
        <input type="text" id="updateLastname" placeholder="New Last Name" />
        <input type="text" id="updateFirstname" placeholder="New First Name" />
        <input type="email" id="updateEmail" placeholder="New Email" />
        <button onclick="updateUser()">Update User</button>
        <h2>Delete User</h2>
        <input type="number" id="deleteId" placeholder="User ID" required />
        <button onclick="deleteUser()">Delete User</button>
        <script>
          document.getElementById('createUserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const lastname = document.getElementById('lastname').value;
            const firstname = document.getElementById('firstname').value;
            const email = document.getElementById('email').value;
            await fetch('http://${APPLICATION_LOAD_BALANCER}/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lastname, firstname, email })
            });
            alert('User created');
          });

          async function updateUser() {
            const id = document.getElementById('updateId').value;
            const lastname = document.getElementById('updateLastname').value;
            const firstname = document.getElementById('updateFirstname').value;
            const email = document.getElementById('updateEmail').value;
            await fetch(\`http://${APPLICATION_LOAD_BALANCER}/users/\${id}\`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lastname, firstname, email })
            });
            alert('User updated');
          }

          async function deleteUser() {
            const id = document.getElementById('deleteId').value;
            await fetch(\`http://${APPLICATION_LOAD_BALANCER}/users/\${id}\`, {
              method: 'DELETE'
            });
            alert('User deleted');
          }
        </script>
      </body>
    </html>
  `);
});

// Custom 404 route not found handler
app.use((req, res) => {
  res.status(404).send('404 not found')
})

app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
})
