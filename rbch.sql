-- phpMyAdmin SQL Dump
-- version 4.6.5.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 02, 2017 at 08:51 PM
-- Server version: 10.1.21-MariaDB
-- PHP Version: 7.1.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rbch`
--

-- --------------------------------------------------------

--
-- Table structure for table `clinical_episode`
--

CREATE TABLE `clinical_episode` (
  `episode_id` int(9) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `source_referral` varchar(255) NOT NULL,
  `reason_referral` varchar(512) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `current_medication`
--

CREATE TABLE `current_medication` (
  `episode_id` int(11) NOT NULL,
  `medication_id` int(11) NOT NULL,
  `dose` int(11) NOT NULL,
  `route` int(11) NOT NULL,
  `frequency` int(11) NOT NULL,
  `details` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `gp`
--

CREATE TABLE `gp` (
  `gp_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address_line_1` varchar(512) NOT NULL,
  `address_line_2` varchar(512) NOT NULL,
  `address_city` varchar(255) NOT NULL,
  `address_county` varchar(255) NOT NULL,
  `address_postcode` varchar(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `history`
--

CREATE TABLE `history` (
  `history_id` int(11) NOT NULL,
  `presenting_complaint` text NOT NULL,
  `history_presenting_complaint` text NOT NULL,
  `history_diabetes` tinyint(1) NOT NULL,
  `history_ihd` tinyint(1) NOT NULL,
  `history_epilepsy` tinyint(1) NOT NULL,
  `history_asthma` tinyint(1) NOT NULL,
  `history_notes` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `hospital`
--

CREATE TABLE `hospital` (
  `hospital_id` int(12) NOT NULL,
  `name` varchar(512) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `hospital`
--

INSERT INTO `hospital` (`hospital_id`, `name`) VALUES
(1, 'Royal Bournemouth Hospital'),
(4, 'Royal Christchurch Hospital');

-- --------------------------------------------------------

--
-- Table structure for table `medication`
--

CREATE TABLE `medication` (
  `medication_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `observations`
--

CREATE TABLE `observations` (
  `observation_id` int(9) NOT NULL,
  `bp_systolic` int(11) NOT NULL,
  `bp_diastolic` int(11) NOT NULL,
  `pulse` int(11) NOT NULL,
  `temperature` decimal(2,0) NOT NULL,
  `respiratory_rate` int(11) NOT NULL,
  `avpu` varchar(255) NOT NULL,
  `news_score` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `patient`
--

CREATE TABLE `patient` (
  `patient_id` varchar(255) NOT NULL,
  `surname` varchar(255) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `address_line_1` varchar(512) NOT NULL,
  `address_line_2` varchar(512) NOT NULL,
  `address_city` varchar(255) NOT NULL,
  `address_county` varchar(255) NOT NULL,
  `address_country` varchar(255) NOT NULL,
  `address_postcode` varchar(8) NOT NULL,
  `date_of_birth` date NOT NULL,
  `telephone` varchar(12) NOT NULL,
  `mobile` varchar(12) NOT NULL,
  `gender` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `patient`
--

INSERT INTO `patient` (`patient_id`, `surname`, `firstname`, `address_line_1`, `address_line_2`, `address_city`, `address_county`, `address_country`, `address_postcode`, `date_of_birth`, `telephone`, `mobile`, `gender`) VALUES
('', 'South', 'Harrison', 'Flat 1', 'agag', 'gagag', 'gagag', '', 'aggag', '0000-00-00', '', '', ''),
('PATIENT', 'South', 'Harrison', '111', '1111', '111', '111', '', '11', '0000-00-00', '', '', '');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `clinical_episode`
--
ALTER TABLE `clinical_episode`
  ADD PRIMARY KEY (`episode_id`);

--
-- Indexes for table `current_medication`
--
ALTER TABLE `current_medication`
  ADD PRIMARY KEY (`episode_id`,`medication_id`);

--
-- Indexes for table `history`
--
ALTER TABLE `history`
  ADD PRIMARY KEY (`history_id`);

--
-- Indexes for table `hospital`
--
ALTER TABLE `hospital`
  ADD PRIMARY KEY (`hospital_id`);

--
-- Indexes for table `medication`
--
ALTER TABLE `medication`
  ADD PRIMARY KEY (`medication_id`);

--
-- Indexes for table `observations`
--
ALTER TABLE `observations`
  ADD PRIMARY KEY (`observation_id`);

--
-- Indexes for table `patient`
--
ALTER TABLE `patient`
  ADD PRIMARY KEY (`patient_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `clinical_episode`
--
ALTER TABLE `clinical_episode`
  MODIFY `episode_id` int(9) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `history`
--
ALTER TABLE `history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `hospital`
--
ALTER TABLE `hospital`
  MODIFY `hospital_id` int(12) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT for table `medication`
--
ALTER TABLE `medication`
  MODIFY `medication_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `observations`
--
ALTER TABLE `observations`
  MODIFY `observation_id` int(9) NOT NULL AUTO_INCREMENT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
