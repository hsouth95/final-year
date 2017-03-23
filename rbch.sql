-- phpMyAdmin SQL Dump
-- version 4.6.5.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 23, 2017 at 11:30 AM
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
-- Table structure for table `blood_results`
--

CREATE TABLE `blood_results` (
  `blood_results_id` int(9) NOT NULL,
  `episode_id` int(9) NOT NULL,
  `date` date NOT NULL,
  `wbc` int(4) DEFAULT NULL,
  `hb` int(4) DEFAULT NULL,
  `platelets` int(4) DEFAULT NULL,
  `neutrophils` int(4) DEFAULT NULL,
  `mcv` int(4) DEFAULT NULL,
  `inr` int(4) DEFAULT NULL,
  `aptt` int(4) DEFAULT NULL,
  `esr` int(4) DEFAULT NULL,
  `crp` int(4) DEFAULT NULL,
  `na` int(4) DEFAULT NULL,
  `k` int(4) DEFAULT NULL,
  `urea` int(4) DEFAULT NULL,
  `creatinine` int(4) DEFAULT NULL,
  `egfr` int(4) DEFAULT NULL,
  `aki_stage` int(4) DEFAULT NULL,
  `alp` int(4) DEFAULT NULL,
  `albumin` int(4) DEFAULT NULL,
  `ca2` int(4) DEFAULT NULL,
  `mg2` int(4) DEFAULT NULL,
  `phosphate` int(4) DEFAULT NULL,
  `alt` int(4) DEFAULT NULL,
  `bilirubin` int(4) DEFAULT NULL,
  `ck` int(4) DEFAULT NULL,
  `ast` int(4) DEFAULT NULL,
  `chol` int(4) DEFAULT NULL,
  `glucose` int(4) DEFAULT NULL,
  `amylase` int(4) DEFAULT NULL,
  `troponin_t` int(4) DEFAULT NULL,
  `d_dimer` int(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `clinical_episode`
--

CREATE TABLE `clinical_episode` (
  `episode_id` int(9) NOT NULL,
  `patient_id` int(9) NOT NULL,
  `gp_id` int(11) NOT NULL,
  `hospital_id` int(9) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `source_referral` varchar(255) NOT NULL,
  `reason_referral` varchar(512) NOT NULL,
  `completed` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `current_medication`
--

CREATE TABLE `current_medication` (
  `episode_id` int(11) NOT NULL,
  `medication_id` int(11) NOT NULL,
  `frequency` int(11) NOT NULL,
  `details` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `diagnosis`
--

CREATE TABLE `diagnosis` (
  `diagnosis_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `diagnosis`
--

INSERT INTO `diagnosis` (`diagnosis_id`, `name`) VALUES
(1, 'Asthma'),
(2, 'Anaemia'),
(3, 'Diabetes'),
(4, 'Flu');

-- --------------------------------------------------------

--
-- Table structure for table `drug_treatment`
--

CREATE TABLE `drug_treatment` (
  `treatment_id` int(9) NOT NULL,
  `medication_id` int(9) NOT NULL,
  `frequency` int(4) NOT NULL,
  `details` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `episode_diagnosis`
--

CREATE TABLE `episode_diagnosis` (
  `episode_id` int(11) NOT NULL,
  `diagnosis_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `episode_observations`
--

CREATE TABLE `episode_observations` (
  `episode_id` int(9) NOT NULL,
  `observation_id` int(9) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `examination`
--

CREATE TABLE `examination` (
  `examination_id` int(9) NOT NULL,
  `episode_id` int(9) NOT NULL,
  `anaemia` tinyint(1) NOT NULL,
  `jaundice` tinyint(1) NOT NULL,
  `cyanosis` tinyint(1) NOT NULL,
  `clubbing` tinyint(1) NOT NULL,
  `lymphnodes` tinyint(1) NOT NULL,
  `dehydration` tinyint(1) NOT NULL,
  `drowsy` tinyint(1) NOT NULL,
  `pulse` int(4) NOT NULL,
  `SOA` tinyint(1) NOT NULL,
  `bp_systolic` int(3) NOT NULL,
  `bp_diastolic` int(3) NOT NULL,
  `respiratory_rate_min` int(3) NOT NULL,
  `respiratory_sats` int(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `gp`
--

CREATE TABLE `gp` (
  `gp_id` int(11) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `surname` varchar(255) NOT NULL,
  `address_line_1` varchar(512) NOT NULL,
  `address_line_2` varchar(512) NOT NULL,
  `address_city` varchar(255) NOT NULL,
  `address_county` varchar(255) NOT NULL,
  `address_postcode` varchar(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `gp`
--

INSERT INTO `gp` (`gp_id`, `firstname`, `surname`, `address_line_1`, `address_line_2`, `address_city`, `address_county`, `address_postcode`) VALUES
(1, 'agagg', 'a', 'aggaga', 'agagga', 'aggag', 'agga', 'agga');

-- --------------------------------------------------------

--
-- Table structure for table `history`
--

CREATE TABLE `history` (
  `history_id` int(11) NOT NULL,
  `episode_id` int(9) NOT NULL,
  `presenting_complaint` text NOT NULL,
  `history_presenting_complaint` text NOT NULL,
  `ihd` tinyint(1) NOT NULL,
  `epilepsy` tinyint(1) NOT NULL,
  `asthma` tinyint(1) NOT NULL,
  `notes` text NOT NULL,
  `dm` tinyint(1) NOT NULL,
  `copd` tinyint(1) NOT NULL,
  `mi` tinyint(1) NOT NULL,
  `dvt` tinyint(1) NOT NULL,
  `pe` tinyint(1) NOT NULL,
  `tia` tinyint(1) NOT NULL,
  `cva` tinyint(1) NOT NULL,
  `family_history` varchar(522) DEFAULT NULL,
  `social_history` varchar(522) DEFAULT NULL,
  `alcohol_history` int(1) DEFAULT NULL,
  `smoking_history` int(1) DEFAULT NULL,
  `smoking_pack_years` int(2) DEFAULT NULL,
  `allergies` varchar(522) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `hospital`
--

CREATE TABLE `hospital` (
  `hospital_id` int(8) NOT NULL,
  `name` varchar(512) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `hospital`
--

INSERT INTO `hospital` (`hospital_id`, `name`) VALUES
(1, 'Royal Bournemouth Hospital'),
(2, 'Royal Christchurch');

-- --------------------------------------------------------

--
-- Table structure for table `imaging_results`
--

CREATE TABLE `imaging_results` (
  `imaging_results_id` int(11) NOT NULL,
  `episode_id` int(9) NOT NULL,
  `cxr` varchar(255) NOT NULL,
  `ct_scan` varchar(255) NOT NULL,
  `ultrasound` varchar(255) NOT NULL,
  `mri` varchar(255) NOT NULL,
  `other` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `medication`
--

CREATE TABLE `medication` (
  `medication_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `dose` int(5) NOT NULL,
  `measure` varchar(255) NOT NULL,
  `route` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `medication`
--

INSERT INTO `medication` (`medication_id`, `name`, `dose`, `measure`, `route`) VALUES
(1, 'Ibuprofen', 0, '', 0),
(2, 'Adderall', 0, '', 0),
(3, 'Codeine', 0, '', 0),
(4, 'Hydrochlorothiazide', 0, '', 0),
(5, 'Paracetamol', 0, '', 0),
(6, 'Benadryl', 0, '', 0);

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
  `patient_id` int(9) NOT NULL,
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
  `gender` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `patient`
--

INSERT INTO `patient` (`patient_id`, `surname`, `firstname`, `address_line_1`, `address_line_2`, `address_city`, `address_county`, `address_country`, `address_postcode`, `date_of_birth`, `telephone`, `mobile`, `gender`) VALUES
(0, 'South', 'Harrison', 'Flat 1 Heron Court', '', 'Bournemouth', 'Dorset', 'England', 'BH89EP', '1995-01-16', '01983529181', '07860631551', 0),
(111111111, 'Nolan', 'Maya', '39 Aldershort Road', '', 'Guildford', 'Surrey', 'England', 'GU28AE', '1995-04-20', '', '', 1);

-- --------------------------------------------------------

--
-- Table structure for table `problem_list`
--

CREATE TABLE `problem_list` (
  `problem_list_id` int(9) NOT NULL,
  `episode_id` int(9) NOT NULL,
  `working_diagnosis` varchar(512) NOT NULL,
  `fbc` tinyint(1) NOT NULL,
  `biochem` tinyint(1) NOT NULL,
  `clotting` tinyint(1) NOT NULL,
  `d_dimer` tinyint(1) NOT NULL,
  `trop_t` tinyint(1) NOT NULL,
  `cx` tinyint(1) NOT NULL,
  `blood` tinyint(1) NOT NULL,
  `esr` tinyint(1) NOT NULL,
  `crp` tinyint(1) NOT NULL,
  `cxr` tinyint(1) NOT NULL,
  `ct` tinyint(1) NOT NULL,
  `ultrasound` tinyint(1) NOT NULL,
  `mri` tinyint(1) NOT NULL,
  `echo` tinyint(1) NOT NULL,
  `svg` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `treatment`
--

CREATE TABLE `treatment` (
  `treatment_id` int(11) NOT NULL,
  `episode_id` int(11) NOT NULL,
  `additional_treatments` varchar(522) NOT NULL,
  `information_given` varchar(522) NOT NULL,
  `follow_up` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `urine_results`
--

CREATE TABLE `urine_results` (
  `urine_results_id` int(9) NOT NULL,
  `episode_id` int(9) NOT NULL,
  `date` date NOT NULL,
  `protein` int(1) NOT NULL,
  `blood` int(1) NOT NULL,
  `glucose` int(1) NOT NULL,
  `nitirites` int(1) NOT NULL,
  `msu_sent` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `blood_results`
--
ALTER TABLE `blood_results`
  ADD PRIMARY KEY (`blood_results_id`),
  ADD KEY `episode_id` (`episode_id`);

--
-- Indexes for table `clinical_episode`
--
ALTER TABLE `clinical_episode`
  ADD PRIMARY KEY (`episode_id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `gp_id` (`gp_id`),
  ADD KEY `hospital_id` (`hospital_id`);

--
-- Indexes for table `current_medication`
--
ALTER TABLE `current_medication`
  ADD PRIMARY KEY (`episode_id`,`medication_id`),
  ADD KEY `medication_id` (`medication_id`);

--
-- Indexes for table `diagnosis`
--
ALTER TABLE `diagnosis`
  ADD PRIMARY KEY (`diagnosis_id`);

--
-- Indexes for table `drug_treatment`
--
ALTER TABLE `drug_treatment`
  ADD PRIMARY KEY (`treatment_id`,`medication_id`),
  ADD KEY `medication_id` (`medication_id`);

--
-- Indexes for table `episode_diagnosis`
--
ALTER TABLE `episode_diagnosis`
  ADD PRIMARY KEY (`episode_id`,`diagnosis_id`),
  ADD KEY `diagnosis_id` (`diagnosis_id`);

--
-- Indexes for table `episode_observations`
--
ALTER TABLE `episode_observations`
  ADD PRIMARY KEY (`episode_id`,`observation_id`),
  ADD KEY `observation_id` (`observation_id`);

--
-- Indexes for table `examination`
--
ALTER TABLE `examination`
  ADD PRIMARY KEY (`examination_id`),
  ADD KEY `episode_id` (`episode_id`);

--
-- Indexes for table `gp`
--
ALTER TABLE `gp`
  ADD PRIMARY KEY (`gp_id`);

--
-- Indexes for table `history`
--
ALTER TABLE `history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `episode_id` (`episode_id`);

--
-- Indexes for table `hospital`
--
ALTER TABLE `hospital`
  ADD PRIMARY KEY (`hospital_id`);

--
-- Indexes for table `imaging_results`
--
ALTER TABLE `imaging_results`
  ADD PRIMARY KEY (`imaging_results_id`),
  ADD KEY `episode_id` (`episode_id`);

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
-- Indexes for table `problem_list`
--
ALTER TABLE `problem_list`
  ADD PRIMARY KEY (`problem_list_id`),
  ADD KEY `episode_id` (`episode_id`);

--
-- Indexes for table `treatment`
--
ALTER TABLE `treatment`
  ADD PRIMARY KEY (`treatment_id`),
  ADD KEY `episode_id` (`episode_id`);

--
-- Indexes for table `urine_results`
--
ALTER TABLE `urine_results`
  ADD PRIMARY KEY (`urine_results_id`),
  ADD KEY `episode_id` (`episode_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `clinical_episode`
--
ALTER TABLE `clinical_episode`
  MODIFY `episode_id` int(9) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `diagnosis`
--
ALTER TABLE `diagnosis`
  MODIFY `diagnosis_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT for table `examination`
--
ALTER TABLE `examination`
  MODIFY `examination_id` int(9) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `gp`
--
ALTER TABLE `gp`
  MODIFY `gp_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT for table `history`
--
ALTER TABLE `history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `hospital`
--
ALTER TABLE `hospital`
  MODIFY `hospital_id` int(8) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `imaging_results`
--
ALTER TABLE `imaging_results`
  MODIFY `imaging_results_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `medication`
--
ALTER TABLE `medication`
  MODIFY `medication_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
--
-- AUTO_INCREMENT for table `observations`
--
ALTER TABLE `observations`
  MODIFY `observation_id` int(9) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `treatment`
--
ALTER TABLE `treatment`
  MODIFY `treatment_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `urine_results`
--
ALTER TABLE `urine_results`
  MODIFY `urine_results_id` int(9) NOT NULL AUTO_INCREMENT;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `blood_results`
--
ALTER TABLE `blood_results`
  ADD CONSTRAINT `blood_results_ibfk_1` FOREIGN KEY (`episode_id`) REFERENCES `clinical_episode` (`episode_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `clinical_episode`
--
ALTER TABLE `clinical_episode`
  ADD CONSTRAINT `clinical_episode_ibfk_1` FOREIGN KEY (`gp_id`) REFERENCES `gp` (`gp_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `clinical_episode_ibfk_2` FOREIGN KEY (`hospital_id`) REFERENCES `hospital` (`hospital_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `current_medication`
--
ALTER TABLE `current_medication`
  ADD CONSTRAINT `current_medication_ibfk_1` FOREIGN KEY (`episode_id`) REFERENCES `clinical_episode` (`episode_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `medication_id` FOREIGN KEY (`medication_id`) REFERENCES `medication` (`medication_id`) ON DELETE CASCADE;

--
-- Constraints for table `drug_treatment`
--
ALTER TABLE `drug_treatment`
  ADD CONSTRAINT `drug_treatment_ibfk_1` FOREIGN KEY (`medication_id`) REFERENCES `medication` (`medication_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `drug_treatment_ibfk_2` FOREIGN KEY (`treatment_id`) REFERENCES `treatment` (`treatment_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `episode_diagnosis`
--
ALTER TABLE `episode_diagnosis`
  ADD CONSTRAINT `episode_diagnosis_ibfk_1` FOREIGN KEY (`episode_id`) REFERENCES `clinical_episode` (`episode_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `episode_diagnosis_ibfk_2` FOREIGN KEY (`diagnosis_id`) REFERENCES `diagnosis` (`diagnosis_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `episode_observations`
--
ALTER TABLE `episode_observations`
  ADD CONSTRAINT `episode_id` FOREIGN KEY (`episode_id`) REFERENCES `clinical_episode` (`episode_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `observation_id` FOREIGN KEY (`observation_id`) REFERENCES `observations` (`observation_id`) ON DELETE CASCADE;

--
-- Constraints for table `examination`
--
ALTER TABLE `examination`
  ADD CONSTRAINT `examination_ibfk_1` FOREIGN KEY (`episode_id`) REFERENCES `clinical_episode` (`episode_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `history`
--
ALTER TABLE `history`
  ADD CONSTRAINT `history_ibfk_1` FOREIGN KEY (`episode_id`) REFERENCES `clinical_episode` (`episode_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `imaging_results`
--
ALTER TABLE `imaging_results`
  ADD CONSTRAINT `imaging_results_ibfk_1` FOREIGN KEY (`episode_id`) REFERENCES `clinical_episode` (`episode_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `problem_list`
--
ALTER TABLE `problem_list`
  ADD CONSTRAINT `problem_list_ibfk_1` FOREIGN KEY (`episode_id`) REFERENCES `clinical_episode` (`episode_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `treatment`
--
ALTER TABLE `treatment`
  ADD CONSTRAINT `treatment_ibfk_1` FOREIGN KEY (`episode_id`) REFERENCES `clinical_episode` (`episode_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `urine_results`
--
ALTER TABLE `urine_results`
  ADD CONSTRAINT `urine_results_ibfk_1` FOREIGN KEY (`episode_id`) REFERENCES `clinical_episode` (`episode_id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
