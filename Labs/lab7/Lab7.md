## Lab7 Documentation

### TLDR; Quick Task Breakdown
  - Jodie worked on Part 1 of the lab, creating the database and the required tables. 
  - Oliver created the data for Part 2 and worked with Jodie in populating the database. 
  - SoMey worked with Dathan for Part 4, designing the wireframe for the website.
  - Dathan worked with SoMey for Part 4, creating the front end using the wire frame SoMey designed.
  - Lala worked on Part 5, developing AJAX that would dynamically load the course information from the JSON document and the PHP that would connect the database with the frontend. 
  - Zhimin worked on Part 3, creating the JSON document that contains information about all the lectures and labs we have done so far.

### Jodie Cho


### Oliver Crotty


### SoMey Dong


### Dathan Lang


### Lala Liu


### Zhimin Jiang


## Accessing the Database (Locally)
  - Import "test.sql" into PHPMYADMIN to create the database, the tables in it, and the data stored in the database. 
  - Use the credentials in "conn.php" or change the credentials to the username and password you are using to access PHPMYADMIN. 
    - If you are using the credentials in "conn.php", make sure to create the user using your root or some other admin account. Doing this in terminal is easy:

```bash
  mysql -u root -p  # allows you to log in as root
  CREATE USER 'username'@'localhost' IDENTIFIED BY 'password'; # replace username and password with the credentials in conn.php
  GRANT ALL PRIVILEGES ON lab7.* to 'username'@'localhost'; # gives the new user all permissions on the lab7 database. As above, replace username with the one in conn.php
  FLUSH PRIVILEGES; # applies the changes
  exit;
```

## Resources
  - https://www.sitepoint.com/community/t/php-not-reading-post-data-sent-from-javascript-fetch/434652