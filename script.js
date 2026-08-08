import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://condkcjbmvghrexgcinn.supabase.co";
const supabaseKey = "sb_publishable_g0UPWbNisSLTMdSBR8-6iw_EDQsilZ-";

const supabase = createClient(supabaseUrl, supabaseKey);


// =========================
// REGISTER
// =========================

const registerBtn = document.getElementById("registerBtn");

if (registerBtn) {
    registerBtn.addEventListener("click", async () => {

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const { error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) {
            alert(error.message);
        } else {
            alert("Registration successful! Please check your email.");
            window.location.href = "login.html";
        }
    });
}


// =========================
// LOGIN
// =========================

const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
    loginBtn.addEventListener("click", async () => {

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            alert(error.message);
        } else {
            alert("Login Successful!");
            window.location.href = "dashboard.html";
        }
    });
}


// =========================
// DASHBOARD USER
// =========================

const {
    data: { user }
} = await supabase.auth.getUser();

const userEmail = document.getElementById("userEmail");

if (user && userEmail) {
    userEmail.innerText = user.email;
}


// =========================
// LOGOUT
// =========================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {

        await supabase.auth.signOut();

        window.location.href = "login.html";
    });
}


// =========================
// LOAD SMM SERVICES
// =========================

const serviceSelect = document.getElementById("service");

if (serviceSelect) {

    async function loadServices() {

        try {

            serviceSelect.innerHTML = "";

            const loadingOption = document.createElement("option");
            loadingOption.textContent = "Loading services...";
            loadingOption.disabled = true;
            loadingOption.selected = true;

            serviceSelect.appendChild(loadingOption);


            const response = await fetch("/api/smm");

            if (!response.ok) {
                throw new Error("API request failed: " + response.status);
            }

            const services = await response.json();

            if (!Array.isArray(services)) {
                throw new Error("Invalid services response");
            }


            serviceSelect.innerHTML = "";


            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "Select Service";
            defaultOption.disabled = true;
            defaultOption.selected = true;

            serviceSelect.appendChild(defaultOption);


            // =========================
            // ADD SERVICES
            // =========================

            services.forEach(service => {

                const option = document.createElement("option");

                option.value = service.service;

                // Provider rate is kept internally
                const providerRate = parseFloat(service.rate);

                // Customer pricing rule
                const customerRate =
                    providerRate < 1
                        ? 1
                        : providerRate * 2;

                // Customer sees ONLY selling price
                option.textContent =
                    `${service.service} - ${service.name} - ₹${customerRate.toFixed(2)}`;


                // Internal service information
                option.dataset.rate = providerRate;
                option.dataset.customerRate = customerRate;
                option.dataset.min = service.min;
                option.dataset.max = service.max;
                option.dataset.category = service.category;
                option.dataset.refill = service.refill;

                serviceSelect.appendChild(option);
            });


            console.log("Services loaded:", services.length);

        } catch (error) {

            console.error("Service loading error:", error);

            serviceSelect.innerHTML = "";

            const errorOption = document.createElement("option");
            errorOption.textContent = "Failed to load services";
            errorOption.disabled = true;

            serviceSelect.appendChild(errorOption);

            alert("Services load nahi ho paayi. Please try again.");
        }
    }


    loadServices();
}


// =========================
// SERVICE DETAILS + CUSTOMER PRICE
// =========================

if (serviceSelect) {

    const serviceDetails = document.createElement("div");

    serviceDetails.id = "serviceDetails";

    serviceDetails.style.marginTop = "15px";
    serviceDetails.style.padding = "12px";
    serviceDetails.style.borderRadius = "10px";
    serviceDetails.style.background = "#182235";
    serviceDetails.style.color = "white";
    serviceDetails.style.lineHeight = "1.6";

    serviceSelect.insertAdjacentElement(
        "afterend",
        serviceDetails
    );


    serviceSelect.addEventListener("change", () => {

        const selectedOption =
            serviceSelect.options[
                serviceSelect.selectedIndex
            ];

        if (!selectedOption || !selectedOption.value) {

            serviceDetails.innerHTML = "";

            return;
        }


        // Provider rate stays hidden
        const customerRate =
            parseFloat(selectedOption.dataset.customerRate);

        const min =
            selectedOption.dataset.min;

        const max =
            selectedOption.dataset.max;

        const category =
            selectedOption.dataset.category;

        const refill =
            selectedOption.dataset.refill;


        // Customer-facing details ONLY
        serviceDetails.innerHTML = `
            <strong>Service Details</strong><br>
            💰 Price: ₹${customerRate.toFixed(2)}<br>
            📦 Minimum: ${min}<br>
            📦 Maximum: ${max}<br>
            📂 Category: ${category}<br>
            ♻️ Refill: ${refill === "1" ? "Available" : "Not Available"}
        `;


        const quantityInput =
            document.getElementById("quantity");

        if (quantityInput) {

            quantityInput.min = min;
            quantityInput.max = max;

            quantityInput.placeholder =
                `Quantity (${min} - ${max})`;
        }
    });
        }
