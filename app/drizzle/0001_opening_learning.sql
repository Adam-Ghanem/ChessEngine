CREATE TABLE `openingReviewItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`openingNodeId` varchar(255) NOT NULL,
	`side` enum('white','black') NOT NULL,
	`ease` int NOT NULL DEFAULT 250,
	`intervalDays` int NOT NULL DEFAULT 0,
	`dueAt` timestamp,
	`streak` int NOT NULL DEFAULT 0,
	`lapses` int NOT NULL DEFAULT 0,
	`lastResult` enum('again','hard','good','easy'),
	`lastReviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `openingReviewItems_id` PRIMARY KEY(`id`),
	CONSTRAINT `opening_review_user_node_side_unique` UNIQUE(`userId`,`openingNodeId`,`side`)
);
--> statement-breakpoint
CREATE INDEX `opening_review_user_due_idx` ON `openingReviewItems` (`userId`,`dueAt`);
--> statement-breakpoint
CREATE TABLE `openingAttempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`openingNodeId` varchar(255) NOT NULL,
	`side` enum('white','black') NOT NULL,
	`result` enum('correct','acceptable','wrong') NOT NULL,
	`responseMs` int NOT NULL DEFAULT 0,
	`usedHint` boolean NOT NULL DEFAULT false,
	`rating` enum('again','hard','good','easy') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `openingAttempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `opening_attempt_user_created_idx` ON `openingAttempts` (`userId`,`createdAt`);
--> statement-breakpoint
CREATE INDEX `opening_attempt_user_node_idx` ON `openingAttempts` (`userId`,`openingNodeId`);
