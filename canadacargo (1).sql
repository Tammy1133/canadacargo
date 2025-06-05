-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 05, 2025 at 11:50 AM
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
CREATE DEFINER=`root`@`localhost` PROCEDURE `create_triggers_for_all_tables` ()   BEGIN
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

        -- Generate and execute INSERT trigger
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

        -- Generate and execute UPDATE trigger
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

        -- Generate and execute DELETE trigger
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
('test@gmail.com', '$2a$10$CpewY/5SfsCpco0uiRmCBeufIZnKWaEKz3wO5MALtreLPvCr/VX2e', 'Tammy', 'Test', '[\"user creation\",\"user management\",\"view all shipments\",\"editing shipments\",\"new shipment\",\"pending weighment\",\"pending payments/ complete payments\",\"generate qr\",\"view out of office list\",\"mark shipment in transit\",\"view all shipments in transit\",\"view arrived shipments\",\"scan qr\",\"configurations\",\"view revenue report\",\"view shipment report\",\"arrival response\",\"payment notification\"]', 'Lagos'),
('ajayitamilore@gmail.com', '$2a$10$HfCjyjH.7FC6RSI7Te1AqeYG287gwmrZyIXptmgA2Jli/2QtuM1OG', 'Oluwatamilore', 'Ajayi', '[\"user creation\",\"user management\",\"view all shipments\",\"editing shipments\",\"new shipment\",\"pending weighment\",\"pending payments/ complete payments\",\"generate qr\",\"view out of office list\",\"mark shipment in transit\",\"view all shipments in transit\",\"view arrived shipments\",\"scan qr\",\"configurations\",\"view revenue report\",\"view shipment report\",\"arrival response\",\"payment notification\"]', 'Ibadan');

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
('vBlY_8Y7W', '2025-05-04T13:50:21.008Z'),
('vBlY_JYB5', '2025-05-04T13:50:31.869Z'),
('yLIP_JIEG', '2025-05-10T14:00:32.646Z'),
('CC0601213237_5EJG', '2025-06-01T16:27:59.971Z'),
('CC0601213237_DC26', '2025-06-01T16:28:08.274Z'),
('CC0602232286_PE8Q', '2025-06-02T05:29:55.593Z');

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
('Ae3C', '9399494', 'Oluwatamilore Ajayi', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'Abeokuta', '44444', 'New Brunswick', '08112037963', 'Processed', 'rey4b455bb5', 'https://tammy.com', '29', '2025-03-31 16:23:17'),
('oONh', '8388383', 'Oluwatamilore Ajayi', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'Abeokuta', '4442', 'Nova scotia', '08112037963', 'Processed', '273DEHG4', 'www.tammy.com', '27', '2025-04-20 21:49:46'),
('vBlY', '66676885', 'Oluwatamilore Ajayi', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'Abeokuta', '56u776767', 'Northwest Territories', '08112037963', 'Processed', '26368oo282', 'www.tammy.com', '29', '2025-05-04 15:00:45'),
('CC0601213237', 'jffhf', 'Oluwatamilore Ajayi', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'Abeokuta', 'djiuirduivn', 'Manitoba', '08112037963', 'Processed', 'Test tracking', 'cango.com/link', '14', '2025-06-01 17:34:41');

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
('DxZG', '2025-05-14T08:04:54.464Z', '11500', 'Cash', '172165862704144', '5', '7500', '4000', '0', '0', '0'),
('rDMo', '2025-05-15T04:40:14.018Z', '140500', 'Cash', '418261147039008', '91', '136500', '4000', '0', '0', '0'),
('TGwb', '2025-05-15T04:54:04.406Z', '76000', 'Cash', '577406371656194', '48', '72000', '4000', '0', '0', '0'),
('CC2025060111033222', '2025-06-01T10:18:04.497Z', '394000', 'Cash', '476318', '78', '390000', '4000', '0', '0', '0'),
('CC2025060111140515', '2025-06-01T10:57:29.509Z', '327000', 'Cash', '305140', '65', '325000', '2000', '0', '0', '0'),
('CC2025060112001918', '2025-06-01T15:43:56.139Z', '217000', 'Bank Transfer', '479584', '43', '215000', '2000', '0', '0', '0'),
('CC2025060116472843', '2025-06-01T15:48:03.356Z', '107000', 'Cash', '546566', '21', '105000', '2000', '0', '0', '2000'),
('CC2025060116563212', '2025-06-01T15:59:04.186Z', '244000', 'Cash', '967032', '48', '240000', '4000', '0', '0', '2000'),
('CC0601213237', '2025-06-01T16:22:11.966Z', '174000', 'Cash', '608209', '34', '170000', '4000', '0', '0', '2000'),
('CC0602232286', '2025-06-02T04:27:30.230Z', '62000', 'Cash', '994015', '12', '60000', '2000', '0', '0', '2000'),
('CC0603315448', '2025-06-03T05:42:28.150Z', '277000', 'Cash', '246198', '55', '275000', '2000', '0', '0', '0'),
('CC0603555315', '2025-06-03T05:57:03.422Z', '174000', 'Cash', '524079', '34', '170000', '4000', '0', '0', '0'),
('CC0603593437', '2025-06-03T06:00:42.733Z', '184000', 'Bank Transfer', '595914', '36', '180000', '4000', '0', '0', '0'),
('CC0603142456', '2025-06-03T06:15:06.859Z', '369000', 'Cash', '559104', '73', '365000', '4000', '0', '0', '0');

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
('0', '3999', '2025-01-25 16:15:19'),
('3999', '1', '2025-01-25 16:18:32');

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
('0', '13', '2025-01-25 16:21:08');

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
('Test Courier', '2025-01-03 11:47:05');

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
('Canada', '2025-03-31 05:13:24');

-- --------------------------------------------------------

--
-- Table structure for table `conf_location_delivery`
--

CREATE TABLE `conf_location_delivery` (
  `name` varchar(250) DEFAULT NULL,
  `price` varchar(250) DEFAULT NULL,
  `date` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `conf_location_delivery`
--

INSERT INTO `conf_location_delivery` (`name`, `price`, `date`) VALUES
('Surulere, Yaba', '2000', '2025-01-25 17:02:01');

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
('Nigeria', '2025-03-31 05:12:24');

-- --------------------------------------------------------

--
-- Table structure for table `conf_payment_modes`
--

CREATE TABLE `conf_payment_modes` (
  `name` varchar(250) DEFAULT NULL,
  `date` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `conf_payment_modes`
--

INSERT INTO `conf_payment_modes` (`name`, `date`) VALUES
('Cash', '2025-03-31 05:12:33'),
('Bank Transfer', '2025-03-31 05:12:39');

-- --------------------------------------------------------

--
-- Table structure for table `conf_piece_type`
--

CREATE TABLE `conf_piece_type` (
  `name` varchar(250) DEFAULT NULL,
  `price` varchar(250) DEFAULT NULL,
  `date` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `conf_piece_type`
--

INSERT INTO `conf_piece_type` (`name`, `price`, `date`) VALUES
('carton', '2000', '2024-12-20 12:46:03'),
('box', '4000', '2024-12-20 22:19:23');

-- --------------------------------------------------------

--
-- Table structure for table `conf_product_type`
--

CREATE TABLE `conf_product_type` (
  `name` varchar(250) DEFAULT NULL,
  `price` varchar(250) DEFAULT NULL,
  `date` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `conf_product_type`
--

INSERT INTO `conf_product_type` (`name`, `price`, `date`) VALUES
('Dry Shipment', '5000', '2025-06-01 10:50:30'),
('Wet Shipment', '6000', '2025-06-01 10:50:47');

-- --------------------------------------------------------

--
-- Table structure for table `conf_shipment_cost`
--

CREATE TABLE `conf_shipment_cost` (
  `oldrate` varchar(250) DEFAULT NULL,
  `newrate` varchar(250) DEFAULT NULL,
  `date` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `conf_shipment_cost`
--

INSERT INTO `conf_shipment_cost` (`oldrate`, `newrate`, `date`) VALUES
('0', '1500', '2025-03-31 05:14:51');

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
('Air Freight', '2025-03-31 05:11:49'),
('Ocean Freight', '2025-03-31 05:12:03');

-- --------------------------------------------------------

--
-- Table structure for table `conf_tax_configuration`
--

CREATE TABLE `conf_tax_configuration` (
  `oldrate` varchar(250) DEFAULT NULL,
  `newrate` varchar(250) DEFAULT NULL,
  `date` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `conf_tax_configuration`
--

INSERT INTO `conf_tax_configuration` (`oldrate`, `newrate`, `date`) VALUES
('0', '20000', '2024-12-18 17:10:49'),
('20000', '30000', '2024-12-18 17:11:56');

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
('2025-06-01', 9),
('2025-06-02', 1);

-- --------------------------------------------------------

--
-- Table structure for table `items_intransit`
--

CREATE TABLE `items_intransit` (
  `item_trans_id` varchar(250) DEFAULT NULL,
  `created_at` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `items_intransit`
--

INSERT INTO `items_intransit` (`item_trans_id`, `created_at`) VALUES
('TGwb_ENIR', '2025-06-01 17:26:45');

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

--
-- Dumping data for table `payment_responses`
--

INSERT INTO `payment_responses` (`transId`, `referenceNumber`, `phone`, `date`, `payment_status`) VALUES
('CC0601213237', 'tetst reference', '09033939393', '2025-06-01 17:49:56', 'VERIFIED');

-- --------------------------------------------------------

--
-- Table structure for table `pending_payment`
--

CREATE TABLE `pending_payment` (
  `trans_id` varchar(250) DEFAULT NULL,
  `items` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pending_payment`
--

INSERT INTO `pending_payment` (`trans_id`, `items`) VALUES
('rUuC', NULL),
('CC0603224176', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `pending_weighment`
--

CREATE TABLE `pending_weighment` (
  `trans_id` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pending_weighment`
--

INSERT INTO `pending_weighment` (`trans_id`) VALUES
('CC0604453358');

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
  `province` varchar(250) DEFAULT NULL,
  `customs_fee` varchar(250) DEFAULT NULL,
  `product_type` varchar(250) DEFAULT NULL,
  `product_type_price` varchar(250) DEFAULT NULL,
  `location` varchar(250) DEFAULT NULL,
  `prepared_by` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shipment_info`
--

INSERT INTO `shipment_info` (`shipper_name`, `shipper_phone`, `shipper_address`, `shipper_email`, `receiver_name`, `receiver_phone`, `receiver_address`, `receiver_email`, `shipment_type`, `box_number`, `courier`, `payment_mode`, `origin`, `destination`, `pickup_date`, `expected_date_delivery`, `comments`, `trans_id`, `status`, `created_date`, `items`, `pickup_location`, `pickup_price`, `province`, `customs_fee`, `product_type`, `product_type_price`, `location`, `prepared_by`) VALUES
('Test Shipper', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@gmail.com', 'Oluwatamilore Ajayi', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@ffmail.com', 'Air Freight', 'BOX-20250514-3', 'Test Courier', 'Cash', 'Nigeria', 'Canada', '2025-05-14', '2025-05-17', 'Test Decription', 'DxZG', 'Processed', '2025-05-14 08:58:32', '[{\"name\":\"Books, Bags\",\"type\":\"Carton\",\"weight\":\"3\",\"status\":\"Pending\",\"item_trans_id\":\"DxZG_60IG\"},{\"name\":\"Test second\",\"type\":\"Carton\",\"weight\":\"2\",\"status\":\"Pending\",\"item_trans_id\":\"DxZG_OOLD\"}]', '', '', 'Newfoundland and Labrador', NULL, NULL, NULL, '0', ''),
('fiunfi', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@gmail.com', 'Oluwatamilore Ajayi', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@ffmail.com', 'Ocean Freight', '1', 'Test Courier', 'Cash', 'Nigeria', 'Canada', '2025-05-15', '2025-05-15', 'funirr', 'rDMo', 'Processed', '2025-05-15 05:39:24', '[{\"name\":\"Books, bags, pen\",\"type\":\"Carton\",\"weight\":\"18\",\"status\":\"Pending\",\"item_trans_id\":\"rDMo_AMSG\"},{\"name\":\"Test\",\"type\":\"Carton\",\"weight\":\"73\",\"status\":\"Pending\",\"item_trans_id\":\"rDMo_9NK5\"}]', '', '', 'Manitoba', NULL, NULL, NULL, '0', ''),
('ghgg', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@gmail.com', 'Oluwatamilore Ajayi', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@ffmail.com', 'Air Freight', 'gggrg', 'Test Courier', 'Cash', 'Nigeria', 'Canada', '2025-05-15', '2025-05-15', 'bvuruuer', 'TGwb', 'Processed', '2025-05-15 05:51:54', '[{\"name\":\"Books, bags, food\",\"type\":\"Carton\",\"weight\":\"39\",\"status\":\"Pending\",\"item_trans_id\":\"TGwb_ENIR\"},{\"name\":\"test bags\",\"type\":\"Carton\",\"weight\":\"9\",\"status\":\"Pending\",\"item_trans_id\":\"TGwb_YB6X\"}]', '', '', 'Newfoundland and Labrador', NULL, NULL, NULL, '0', ''),
('test', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@gmail.com', 'Oluwatamilore Ajayi', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@gmail.com', 'Air Freight', '--', 'Test Courier', 'Cash', 'Nigeria', 'Canada', '2025-05-24', '2025-05-24', 'Yetr', 'rUuC', 'pending payment', '2025-05-24T08:58:48+01:00', NULL, '', '', 'Nova Scotia', NULL, NULL, NULL, '0', ''),
('hhdd', 'fhbhf', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@gmail.com', 'dhbhf', 'jfn fh', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@gmail.com', 'Air Freight', '--', 'Test Courier', 'Cash', 'Nigeria', 'Canada', '2025-06-01', '2025-06-01', 'Test', 'CC2025060111033222', 'Processed', '2025-06-01 11:03:32', '[{\"name\":\"test\",\"type\":\"Carton\",\"weight\":\"29\",\"status\":\"Pending\",\"item_trans_id\":\"CC2025060111033222_LQ3H\"},{\"name\":\"test2\",\"type\":\"Carton\",\"weight\":\"49\",\"status\":\"Pending\",\"item_trans_id\":\"CC2025060111033222_9Y5C\"}]', '', '', 'Alberta', NULL, 'Dry Shipment', '5000', '0', ''),
('Test Shipper', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@gmail.com', 'Oluwatamilore Ajayi', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@ffmail.com', 'Air Freight', '--', 'Test Courier', 'Cash', 'Nigeria', 'Canada', '2025-06-01', '2025-06-01', 'Test description', 'CC2025060111140515', 'Processed', '2025-06-01 11:14:05', '[{\"name\":\"NDhubjhf\",\"type\":\"Carton\",\"weight\":\"65\",\"status\":\"Pending\",\"item_trans_id\":\"CC2025060111140515_YQJW\"}]', 'Surulere, Yaba', '2000', 'Ontario', NULL, 'Dry Shipment', '5000', '0', ''),
('Test Shipper', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@gmail.com', 'Oluwatamilore Ajayi', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@gmail.com', 'Air Freight', '--', 'Test Courier', 'Bank Transfer', 'Nigeria', 'Canada', '2025-06-01', '2025-06-01', 'Test description', 'CC2025060112001918', 'Processed', '2025-06-01 12:00:19', '[{\"name\":\"Books bags and food\",\"type\":\"Carton\",\"weight\":\"43\",\"status\":\"Pending\",\"item_trans_id\":\"CC2025060112001918_VN4R\"}]', 'Surulere, Yaba', '2000', 'New Brunswick', NULL, 'Dry Shipment', '5000', '0', ''),
('Test Shipper', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@gmail.com', 'Oluwatamilore Ajayi', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@ffmail.com', 'Air Freight', '--', 'Test Courier', 'Cash', 'Nigeria', 'Canada', '2025-06-01', '2025-06-01', 'vrtvdvgd', 'CC2025060116472843', 'Processed', '2025-06-01 16:47:28', '[{\"name\":\"Books, bags, slippers\",\"type\":\"Carton\",\"weight\":\"21\",\"status\":\"Pending\",\"item_trans_id\":\"CC2025060116472843_P5IE\"}]', 'Surulere, Yaba', '2000', 'Newfoundland and Labrador', NULL, 'Dry Shipment', '5000', '0', ''),
('Test Shipper', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@gmail.com', 'Oluwatamilore Ajayi', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@gmail.com', 'Air Freight', '--', 'Test Courier', 'Cash', 'Nigeria', 'Canada', '2025-06-01', '2025-06-01', 'DESCRIPTION', 'CC2025060116563212', 'Processed', '2025-06-01 16:56:32', '[{\"name\":\"Books, slippers, toasts\",\"type\":\"Carton\",\"weight\":\"11\",\"status\":\"Pending\",\"item_trans_id\":\"CC2025060116563212_U4H8\"},{\"name\":\"Toothbrush, foodstuff, cardboard\",\"type\":\"Carton\",\"weight\":\"37\",\"status\":\"Pending\",\"item_trans_id\":\"CC2025060116563212_ZTBU\"}]', 'Surulere, Yaba', '2000', 'Newfoundland and Labrador', NULL, 'Dry Shipment', '5000', '0', ''),
('Test Shipper', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@gmail.com', 'Oluwatamilore Ajayi', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@ffmail.com', 'Air Freight', '--', 'Test Courier', 'Cash', 'Nigeria', 'Canada', '2025-06-01', '2025-06-01', 'DESCRIPTION', 'CC0601213237', 'Processed', '2025-06-01 17:21:32', '[{\"name\":\"Bags books and rice\",\"type\":\"Carton\",\"weight\":\"20\",\"status\":\"Pending\",\"item_trans_id\":\"CC0601213237_5EJG\"},{\"name\":\"Spoon and cutleries\",\"type\":\"Carton\",\"weight\":\"14\",\"status\":\"Pending\",\"item_trans_id\":\"CC0601213237_DC26\"}]', 'Surulere, Yaba', '2000', 'Manitoba', '38.42', 'Dry Shipment', '5000', '0', ''),
('Test Ibadan', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@gmail.com', 'Oluwatamilore Ibadan', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@ffmail.com', 'Air Freight', '--', 'Test Courier', 'Cash', 'Nigeria', 'Canada', '2025-06-02', '2025-06-02', 'DESCRIPTION', 'CC0602232286', 'Processed', '2025-06-02 05:23:22', '[{\"name\":\"Books\",\"type\":\"Carton\",\"weight\":\"12\",\"status\":\"Pending\",\"item_trans_id\":\"CC0602232286_PE8Q\"}]', 'Surulere, Yaba', '2000', 'Ontario', NULL, 'Dry Shipment', '5000', 'Ibadan', ''),
('Test Shipper', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@gmail.com', 'Oluwatamilore Ajayi', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@ffmail.com', 'Air Freight', '--', 'Test Courier', 'Bank Transfer', 'Nigeria', 'Canada', '2025-06-03', '2025-06-03', 'DESCRIPTION', 'CC0603224176', 'pending payment', '2025-06-03 06:22:41', NULL, 'Surulere, Yaba', '2000', 'British Columbia', NULL, 'Dry Shipment', '5000', 'Lagos', ''),
('Test Shipper', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@gmail.com', 'Oluwatamilore Ajayi', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@ffmail.com', 'Air Freight', '--', 'Test Courier', 'Cash', 'Nigeria', 'Canada', '2025-06-03', '2025-06-03', 'DESCRIPTION', 'CC0603315448', 'Processed', '2025-06-03 06:31:54', '[{\"name\":\"books bags\",\"type\":\"carton\",\"weight\":\"55\",\"status\":\"Pending\",\"item_trans_id\":\"CC0603315448_HUR8\"}]', '', '', 'Prince Edward Island', NULL, 'Dry Shipment', '5000', 'Lagos', ''),
('Test Shipper', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@gmail.com', 'Oluwatamilore Ajayi', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@ffmail.com', 'Air Freight', '--', 'Test Courier', 'Cash', 'Nigeria', 'Canada', '2025-06-03', '2025-06-03', 'DESCRIPTION', 'CC0603555315', 'Processed', '2025-06-03 06:55:53', '[{\"name\":\"Bags\",\"type\":\"carton\",\"weight\":\"9\",\"status\":\"Pending\",\"item_trans_id\":\"CC0603555315_N3B5\"},{\"name\":\"Boxes\",\"type\":\"carton\",\"weight\":\"25\",\"status\":\"Pending\",\"item_trans_id\":\"CC0603555315_XW1R\"}]', '', '', 'British Columbia', NULL, 'Dry Shipment', '5000', 'Lagos', 'Test Tammy'),
('Test Shipper', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@gmail.com', 'Oluwatamilore Ajayi', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@ffmail.com', 'Air Freight', '--', 'Test Courier', 'Bank Transfer', 'Nigeria', 'Canada', '2025-06-03', '2025-06-03', 'DESCRIPTION', 'CC0603593437', 'Processed', '2025-06-03 06:59:34', '[{\"name\":\"Bags slippers\",\"box_number\":\"13\",\"type\":\"carton\",\"weight\":\"19\",\"status\":\"Pending\",\"item_trans_id\":\"CC0603593437_NS0O\"},{\"name\":\"Cardboard, mise\",\"box_number\":\"20\",\"type\":\"carton\",\"weight\":\"17\",\"status\":\"Pending\",\"item_trans_id\":\"CC0603593437_6PWX\"}]', '', '', 'Saskatchewan', NULL, 'Dry Shipment', '5000', 'Lagos', 'Test Tammy'),
('Test Shipper', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@gmail.com', 'Oluwatamilore Ajayi', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@ffmail.com', 'Air Freight', '--', 'Test Courier', 'Cash', 'Nigeria', 'Canada', '2025-06-03', '2025-06-03', 'DESCRIPTION', 'CC0603142456', 'Processed', '2025-06-03 07:14:24', '[{\"name\":\"test craff\",\"box_number\":\"44\",\"type\":\"carton\",\"weight\":\"58\",\"status\":\"Pending\",\"item_trans_id\":\"CC0603142456_57V3\"},{\"name\":\"dybfuhu ff\",\"box_number\":\"21\",\"type\":\"carton\",\"weight\":\"15\",\"status\":\"Pending\",\"item_trans_id\":\"CC0603142456_5RYM\"}]', '', '', 'Prince Edward Island', NULL, 'Dry Shipment', '5000', 'Lagos', 'Test Tammy'),
('Test Shipper', '08112037963', 'Plot 15 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@gmail.com', 'Oluwatamilore Ajayi', '081120379634', 'Plot 13 bada street behind tipper garage onikolobo abeokuta nigeria', 'ajayitamilore@gmail.com', 'Air Freight', '--', 'Test Courier', 'Cash', 'Nigeria', 'Canada', '2025-06-04', '2025-06-04', 'DESCRIPTION', 'CC0604453358', 'intitated', '2025-06-04 07:45:33', NULL, '', '', 'Saskatchewan', NULL, 'Dry Shipment', '5000', 'Lagos', 'Test Tammy');

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
('DxZG', 'Books, Bags', 'Carton', '3', 'Processed', 'DxZG_60IG', '20250514-1', ''),
('DxZG', 'Test second', 'Carton', '2', 'Processed', 'DxZG_OOLD', '20250514-2', ''),
('rDMo', 'Books, bags, pen', 'Carton', '18', 'Processed', 'rDMo_AMSG', NULL, NULL),
('rDMo', 'Test', 'Carton', '73', 'Processed', 'rDMo_9NK5', NULL, NULL),
('TGwb', 'Books, bags, food', 'Carton', '39', 'In Transit', 'TGwb_ENIR', '36327733yg7d', '4'),
('TGwb', 'test bags', 'Carton', '9', 'Processed', 'TGwb_YB6X', NULL, '5'),
('rUuC', 'dyyd', 'Carton', '21', 'Pending', 'rUuC_I6TZ', NULL, NULL),
('CC2025060111033222', 'test', 'Carton', '29', 'Processed', 'CC2025060111033222_LQ3H', NULL, '1'),
('CC2025060111033222', 'test2', 'Carton', '49', 'Processed', 'CC2025060111033222_9Y5C', NULL, '2'),
('CC2025060111140515', 'NDhubjhf', 'Carton', '65', 'Processed', 'CC2025060111140515_YQJW', NULL, '3'),
('CC2025060112001918', 'Books bags and food', 'Carton', '43', 'Processed', 'CC2025060112001918_VN4R', NULL, '4'),
('CC2025060116472843', 'Books, bags, slippers', 'Carton', '21', 'Processed', 'CC2025060116472843_P5IE', NULL, '5'),
('CC2025060116563212', 'Books, slippers, toasts', 'Carton', '11', 'Processed', 'CC2025060116563212_U4H8', NULL, '6'),
('CC2025060116563212', 'Toothbrush, foodstuff, cardboard', 'Carton', '37', 'Processed', 'CC2025060116563212_ZTBU', NULL, '7'),
('CC0601213237', 'Bags books and rice', 'Carton', '20', 'Arrived', 'CC0601213237_5EJG', '36327733yg7d', '8'),
('CC0601213237', 'Spoon and cutleries', 'Carton', '14', 'Arrived', 'CC0601213237_DC26', '36327733yg7d', '9'),
('CC0602232286', 'Books', 'Carton', '12', 'Arrived', 'CC0602232286_PE8Q', 'djnijnridub', '1'),
('CC0603224176', 'Test carton', 'Carton', '50', 'Pending', 'CC0603224176_W8MO', NULL, NULL),
('CC0603315448', 'books bags', 'carton', '55', 'Processed', 'CC0603315448_HUR8', NULL, '20'),
('CC0603555315', 'Bags', 'carton', '9', 'Processed', 'CC0603555315_N3B5', NULL, '10'),
('CC0603555315', 'Boxes', 'carton', '25', 'Processed', 'CC0603555315_XW1R', NULL, '11'),
('CC0603593437', 'Bags slippers', 'carton', '19', 'Processed', 'CC0603593437_NS0O', NULL, '13'),
('CC0603593437', 'Cardboard, mise', 'carton', '17', 'Processed', 'CC0603593437_6PWX', NULL, '20'),
('CC0603142456', 'test craff', 'carton', '58', 'Processed', 'CC0603142456_57V3', NULL, '44'),
('CC0603142456', 'dybfuhu ff', 'carton', '15', 'Processed', 'CC0603142456_5RYM', NULL, '21');

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
