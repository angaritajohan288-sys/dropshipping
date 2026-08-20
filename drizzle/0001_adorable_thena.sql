CREATE TABLE `taskProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taskKey` varchar(96) NOT NULL,
	`isCompleted` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `taskProgress_id` PRIMARY KEY(`id`),
	CONSTRAINT `task_progress_user_task_unique` UNIQUE(`userId`,`taskKey`)
);
--> statement-breakpoint
ALTER TABLE `taskProgress` ADD CONSTRAINT `taskProgress_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;