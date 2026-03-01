"""add role to user

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-02-28 23:30:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, Sequence[str], None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("CREATE TYPE userrole AS ENUM ('READ', 'WRITE', 'ADMIN')")
    op.add_column(
        "user",
        sa.Column(
            "role",
            sa.Enum("READ", "WRITE", "ADMIN", name="userrole"),
            nullable=False,
            server_default="READ",
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("user", "role")
    op.execute("DROP TYPE userrole")
