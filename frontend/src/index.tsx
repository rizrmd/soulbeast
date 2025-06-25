import { FC, ReactElement } from "react";
import ReactDOM from "react-dom/client";
import "./App.css";
import { Session, useSession } from "./lib/auth";
import "./lib/init";

const rootEl = document.getElementById("root");
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  const Root: FC<{
    children: (opt: { session?: Session }) => ReactElement;
  }> = ({ children }) => {
    const { data } = useSession();

    const session = data?.session;
    return children({ session });
  };

  root.render(
    <Root>
      {({ session }) => (
        <>
          {/* <App session={session} /> */}
        </>
      )}
    </Root>
  );
}
