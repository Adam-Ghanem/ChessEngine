CREATE TABLE `analysisSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`gameId` int,
	`positionFen` text NOT NULL,
	`depth` int NOT NULL,
	`bestMove` varchar(16) NOT NULL,
	`scoreCp` int NOT NULL,
	`principalVariation` text NOT NULL,
	`engine` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analysisSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `games` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(140) NOT NULL,
	`mode` enum('local','computer','imported') NOT NULL DEFAULT 'local',
	`status` enum('active','completed','abandoned') NOT NULL DEFAULT 'active',
	`initialFen` text NOT NULL,
	`currentFen` text NOT NULL,
	`moves` json NOT NULL,
	`pgn` text NOT NULL,
	`result` varchar(16),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `games_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lessonProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`lessonKey` varchar(80) NOT NULL,
	`status` enum('not_started','in_progress','completed') NOT NULL DEFAULT 'not_started',
	`completedSteps` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `lessonProgress_id` PRIMARY KEY(`id`),
	CONSTRAINT `lesson_progress_user_lesson_unique` UNIQUE(`userId`,`lessonKey`)
);
--> statement-breakpoint
CREATE TABLE `puzzleAttempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`puzzleKey` varchar(80) NOT NULL,
	`moves` json NOT NULL,
	`result` enum('solved','failed','abandoned') NOT NULL,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `puzzleAttempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE INDEX `analysis_user_created_idx` ON `analysisSessions` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `analysis_game_idx` ON `analysisSessions` (`gameId`);--> statement-breakpoint
CREATE INDEX `games_user_updated_idx` ON `games` (`userId`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `puzzle_attempts_user_created_idx` ON `puzzleAttempts` (`userId`,`createdAt`);