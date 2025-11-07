CREATE DATABASE IF NOT EXISTS lab7;

CREATE table If NOT EXISTS lab7.courses(
    crn INT(11) PRIMARY KEY,
    prefix VARCHAR(4) NOT NULL,
    number SMALLINT(4) NOT NULL,
    title VARCHAR(255) NOT NULL
);

CREATE table IF not exists lab7.students(
    RIN int(9) PRIMARY Key,
    RCSID char(7),
    first_name varchar(100) NOT NULL,
    last_name varchar(100) NOT NULL,
    alias varchar(100) NOT NULL,
    phone int(10)
);

ALTER TABLE lab7.students
ADD street VARCHAR(255),
ADD city VARCHAR(100),
ADD state CHAR(2),
ADD zip CHAR(10);

ALTER TABLE lab7.courses
ADD section INT(4) NOT NULL,
ADD year VARCHAR(6) NOT NULL;