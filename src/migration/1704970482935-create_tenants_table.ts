import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTenantsTable1704970482935 implements MigrationInterface {
   name = "CreateTenantsTable1704970482935";

   public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(
         `CREATE TABLE "teants" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "address" character varying(255) NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c16f9aeccf3c7838d5067388b8b" PRIMARY KEY ("id"))`,
      );
      await queryRunner.query(`ALTER TABLE "user" ADD "tenantId" integer`);
      await queryRunner.query(
         `ALTER TABLE "user" ADD CONSTRAINT "FK_685bf353c85f23b6f848e4dcded" FOREIGN KEY ("tenantId") REFERENCES "teants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      );
   }

   public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(
         `ALTER TABLE "user" DROP CONSTRAINT "FK_685bf353c85f23b6f848e4dcded"`,
      );
      await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "tenantId"`);
      await queryRunner.query(`DROP TABLE "teants"`);
   }
}
