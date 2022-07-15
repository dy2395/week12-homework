const express = require('express');
// Import and require mysql2
const mysql = require('mysql2');
const inquirer = require ("inquirer");
const fs = require('fs');
const { resolveSoa } = require('dns');

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
  {
    host: 'localhost',
    // MySQL username,
    user: 'root',
    // {TODO: Add your MySQL password}
    password: '1Bmflshzbqb',
    database: 'employee_db'
  },
  console.log(`Connected to the employee_db database.`)
);


const initPrompt = () => {
  inquirer
    .prompt({
      type: "list",
      name: "task",
      message: "What would you like to do?",
      choices: [
        "View All Employee",
        "Add Employee",
        "Update Employee Role",
        "View All Roles",
        "Add Role",
        "View All Departments",
        "Add Department"
      ]
    })
    .then(function ({ task }) {
      switch (task) {
        case "View All Employee":
          viewEmployee();
          break;
      
        case "Add Employee":
          addEmployee();
          break;

        case "Update Employee Role":
          updateEmployeeRole();
          break;

        case "View All Employee":
          viewEmployee();
          break;

        case "Add Role":
          addRole();
          break;
      }
    });
}

const viewEmployee = () => {
  const query1 = fs.readFileSync('./db/query.sql').toString();
  db.query(query1,(err,res) => {
    if (err) throw err;
    console.table(res);
    initPrompt();
  });
};

const addEmployee = () => {
  db.query(`SELECT * FROM roles;`, (err, res) => {
      if (err) throw err;
      const roles = res.map(roles => ({name: roles.title, value: roles.id }));
      db.query(`SELECT * FROM employee;`, (err, res) => {
          if (err) throw err;
          const employees = res.map(employee => ({name: employee.first_name + ' ' + employee.last_name, value: employee.id}));
          inquirer.prompt([
              {
                  name: 'firstName',
                  type: 'input',
                  message: 'What is the new employee\'s first name?'
              },
              {
                  name: 'lastName',
                  type: 'input',
                  message: 'What is the new employee\'s last name?'
              },
              {
                  name: 'role',
                  type: 'rawlist',
                  message: 'What is the new employee\'s title?',
                  choices: roles
              },
              {
                  name: 'manager',
                  type: 'rawlist',
                  message: 'Who is the new employee\'s manager?',
                  choices: employees
              }
          ]).then((answer) => {
              db.query(`INSERT INTO employee SET ?`, 
              {
                  first_name: answer.firstName,
                  last_name: answer.lastName,
                  role_id: answer.role,
                  manager_id: answer.manager,
              }, 
              (err) => {
                  if (err) throw err;
                  console.log(`\n Employee added! \n`);
                  initPrompt();
              })
          })
      })
  });
};
// // Query database
// let delete_id = 2;
// let delete_book = "Decameron"

// db.query(`DELETE FROM books WHERE id = ? AND book_name = ?`, [delete_id, delete_book], (err, result) => {
//   if (err) {
//     console.log(err);
//   }
//   console.log(result);
// });

// // Query database
// db.query('SELECT * FROM books', function (err, results) {
//   console.log(results);
// });

// Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});

// Start server after DB connection
db.connect(err => {
  if (err) throw err;
  initPrompt();
});
