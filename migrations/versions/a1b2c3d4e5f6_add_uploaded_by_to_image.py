"""add uploaded_by to image

Revision ID: a1b2c3d4e5f6
Revises: 832ac61bb210
Create Date: 2026-02-28 23:00:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "832ac61bb210"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("image", sa.Column("uploaded_by", sa.Uuid(), nullable=True))
    op.create_foreign_key(
        "image_uploaded_by_fkey",
        "image",
        "user",
        ["uploaded_by"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint("image_uploaded_by_fkey", "image", type_="foreignkey")
    op.drop_column("image", "uploaded_by")
