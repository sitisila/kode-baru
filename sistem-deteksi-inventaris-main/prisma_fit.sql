-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jul 06, 2026 at 01:06 PM
-- Server version: 8.0.30
-- PHP Version: 8.3.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `prisma_fit`
--

-- --------------------------------------------------------

--
-- Table structure for table `assets`
--

CREATE TABLE `assets` (
  `id` int NOT NULL,
  `serialNumber` varchar(100) DEFAULT NULL,
  `asset_code` varchar(50) NOT NULL,
  `asset_name` varchar(100) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `lab` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Tersedia',
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `sumber_pendanaan` varchar(255) DEFAULT NULL,
  `no_invoice` varchar(100) DEFAULT NULL,
  `status_kelayakan` varchar(100) DEFAULT NULL,
  `deskripsi` text,
  `QTY` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `assets`
--

INSERT INTO `assets` (`id`, `serialNumber`, `asset_code`, `asset_name`, `category`, `location`, `lab`, `status`, `description`, `created_at`, `sumber_pendanaan`, `no_invoice`, `status_kelayakan`, `deskripsi`, `QTY`) VALUES
(5, '1234567654323', '1234567654323', 'kaset', 'DGFHGGGFD322', 'bawag', 'Cellular Communication (CellComm) Laboratory', 'Tersedia', '||META:eyJicmFuZCI6IjIyNiIsInllYXIiOiI0NDQ0IiwiYWNjIjoic2Zhc3cyIiwicXR5Ijo4LCJkZXNjIjoic2ZhZ2FnZSJ9|| sfagage', '2026-07-04 17:31:41', '2SDS33', '34R4222224', 'Rusak Berat', '||META:eyJicmFuZCI6IjIyNiIsInllYXIiOiI0NDQ0IiwiYWNjIjoic2Zhc3cyIiwicXR5Ijo4LCJkZXNjIjoic2ZhZ2FnZSJ9|| sfagage', 8),
(11, '133575343', '133575343', 'kaset1', 'DGFHGGGFD', 'Rak besi atas', 'Telecommunication Networking (TelNet) Laboratory', 'TERSEDIA', '||META:eyJicmFuZCI6IjIyNiIsInllYXIiOiIzMTIyIiwiYWNjIjoidHR0dCIsInF0eSI6MTMsImRlc2MiOiI4c2RmZ2giLCJjb25kaXRpb24iOiJCYWlrIFwvIExheWFrIn0=|| 8sdfgh', '2026-07-04 17:57:08', '2SDS2', '34R4222224', 'Rusak Ringan', '||META:eyJicmFuZCI6IjIyNiIsInllYXIiOiIzMTIyIiwiYWNjIjoidHR0dCIsInF0eSI6MTMsImRlc2MiOiI4c2RmZ2giLCJjb25kaXRpb24iOiJCYWlrIFwvIExheWFrIn0=|| 8sdfgh', 13),
(16, '2221111', '2221111', 'dafa', 'DGFHGGGFDa', 'sate', 'Mechanical and Electrical Workshop Laboratory', 'TERSEDIA', '||META:eyJicmFuZCI6IjIyMTJzIiwieWVhciI6IjIwMjIiLCJhY2MiOiJhIiwicXR5Ijo4LCJkZXNjIjoicyIsImNvbmRpdGlvbiI6IkJhaWsgXC8gTGF5YWsifQ==|| s', '2026-07-05 02:26:41', 'vasere', '34R41c', 'Rusak Berat', '||META:eyJicmFuZCI6IjIyMTJzIiwieWVhciI6IjIwMjIiLCJhY2MiOiJhIiwicXR5Ijo4LCJkZXNjIjoicyIsImNvbmRpdGlvbiI6IkJhaWsgXC8gTGF5YWsifQ==|| s', 8),
(17, '3122', '3122', 'sss', 'DGFHGGGFD322', 'bawag', 'Optical Communication System (OCS) Laboratory', 'Tersedia', '||META:eyJicmFuZCI6IjExcyIsInllYXIiOiIyMDIyIiwiYWNjIjoiZmYiLCJxdHkiOjEsImRlc2MiOiJ4eCJ9|| xx', '2026-07-05 03:23:15', '2SDS33', '34R42222222s', 'Baik', '||META:eyJicmFuZCI6IjExcyIsInllYXIiOiIyMDIyIiwiYWNjIjoiZmYiLCJxdHkiOjEsImRlc2MiOiJ4eCJ9|| xx', 1),
(19, '222111112', '222111112', 'siuuu', 'ASET NON-TEKNIS TAPI BERNILAI', 'Rak besi atas', 'Ruangan Admin', 'Tersedia', '||META:eyJicmFuZCI6InN4MyIsInllYXIiOiI0NDQ0MiIsImFjYyI6Ii0iLCJxdHkiOjYsImRlc2MiOiItIn0=|| -', '2026-07-05 07:16:31', '1223', '34R41', 'Baik', '||META:eyJicmFuZCI6InN4MyIsInllYXIiOiI0NDQ0MiIsImFjYyI6Ii0iLCJxdHkiOjYsImRlc2MiOiItIn0=|| -', 6),
(20, '2233', '2233', 'apa', 'PERALATAN LABORATORIUM & PENGUKURAN', 'Rak besi atas', 'Wireless Communication (WiComm) Laboratory', 'Tersedia', '||META:eyJicmFuZCI6Ing1IiwieWVhciI6IjIxMjIiLCJhY2MiOiItIiwicXR5Ijo3LCJkZXNjIjoiLSJ9|| -', '2026-07-05 09:27:56', '2SDS334', '34R41', 'Baik', '||META:eyJicmFuZCI6Ing1IiwieWVhciI6IjIxMjIiLCJhY2MiOiItIiwicXR5Ijo3LCJkZXNjIjoiLSJ9|| -', 7);

-- --------------------------------------------------------

--
-- Table structure for table `loans`
--

CREATE TABLE `loans` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `userName` varchar(255) NOT NULL,
  `userEmail` varchar(255) NOT NULL,
  `asset_id` int NOT NULL,
  `assetName` varchar(255) NOT NULL,
  `loan_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `purpose` text,
  `borrowTime` time DEFAULT NULL,
  `returnTime` time DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `status` varchar(50) DEFAULT 'Pending',
  `return_condition` varchar(100) DEFAULT 'Baik / Layak',
  `return_photo` varchar(255) DEFAULT NULL,
  `return_notes` text,
  `notes` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `loans`
--

INSERT INTO `loans` (`id`, `user_id`, `userName`, `userEmail`, `asset_id`, `assetName`, `loan_date`, `return_date`, `purpose`, `borrowTime`, `returnTime`, `quantity`, `status`, `return_condition`, `return_photo`, `return_notes`, `notes`) VALUES
(1, 4, 'User Biasa', 'user@telkomuniversity.ac.id', 11, 'kaset1', '2026-07-05', '2026-07-07', '-', '04:28:07', NULL, 1, 'DIKEMBALIKAN', 'Baik / Layak', NULL, NULL, 'Kondisi: Baik / Layak | Catatan: - | Foto Bukti: 26-266835_blank-speech-bubble-blank-pixel-speech-bubble-png.png'),
(3, 4, 'User Biasa', 'user@telkomuniversity.ac.id', 16, 'dafa', '2026-07-05', '2026-07-05', 'mau ', '12:00:00', '16:58:00', 1, 'DIKEMBALIKAN', 'Baik / Layak', NULL, NULL, 'Kondisi: Baik / Layak | Catatan: OKE | Foto Bukti: 257.jpg'),
(5, 4, 'User Biasa', 'user@telkomuniversity.ac.id', 16, 'dafa', '2026-07-05', '2026-07-05', 'PERLU AJA', '19:00:00', '22:56:00', 1, 'DIKEMBALIKAN', 'Baik / Layak', NULL, NULL, 'Kondisi: Baik / Layak | Catatan: OKE DONE | Foto Bukti: 5261298.png'),
(6, 4, 'User Biasa', 'user@telkomuniversity.ac.id', 19, 'siuuu', '2026-07-05', '2026-07-05', '-', '08:30:00', '16:30:00', 1, 'REJECTED', 'Baik / Layak', NULL, NULL, '-'),
(7, 4, 'User Biasa', 'user@telkomuniversity.ac.id', 16, 'dafa', '2026-07-06', '2026-07-06', 'perlu', '19:32:00', '23:11:00', 1, 'REJECTED', 'Baik / Layak', NULL, NULL, 'perlu');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `nim` varchar(20) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'USER',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `email`, `password`, `phone`, `nim`, `role`, `created_at`) VALUES
(3, 'Muh Fahrul Fahrezi', 'fahrul', 'fahrul@telkomuniversity.ac.id', '12345678', '081234567890', NULL, 'Admin', '2026-07-04 08:24:06'),
(4, 'User Biasa', 'userbiasa', 'user@telkomuniversity.ac.id', '12345678', '081299998888', NULL, 'Mahasiswa', '2026-07-04 08:29:34'),
(5, 'Admin Kedua', '1202229999', 'admin2@telkomuniversity.ac.id', '12345678', '081234567899', NULL, 'Dosen', '2026-07-05 04:20:07'),
(6, 'doseng', 'doseng', 'abcd@employee.telkomuniversity.ac.id', '$2y$10$DZNwM6740.nXChzu6X5jc.hTvfkHUe1ubhDA7RAHpLZ3I3..7G.6C', '081222264523', 'j04444444', 'dosen', '2026-07-06 12:11:29'),
(7, 'mahasewa', 'mahasewa', 'abcd@student.telkomuniversity.ac.id', '$2y$10$syBm/bIOWDfAw3JCLK2A0eXoh.dJkqe5PrpFkFqlQs9gs2L0OCLbK', '0837277392', 'j0222222', 'mahasiswa', '2026-07-06 12:12:56');

-- --------------------------------------------------------

--
-- Table structure for table `user_tokens`
--

CREATE TABLE `user_tokens` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_tokens`
--

INSERT INTO `user_tokens` (`id`, `user_id`, `token`, `created_at`, `expires_at`) VALUES
(1, 3, '505e250e45e081daa5e1837ce292f59bfd8ccd6e8878c07b148130d75833cfce', '2026-07-04 14:28:46', '2026-07-05 14:28:46'),
(2, 3, 'e45efde64e429389110998e0188f6c4d0144d311a7b74eb1ec61d46239c3cd8f', '2026-07-04 15:33:04', '2026-07-05 15:33:04'),
(3, 3, 'e9d2d466db9a092d1ec0c070d3129b23b3dd5c2866d8d9be09bf4e2f722087d8', '2026-07-04 15:36:10', '2026-07-05 15:36:10'),
(4, 3, '7b060e003565e5899aafabc29528522dd42e0cd415d7cc9cb26ae93b01c337df', '2026-07-04 15:38:26', '2026-07-05 15:38:26'),
(5, 4, 'bec11d014a448d1b3dc566dc0d5ae82999c835bfdb19362f48fe152a203c57cd', '2026-07-04 15:38:56', '2026-07-05 15:38:56'),
(6, 3, 'cd3c9416909e12d9a610f42aa055b9b965bf83b929647eaf0faa588f201e7423', '2026-07-04 15:39:14', '2026-07-05 15:39:14'),
(7, 3, 'e8fb56ee8d7f63bdf68214d9dd846b5ac35bb4a291f0f6bdfc9245550e8a0b4a', '2026-07-04 15:52:02', '2026-07-05 15:52:02'),
(8, 3, 'f165da31c25868a1acdee1c93d34dfe46a10b2e0fe22ebd3acb087b59a191a03', '2026-07-04 15:54:20', '2026-07-05 15:54:20'),
(9, 4, '611f22324a50911542be08e7c9c5fdef0ceb73a58b16b31cd2b07574cc93fcfa', '2026-07-04 16:06:35', '2026-07-05 16:06:35'),
(10, 3, '06d93d933bb59eaade624448b3ecad65e96602f9c76358d155e2650ee8a2ce09', '2026-07-04 16:08:38', '2026-07-05 16:08:38'),
(11, 4, '2bc63fe60bdd211bff2fc83507ca8a24596c13c81b2feb75db434392b48edb73', '2026-07-04 16:09:18', '2026-07-05 16:09:18'),
(12, 3, '9b8b3c7c925ca6d4118bbe39e866b7c3636132f8020a8d07d7ddb0a2e9a3cfe3', '2026-07-04 16:16:20', '2026-07-05 16:16:20'),
(13, 3, 'c84340868934b40ba9b745e2c59b4851c67b384d2a984280f614dcaa808db9e1', '2026-07-04 16:20:28', '2026-07-05 16:20:28'),
(14, 3, 'd1d155ea8a85d29a3efe7e32abf9546deb993e6787f4e7a48fb8acd909d5c942', '2026-07-04 16:24:44', '2026-07-05 16:24:44'),
(15, 4, 'c70ee010c50fe61bf8ec539dad7a0bdcf05259b3a503cd98b68e3a27ca14739e', '2026-07-04 16:26:17', '2026-07-05 16:26:17'),
(16, 3, '261f87c3692e018697f55daef2218c3b39410315e81d73373cdb1e5af2b0cf90', '2026-07-04 16:27:14', '2026-07-05 16:27:14'),
(17, 3, '7b0cce5ed1663192630be3c61144e9974465bf41e1a4db259baff0a202617998', '2026-07-04 16:28:21', '2026-07-05 16:28:21'),
(18, 3, '49086cb0f8a877ef7a30918c1da4f02321477136b69cab280f4082247a093830', '2026-07-04 16:41:45', '2026-07-05 16:41:45'),
(19, 4, '30410988228a8ec582056c48c81fe4532982ba1e15d4aa325572417e76f73e16', '2026-07-04 16:44:05', '2026-07-05 16:44:05'),
(20, 3, '229a415e99216e4bd37d22f07e0a3f21498d2298476d392d71b7ef6b780cbc89', '2026-07-04 16:47:05', '2026-07-05 16:47:05'),
(21, 3, '86a50898eb1674da5bf01bd9f8ba2a4cb5c636c6a4fad812e8bc3e86e7ac790f', '2026-07-04 16:55:51', '2026-07-05 16:55:51'),
(22, 3, 'd5b7bbadacf0e15b8ee8fbacd1c7b7f32f9b774daf199bd427887bcb7596e067', '2026-07-04 16:58:53', '2026-07-05 16:58:53'),
(23, 3, 'e3700f3a03065a99cdd31a73da152e589dd75aea2a84b03d4ba86718bf6feca1', '2026-07-04 17:09:49', '2026-07-05 17:09:49'),
(24, 3, '6cb25860617d115ed3cac21d4af0938c3eb7c1c3e46212fdb66c3e77a7a2070b', '2026-07-04 17:10:15', '2026-07-05 17:10:15'),
(25, 3, '629a31a150c42d18a698c926d397dc335f7e4ea864edf4415e79da717c445694', '2026-07-04 17:11:40', '2026-07-05 17:11:40'),
(26, 3, '84d0a20488e17b3601a55d1b3dbde5798c51aff77a1db3002fd85fd49f715251', '2026-07-04 17:12:20', '2026-07-05 17:12:20'),
(27, 3, 'b8f610dfdce16e05af57d65b88d6a7b0c028d6d550553a1513eae0ff9ad9d880', '2026-07-04 17:18:24', '2026-07-05 17:18:24'),
(28, 3, 'a081f61b15863fb73b69d968e2f01788213e7a3a68077ac5ab855580abfd34c4', '2026-07-04 17:21:05', '2026-07-05 17:21:05'),
(29, 3, 'e9b68638b752e253b69a4e11a1432a7c507b29e0f81e3a99e29f4cb31bd77066', '2026-07-04 17:30:25', '2026-07-05 17:30:25'),
(30, 3, '7980858e0c17eb4d7759611d0361f961978c1c3c34f3fc38ab51457c0e7352b5', '2026-07-04 17:32:41', '2026-07-05 17:32:41'),
(31, 3, 'ccc871d24b345f1915be3685b9ebb9729b778e793a6a66b375ef8887a4e2870f', '2026-07-04 17:34:02', '2026-07-05 17:34:02'),
(32, 3, '325dbca1446064d6e274b8894743f7a26b79bb02065e8bf3cb9e3a037736b4a9', '2026-07-04 17:37:20', '2026-07-05 17:37:20'),
(33, 3, 'f7ddad05cbc14810b9d04ba02e420b2cdb3c2a24d3d837f64e6681de8d531e50', '2026-07-04 17:38:42', '2026-07-05 17:38:42'),
(34, 3, '832c081e20e1b4bf1ac525fb62ec5cd61e540abc3530fafd596235fb07b44931', '2026-07-04 17:38:53', '2026-07-05 17:38:53'),
(35, 3, '9993e84e1c261b50b48d981d553f7ed63b4fba051c2882ee3e2b8f93cd859052', '2026-07-04 17:45:47', '2026-07-05 17:45:47'),
(36, 3, '44e549bbf8928f4592db033f4688e11849fd1eca55cdf738cb4a0a55961a57b1', '2026-07-04 17:47:31', '2026-07-05 17:47:31'),
(37, 3, '5e6caa1e911345477628abf7490d18cc47f067cae4cbfe0686fc42ceb9bde307', '2026-07-04 17:54:10', '2026-07-05 17:54:10'),
(38, 3, '1ad9353d477e8c7d51631279c2c95475a5e0067516cf479cdaf340774b0da361', '2026-07-04 17:55:16', '2026-07-05 17:55:16'),
(39, 3, '839ce9719d426a817b0a10110cd736beb017bd51a4947bb691f92b800083c1a6', '2026-07-04 18:01:49', '2026-07-05 18:01:49'),
(40, 3, '08076202c705ff34cdf9a9dd208f6e2cab576432fd68ad8639c690033eaa9629', '2026-07-04 18:05:10', '2026-07-05 18:05:10'),
(41, 3, '6338963718cd1395661b88e586d73408124cea4ebd1eafc3c342fc880995e0ae', '2026-07-04 18:10:39', '2026-07-05 18:10:39'),
(42, 3, '16ef156f35b3f364f6a55a8e53d70b3b03351335559c4bb5234a7bff1af5472d', '2026-07-04 18:54:08', '2026-07-05 18:54:08'),
(43, 3, '931970200a4c8b6ba36d2513b0e81124c252907cb3d01b5350cc287471804308', '2026-07-04 18:56:43', '2026-07-05 18:56:43'),
(44, 3, 'b0d66266a96dd700a4cda7d932ab4cd3bca8bd15f35d5338918864624239657f', '2026-07-05 02:25:58', '2026-07-06 02:25:58'),
(45, 4, '718051a30ff1a1339f91936cc05be55ef46f8c52d1f65d1f59ae65a68ca7ae2b', '2026-07-05 02:27:10', '2026-07-06 02:27:10'),
(46, 3, 'a66370c3334ab1a9d7072a25062da20d57dd813cb148221bc054726cc5b5363a', '2026-07-05 02:49:42', '2026-07-06 02:49:42'),
(47, 4, '172e47c6fec051810ab8231da6b9be14c6a8ef9ac54ca931dc0aef5ed2e97d5b', '2026-07-05 02:54:19', '2026-07-06 02:54:19'),
(48, 3, '25959ef66faa972949d9e34e048d62a3681f67b876e72f991dbcda594c310cab', '2026-07-05 03:03:27', '2026-07-06 03:03:27'),
(49, 4, '0695c00ebcac2a7f556663f13d4afb0300011b19f1ef65f2155dec5a2d0419c4', '2026-07-05 03:36:05', '2026-07-06 03:36:05'),
(50, 4, 'd88a7bf9a0fc377665a207034a24bb70f3e896dd76d7ff54dbd98a2db8de1df6', '2026-07-05 03:36:44', '2026-07-06 03:36:44'),
(51, 3, 'f604984590d468df18ae9c6886b3c61d57dc7641414e1ebf63e1b489bf69f5a6', '2026-07-05 03:44:11', '2026-07-06 03:44:11'),
(52, 3, '2da7b62ec2b7091860031dafb5862fbd380f5fdc34e9e9ed7589323366a80eb5', '2026-07-05 03:45:03', '2026-07-06 03:45:03'),
(53, 4, '409c47fb35c621c691762f6881fe4d9f8d1c972bd634eb86b9172b892b39a51c', '2026-07-05 03:45:13', '2026-07-06 03:45:13'),
(54, 3, 'b2b3a5de5980a53145d6a43486430b0ccfa24828a1adcb0c46b87ff2deb6869d', '2026-07-05 03:46:02', '2026-07-06 03:46:02'),
(55, 4, 'aa2ca0a62abd809f947dc554ec432f483a63e7dfb30cc4dae43ba736bdc5cbdf', '2026-07-05 03:46:38', '2026-07-06 03:46:38'),
(56, 3, '3062e6481d6202f9885a18a5c0e9a5d7042dfb0b19ec11316116e1b7db292594', '2026-07-05 04:13:38', '2026-07-06 04:13:38'),
(57, 4, 'a659dd79dcfe249681207b864d8a0e81d8ae36bec06ed729f1d1a3280cf2c04d', '2026-07-05 04:14:12', '2026-07-06 04:14:12'),
(58, 3, '686e9134dad0c797f33ea46cfb230ee3b54a480e056d6fe6ac61e0e09e2f0113', '2026-07-05 04:14:50', '2026-07-06 04:14:50'),
(59, 5, 'cc82bb27029670349c16e3ed25e0b49231f6565b6e415e11aa2a5f149737faf7', '2026-07-05 04:21:02', '2026-07-06 04:21:02'),
(60, 4, '2862db9716c05d13af6e4519419e134c96332cffc8c4106390b521bf05afb8fb', '2026-07-05 04:21:19', '2026-07-06 04:21:19'),
(61, 5, 'd60cd31a3884517020bd30b3eedd3447884de0c966f700145b8b2ce0993f2ae7', '2026-07-05 04:21:58', '2026-07-06 04:21:58'),
(62, 4, 'b8a8ed27092bd03cd9d40649fc7ed203ee9c2faba4e5ad69e2b9a2460ee85896', '2026-07-05 04:23:53', '2026-07-06 04:23:53'),
(63, 3, '1104fd900e0bbec6ec4a1356eae63cb6e267db8f6d798f76f5576f7b73a7494e', '2026-07-05 04:30:28', '2026-07-06 04:30:28'),
(64, 4, '7d060e342375ac8a7cef0efcde126e022277233df0fe8185ee92318641920841', '2026-07-05 04:32:57', '2026-07-06 04:32:57'),
(65, 3, 'a19399d86a11d584f7ce9f8da1e3f52799ae3c54daf613225734681646173ba3', '2026-07-05 04:33:30', '2026-07-06 04:33:30'),
(66, 4, '9a7d0e953e3b52d290e40e7dbfad3f7cfa7d35bc8b3459dbdf781abe73f2e927', '2026-07-05 05:40:07', '2026-07-06 05:40:07'),
(67, 4, 'd4db37b23d1c377d1b365d06f0c0687aeb21284b111118ab8a65ba4c7cfe44d0', '2026-07-05 05:47:07', '2026-07-06 05:47:07'),
(68, 3, '3e055db7e197b0d1bfb75fdbc6292254a170d819c432d4ab486e60e7a51a24bb', '2026-07-05 05:48:19', '2026-07-06 05:48:19'),
(69, 4, 'e7868253898062722530eb59ab3811b19069bf6deb2908bd37cecd7bf934fc2d', '2026-07-05 05:49:59', '2026-07-06 05:49:59'),
(70, 3, 'b5939ecc0db4cdfea0c5c080f205f62c972bab9df68452e0127522177817a636', '2026-07-05 06:10:33', '2026-07-06 06:10:33'),
(71, 4, '21d0d44ee6885cb67e509f9db21221970ed6ead623cf9657761ecdfdf6c8457c', '2026-07-05 06:15:53', '2026-07-06 06:15:53'),
(72, 3, 'caaa2badfa3174ca1b54697775a5610f3b5ddac2eff2c7d39d45a9e699da8b98', '2026-07-05 06:16:34', '2026-07-06 06:16:34'),
(73, 4, 'a7fdf76b059f6f9eb28f8b5601dfbcb7b0374499db8760a1fb327fd67e59c350', '2026-07-05 06:17:02', '2026-07-06 06:17:02'),
(74, 3, '53ded6f7e24dafe13185e676d84724b55bd473b4baf8eec262a1b739a6ca2703', '2026-07-05 06:17:53', '2026-07-06 06:17:53'),
(75, 3, '8fc4a0b53ddc6b47bb692a14db3991bf7ac8c6e2ca8d61004e61cc67c49b4db0', '2026-07-05 06:29:55', '2026-07-06 06:29:55'),
(76, 4, '80793973f49c110ecc7075520947826b74c5c10e0730ae60b9ff548d1fb303ac', '2026-07-05 07:39:08', '2026-07-06 07:39:08'),
(77, 3, 'aed199be2b32e436432d74a72386469d68dfc22307d26f7849740f4cafdd0c3b', '2026-07-05 07:41:17', '2026-07-06 07:41:17'),
(78, 3, 'b03bff6b00ce92f654f6c1e793311cd48324a8d355beb7c0972139436857bb4d', '2026-07-05 07:45:52', '2026-07-06 07:45:52'),
(79, 4, '6547c090d3742a147acfbed96245e83920cc98d730618393c311c10613109f17', '2026-07-05 07:46:05', '2026-07-06 07:46:05'),
(80, 3, '1ce0382f8c836087696b577609ef21a798e0ee81f1e6f5679771ba8383ab2c5d', '2026-07-05 07:53:52', '2026-07-06 07:53:52'),
(81, 4, 'b93553ef9c6d76516a79353fe93c23c2715106697a1bfe8c130c70849134994c', '2026-07-05 07:55:20', '2026-07-06 07:55:20'),
(82, 3, 'bdfbe786aa770ba810c00fbdc20c970e181f112e19bfc83488882676e5538bff', '2026-07-05 07:56:54', '2026-07-06 07:56:54'),
(83, 4, '5687aaf63e18bb2c3b6aec4d749d65d7e6c1190084d71628d977120727917978', '2026-07-05 07:57:29', '2026-07-06 07:57:29'),
(84, 3, 'ec5034d048843832efb69cd99d783dca3237df8ce6d0506d360315443ef4e158', '2026-07-05 08:00:27', '2026-07-06 08:00:27'),
(85, 4, '8f5bac41d30853c6453ff1f0c93fd4d5461dc1341485eac36f0284f1bc8cbdb9', '2026-07-05 09:29:01', '2026-07-06 09:29:01'),
(86, 3, '646fd581755101343016af44e838ad1d5e9b0691925b5846f1d8014eeaefc311', '2026-07-05 09:31:28', '2026-07-06 09:31:28'),
(87, 5, '78f4a3b188b1c723b1458e0881e988464fab0764140cbb9503f8efcbd47300af', '2026-07-05 09:33:20', '2026-07-06 09:33:20'),
(88, 3, '84532921c66073b510d4990421402ed217d6d7ab8bdc0dafe05b68739390a6b8', '2026-07-05 09:33:48', '2026-07-06 09:33:48'),
(89, 3, 'e0306b84367257d55791295d088dcd9ee524bed51a3fe7f24c823ab0a62348c8', '2026-07-06 06:42:40', '2026-07-07 06:42:40'),
(90, 4, 'b3498dd270747f1472e9d1f950ff7a5b12f26068872d6c6f2e3881c1da8688a8', '2026-07-06 06:43:37', '2026-07-07 06:43:37'),
(91, 3, '49f939284b3144c4e29b7b572dcadc1a70e02d94802c75dff67975d2c317bc3d', '2026-07-06 06:44:20', '2026-07-07 06:44:20'),
(92, 6, '1a039c118c1880cdcec6958db45f437463136236716f5d4766c701ed58e2e22e', '2026-07-06 12:11:51', '2026-07-07 12:11:51'),
(93, 7, 'eee9d5387ace220258e86127b6eed6e5cd70ff345e66bb65d3e72727507cab89', '2026-07-06 12:15:02', '2026-07-07 12:15:02'),
(94, 3, 'be94826b40f8031541a09c92ef14211f467c4a25889e07fdbb8ec90448e600cc', '2026-07-06 12:19:01', '2026-07-07 12:19:01');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assets`
--
ALTER TABLE `assets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `asset_code` (`asset_code`);

--
-- Indexes for table `loans`
--
ALTER TABLE `loans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_loans_user` (`user_id`),
  ADD KEY `fk_loans_asset` (`asset_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_tokens`
--
ALTER TABLE `user_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `assets`
--
ALTER TABLE `assets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `loans`
--
ALTER TABLE `loans`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `user_tokens`
--
ALTER TABLE `user_tokens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `loans`
--
ALTER TABLE `loans`
  ADD CONSTRAINT `fk_loans_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_loans_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
