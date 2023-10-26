document.addEventListener("DOMContentLoaded", () => {
  const feed = document.getElementById("feed");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginButton = document.getElementById("login");
  const bruteForceButton = document.getElementById("bruteForce");
  const resultText = document.getElementById("result");
  const logoutButton = document.getElementById("logout");
  const titleInput = document.getElementById("post-title");
  const postButton = document.getElementById("postButton");
  const postContent = document.getElementById("post-content");
  const logo = document.getElementById("logo");


  const getPosts = async () => {
    if (!sessionStorage.getItem("token")) {
      logoutButton.classList.add("hidden");
      postContent.classList.add("hidden");
      titleInput.classList.add("hidden");
      postButton.classList.add("hidden");
      return;
    }
    feed.innerHTML = "";
    const response = await fetch("/api/posts", {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
    const posts = await response.json();
    for (const post of posts) {
      const postElement = document.createElement("div");
      postElement.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.content}</p>
      `;
      feed.appendChild(postElement);
    }
  };
  getPosts();
  const login = async (username, password) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zAZ0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(username)) {
      resultText.innerHTML = "Invalid E-Mail";
      return;
    }
    if (!password || password.length < 10) {
      resultText.innerHTML = "Password must be at least 10 characters.";
      return;
    }
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    const result = await response.text();
    if (!result) return;
    sessionStorage.setItem("token", result);
    logoutButton.classList.remove("hidden");
    titleInput.classList.remove("hidden");
    postButton.classList.remove("hidden");
    postContent.classList.remove("hidden");
    logo.classList.add("hidden");
    req.log.info("Posts wurden angezeigt");
    getPosts();
  };

  logoutButton.addEventListener("click", () => {
    sessionStorage.removeItem("token");
    location.reload();
    req.log.info("Benutzer hat sich ausgeloggt");
    req.log.info("Login GUI wurde geöffnet");

  });

  loginButton.addEventListener("click", async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    await login(username, password);
    req.log.info("Benutzer loggt sich ein");

  });

  bruteForceButton.addEventListener("click", async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    req.log.info("Brute Force Simulation wurde gestartet");


    while (true) {
      await login(username, password);
    }
    
  });

  postButton.addEventListener("click", async () => {
    const title = titleInput.value;
    const content = postContent.value;
    const response = await fetch("/api/post/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, content }),
    });
    req.log.info("Post wurde in die DB hinzugefügt");
    getPosts();
  });
  });

