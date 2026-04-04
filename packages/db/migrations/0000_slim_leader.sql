CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name_en` text NOT NULL,
	`name_tr` text NOT NULL,
	`icon` text,
	`description` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `professions` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name_en` text NOT NULL,
	`name_tr` text NOT NULL,
	`icon` text,
	`group` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `project_stages` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name_en` text NOT NULL,
	`name_tr` text NOT NULL,
	`color` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `project_types` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name_en` text NOT NULL,
	`name_tr` text NOT NULL,
	`icon` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `technologies` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`icon_url` text,
	`group` text,
	`website_url` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `follows` (
	`id` text PRIMARY KEY NOT NULL,
	`follower_id` text NOT NULL,
	`following_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`follower_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`following_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `follows_follower_idx` ON `follows` (`follower_id`);--> statement-breakpoint
CREATE INDEX `follows_following_idx` ON `follows` (`following_id`);--> statement-breakpoint
CREATE TABLE `user_professions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`profession_id` text NOT NULL,
	`is_primary` integer DEFAULT false,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`profession_id`) REFERENCES `professions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `user_professions_user_idx` ON `user_professions` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`github_id` text,
	`google_id` text,
	`email` text NOT NULL,
	`username` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`bio` text,
	`avatar_url` text,
	`cover_url` text,
	`website` text,
	`github_url` text,
	`linkedin_url` text,
	`twitter_url` text,
	`location` text,
	`rating` integer DEFAULT 0,
	`rating_count` integer DEFAULT 0,
	`is_public` integer DEFAULT true,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_username_idx` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `users_github_id_idx` ON `users` (`github_id`);--> statement-breakpoint
CREATE INDEX `users_google_id_idx` ON `users` (`google_id`);--> statement-breakpoint
CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`author_id` text NOT NULL,
	`parent_id` text,
	`content` text NOT NULL,
	`likes_count` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `comments_project_idx` ON `comments` (`project_id`);--> statement-breakpoint
CREATE INDEX `comments_author_idx` ON `comments` (`author_id`);--> statement-breakpoint
CREATE INDEX `comments_parent_idx` ON `comments` (`parent_id`);--> statement-breakpoint
CREATE TABLE `project_images` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`url` text NOT NULL,
	`caption` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `project_images_project_idx` ON `project_images` (`project_id`);--> statement-breakpoint
CREATE TABLE `project_likes` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `project_likes_project_idx` ON `project_likes` (`project_id`);--> statement-breakpoint
CREATE INDEX `project_likes_user_idx` ON `project_likes` (`user_id`);--> statement-breakpoint
CREATE TABLE `project_members` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`joined_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `project_members_project_idx` ON `project_members` (`project_id`);--> statement-breakpoint
CREATE INDEX `project_members_user_idx` ON `project_members` (`user_id`);--> statement-breakpoint
CREATE TABLE `project_technologies` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`technology_id` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`technology_id`) REFERENCES `technologies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `project_tech_project_idx` ON `project_technologies` (`project_id`);--> statement-breakpoint
CREATE TABLE `project_upvotes` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `project_upvotes_project_idx` ON `project_upvotes` (`project_id`);--> statement-breakpoint
CREATE INDEX `project_upvotes_user_idx` ON `project_upvotes` (`user_id`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`tagline` text,
	`description` text,
	`category_id` text NOT NULL,
	`type_id` text NOT NULL,
	`stage_id` text NOT NULL,
	`website_url` text,
	`repo_url` text,
	`demo_url` text,
	`thumbnail_url` text,
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
CREATE INDEX `projects_owner_idx` ON `projects` (`owner_id`);--> statement-breakpoint
CREATE INDEX `projects_slug_idx` ON `projects` (`slug`);--> statement-breakpoint
CREATE INDEX `projects_category_idx` ON `projects` (`category_id`);--> statement-breakpoint
CREATE INDEX `projects_stage_idx` ON `projects` (`stage_id`);--> statement-breakpoint
CREATE INDEX `projects_created_idx` ON `projects` (`created_at`);