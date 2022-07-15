SELECT e.id, e.first_name, e.last_name, roles.title, department.names, roles.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager 
FROM employee e 
LEFT JOIN roles ON e.role_id = roles.id
LEFT JOIN department ON department.id = roles.department_id 
LEFT JOIN employee m ON e.manager_id = m.id
ORDER BY e.id ASC;



  
  
  