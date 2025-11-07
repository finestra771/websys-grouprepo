CREATE DATABASE IF NOT EXISTS `lab7`;
USE `lab7`;

CREATE table If NOT EXISTS `lab7`.`courses`(
    `crn` INT(11) PRIMARY KEY,
    `prefix` VARCHAR(4) NOT NULL,
    `number` SMALLINT(4) NOT NULL,
    `title` VARCHAR(255) NOT NULL
);

CREATE table IF not exists `lab7`.`students`(
    `RIN` int(9) PRIMARY Key,
    `RCSID` char(7),
    `first_name` varchar(100) NOT NULL,
    `last_name` varchar(100) NOT NULL,
    `alias` varchar(100) NOT NULL,
    `phone` int(10)
);

CREATE table IF not exists `lab7`.grades(
    `ID` int(11) PRIMARY KEY AUTO_INCREMENT,
    CRN foreign key REFERENCES courses(crn),
    RIn foreign key REFERENCES students(RIN),
    grade int(3) NOT NULL
);

ALTER TABLE `lab7`.`students`
ADD `street` VARCHAR(255),
ADD `city` VARCHAR(100),
ADD `state` CHAR(2),
ADD `zip` CHAR(10);

ALTER TABLE `lab7`.`courses`
ADD `section` INT(4) NOT NULL,
ADD `year` VARCHAR(6) NOT NULL;

INSERT INTO 'lab7'.'courses'
VALUES (73048, "ITWS", 2110, "Web Systems Development", 01, 2025),
    (36138, "ITWS", 4500, "Web Science Systems Dev", 01, 2026),
    (35258, "CSCI", 1200, "Data Structures", 02, 2026),
    (35492, "CSCI", 2300, "Introduction To Algorithms", 01, 2026);

INSERT INTO `lab7`.'students'
VALUES (661234567, 'smithj', 'John', 'Smith', 'Johnny', 5185551234, '12 Oak Street', 'Albany', 'NY', '12203'),
    (661234568, 'garciam', 'Maria', 'Garcia', 'Ria', 5185552345, '24 Pine Avenue', 'Troy', 'NY', '12180'),
    (661234569, 'browna', 'Alex', 'Brown', 'Lex', 5185553456, '56 Maple Lane', 'Schenectady', 'NY', '12308'),
    (661234570, 'wilsonl', 'Liam', 'Wilson', 'Lee', 5185554567, '89 Elm Road', 'Saratoga', 'NY', '12866');

    