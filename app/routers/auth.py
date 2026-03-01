from datetime import datetime

from authlib.integrations.starlette_client import OAuth
from fastapi import APIRouter, Request, Response
from fastapi.responses import RedirectResponse
from sqlmodel import select
from starlette.config import Config

from app.constants import (
    FRONTEND_URL,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
)
from app.db import SessionDep
from app.db.model import User
from app.deps import CurrentUser, create_access_token, set_auth_cookie
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


@router.get("/me")
async def me(current_user: CurrentUser) -> UserResponse:
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        avatar_url=current_user.avatar_url,
        provider=current_user.provider,
        role=current_user.role,
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

    token = create_access_token(user.id)
    response = RedirectResponse(f"{FRONTEND_URL}/gallery")
    set_auth_cookie(response, token)
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

    token = create_access_token(user.id)
    response = RedirectResponse(f"{FRONTEND_URL}/gallery")
    set_auth_cookie(response, token)
    return response
