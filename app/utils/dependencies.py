from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils.jwt_handler import verify_token

security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):

    token = credentials.credentials

    try:
        payload = verify_token(token)
        return payload

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
def require_role(required_role: str):

    def role_checker(current_user: dict = Depends(get_current_user)):

        if current_user.get("role") != required_role:
            raise HTTPException(
                status_code=403,
                detail="Access forbidden: insufficient permissions"
            )

        return current_user

    return role_checker