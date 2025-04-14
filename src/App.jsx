import React, { useState, useEffect } from "react";

const auth = window.osmAuth.osmAuth({
  client_id: "Cah_QEsDxE8gjV8EGntqwBk3ucxf2nni6DMm_ubG724",
  scope: "read_prefs",
  redirect_uri: "https://zabop.github.io/mark-nodes-as/",
  singlepage: true,
});

export default function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (window.location.search.includes("code=")) {
      auth.authenticate(() => {
        if (auth.authenticated()) {
          window.history.pushState({}, null, "/mark-nodes-as/");
          fetchUserDetails();
        } else {
          console.log("Authentication failed");
          setError("Authentication failed");
        }
      });
    } else if (auth.authenticated() && !user) {
      fetchUserDetails();
    }
  }, []);

  function fetchUserDetails() {
    auth.xhr({ method: "GET", path: "/api/0.6/user/details" }, (err, res) => {
      if (err) {
        console.log("err", err);
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
