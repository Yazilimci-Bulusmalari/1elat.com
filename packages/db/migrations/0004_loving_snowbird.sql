CREATE TABLE `skills` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name_en` text NOT NULL,
	`name_tr` text NOT NULL,
	`icon` text,
	`parent_id` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `skills_slug_unique` ON `skills` (`slug`);--> statement-breakpoint
CREATE INDEX `skills_slug_idx` ON `skills` (`slug`);--> statement-breakpoint
CREATE TABLE `user_skills` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`skill_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `user_skills_user_idx` ON `user_skills` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_skills_skill_idx` ON `user_skills` (`skill_id`);--> statement-breakpoint
ALTER TABLE `users` ADD `is_open_to_work` integer DEFAULT false;