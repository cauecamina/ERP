import { MigrationInterface, QueryRunner } from "typeorm";

export class ExpandOrderStatus1771896730894 implements MigrationInterface {
    name = 'ExpandOrderStatus1771896730894'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`image\` \`image\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`clients\` CHANGE \`avatar\` \`avatar\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`clients\` CHANGE \`avatar\` \`avatar\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`image\` \`image\` varchar(255) NULL DEFAULT 'NULL'`);
    }

}
