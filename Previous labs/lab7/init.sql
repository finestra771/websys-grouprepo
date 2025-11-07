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


CREATE TABLE IF NOT EXISTS `lab7`.`grades` (
    `ID` int(11) PRIMARY KEY AUTO_INCREMENT,
    `CRN` int(11) NOT NULL,
    `RIN` int(9) NOT NULL,
    `grade` int(3) NOT NULL,
    FOREIGN KEY (`CRN`) REFERENCES `lab7`.`courses`(`crn`),
    FOREIGN KEY (`RIN`) REFERENCES `lab7`.`students`(`RIN`)
);

ALTER TABLE `lab7`.`students`
ADD `street` VARCHAR(255),
ADD `city` VARCHAR(100),
ADD `state` CHAR(2),
ADD `zip` CHAR(10);

ALTER TABLE `lab7`.`courses`
ADD `section` INT(4) NOT NULL,
ADD `year` VARCHAR(6) NOT NULL;

INSERT INTO `courses`
VALUES (73048, "ITWS", 2110, "Web Systems Development", 01, '2025'),
    (36138, "ITWS", 4500, "Web Science Systems Dev", 01, 2026),
    (35258, "CSCI", 1200, "Data Structures", 02, 2026),
    (35492, "CSCI", 2300, "Introduction To Algorithms", 01, 2026);

INSERT INTO `students`
VALUES (661234567, 'smithj', 'John', 'Smith', 'Johnny', 1185551234, '12 Oak Street', 'Albany', 'NY', '12203'),
    (661234568, 'garciam', 'Maria', 'Garcia', 'Ria', 1185552345, '24 Pine Avenue', 'Troy', 'NY', '12180'),
    (661234569, 'browna', 'Alex', 'Brown', 'Lex', 1185553456, '56 Maple Lane', 'Schenectady', 'NY', '12308'),
    (661234570, 'wilsonl', 'Liam', 'Wicourseslson', 'Lee', 1185554567, '89 Elm Road', 'Saratoga', 'NY', '12866');

INSERT INTO `grades`
VALUES (1, 73048, 661234567, 90),
    (2, 73048, 661234568, 91),
    (3, 73048, 661234569, 81),
    (4, 73048, 661234570, 97),
    (5, 36138, 661234567, 100),
    (6, 36138, 661234568, 76),
    (7, 36138, 661234569, 90),
    (8, 36138, 661234570, 85),
    (9, 35258, 661234567, 74),
    (10, 35492, 661234568, 94);

-- List all students in the following sequences; in lexicographical order by RIN, last name, RCSID, and first name. Remember that lexicographical order is determined by your collation.
SELECT * FROM `students` ORDER BY `RIN` ASC;
SELECT * FROM `students` ORDER BY `RCSID` ASC;
SELECT * FROM `students` ORDER BY `last_name` ASC;
SELECT * FROM `students` ORDER BY `first_name` ASC;

-- 8. List all students RIN, name, and address if their grade in any course was higher than a 90
SELECT
  s.RIN, s.first_name, s.last_name, s.street, s.city, s.state, s.zip
FROM lab7.students s
JOIN lab7.grades g ON s.RIN = g.RIN
WHERE g.grade > 90
GROUP BY s.RIN, s.first_name, s.last_name, s.street, s.city, s.state, s.zip
ORDER BY s.RIN;

-- List out the average grade in each course
SELECT
  c.crn, c.prefix, c.number, c.title,
  AVG(g.grade) AS average_grade
FROM lab7.courses c
JOIN lab7.grades g ON c.crn = g.CRN
GROUP BY c.crn, c.prefix, c.number, c.title
ORDER BY c.crn;

-- List out the number of students in each course
SELECT
  c.crn, c.prefix, c.number, c.title,
  COUNT(DISTINCT g.RIN) AS student_count
FROM lab7.courses c
LEFT JOIN lab7.grades g ON c.crn = g.CRN
GROUP BY c.crn, c.prefix, c.number, c.title
ORDER BY c.crn;