## story | Documentation that can't go stale

Most API documentation drifts from the code within months. In SaaS-Foundation it can't: FastAPI builds the OpenAPI description from the Python types of each route, the TypeScript SDK is generated from that, and CI fails if the committed SDK doesn't match. Change a field in Python, and the frontend's types change with it.

## model | FastAPI in one example

```python
router = APIRouter()

@router.post("/{org_id}/invites", response_model=InviteOut, status_code=201)
async def create_invite(
    org_id: uuid.UUID,                                              # path parameter, validated as a UUID
    data: InviteIn,                                                 # JSON body, validated by Pydantic
    request: Request,
    principal: Principal = Depends(require("organizations.invite")),  # 401/403 before the body runs
    session: AsyncSession = Depends(get_session),                   # a session bound to this tenant (RLS)
) -> InviteOut:
    invite = await invites.create(request.app, session, principal, org_id, str(data.email), data.role, ...)
    return InviteOut.model_validate(invite, from_attributes=True)
```

- **Path operations**: a decorator per method and path.
- **Validation**: parameters and bodies are checked against their types; failures return **422** with a `detail` list whose `loc` points at the exact field (`["body", "items", 0, "qty"]`).
- **Dependencies** (`Depends`): reusable pieces a route needs (the DB session, the current user, a permission check). They run first and can stop the request.
- **`response_model`**: filters the output, so internal fields never leak, and documents it.
- **OpenAPI** at `/openapi.json` and interactive docs at `/docs`.

## analogy | A building's reception desk

Dependencies are the security gates you pass before reaching an office: badge check (authentication), floor permission (authorisation), a visitor log (session). Pydantic is the form at reception that won't accept "tomorrow-ish" as a date. The office (your handler) only ever sees checked people with valid forms.

## traps | Traps

- Returning ORM objects without a response model (password hashes and internal ids leak).
- Doing permission checks inside the function body inconsistently instead of with `require(...)`.
- Validation in the frontend only.

## lab | Talk to a FastAPI service

A FastAPI orders service is running. Read its self-description, then trigger its validation and read the errors the way a frontend developer would.
