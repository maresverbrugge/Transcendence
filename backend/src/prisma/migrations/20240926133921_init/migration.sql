/*
  Warnings:

  - The `status` column on the `Match` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `_MatchToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `player1Id` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ONLINE', 'OFFLINE', 'IN_GAME', 'AFK');

-- DropForeignKey
ALTER TABLE "_MatchToUser" DROP CONSTRAINT "_MatchToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_MatchToUser" DROP CONSTRAINT "_MatchToUser_B_fkey";

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "player1Id" INTEGER NOT NULL,
ADD COLUMN     "player2Id" INTEGER,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL;

-- DropTable
DROP TABLE "_MatchToUser";

-- DropEnum
DROP TYPE "MatchStatus";

-- DropEnum
DROP TYPE "PlayerStatus";

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
