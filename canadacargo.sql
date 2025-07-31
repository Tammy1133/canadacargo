-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 31, 2025 at 04:58 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `canadacargo`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`%` PROCEDURE `create_triggers_for_all_tables` ()   BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE table_name VARCHAR(255);
    DECLARE cur CURSOR FOR 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'canadacargo';

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO table_name;

        IF done THEN
            LEAVE read_loop;
        END IF;

        
        SET @insert_trigger = CONCAT(
            'CREATE TRIGGER after_insert_', table_name, ' AFTER INSERT ON ', table_name, '
            FOR EACH ROW
            BEGIN
                INSERT INTO audit_table (table_name, action_type, user_email, action_details)
                VALUES (
                    ''', table_name, ''',
                    ''INSERT'',
                    @current_user_email,
                    JSON_OBJECT(', (SELECT GROUP_CONCAT(CONCAT('''', column_name, '''', ', NEW.', column_name) SEPARATOR ', ')
                        FROM information_schema.columns
                        WHERE table_name = table_name AND table_schema = 'canadacargo'), ')
                );
            END;'
        );
        PREPARE stmt FROM @insert_trigger;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

        
        SET @update_trigger = CONCAT(
            'CREATE TRIGGER after_update_', table_name, ' AFTER UPDATE ON ', table_name, '
            FOR EACH ROW
            BEGIN
                INSERT INTO audit_table (table_name, action_type, user_email, action_details)
                VALUES (
                    ''', table_name, ''',
                    ''UPDATE'',
                    @current_user_email,
                    JSON_OBJECT(
                        ''old'', JSON_OBJECT(', (SELECT GROUP_CONCAT(CONCAT('''', column_name, '''', ', OLD.', column_name) SEPARATOR ', ')
                            FROM information_schema.columns
                            WHERE table_name = table_name AND table_schema = 'canadacargo'), '),
                        ''new'', JSON_OBJECT(', (SELECT GROUP_CONCAT(CONCAT('''', column_name, '''', ', NEW.', column_name) SEPARATOR ', ')
                            FROM information_schema.columns
                            WHERE table_name = table_name AND table_schema = 'canadacargo'), ')
                    )
                );
            END;'
        );
        PREPARE stmt FROM @update_trigger;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

        
        SET @delete_trigger = CONCAT(
            'CREATE TRIGGER after_delete_', table_name, ' AFTER DELETE ON ', table_name, '
            FOR EACH ROW
            BEGIN
                INSERT INTO audit_table (table_name, action_type, user_email, action_details)
                VALUES (
                    ''', table_name, ''',
                    ''DELETE'',
                    @current_user_email,
                    JSON_OBJECT(', (SELECT GROUP_CONCAT(CONCAT('''', column_name, '''', ', OLD.', column_name) SEPARATOR ', ')
                        FROM information_schema.columns
                        WHERE table_name = table_name AND table_schema = 'canadacargo'), ')
                );
            END;'
        );
        PREPARE stmt FROM @delete_trigger;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

    END LOOP;

    CLOSE cur;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `appusers`
--

CREATE TABLE `appusers` (
  `email` varchar(250) DEFAULT NULL,
  `password` varchar(1000) DEFAULT NULL,
  `firstname` varchar(250) DEFAULT NULL,
  `lastname` varchar(250) DEFAULT NULL,
  `modules` varchar(10000) DEFAULT NULL,
  `location` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appusers`
--

INSERT INTO `appusers` (`email`, `password`, `firstname`, `lastname`, `modules`, `location`) VALUES
('lagosadmin@gmail.com', '$2a$10$CpewY/5SfsCpco0uiRmCBeufIZnKWaEKz3wO5MALtreLPvCr/VX2e', 'Lagos', 'Admin', '[\"user creation\",\"user management\",\"view all shipments\",\"editing shipments\",\"new shipment\",\"pending weighment\",\"pending payments/ complete payments\",\"generate qr\",\"view out of office list\",\"mark shipment in transit\",\"view all shipments in transit\",\"view arrived shipments\",\"scan qr\",\"configurations\",\"view revenue report\",\"view shipment report\",\"arrival response\",\"payment notification\"]\r\n', 'Lagos'),
('ibadanadmin@gmail.com', '$2a$10$CpewY/5SfsCpco0uiRmCBeufIZnKWaEKz3wO5MALtreLPvCr/VX2e', 'Ibadan', 'Admin', '[\"user creation\",\"user management\",\"view all shipments\",\"editing shipments\",\"new shipment\",\"pending weighment\",\"pending payments/ complete payments\",\"generate qr\",\"view out of office list\",\"mark shipment in transit\",\"view all shipments in transit\",\"view arrived shipments\",\"scan qr\",\"configurations\",\"view revenue report\",\"view shipment report\",\"arrival response\",\"payment notification\"]\r\n', 'Ibadan'),
('canadacargobackup@gmail.com', '$2a$10$x7SaM0QM3nkqKPkieAAEbu5K4cI/QwxZIZtJO6HDXjHPtRfLjgqZG', 'David', 'Ayokunle', '[\"user creation\",\"user management\",\"view all shipments\",\"editing shipments\",\"new shipment\",\"pending weighment\",\"pending payments/ complete payments\",\"generate qr\",\"view out of office list\",\"mark shipment in transit\",\"view all shipments in transit\",\"view arrived shipments\",\"scan qr\",\"configurations\",\"view revenue report\",\"view shipment report\",\"arrival response\",\"payment notification\"]\r\n', 'Lagos'),
('evelynabimbola24@gmail.com', '$2a$10$w.PFusFn4.w.byf58Vasle1BqkkJ1b8IhT3Fbs6RYRKylgTGUhCqW', 'EVELYN', 'ABIMBOLA', '[\"user creation\",\"user management\",\"view all shipments\",\"editing shipments\",\"new shipment\",\"pending weighment\",\"pending payments/ complete payments\",\"generate qr\",\"view out of office list\",\"mark shipment in transit\",\"view all shipments in transit\",\"view arrived shipments\",\"scan qr\",\"configurations\",\"view revenue report\",\"view shipment report\",\"arrival response\",\"payment notification\"]\r\n', 'Lagos'),
('royalboyworldwide29@gmail.com', '$2a$10$B1cXrGeCpq3rg/VpNuCwt.n98Tiw.DtGvbwEycbOaFuDlW2R7CQw6', 'Abdullateef', 'Adeola', '[\"user creation\",\"user management\",\"view all shipments\",\"editing shipments\",\"new shipment\",\"pending weighment\",\"pending payments/ complete payments\",\"generate qr\",\"view out of office list\",\"mark shipment in transit\",\"view all shipments in transit\",\"view arrived shipments\",\"scan qr\",\"configurations\",\"view revenue report\",\"view shipment report\",\"arrival response\",\"payment notification\"]\r\n', 'Lagos'),
('emperorclothings22@gmail.com', '$2a$10$oZudkpeJb/Ok85BbzmDjTOoVfHJhtKRVUpd2rXMERT34JG0.vh.ZS', 'Olaoluwa', 'yeni', '[\"user creation\",\"user management\",\"view all shipments\",\"editing shipments\",\"new shipment\",\"pending weighment\",\"pending payments/ complete payments\",\"generate qr\",\"view out of office list\",\"mark shipment in transit\",\"view all shipments in transit\",\"view arrived shipments\",\"scan qr\",\"configurations\",\"view revenue report\",\"view shipment report\",\"arrival response\",\"payment notification\"]\r\n', 'Lagos'),
('Ayubaakinlotan@gmail.com', '$2a$10$3ViLK.YOCuJyts/J5aA5CeQoDnnqkDB8iG2C4d7eutgiKc2aiLf4e', 'Ayuba', 'Akinlotan', '[\"user creation\",\"user management\",\"view all shipments\",\"editing shipments\",\"new shipment\",\"pending weighment\",\"pending payments/ complete payments\",\"generate qr\",\"view out of office list\",\"mark shipment in transit\",\"view all shipments in transit\",\"view arrived shipments\",\"scan qr\",\"configurations\",\"view revenue report\",\"view shipment report\",\"arrival response\",\"payment notification\"]\r\n', 'Lagos'),
('canadacargo55@gmail.com', '$2a$10$2kFkHh53Qc8V9Clh9ohTceYp66q8y0v3WNxZNZ58OUN4CyuCRcGXa', 'Idris', 'Abiola', '[\"user creation\",\"user management\",\"view all shipments\",\"editing shipments\",\"new shipment\",\"pending weighment\",\"pending payments/ complete payments\",\"generate qr\",\"view out of office list\",\"mark shipment in transit\",\"view all shipments in transit\",\"view arrived shipments\",\"scan qr\",\"configurations\",\"view revenue report\",\"view shipment report\",\"arrival response\",\"payment notification\"]\r\n', 'Lagos'),
('sakayusuf410@gmail.com', '$2a$10$sqZUCZY7/GV/5xoLsNWHtujSRUtXhpOOmq6T3XF83V1.ErNUWPAAK', 'Eniola', 'yusuf', '[\"user creation\",\"user management\",\"view all shipments\",\"editing shipments\",\"new shipment\",\"pending weighment\",\"pending payments/ complete payments\",\"generate qr\",\"view out of office list\",\"mark shipment in transit\",\"view all shipments in transit\",\"view arrived shipments\",\"scan qr\",\"configurations\",\"view revenue report\",\"view shipment report\",\"arrival response\",\"payment notification\"]\r\n', 'Lagos'),
('canadaadmin@gmail.com', '$2a$10$sSATfBLPe6/.T53MniZ7G.l.sINcfjs6DXfpnCqxrubYst7r1fFXK', 'Test', 'Canada', '[\"user creation\",\"user management\",\"view all shipments\",\"editing shipments\",\"new shipment\",\"pending weighment\",\"pending payments/ complete payments\",\"generate qr\",\"view out of office list\",\"mark shipment in transit\",\"view all shipments in transit\",\"view arrived shipments\",\"scan qr\",\"configurations\",\"view revenue report\",\"view shipment report\",\"arrival response\",\"payment notification\"]', 'Canada');

-- --------------------------------------------------------

--
-- Table structure for table `arrivals`
--

CREATE TABLE `arrivals` (
  `item_trans_id` varchar(250) DEFAULT NULL,
  `created_at` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `arrivals`
--

INSERT INTO `arrivals` (`item_trans_id`, `created_at`) VALUES
('CC0628493681_JGCY', '2025-06-28T12:51:35.902Z'),
('CC0628373944_DXU5', '2025-06-28T14:49:26.497Z'),
('CC0704192239_P09V', '2025-07-04T20:18:01.638Z'),
('CC0706260853_NBEB', '2025-07-06T06:39:44.664Z'),
('CC0706152867_0JU3', '2025-07-06T14:50:56.543Z');

-- --------------------------------------------------------

--
-- Table structure for table `arrival_responses`
--

CREATE TABLE `arrival_responses` (
  `trans_id` varchar(250) DEFAULT NULL,
  `boxnumber` varchar(250) DEFAULT NULL,
  `fullname` varchar(250) DEFAULT NULL,
  `address` varchar(250) DEFAULT NULL,
  `city` varchar(250) DEFAULT NULL,
  `aptunit` varchar(250) DEFAULT NULL,
  `province` varchar(250) DEFAULT NULL,
  `phone` varchar(250) DEFAULT NULL,
  `status` varchar(250) NOT NULL DEFAULT 'Pending',
  `tracking_number_delivery` varchar(250) DEFAULT NULL,
  `tracking_link` varchar(250) DEFAULT NULL,
  `postagebill` varchar(250) DEFAULT NULL,
  `date` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `arrival_responses`
--

INSERT INTO `arrival_responses` (`trans_id`, `boxnumber`, `fullname`, `address`, `city`, `aptunit`, `province`, `phone`, `status`, `tracking_number_delivery`, `tracking_link`, `postagebill`, `date`) VALUES
('CC0628493681', 'jffhf', 'Oluwatamilore Ajayi', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'Abeokuta', '239', 'Saskatchewan', '08112037963', 'Processed', '22374845', 'www.fedex.com', '150', '2025-06-28 13:55:56'),
('CC0628373944', 'jffhf', 'John Doe', 'Plot 4 New foundland', 'TEst city', '27', 'Prince Edward Island', '+17374774', 'Processed', '747477474', 'www.fedex.com/tracking', '150', '2025-06-28 15:51:41'),
('CC0706115696', 'jffhf', 'Oluwatamilore Ajayi', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'Abeokuta', '22', 'Saskatchewan', '08112037963', 'Processed', '29398484', 'www.fedex.com/tracking', '20', '2025-07-06 21:22:58');

-- --------------------------------------------------------

--
-- Table structure for table `audit_table`
--

CREATE TABLE `audit_table` (
  `action_type` varchar(250) DEFAULT NULL,
  `table_name` varchar(250) DEFAULT NULL,
  `user_email` varchar(250) DEFAULT NULL,
  `action_details` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `completed_payments`
--

CREATE TABLE `completed_payments` (
  `trans_id` varchar(250) DEFAULT NULL,
  `date` varchar(250) DEFAULT NULL,
  `amount` varchar(250) DEFAULT NULL,
  `payment_mode` varchar(250) DEFAULT NULL,
  `invoice_no` varchar(250) DEFAULT NULL,
  `weight` varchar(250) DEFAULT NULL,
  `shipping_rate` varchar(250) DEFAULT NULL,
  `carton` varchar(250) DEFAULT NULL,
  `custom_fee` varchar(250) DEFAULT NULL,
  `doorstep_fee` varchar(250) DEFAULT NULL,
  `pickup_fee` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `completed_payments`
--

INSERT INTO `completed_payments` (`trans_id`, `date`, `amount`, `payment_mode`, `invoice_no`, `weight`, `shipping_rate`, `carton`, `custom_fee`, `doorstep_fee`, `pickup_fee`) VALUES
('CC0628382757', '2025-06-28T12:39:08.982Z', '86000', 'Cash', '991592', '14', '84000', '2000', '0', '0', '0'),
('CC0628493681', '2025-06-28T12:50:02.143Z', '14000', 'Debit Card', '472501', '2', '12000', '2000', '0', '0', '0'),
('CC0628073479', '2025-06-28T14:13:30.283Z', '50000', 'Cash', '175810', '8', '48000', '2000', '0', '0', '0'),
('CC0628073479', '2025-06-28T14:13:54.280Z', '50000', 'Cash', '571505', '8', '48000', '2000', '0', '0', '0'),
('CC0628373944', '2025-06-28T14:47:00.099Z', '32000', 'Bank Transfer ', '478510', '5', '30000', '2000', '0', '0', '0'),
('CC0704192239', '2025-07-04T19:22:25.660Z', '49000', 'Bank Transfer', '345913', '24', '48000', '1000', '0', '0', '1000'),
('CC0705110892', '2025-07-05T19:25:33.327Z', '22', 'Bank Canada', '532410', '21', '21', '1', '0', '0', '0'),
('CC0706260853', '2025-07-06T06:26:43.500Z', '12', 'Bank Canada', '465198', '11', '11', '1', '0', '0', '10'),
('CC0706134986', '2025-07-06T14:14:43.382Z', '15', 'Bank Canada', '188903', '14', '14', '1', '0', '0', '0'),
('CC0706152867', '2025-07-06T14:22:37.380Z', '24', 'Bank Canada', '797143', '23', '23', '1', '0', '0', '0'),
('CC0706433229', '2025-07-06T15:45:33.203Z', '50000', 'Bank Transfer', '276931', '24', '48000', '2000', '0', '0', '0'),
('CC0706115696', '2025-07-06T20:13:16.448Z', '3000', 'Bank Transfer', '215502', '1', '2000', '1000', '0', '0', '0'),
('CC0706531385', '2025-07-06 21:56:31', '34', 'Bank Canada', '592824', '33', '33', '1', '0', '0', '0'),
('CC0722015266', '2025-07-22 16:03:57', '120000', 'Cash', '136504', '20', '118000', '2000', '0', '0', '0');

-- --------------------------------------------------------

--
-- Table structure for table `conf_clearing_fee`
--

CREATE TABLE `conf_clearing_fee` (
  `oldrate` varchar(250) DEFAULT NULL,
  `newrate` varchar(250) DEFAULT NULL,
  `date` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `conf_clearing_fee`
--

INSERT INTO `conf_clearing_fee` (`oldrate`, `newrate`, `date`) VALUES
('0', '10', '2025-06-02 10:10:37'),
('10', '1', '2025-07-06 17:08:28');

-- --------------------------------------------------------

--
-- Table structure for table `conf_clearing_tax`
--

CREATE TABLE `conf_clearing_tax` (
  `oldrate` varchar(250) DEFAULT NULL,
  `newrate` varchar(250) DEFAULT NULL,
  `date` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `conf_clearing_tax`
--

INSERT INTO `conf_clearing_tax` (`oldrate`, `newrate`, `date`) VALUES
('0', '15', '2025-06-02 10:10:51'),
('15', '10', '2025-07-06 17:08:35');

-- --------------------------------------------------------

--
-- Table structure for table `conf_courier`
--

CREATE TABLE `conf_courier` (
  `name` varchar(250) DEFAULT NULL,
  `date` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `conf_courier`
--

INSERT INTO `conf_courier` (`name`, `date`) VALUES
('KLM', '2025-06-02 10:09:07');

-- --------------------------------------------------------

--
-- Table structure for table `conf_destination`
--

CREATE TABLE `conf_destination` (
  `name` varchar(250) DEFAULT NULL,
  `date` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `conf_destination`
--

INSERT INTO `conf_destination` (`name`, `date`) VALUES
('Canada', '2025-06-02 10:10:05'),
('U.S.A', '2025-06-03 14:28:31'),
('U.K', '2025-06-03 14:29:02'),
('Nigeria', '2025-06-03 14:29:23');

-- --------------------------------------------------------

--
-- Table structure for table `conf_extrafees`
--

CREATE TABLE `conf_extrafees` (
  `name` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `price` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `date` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `location` varchar(250) DEFAULT 'Lagos'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `conf_extrafees`
--

INSERT INTO `conf_extrafees` (`name`, `price`, `date`, `location`) VALUES
('Small Nylon', '1000', '2025-06-09 17:13:37', 'Lagos'),
('Biggest Nylon', '500', '2025-06-09 20:46:23', 'Lagos'),
('Biggest Ziplok', '400', '2025-06-09 20:47:29', 'Lagos'),
('Medium Ziplok', '300', '2025-06-09 20:48:16', 'Lagos'),
('Small Ziplok', '200', '2025-06-09 20:49:01', 'Lagos'),
('Smallest Ziplock', '100', '2025-06-09 20:49:52', 'Lagos'),
('Declaration fee', '45000', '2025-06-10 16:17:37', 'Lagos'),
('Declaration fee 2', '39100', '2025-06-10 16:26:42', 'Lagos'),
('Deceleration Fee 3', '90000', '2025-06-11 15:48:22', 'Lagos'),
('Declaration fee 5', '55000', '2025-06-11 17:55:40', 'Lagos'),
('Declaration Fee 6', '10000', '2025-06-12 12:45:02', 'Lagos'),
('Declaration Fee 7', '30000', '2025-06-12 13:53:42', 'Lagos'),
('Declaration fee 8', '25000', '2025-06-27 20:00:33', 'Lagos'),
('Bakk', '2000', '2025-07-04 19:54:38', 'Ibadan'),
('Askin', '20', '2025-07-05 20:06:14', 'Canada');

-- --------------------------------------------------------

--
-- Table structure for table `conf_location_delivery`
--

CREATE TABLE `conf_location_delivery` (
  `name` varchar(250) DEFAULT NULL,
  `price` varchar(250) DEFAULT NULL,
  `date` varchar(250) DEFAULT NULL,
  `location` varchar(250) DEFAULT 'Lagos'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `conf_location_delivery`
--

INSERT INTO `conf_location_delivery` (`name`, `price`, `date`, `location`) VALUES
('Pickup Fee 2', '5000', '2025-06-11 17:00:01', 'Lagos'),
('Pickup Fee 3', '6000', '2025-06-11 17:02:19', 'Lagos'),
('Pickup Fee 4', '10000', '2025-06-11 17:02:40', 'Lagos'),
('Pickup Fee 5', '12000', '2025-06-11 17:03:07', 'Lagos'),
('Pickup Fee 1', '4000', '2025-06-11 17:04:07', 'Lagos'),
('Pickup Fee 6', '7000', '2025-06-17 20:14:49', 'Lagos'),
('Pickup Fee 7', '8000', '2025-06-17 20:15:16', 'Lagos'),
('LOCATION 1', '1000', '2025-07-04 19:42:43', 'Ibadan'),
('NGRok', '10', '2025-07-05 20:06:32', 'Canada');

-- --------------------------------------------------------

--
-- Table structure for table `conf_origin`
--

CREATE TABLE `conf_origin` (
  `name` varchar(250) DEFAULT NULL,
  `date` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `conf_origin`
--

INSERT INTO `conf_origin` (`name`, `date`) VALUES
('Nigeria', '2025-06-02 10:09:55'),
('Canada', '2025-07-04 19:59:03');

-- --------------------------------------------------------

--
-- Table structure for table `conf_payment_modes`
--

CREATE TABLE `conf_payment_modes` (
  `name` varchar(250) DEFAULT NULL,
  `date` varchar(250) DEFAULT NULL,
  `location` varchar(250) DEFAULT 'Lagos'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `conf_payment_modes`
--

INSERT INTO `conf_payment_modes` (`name`, `date`, `location`) VALUES
('Cash', '2025-06-02 10:09:15', 'Lagos'),
('Bank Transfer ', '2025-06-03 14:18:00', 'Lagos'),
('Debit Card', '2025-06-03 14:18:29', 'Lagos'),
('Debit Card & Bank Transfer', '2025-06-03 14:19:54', 'Lagos'),
('Debit Card & Cash', '2025-06-03 14:20:27', 'Lagos'),
('Bank Transfer & Cash', '2025-06-03 14:22:18', 'Lagos'),
('Debit Card & Cash & Bank Transfer', '2025-06-03 14:24:42', 'Lagos'),
('Bank Transfer', '2025-07-04 19:53:29', 'Ibadan'),
('Bank Canada', '2025-07-05 20:04:52', 'Canada'),
('New Canada', '2025-07-05 20:04:58', 'Canada');

-- --------------------------------------------------------

--
-- Table structure for table `conf_piece_type`
--

CREATE TABLE `conf_piece_type` (
  `name` varchar(250) DEFAULT NULL,
  `price` varchar(250) DEFAULT NULL,
  `date` varchar(250) DEFAULT NULL,
  `location` varchar(250) DEFAULT 'Lagos'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `conf_piece_type`
--

INSERT INTO `conf_piece_type` (`name`, `price`, `date`, `location`) VALUES
('Carton', '2000', '2025-06-02 10:10:13', 'Lagos'),
('Big Carton', '2000', '2025-06-03 18:34:03', 'Lagos'),
('Medium Carton', '1000', '2025-06-03 18:35:37', 'Lagos'),
('Small Carton', '600', '2025-06-03 18:36:22', 'Lagos'),
('Made', '0', '2025-06-05 19:53:00', 'Lagos'),
('Book', '1000', '2025-07-04 19:54:09', 'Ibadan'),
('Carton', '1', '2025-07-05 20:05:46', 'Canada'),
('Small Carton', '3', '2025-07-05 20:06:03', 'Canada');

-- --------------------------------------------------------

--
-- Table structure for table `conf_product_type`
--

CREATE TABLE `conf_product_type` (
  `name` varchar(250) DEFAULT NULL,
  `price` varchar(250) DEFAULT NULL,
  `date` varchar(250) DEFAULT NULL,
  `location` varchar(250) DEFAULT 'Lagos'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `conf_product_type`
--

INSERT INTO `conf_product_type` (`name`, `price`, `date`, `location`) VALUES
('Frozen shipment', '6000', '2025-06-02 10:08:31', 'Lagos'),
('Dry Shipment (Canada)', '5900', '2025-06-03 14:14:15', 'Lagos'),
('U.S.A', '5900', '2025-06-03 14:16:08', 'Lagos'),
('U.K', '5300', '2025-06-03 14:16:44', 'Lagos'),
('Test New', '2000', '2025-07-04 20:18:38', 'Ibadan'),
('Test Canada type', '1', '2025-07-05 20:03:43', 'Canada');

-- --------------------------------------------------------

--
-- Table structure for table `conf_shipment_cost`
--

CREATE TABLE `conf_shipment_cost` (
  `oldrate` varchar(250) DEFAULT NULL,
  `newrate` varchar(250) DEFAULT NULL,
  `date` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `conf_shipment_type`
--

CREATE TABLE `conf_shipment_type` (
  `name` varchar(250) DEFAULT NULL,
  `date` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `conf_shipment_type`
--

INSERT INTO `conf_shipment_type` (`name`, `date`) VALUES
('Air freight ', '2025-06-02 10:08:49'),
('Sea', '2025-06-02 10:08:57');

-- --------------------------------------------------------

--
-- Table structure for table `conf_tax_configuration`
--

CREATE TABLE `conf_tax_configuration` (
  `oldrate` varchar(250) DEFAULT NULL,
  `newrate` varchar(250) DEFAULT NULL,
  `date` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `daily_counters`
--

CREATE TABLE `daily_counters` (
  `date` date NOT NULL,
  `counter` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `daily_counters`
--

INSERT INTO `daily_counters` (`date`, `counter`) VALUES
('2025-06-02', 3);

-- --------------------------------------------------------

--
-- Table structure for table `items_intransit`
--

CREATE TABLE `items_intransit` (
  `item_trans_id` varchar(250) DEFAULT NULL,
  `created_at` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `out_of_office`
--

CREATE TABLE `out_of_office` (
  `item_trans_id` varchar(250) DEFAULT NULL,
  `created_at` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_responses`
--

CREATE TABLE `payment_responses` (
  `transId` varchar(250) DEFAULT NULL,
  `referenceNumber` varchar(250) DEFAULT NULL,
  `phone` varchar(250) DEFAULT NULL,
  `date` varchar(250) DEFAULT NULL,
  `payment_status` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pending_payment`
--

CREATE TABLE `pending_payment` (
  `trans_id` varchar(250) DEFAULT NULL,
  `items` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pending_weighment`
--

CREATE TABLE `pending_weighment` (
  `trans_id` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shipment_info`
--

CREATE TABLE `shipment_info` (
  `shipper_name` varchar(250) DEFAULT NULL,
  `shipper_phone` varchar(250) DEFAULT NULL,
  `shipper_address` varchar(250) DEFAULT NULL,
  `shipper_email` varchar(250) DEFAULT NULL,
  `receiver_name` varchar(250) DEFAULT NULL,
  `receiver_phone` varchar(250) DEFAULT NULL,
  `receiver_address` varchar(250) DEFAULT NULL,
  `receiver_email` varchar(250) DEFAULT NULL,
  `shipment_type` varchar(250) DEFAULT NULL,
  `box_number` varchar(250) DEFAULT NULL,
  `courier` varchar(250) DEFAULT NULL,
  `payment_mode` varchar(250) DEFAULT NULL,
  `origin` varchar(250) DEFAULT NULL,
  `destination` varchar(250) DEFAULT NULL,
  `pickup_date` varchar(250) DEFAULT NULL,
  `expected_date_delivery` varchar(250) DEFAULT NULL,
  `comments` longtext DEFAULT NULL,
  `trans_id` varchar(250) DEFAULT NULL,
  `status` varchar(250) DEFAULT NULL,
  `created_date` varchar(250) DEFAULT NULL,
  `items` mediumtext DEFAULT NULL,
  `pickup_location` varchar(250) DEFAULT NULL,
  `pickup_price` varchar(250) DEFAULT NULL,
  `extra_fees` mediumtext DEFAULT NULL,
  `total_extra_fees` varchar(250) DEFAULT NULL,
  `feequantities` mediumtext DEFAULT NULL,
  `province` varchar(250) DEFAULT NULL,
  `customs_fee` varchar(250) DEFAULT NULL,
  `product_type` varchar(250) DEFAULT NULL,
  `product_type_price` varchar(250) DEFAULT NULL,
  `location` varchar(250) DEFAULT NULL,
  `prepared_by` varchar(250) NOT NULL,
  `logs` mediumtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shipment_info`
--

INSERT INTO `shipment_info` (`shipper_name`, `shipper_phone`, `shipper_address`, `shipper_email`, `receiver_name`, `receiver_phone`, `receiver_address`, `receiver_email`, `shipment_type`, `box_number`, `courier`, `payment_mode`, `origin`, `destination`, `pickup_date`, `expected_date_delivery`, `comments`, `trans_id`, `status`, `created_date`, `items`, `pickup_location`, `pickup_price`, `extra_fees`, `total_extra_fees`, `feequantities`, `province`, `customs_fee`, `product_type`, `product_type_price`, `location`, `prepared_by`, `logs`) VALUES
('test', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@gmail.com', 'Oluwatamilore Ajayi', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@gmail.com', 'Air freight ', '--', 'KLM', 'Cash', 'Nigeria', 'Canada', '2025-07-22', '2025-07-22', 'DESCRIPTION', 'CC0722015266', 'Processed', '2025-07-22 16:01:52', '[{\"name\":\"hair book\",\"box_number\":\"12\",\"type\":\"Carton\",\"weight\":\"20\",\"status\":\"Pending\",\"item_trans_id\":\"CC0722015266_YO8Y\"}]', '', '', '[]', '0.00', '{}', 'Ontario', '22', 'Dry Shipment (Canada)', '5900', 'Lagos', 'Admin Lagos', '{\"shipment_created\":\"2025-07-22 16:01:52\",\"items_weighed\":\"2025-07-22 16:03:44\",\"payment_completed\":\"2025-07-22 16:03:57\",\"out_of_office\":\"2025-07-22 16:08:05\",\"in_transit\":\"2025-07-22 16:10:19\",\"arrived\":\"2025-07-22 16:11:15\",\"delivered\":\"2025-07-22 16:15:00\"}');

-- --------------------------------------------------------

--
-- Table structure for table `shipment_items`
--

CREATE TABLE `shipment_items` (
  `trans_id` varchar(250) DEFAULT NULL,
  `name` varchar(250) DEFAULT NULL,
  `type` varchar(250) DEFAULT NULL,
  `weight` varchar(250) DEFAULT NULL,
  `status` varchar(250) DEFAULT NULL,
  `item_trans_id` varchar(250) DEFAULT NULL,
  `tracking_number` varchar(250) DEFAULT NULL,
  `box_number` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shipment_items`
--

INSERT INTO `shipment_items` (`trans_id`, `name`, `type`, `weight`, `status`, `item_trans_id`, `tracking_number`, `box_number`) VALUES
('CC0722015266', 'hair book', 'Carton', '20', 'Delivered', 'CC0722015266_YO8Y', 'ehdhhdhdh', '12');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `daily_counters`
--
ALTER TABLE `daily_counters`
  ADD PRIMARY KEY (`date`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
