const REMEMBER_LOGIN_KEY = 'edutech.rememberLogin';

export type RememberedLogin = {
  loginId: string;
  password: string;
};

export function loadRememberedLogin(): RememberedLogin | null {
  try {
    const raw = localStorage.getItem(REMEMBER_LOGIN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RememberedLogin>;
    if (typeof parsed.loginId !== 'string' || typeof parsed.password !== 'string') return null;
    if (!parsed.loginId.trim()) return null;
    return { loginId: parsed.loginId, password: parsed.password };
  } catch {
    return null;
  }
}

export function saveRememberedLogin(loginId: string, password: string) {
  localStorage.setItem(
    REMEMBER_LOGIN_KEY,
    JSON.stringify({ loginId: loginId.trim(), password }),
  );
}

export function clearRememberedLogin() {
  localStorage.removeItem(REMEMBER_LOGIN_KEY);
}
