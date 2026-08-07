import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://condkcjbmvghrexgcinn.supabase.co";
const supabaseKey = "sb_publishable_g0UPWbNisSLTMdSBR8-6iw_EDQsilZ-";

const supabase = createClient(supabaseUrl, supabaseKey);

// REGISTER
const registerBtn = document.getElementById("registerBtn");

if (registerBtn) {
  registerBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Registration successful! Please check your email.");
      window.location.href = "login.html";
    }
  });
}

// LOGIN
const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Login Successful!");
      window.location.href = "dashboard.html";
    }
  });
}
// DASHBOARD
const { data: { user } } = await supabase.auth.getUser();

const userEmail = document.getElementById("userEmail");

if (user && userEmail) {
    userEmail.innerText = user.email;
}

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        await supabase.auth.signOut();
        window.location.href = "login.html";
    });
}
