from datetime import datetime, timedelta
from http import HTTPStatus
from typing import Annotated
from uuid import UUID

from fastapi import Cookie, Depends, HTTPException, Response
from jose import JWTError, jwt

from app.constants import ACCESS_TOKEN_EXPIRE_MINUTES, JWT_SECRET, SECURE_COOKIES
from app.db import SessionDep
from app.db.model import User
from app.enums import UserRole


def create_access_token(user_id: UUID) -> str:
    expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": str(user_id), "exp": expire}, JWT_SECRET, algorithm="HS256"
    )


def set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=SECURE_COOKIES,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )


async def get_current_user(
    session: SessionDep,
    access_token: Annotated[str | None, Cookie()] = None,
) -> User:
    if not access_token:
        raise HTTPException(
            status_code=HTTPStatus.UNAUTHORIZED, detail="Not authenticated"
        )
    try:
        payload = jwt.decode(access_token, JWT_SECRET, algorithms=["HS256"])
        user_id = UUID(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=HTTPStatus.UNAUTHORIZED, detail="Invalid token")

    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=HTTPStatus.UNAUTHORIZED, detail="User not found"
        )
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def _require_role(*roles: UserRole):
    async def dependency(current_user: CurrentUser) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=HTTPStatus.FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return current_user

    return dependency


AdminUser = Annotated[User, Depends(_require_role(UserRole.ADMIN))]
WriteUser = Annotated[User, Depends(_require_role(UserRole.WRITE, UserRole.ADMIN))]
ReadUser = Annotated[
    User, Depends(_require_role(UserRole.READ, UserRole.WRITE, UserRole.ADMIN))
]
