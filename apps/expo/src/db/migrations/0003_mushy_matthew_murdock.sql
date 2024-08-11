ALTER TABLE `asset` RENAME COLUMN `text` TO `mediaType`;--> statement-breakpoint
ALTER TABLE `asset` RENAME COLUMN `string` TO `uri`;--> statement-breakpoint
DROP INDEX IF EXISTS `asset_string_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `asset_uri_unique` ON `asset` (`uri`);