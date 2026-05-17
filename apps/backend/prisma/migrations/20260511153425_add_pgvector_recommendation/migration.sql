-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- AlterTable
ALTER TABLE "SubField" ADD COLUMN     "embedding" vector(8),
ADD COLUMN     "embedding_updated_at" TIMESTAMPTZ(0);

CREATE INDEX IF NOT EXISTS "SubField_embedding_cosine_idx"
    ON "SubField" USING ivfflat ("embedding" vector_cosine_ops)
    WITH (lists = 100);
