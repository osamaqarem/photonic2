CREATE TABLE `asset` (
	`id` text PRIMARY KEY NOT NULL,
	`deviceId` text NOT NULL,
	`localId` text,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`text` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`duration` integer NOT NULL,
	`creationTime` integer NOT NULL,
	`string` text,
	`userId` text NOT NULL
);
