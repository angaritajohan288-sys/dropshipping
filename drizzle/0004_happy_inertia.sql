CREATE TABLE `userReminderSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`leadDays` int NOT NULL DEFAULT 3,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userReminderSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `reminder_settings_user_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `userReminderSettings` ADD CONSTRAINT `userReminderSettings_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;