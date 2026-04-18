CREATE TABLE `comment_likes` (
	`id` text PRIMARY KEY NOT NULL,
	`comment_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `comment_likes_comment_idx` ON `comment_likes` (`comment_id`);--> statement-breakpoint
CREATE INDEX `comment_likes_user_idx` ON `comment_likes` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `comment_likes_comment_user_unique` ON `comment_likes` (`comment_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `project_invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`inviter_id` text NOT NULL,
	`invitee_id` text NOT NULL,
	`role` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`message` text,
	`created_at` integer NOT NULL,
	`responded_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`inviter_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`invitee_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `project_invitations_project_idx` ON `project_invitations` (`project_id`);--> statement-breakpoint
CREATE INDEX `project_invitations_invitee_idx` ON `project_invitations` (`invitee_id`);--> statement-breakpoint
CREATE INDEX `project_invitations_status_idx` ON `project_invitations` (`status`);--> statement-breakpoint
ALTER TABLE `projects` ADD `followers_count` integer DEFAULT 0;