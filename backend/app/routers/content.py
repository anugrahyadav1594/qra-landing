"""Public read endpoints: products, team, updates (§6.1, §13.2)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..deps import get_session, require_public_read_limit
from ..models import Product, TeamMember, Update

router = APIRouter(prefix="/api/v1", tags=["public"])

PUBLIC_PRODUCT_STATUSES = ("live", "waitlist_only")


def _product_dict(p: Product) -> dict:
    return {
        "id": p.id,
        "slug": p.slug,
        "name": p.name,
        "tagline": p.tagline,
        "description_md": p.description_md,
        "domain": p.domain,
        "status": p.status,
        "accepts_waitlist": p.accepts_waitlist,
    }


@router.get("/products", dependencies=[Depends(require_public_read_limit)])
def list_products(request: Request, session: Session = Depends(get_session)):
    products = session.execute(
        select(Product)
        .where(Product.status.in_(PUBLIC_PRODUCT_STATUSES))
        .order_by(Product.display_order, Product.created_at)
    ).scalars().all()
    return {"products": [_product_dict(p) for p in products]}


@router.get("/products/{slug}", dependencies=[Depends(require_public_read_limit)])
def get_product(slug: str, request: Request, session: Session = Depends(get_session)):
    product = session.execute(
        select(Product).where(
            Product.slug == slug,
            Product.status.in_(PUBLIC_PRODUCT_STATUSES),
        )
    ).scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=404, detail={"error": {
            "code": "not_found", "message": "Product not found.",
            "request_id": getattr(request.state, "request_id", "")}})
    return _product_dict(product)


@router.get("/team", dependencies=[Depends(require_public_read_limit)])
def list_team(request: Request, session: Session = Depends(get_session)):
    members = session.execute(
        select(TeamMember).order_by(TeamMember.display_order)
    ).scalars().all()
    return {"members": [
        {"id": m.id, "name": m.name, "role": m.role, "bio": m.bio} for m in members
    ]}


@router.get("/updates", dependencies=[Depends(require_public_read_limit)])
def list_updates(request: Request, session: Session = Depends(get_session)):
    updates = session.execute(
        select(Update).order_by(Update.published_at.desc())
    ).scalars().all()
    return {"updates": [
        {"id": u.id, "slug": u.slug, "title": u.title, "body_md": u.body_md,
         "published_at": u.published_at.isoformat()} for u in updates
    ]}
