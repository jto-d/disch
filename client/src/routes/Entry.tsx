import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useMe, useSignInWithGoogle } from "../lib/hooks";

export function EntryRoute() {
  const me = useMe();
  const navigate = useNavigate();
  const signIn = useSignInWithGoogle();
  const [error, setError] = useState<string | null>(null);

  // Already onboarded? Skip straight to feed.
  useEffect(() => {
    if (me.isSuccess && me.data?.id) {
      navigate("/feed", { replace: true });
    }
  }, [me.isSuccess, me.data, navigate]);

  return (
    <div
      className="min-h-[100dvh] flex flex-col justify-between px-6"
      style={{ background: "var(--bg)" }}
    >
      <div className="pt-20">
        <div className="text-[11px] font-bold tracking-[0.2em] text-fg3 font-mono mb-3">
          DISCH MARKET
        </div>
        <div className="text-display text-fg mb-[6px]">
          Charter Club's
          <br />
          2nd annual
          <br />
          Disch.
        </div>
        <div className="text-[14px] text-fg3 leading-[1.5] mt-3">
          Prediction markets for the Disch.
          <br />
          Vote on what's about to happen.
        </div>
      </div>

      <div className="pb-24">
        <div className="flex justify-center mb-3">
          <GoogleLogin
            onSuccess={(credential) => {
              const idToken = credential.credential;
              if (!idToken) {
                setError("No credential returned. Try again.");
                return;
              }
              setError(null);
              signIn.mutate(idToken, {
                onSuccess: () => navigate("/feed", { replace: true }),
                onError: (e: any) =>
                  setError(e?.message ?? "Couldn't sign in. Try again."),
              });
            }}
            onError={() => setError("Google sign-in failed. Try again.")}
            text="signin_with"
            shape="pill"
            theme="filled_black"
            size="large"
          />
        </div>
        {error && (
          <div className="text-center text-[12px] text-red-600 mb-2 leading-[1.4]">
            {error}
          </div>
        )}
        <div className="text-center text-[11px] text-fg3 leading-[1.5]">
          Princeton.edu accounts only. One vote per market.
        </div>
      </div>
    </div>
  );
}
