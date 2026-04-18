CREATE TABLE `project_followers` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `project_followers_project_idx` ON `project_followers` (`project_id`);--> statement-breakpoint
CREATE INDEX `project_followers_user_idx` ON `project_followers` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `project_followers_project_user_unique` ON `project_followers` (`project_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `project_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`label` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `project_tags_project_idx` ON `project_tags` (`project_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `project_tags_project_label_unique` ON `project_tags` (`project_id`,`label`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`tagline` text,
	`description` text,
	`launch_story` text,
	`category_id` text,
	`type_id` text,
	`stage_id` text,
	`website_url` text,
	`repo_url` text,
	`demo_url` text,
	`thumbnail_url` text,
	`pricing_model` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`is_public` integer DEFAULT true,
	`is_open_source` integer DEFAULT false,
	`is_seeking_investment` integer DEFAULT false,
	`is_seeking_teammates` integer DEFAULT false,
	`likes_count` integer DEFAULT 0,
	`upvotes_count` integer DEFAULT 0,
	`views_count` integer DEFAULT 0,
	`comments_count` integer DEFAULT 0,
	`start_date` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`launched_at` integer,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`type_id`) REFERENCES `project_types`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`stage_id`) REFERENCES `project_stages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_projects`("id", "owner_id", "slug", "name", "tagline", "description", "launch_story", "category_id", "type_id", "stage_id", "website_url", "repo_url", "demo_url", "thumbnail_url", "pricing_model", "status", "is_public", "is_open_source", "is_seeking_investment", "is_seeking_teammates", "likes_count", "upvotes_count", "views_count", "comments_count", "start_date", "created_at", "updated_at", "launched_at") SELECT "id", "owner_id", "slug", "name", "tagline", "description", "launch_story", "category_id", "type_id", "stage_id", "website_url", "repo_url", "demo_url", "thumbnail_url", "pricing_model", "status", "is_public", "is_open_source", "is_seeking_investment", "is_seeking_teammates", "likes_count", "upvotes_count", "views_count", "comments_count", "start_date", "created_at", "updated_at", "launched_at" FROM `projects`;--> statement-breakpoint
DROP TABLE `projects`;--> statement-breakpoint
ALTER TABLE `__new_projects` RENAME TO `projects`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `projects_owner_idx` ON `projects` (`owner_id`);--> statement-breakpoint
CREATE INDEX `projects_slug_idx` ON `projects` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `projects_owner_slug_unique` ON `projects` (`owner_id`,`slug`);--> statement-breakpoint
CREATE INDEX `projects_status_idx` ON `projects` (`status`);--> statement-breakpoint
CREATE INDEX `projects_category_idx` ON `projects` (`category_id`);--> statement-breakpoint
CREATE INDEX `projects_stage_idx` ON `projects` (`stage_id`);--> statement-breakpoint
CREATE INDEX `projects_created_idx` ON `projects` (`created_at`);