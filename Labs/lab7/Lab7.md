## Lab7 Documentation

### TLDR; Quick Task Breakdown
  - Jodie worked on Part 1 of the lab, creating the database and the required tables. 
  - Oliver created the data for Part 2 and worked with Jodie in populating the database. 
  - SoMey worked with Dathan for Part 4, designing the wireframe for the website.
  - Dathan worked with SoMey for Part 4, creating the front end using the wire frame SoMey designed.
  - Lala worked on Part 5, developing AJAX that would dynamically load the course information from the JSON document and the PHP that would connect the database with the frontend. 
  - Zhimin worked on Part 3, creating the JSON document that contains information about all the lectures and labs we have done so far.

### Jodie Cho
During this lab, when I was writing the sql, it didn't work first because I was testing in the local mysql local benchmark, and it was only working when I used ` (backtick). When we were testing in local environment, in worked but when we were testing in php, it didn't work. Removing the backtick made it work in php.

### Oliver Crotty


### SoMey Dong


### Dathan Lang
  I helped implement the CSS and general graphical layout of the website by creating the index.html page for our spooky lms. I notably imported a special character font to invoke a more halloween-themed feel and also uses flex-boxing to align data elements. I also helped the generic styling so that my other team members could easily build around my design to dynamically add classes and labs. I also used internal css to speed-up load time since I know PHP and ajax can have slow loading speeds.
  
### Lala Liu
Overall, this lab was a big refresher on using MySQL with PHP. While I vaguely remember a lot of the steps from Intro to ITWS, I had also forgotten a lot of the syntax so it was nice to go back through my old notes from Intro and figure out how to set up a SQL query in PHP so that the database got updated with new information. The main struggle I had was figuring out how to send information from JavaScript to PHP, in which case I was lucky enough to find an article on how the fetch API could be used to send data from JavaScript to PHP in the form of a JSON.

### Zhimin Jiang
During this lab, I was responsible for building the JSON document that lists all of the Websys lectures and labs. I had to go back through the course materials to track down each individual lecture and lab, carefully summarize its main purpose in a short description, and make sure everything was included and consistently formatted so it would work correctly with our PHP/MySQL setup. This was time-consuming and easy to mess up, but it helped me understand how all the pieces of the course fit together.

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
  - https://www.1001fonts.com/bloody-modes-font.html
