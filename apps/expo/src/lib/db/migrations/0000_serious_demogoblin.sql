CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`local_id` text,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`text` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`duration` integer NOT NULL,
	`creation_time` integer NOT NULL,
	`string` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assets_name_unique` ON `assets` (`name`);