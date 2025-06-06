CREATE TABLE `budget_alerts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`budget_id` integer NOT NULL,
	`alert_type` text NOT NULL,
	`message` text NOT NULL,
	`percentage` real NOT NULL,
	`amount` real NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`budget_id`) REFERENCES `budgets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `budget_alerts_budget_id_idx` ON `budget_alerts` (`budget_id`);--> statement-breakpoint
CREATE INDEX `budget_alerts_is_read_idx` ON `budget_alerts` (`is_read`);--> statement-breakpoint
CREATE INDEX `budget_alerts_alert_type_idx` ON `budget_alerts` (`alert_type`);--> statement-breakpoint
CREATE TABLE `budget_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`budget_id` integer NOT NULL,
	`date` text NOT NULL,
	`spent_amount` real NOT NULL,
	`percentage` real NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`budget_id`) REFERENCES `budgets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `budget_progress_budget_id_idx` ON `budget_progress` (`budget_id`);--> statement-breakpoint
CREATE INDEX `budget_progress_date_idx` ON `budget_progress` (`date`);--> statement-breakpoint
CREATE TABLE `budgets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category_id` integer,
	`account_id` integer,
	`amount` real NOT NULL,
	`period` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text,
	`spent_amount` real DEFAULT 0 NOT NULL,
	`alert_percentage` integer DEFAULT 80 NOT NULL,
	`alert_triggered` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `budgets_category_id_idx` ON `budgets` (`category_id`);--> statement-breakpoint
CREATE INDEX `budgets_account_id_idx` ON `budgets` (`account_id`);--> statement-breakpoint
CREATE INDEX `budgets_period_idx` ON `budgets` (`period`);--> statement-breakpoint
CREATE INDEX `budgets_is_active_idx` ON `budgets` (`is_active`);--> statement-breakpoint
CREATE INDEX `budgets_start_date_idx` ON `budgets` (`start_date`);