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

        const email = document.getElementById("email")?.value.trim();
        const password = document.getElementById("password")?.value;

        if (!email || !password) {
            alert("Email aur password enter karo.");
            return;
        }

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

        const email = document.getElementById("email")?.value.trim();
        const password = document.getElementById("password")?.value;

        if (!email || !password) {
            alert("Email aur password enter karo.");
            return;
        }

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
// FORGOT PASSWORD
// =========================

const forgotPassword = document.getElementById("forgotPassword");

if (forgotPassword) {
    forgotPassword.addEventListener("click", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email")?.value.trim();

        if (!email) {
            alert("Pehle apna email enter karo.");
            return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: "https://vkpannel.vercel.app/reset-password.html"
        });

        if (error) {
            alert(error.message);
            return;
        }

        alert("Password reset link tumhare email par bhej diya gaya hai.");
    });
}
// =========================
// DASHBOARD USER + BALANCE
// =========================

const userEmail = document.getElementById("userEmail");
const userBalance = document.getElementById("userBalance");

if (userEmail || userBalance) {

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (user) {

        if (userEmail) {
            userEmail.innerText = user.email;
        }

        const { data: profile, error } = await supabase
            .from("profiles")
            .select("balance")
            .eq("id", user.id)
            .single();

        if (error) {
            console.error("Balance fetch error:", error);

            if (userBalance) {
                userBalance.innerText = "₹0.00";
            }

        } else {

            if (userBalance) {
                userBalance.innerText =
                    `₹${Number(profile.balance || 0).toFixed(2)}`;
            }
        }

    } else {

        if (userEmail) {
            userEmail.innerText = "Not logged in";
        }

        if (userBalance) {
            userBalance.innerText = "₹0.00";
        }
    }
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

    // Compact service box
    serviceSelect.style.height = "45px";
    serviceSelect.style.minHeight = "45px";
    serviceSelect.style.width = "100%";
    serviceSelect.style.boxSizing = "border-box";


    async function loadServices() {

        try {

            serviceSelect.innerHTML = "";

            const loadingOption =
                document.createElement("option");

            loadingOption.textContent =
                "Loading services...";

            loadingOption.disabled = true;
            loadingOption.selected = true;

            serviceSelect.appendChild(loadingOption);


            const response =
                await fetch("/api/smm");


            if (!response.ok) {
                throw new Error(
                    "API request failed: " +
                    response.status
                );
            }


            const services =
                await response.json();


            if (!Array.isArray(services)) {
                throw new Error(
                    "Invalid services response"
                );
            }


            serviceSelect.innerHTML = "";


            const defaultOption =
                document.createElement("option");

            defaultOption.value = "";
            defaultOption.textContent =
                "Select Service";

            defaultOption.disabled = true;
            defaultOption.selected = true;

            serviceSelect.appendChild(
                defaultOption
            );


            // =========================
            // ADD SERVICES
            // =========================

            services.forEach(service => {

                const option =
                    document.createElement("option");


                option.value =
                    service.service;


                const providerRate =
                    parseFloat(service.rate);


                // Pricing rule
                const customerRate =
                    providerRate < 1
                        ? 1
                        : providerRate * 2;


                // Customer sees only selling price
                option.textContent =
                    `${service.service} - ${service.name} - ₹${customerRate.toFixed(2)}`;


                // Internal data
                option.dataset.rate =
                    providerRate;

                option.dataset.customerRate =
                    customerRate;

                option.dataset.min =
                    service.min;

                option.dataset.max =
                    service.max;

                option.dataset.category =
                    service.category;

                option.dataset.refill =
                    service.refill;


                serviceSelect.appendChild(
                    option
                );
            });


            console.log(
                "Services loaded:",
                services.length
            );


        } catch (error) {

            console.error(
                "Service loading error:",
                error
            );


            serviceSelect.innerHTML = "";


            const errorOption =
                document.createElement("option");

            errorOption.textContent =
                "Failed to load services";

            errorOption.disabled = true;


            serviceSelect.appendChild(
                errorOption
            );


            alert(
                "Services load nahi ho paayi. Please try again."
            );
        }
    }


    loadServices();
}


// =========================
// SERVICE DETAILS + TOTAL PRICE
// =========================

if (serviceSelect) {

    const serviceDetails =
        document.createElement("div");


    serviceDetails.id =
        "serviceDetails";


    serviceDetails.style.marginTop =
        "15px";

    serviceDetails.style.padding =
        "12px";

    serviceDetails.style.borderRadius =
        "10px";

    serviceDetails.style.background =
        "#182235";

    serviceDetails.style.color =
        "white";

    serviceDetails.style.lineHeight =
        "1.6";


    serviceSelect.insertAdjacentElement(
        "afterend",
        serviceDetails
    );


    const quantityInput =
        document.getElementById("quantity");


    function updateServiceDetails() {

        const selectedOption =
            serviceSelect.options[
                serviceSelect.selectedIndex
            ];


        if (
            !selectedOption ||
            !selectedOption.value
        ) {

            serviceDetails.innerHTML =
                "";

            return;
        }


        const customerRate =
            parseFloat(
                selectedOption.dataset.customerRate
            );


        const min =
            parseInt(
                selectedOption.dataset.min
            );


        const max =
            parseInt(
                selectedOption.dataset.max
            );


        const category =
            selectedOption.dataset.category;


        const refill =
            selectedOption.dataset.refill;


        let quantity = 0;


        if (quantityInput) {

            quantity =
                parseInt(
                    quantityInput.value
                ) || 0;


            quantityInput.min =
                min;

            quantityInput.max =
                max;

            quantityInput.placeholder =
                `Quantity (${min} - ${max})`;
        }


        // Customer price is per 1000
        const totalPrice =
            (customerRate * quantity) /
            1000;


        serviceDetails.innerHTML = `
            <strong>Service Details</strong><br>
            💵 Price: ₹${customerRate.toFixed(2)} / 1000<br>
            📦 Minimum: ${min}<br>
            📦 Maximum: ${max}<br>
            📂 Category: ${category}<br>
            ♻️ Refill: ${
                refill === "1"
                    ? "Available"
                    : "Not Available"
            }<br>
            💰 Total Price: ₹${totalPrice.toFixed(2)}
        `;
    }


    serviceSelect.addEventListener(
        "change",
        updateServiceDetails
    );


    if (quantityInput) {

        quantityInput.addEventListener(
            "input",
            updateServiceDetails
        );
    }
                             }
// =========================
// PLACE ORDER
// =========================

const orderBtn = document.getElementById("orderBtn");

if (orderBtn) {
    orderBtn.addEventListener("click", async () => {

        const serviceSelect = document.getElementById("service");
        const linkInput = document.getElementById("link");
        const quantityInput = document.getElementById("quantity");
        const userBalance = document.getElementById("userBalance");

        const selectedOption =
            serviceSelect?.options[serviceSelect.selectedIndex];

        if (!selectedOption || !selectedOption.value) {
            alert("Please select a service.");
            return;
        }

        const link = linkInput?.value.trim();
        const quantity = parseInt(quantityInput?.value);

        if (!link) {
            alert("Please enter the link.");
            return;
        }

        if (!quantity || quantity <= 0) {
            alert("Please enter a valid quantity.");
            return;
        }

        const min = parseInt(selectedOption.dataset.min);
        const max = parseInt(selectedOption.dataset.max);

        if (quantity < min || quantity > max) {
            alert(`Quantity ${min} se ${max} ke beech honi chahiye.`);
            return;
        }

        const customerRate =
            parseFloat(selectedOption.dataset.customerRate);

        const charge =
            (customerRate * quantity) / 1000;

        const {
            data: { user }
        } = await supabase.auth.getUser();

        if (!user) {
            alert("Please login first.");
            window.location.href = "login.html";
            return;
        }

        if (!confirm(
            `Order charge: ₹${charge.toFixed(2)}\n\nOrder place karein?`
        )) {
            return;
        }

        orderBtn.disabled = true;
        orderBtn.innerText = "Placing Order...";

        try {

            const response = await fetch("/api/order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    service: selectedOption.value,
                    link: link,
                    quantity: quantity,
                    userId: user.id,
                    charge: charge
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Order failed"
                );
            }

            alert(
                `Order placed successfully!\nOrder ID: ${
                    data.order?.provider_order_id || "N/A"
                }`
            );

            if (userBalance && data.newBalance !== undefined) {
                userBalance.innerText =
                    `₹${Number(data.newBalance).toFixed(2)}`;
            }

            linkInput.value = "";
            quantityInput.value = "";

        } catch (error) {

            console.error("Order error:", error);

            alert(error.message);

        } finally {

            orderBtn.disabled = false;
            orderBtn.innerText = "Place Order";
        }
    });
}
// =========================
// =========================
// ADD FUNDS REQUEST
// =========================

const submitDeposit = document.getElementById("submitDeposit");

if (submitDeposit) {
    submitDeposit.addEventListener("click", async () => {

        const amountInput = document.getElementById("amount");
        const utrInput = document.getElementById("utr");
        const message = document.getElementById("depositMessage");

        const amount = Number(amountInput?.value);
        const utr = utrInput?.value.trim();

        if (!amount || amount <= 0) {
            alert("Valid amount enter karo.");
            return;
        }

        if (!utr) {
            alert("UTR / Transaction ID enter karo.");
            return;
        }

        const {
            data: { user }
        } = await supabase.auth.getUser();

        if (!user) {
            alert("Please login first.");
            window.location.href = "login.html";
            return;
        }

        submitDeposit.disabled = true;
        submitDeposit.innerText = "Submitting...";

        try {

            const response = await fetch("/api/deposit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: user.id,
                    amount: amount,
                    utr: utr
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Request failed");
            }

            if (message) {
                message.innerText =
                    "Payment request submitted. Verification ke baad balance add hoga.";
            }

            amountInput.value = "";
            utrInput.value = "";

        } catch (error) {

            console.error("Deposit error:", error);

            alert(
                "Request submit nahi hui: " +
                error.message
            );

        } finally {

            submitDeposit.disabled = false;
            submitDeposit.innerText =
                "Submit Payment Request";
        }
    });
}
