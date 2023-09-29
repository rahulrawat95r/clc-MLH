-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 08, 2023 at 07:50 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.0.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `councelling2`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity`
--

CREATE TABLE `activity` (
  `act` varchar(200) DEFAULT NULL,
  `time` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `adminlogin`
--

CREATE TABLE `adminlogin` (
  `name` varchar(200) DEFAULT NULL,
  `username` varchar(200) DEFAULT NULL,
  `password` varchar(200) DEFAULT NULL,
  `profile` varchar(200) DEFAULT NULL,
  `type` varchar(200) DEFAULT NULL,
  `active` varchar(200) DEFAULT NULL,
  `year` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `admittedstudents`
--

CREATE TABLE `admittedstudents` (
  `jeerollno` double NOT NULL,
  `Candidate_Type` varchar(200) DEFAULT NULL,
  `name` varchar(200) DEFAULT NULL,
  `fathersname` varchar(200) DEFAULT NULL,
  `Phonenumber` varchar(200) DEFAULT NULL,
  `branch` varchar(200) DEFAULT NULL,
  `category` varchar(200) DEFAULT NULL,
  `subcategory` varchar(200) DEFAULT NULL,
  `feestatus` varchar(200) DEFAULT NULL,
  `feereceiptno` int(100) DEFAULT NULL,
  `admissiontime` varchar(100) DEFAULT NULL,
  `gender` varchar(200) DEFAULT NULL,
  `dob` varchar(200) DEFAULT NULL,
  `domicile` varchar(200) DEFAULT NULL,
  `remarks` varchar(200) DEFAULT NULL,
  `year` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clc_councelling`
--

CREATE TABLE `clc_councelling` (
  `branch` varchar(200) DEFAULT NULL,
  `category` varchar(200) DEFAULT NULL,
  `xf` int(11) DEFAULT NULL,
  `xop` int(11) DEFAULT NULL,
  `sf` int(11) DEFAULT NULL,
  `sop` int(11) DEFAULT NULL,
  `fff` int(11) DEFAULT NULL,
  `ffop` int(11) DEFAULT NULL,
  `hcf` int(11) DEFAULT NULL,
  `hcop` int(11) DEFAULT NULL,
  `nccf` int(11) DEFAULT NULL,
  `nccop` int(11) DEFAULT NULL,
  `tsf` int(11) DEFAULT NULL,
  `tsop` int(11) DEFAULT NULL,
  `year` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clc_councelling2`
--

CREATE TABLE `clc_councelling2` (
  `branch` varchar(200) DEFAULT NULL,
  `category` varchar(200) DEFAULT NULL,
  `seats` varchar(200) DEFAULT NULL,
  `year` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `logs`
--

CREATE TABLE `logs` (
  `level` longtext DEFAULT NULL,
  `log` longtext DEFAULT NULL,
  `date` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `merit_list`
--

CREATE TABLE `merit_list` (
  `SNo` int(11) NOT NULL,
  `Rollno` varchar(200) NOT NULL,
  `Name` varchar(200) DEFAULT NULL,
  `DOB` varchar(200) DEFAULT NULL,
  `Gender` varchar(200) DEFAULT NULL,
  `Father` varchar(200) DEFAULT NULL,
  `Category` varchar(200) DEFAULT NULL,
  `Domicile` varchar(200) DEFAULT NULL,
  `Marks_per` varchar(200) DEFAULT NULL,
  `Maths_per` varchar(200) DEFAULT NULL,
  `Physics_per` varchar(200) DEFAULT NULL,
  `Chemistry_Bio_BioTech_Tech_Voc_per` varchar(200) DEFAULT NULL,
  `Phy_Obt_Outof` varchar(200) DEFAULT NULL,
  `Chem_Obt_Outof` varchar(200) DEFAULT NULL,
  `Maths_Obt_Outof` varchar(200) DEFAULT NULL,
  `PCM` varchar(200) DEFAULT NULL,
  `Perc_per` varchar(200) DEFAULT NULL,
  `JEERank` varchar(200) DEFAULT NULL,
  `Candidate_Type` varchar(200) DEFAULT NULL,
  `year` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `total_seats`
--

CREATE TABLE `total_seats` (
  `branch` varchar(200) DEFAULT NULL,
  `seats` int(11) DEFAULT NULL,
  `year` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `merit_list`
--
ALTER TABLE `merit_list`
  ADD PRIMARY KEY (`Rollno`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
