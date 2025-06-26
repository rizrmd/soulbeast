import { FC, ReactElement } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";
import { authClient, getSession, Session } from "./lib/auth";
import "./lib/init";
import { useLocal } from "./lib/use-local";

const rootEl = document.getElementById("root");
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  const Root: FC<{
    children: (opt: { session?: Session }) => ReactElement;
  }> = ({ children }) => {
    const local = useLocal(
      { session: undefined as undefined | Session },
      async () => {
        const ses = await getSession();

        if (ses.data?.session) {
          local.session = ses.data.session;
          local.render();
          console.log(local.session)
        } else {
          await authClient.signIn.social({
            provider: "google",
          });
        }
      }
    );

    return children({ session: local.session });
  };

  root.render(
    <Root>
      {({ session }) => (
        <>
          <App session={session} />
        </>
      )}
    </Root>
  );
}
