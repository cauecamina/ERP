import { MigrationInterface, QueryRunner } from "typeorm";

export class ExpandClientFields1771901620503 implements MigrationInterface {
    name = 'ExpandClientFields1771901620503'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`clients\` ADD \`fantasy_name\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`clients\` ADD \`contact_name\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`clients\` ADD \`ddd\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`clients\` ADD \`street\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`clients\` ADD \`number\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`clients\` ADD \`neighborhood\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`clients\` ADD \`complement\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`clients\` ADD \`city\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`clients\` ADD \`state\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`clients\` ADD \`zip_code\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`clients\` ADD \`active\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`clients\` CHANGE \`avatar\` \`avatar\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`sku\` \`sku\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`ean\` \`ean\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`ncm\` \`ncm\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`family\` \`family\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`observations\` \`observations\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`image\` \`image\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`accounts_receivable\` CHANGE \`paid_at\` \`paid_at\` datetime NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`accounts_receivable\` CHANGE \`paid_at\` \`paid_at\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`image\` \`image\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`observations\` \`observations\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`family\` \`family\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`ncm\` \`ncm\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`ean\` \`ean\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`sku\` \`sku\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`clients\` CHANGE \`avatar\` \`avatar\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`clients\` DROP COLUMN \`active\``);
        await queryRunner.query(`ALTER TABLE \`clients\` DROP COLUMN \`zip_code\``);
        await queryRunner.query(`ALTER TABLE \`clients\` DROP COLUMN \`state\``);
        await queryRunner.query(`ALTER TABLE \`clients\` DROP COLUMN \`city\``);
        await queryRunner.query(`ALTER TABLE \`clients\` DROP COLUMN \`complement\``);
        await queryRunner.query(`ALTER TABLE \`clients\` DROP COLUMN \`neighborhood\``);
        await queryRunner.query(`ALTER TABLE \`clients\` DROP COLUMN \`number\``);
        await queryRunner.query(`ALTER TABLE \`clients\` DROP COLUMN \`street\``);
        await queryRunner.query(`ALTER TABLE \`clients\` DROP COLUMN \`ddd\``);
        await queryRunner.query(`ALTER TABLE \`clients\` DROP COLUMN \`contact_name\``);
        await queryRunner.query(`ALTER TABLE \`clients\` DROP COLUMN \`fantasy_name\``);
    }

}
