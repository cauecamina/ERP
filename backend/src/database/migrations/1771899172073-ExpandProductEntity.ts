import { MigrationInterface, QueryRunner } from "typeorm";

export class ExpandProductEntity1771899172073 implements MigrationInterface {
    name = 'ExpandProductEntity1771899172073'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`min_stock\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`sku\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`ean\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`unit\` varchar(255) NOT NULL DEFAULT 'un'`);
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`ncm\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`family\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`type\` varchar(255) NOT NULL DEFAULT 'simple'`);
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`observations\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`image\` \`image\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`clients\` CHANGE \`avatar\` \`avatar\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`accounts_receivable\` CHANGE \`paid_at\` \`paid_at\` datetime NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`accounts_receivable\` CHANGE \`paid_at\` \`paid_at\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`clients\` CHANGE \`avatar\` \`avatar\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`image\` \`image\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`observations\``);
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`type\``);
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`family\``);
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`ncm\``);
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`unit\``);
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`ean\``);
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`sku\``);
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`min_stock\``);
    }

}
