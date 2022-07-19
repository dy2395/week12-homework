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
        "View All Employees",
        "Add Employee",
        "Update Employee Role",
        "View All Roles",
        "View All Departments"
      ]
    })
    .then(function ({ task }) {
      switch (task) {
        case "View All Employees":
          viewEmployee();
          break;
      
        case "Add Employee":
          addEmployee();
          break;

        case "Update Employee Role":
          updateEmployeeRole();
          break;

        case "View All Roles":
          viewRole();
          break;
        
        case "View All Departments":
          viewDepartment();
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

// refer to https://github.com/samrogers15/MySQL-employee-tracker/blob/main/server.js
updateEmployeeRole = () => {
  db.query(`SELECT * FROM roles;`, (err, res) => {
      if (err) throw err;
      const roles = res.map(roles => ({name: roles.title, value: roles.id }));
      db.query(`SELECT * FROM employee;`, (err, res) => {
          if (err) throw err;
          const employees = res.map(employee => ({name: employee.first_name + ' ' + employee.last_name, value: employee.id}));
          inquirer.prompt([
              {
                  name: 'employee',
                  type: 'rawlist',
                  message: 'Which employee would you like to update the role for?',
                  choices: employees
              },
              {
                  name: 'newRole',
                  type: 'rawlist',
                  message: 'Choose employee\'s new role?',
                  choices: roles
              },
          ]).then((answer) => {
              db.query(`UPDATE employee SET ? WHERE ?`, 
              [
                  {
                      role_id: answer.newRole,
                  },
                  {
                      id: answer.employee,
                  },
              ], 
              (err) => {
                  if (err) throw err;
                  console.log(`\n Employee's role updated! \n`);
                  initPrompt();
              })
          })
      })
  })
};

viewRole = () => {
  db.query(
    `SELECT roles.id, roles.title, roles.salary, department.names AS department
    FROM department
    JOIN roles ON roles.department_id = department.id 
    ORDER BY roles.id ASC;`,
    (err, res) => {
      if (err) throw err;
      console.table(res);
      initPrompt();
  })
};

viewDepartment = () => {
  db.query(
    `SELECT * FROM department 
    ORDER BY id ASC;`, 
    (err, res) => {
      if (err) throw err;
      console.table(res);
      initPrompt();
  })
};

// Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});

// Start server after DB connection
db.connect(err => {
  if (err) throw err;
  initPrompt();
});
