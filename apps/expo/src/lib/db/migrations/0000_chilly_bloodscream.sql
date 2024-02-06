CREATE TABLE `photos` (
	`id` integer PRIMARY KEY NOT NULL,
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
CREATE UNIQUE INDEX `photos_name_unique` ON `photos` (`name`);