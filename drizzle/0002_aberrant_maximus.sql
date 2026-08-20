CREATE TABLE `taskAttachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taskKey` varchar(96) NOT NULL,
	`storageKey` varchar(500) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`mimeType` varchar(120) NOT NULL,
	`sizeBytes` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `taskAttachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `taskNotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taskKey` varchar(96) NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `taskNotes_id` PRIMARY KEY(`id`),
	CONSTRAINT `task_note_user_task_unique` UNIQUE(`userId`,`taskKey`)
);
--> statement-breakpoint
CREATE TABLE `userBusinessMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`revenueCents` int NOT NULL DEFAULT 0,
	`productCostCents` int NOT NULL DEFAULT 0,
	`adSpendCents` int NOT NULL DEFAULT 0,
	`orders` int NOT NULL DEFAULT 0,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userBusinessMetrics_id` PRIMARY KEY(`id`),
	CONSTRAINT `business_metrics_user_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `userPlanSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`startDate` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userPlanSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `plan_settings_user_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `taskAttachments` ADD CONSTRAINT `taskAttachments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `taskNotes` ADD CONSTRAINT `taskNotes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userBusinessMetrics` ADD CONSTRAINT `userBusinessMetrics_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userPlanSettings` ADD CONSTRAINT `userPlanSettings_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;