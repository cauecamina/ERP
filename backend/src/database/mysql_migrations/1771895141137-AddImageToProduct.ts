import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageToProduct1771895141137 implements MigrationInterface {
    name = 'AddImageToProduct1771895141137'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` ADD \`image\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` DROP COLUMN \`image\``);
    }

}
