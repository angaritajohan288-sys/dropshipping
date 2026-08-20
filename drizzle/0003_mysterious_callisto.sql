CREATE TABLE `userMonthlyMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`monthKey` varchar(7) NOT NULL,
	`revenueCents` int NOT NULL DEFAULT 0,
	`productCostCents` int NOT NULL DEFAULT 0,
	`adSpendCents` int NOT NULL DEFAULT 0,
	`orders` int NOT NULL DEFAULT 0,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`importedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userMonthlyMetrics_id` PRIMARY KEY(`id`),
	CONSTRAINT `monthly_metrics_user_month_currency_unique` UNIQUE(`userId`,`monthKey`,`currency`)
);
--> statement-breakpoint
CREATE TABLE `userTaskDeadlines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`taskKey` varchar(96) NOT NULL,
	`dueDate` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userTaskDeadlines_id` PRIMARY KEY(`id`),
	CONSTRAINT `task_deadline_user_task_unique` UNIQUE(`userId`,`taskKey`)
);
--> statement-breakpoint
ALTER TABLE `userMonthlyMetrics` ADD CONSTRAINT `userMonthlyMetrics_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userTaskDeadlines` ADD CONSTRAINT `userTaskDeadlines_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;