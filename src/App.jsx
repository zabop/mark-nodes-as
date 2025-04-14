import React, { useState } from "react";

// Initialize auth once outside the component
const auth = window.osmAuth.osmAuth({
  client_id: "JWXSAzNp64sIRMStTnkhMRaMxSR964V4sFgn3KUZNTA",
  scope: "read_prefs",
  redirect_uri: window.location.origin + window.location.pathname,
  singlepage: true,
});

export default function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  // Check for auth code in URL immediately during render
  if (
    window.location.search.includes("code=") &&
    !auth.authenticated() &&
    !user &&
    !error
  ) {
    auth.authenticate(() => {
      window.history.pushState({}, null, window.location.pathname);
      fetchUserDetails();
    });
  }

  function fetchUserDetails() {
    auth.xhr({ method: "GET", path: "/api/0.6/user/details" }, (err, res) => {
      if (err) {
        setError("Failed to fetch user details");
        return;
      }

      const userEl = res.getElementsByTagName("user")[0];
      const changesets = res.getElementsByTagName("changesets")[0];

      setUser({
        name: userEl.getAttribute("display_name"),
        id: userEl.getAttribute("id"),
        count: changesets.getAttribute("count"),
      });

      setError("");
    });
  }

  function handleLogin() {
    auth.authenticate(() => fetchUserDetails());
  }

  function handleLogout() {
    auth.logout();
    setUser(null);
    setError("");
  }

  return (
    <div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleLogout}>Logout</button>

      {error && <div>{error}</div>}

      {user && (
        <div>
          <h1>{user.name}</h1>
          <p>User ID: {user.id}</p>
          <p>Changesets: {user.count}</p>
        </div>
      )}
    </div>
  );
}
