"""add_attempts_to_serviceq

Revision ID: 9d9729b2102b
Revises: d72f3bc62ce7
Create Date: 2026-02-20 23:06:32.023395

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "9d9729b2102b"
down_revision: Union[str, Sequence[str], None] = "d72f3bc62ce7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "serviceq",
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column(
        "serviceq",
        sa.Column("max_attempts", sa.Integer(), nullable=False, server_default="3"),
    )
    op.execute("""
        CREATE INDEX idx_serviceq_pending
        ON serviceq (status, created_at)
        WHERE attempts < max_attempts
    """)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("idx_serviceq_pending", table_name="serviceq")
    op.drop_column("serviceq", "max_attempts")
    op.drop_column("serviceq", "attempts")
