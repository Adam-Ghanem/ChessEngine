CREATE TABLE `openingStatsCache` (
	`positionKey` varchar(255) NOT NULL,
	`payload` json NOT NULL,
	`fetchedAt` timestamp NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `openingStatsCache_positionKey` PRIMARY KEY(`positionKey`)
);
--> statement-breakpoint
CREATE INDEX `opening_stats_fetched_idx` ON `openingStatsCache` (`fetchedAt`);
