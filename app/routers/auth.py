import os
from datetime import datetime, timedelta
from http import HTTPStatus
from typing import Annotated
from uuid import UUID

from authlib.integrations.starlette_client import OAuth
from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response
from fastapi.responses import RedirectResponse
from jose import JWTError, jwt
from sqlmodel import select
from starlette.config import Config

from app.constants import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    FRONTEND_URL,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    JWT_SECRET,
    SECURE_COOKIES,
)
from app.db import SessionDep
from app.db.model import User
from app.logger import logger
from app.schemas import UserResponse

router = APIRouter()


_config = Config(
    environ={
        "GOOGLE_CLIENT_ID": GOOGLE_CLIENT_ID,
        "GOOGLE_CLIENT_SECRET": GOOGLE_CLIENT_SECRET,
        "GITHUB_CLIENT_ID": GITHUB_CLIENT_ID,
        "GITHUB_CLIENT_SECRET": GITHUB_CLIENT_SECRET,
    }
)

oauth = OAuth(_config)

oauth.register(
    name="google",
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

oauth.register(
    name="github",
    access_token_url="https://github.com/login/oauth/access_token",
    authorize_url="https://github.com/login/oauth/authorize",
    api_base_url="https://api.github.com/",
    client_kwargs={"scope": "read:user user:email"},
)


def _create_access_token(user_id: UUID) -> str:
    expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": str(user_id), "exp": expire}, JWT_SECRET, algorithm="HS256"
    )


def _set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=SECURE_COOKIES,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )


async def _upsert_user(
    session,
    provider: str,
    provider_id: str,
    email: str | None,
    name: str | None,
    avatar_url: str | None,
) -> User:
    result = await session.exec(
        select(User).where(User.provider == provider, User.provider_id == provider_id)
    )
    user = result.first()
    if user:
        user.email = email
        user.name = name
        user.avatar_url = avatar_url
        user.updated_at = datetime.now()
    else:
        user = User(
            provider=provider,
            provider_id=provider_id,
            email=email,
            name=name,
            avatar_url=avatar_url,
        )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


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


@router.get("/me")
async def me(current_user: CurrentUser) -> UserResponse:
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        avatar_url=current_user.avatar_url,
        provider=current_user.provider,
    )


@router.post("/logout")
async def logout(response: Response) -> dict:
    response.delete_cookie("access_token", path="/")
    return {"message": "Logged out"}


@router.get("/google/login")
async def google_login(request: Request) -> RedirectResponse:
    redirect_uri = request.url_for("google_callback")
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback", name="google_callback")
async def google_callback(request: Request, session: SessionDep) -> RedirectResponse:
    try:
        token = await oauth.google.authorize_access_token(request)
        userinfo = token["userinfo"]
    except Exception as e:
        logger.error(f"Google OAuth error: {e}")
        return RedirectResponse(f"{FRONTEND_URL}/login?error=oauth_failed")

    user = await _upsert_user(
        session,
        provider="google",
        provider_id=userinfo["sub"],
        email=userinfo.get("email"),
        name=userinfo.get("name"),
        avatar_url=userinfo.get("picture"),
    )

    token = _create_access_token(user.id)
    response = RedirectResponse(f"{FRONTEND_URL}/gallery")
    _set_auth_cookie(response, token)
    return response


@router.get("/github/login")
async def github_login(request: Request) -> RedirectResponse:
    redirect_uri = request.url_for("github_callback")
    return await oauth.github.authorize_redirect(request, redirect_uri)


@router.get("/github/callback", name="github_callback")
async def github_callback(request: Request, session: SessionDep) -> RedirectResponse:
    try:
        token = await oauth.github.authorize_access_token(request)
        resp = await oauth.github.get("user", token=token)
        resp.raise_for_status()
        userinfo = resp.json()

        email = userinfo.get("email")
        if not email:
            emails_resp = await oauth.github.get("user/emails", token=token)
            emails_resp.raise_for_status()
            for e in emails_resp.json():
                if e.get("primary") and e.get("verified"):
                    email = e["email"]
                    break
    except Exception as e:
        logger.error(f"GitHub OAuth error: {e}")
        return RedirectResponse(f"{FRONTEND_URL}/login?error=oauth_failed")

    user = await _upsert_user(
        session,
        provider="github",
        provider_id=str(userinfo["id"]),
        email=email,
        name=userinfo.get("name") or userinfo.get("login"),
        avatar_url=userinfo.get("avatar_url"),
    )

    token = _create_access_token(user.id)
    response = RedirectResponse(f"{FRONTEND_URL}/gallery")
    _set_auth_cookie(response, token)
    return response
