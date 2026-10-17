
/*
 * CarbonAware student prototype.
 * Factors are illustrative kg CO2e per passenger-km,
 * not official or vehicle-specific values.
 * Replace them with a cited, region-appropriate dataset
 * before presenting as validated results.
 */

(function () {
    const options = {
        petrolCar: {
            name: "Petrol car",
            icon: "🚗",
            factor: 0.19,
            kind: "car"
        },
        dieselCar: {
            name: "Diesel car",
            icon: "🚙",
            factor: 0.17,
            kind: "car"
        },
        cngCar: {
            name: "CNG car",
            icon: "🚘",
            factor: 0.13,
            kind: "car"
        },
        hybridCar: {
            name: "Hybrid car",
            icon: "🔋",
            factor: 0.11,
            kind: "car"
        },
        electricCar: {
            name: "Electric car (EV)",
            icon: "⚡",
            factor: 0.07,
            kind: "car"
        },
        petrolBike: {
            name: "Petrol bike",
            icon: "🏍️",
            factor: 0.08,
            kind: "bike"
        },
        electricScooter: {
            name: "Electric scooter",
            icon: "🛵",
            factor: 0.025,
            kind: "bike"
        },
        dieselBus: {
            name: "Diesel bus",
            icon: "🚌",
            factor: 0.06,
            kind: "public"
        },
        cngBus: {
            name: "CNG bus",
            icon: "🚌",
            factor: 0.045,
            kind: "public"
        },
        electricBus: {
            name: "Electric bus",
            icon: "🔌",
            factor: 0.025,
            kind: "public"
        },
        train: {
            name: "Train",
            icon: "🚆",
            factor: 0.035,
            kind: "public"
        },
        flight: {
            name: "Flight",
            icon: "✈️",
            factor: 0.15,
            kind: "air"
        }
    };

    const $ = id => document.getElementById(id);

    const fmt = n =>
        Number.isFinite(n) ? n.toFixed(2) : "—";

    function speedMultiplier(speed, conditions) {
        let multiplier = 1;

        if (speed < 35) {
            multiplier *= 1.12;
        } else if (speed > 100) {
            multiplier *= 1.18;
        } else if (speed > 85) {
            multiplier *= 1.08;
        }

        if (conditions === "mixed") {
            multiplier *= 1.08;
        }

        if (conditions === "heavy") {
            multiplier *= 1.22;
        }

        return multiplier;
    }

    function calc(key, distance, passengers, speed, conditions) {
        const option = options[key];
        let perKm = option.factor;

        if (option.kind === "car" || option.kind === "bike") {
            perKm *= speedMultiplier(speed, conditions);
        }

        /*
         * Shared transport factors are already expressed per passenger-km.
         * Private car/bike estimates are divided by passenger occupancy.
         */

        if (option.kind === "car" || option.kind === "bike") {
            return distance * perKm / Math.max(1, passengers);
        }

        return distance * perKm;
    }

    function getSaved() {
        try {
            return JSON.parse(
                localStorage.getItem("carbonAwareJourney") || "null"
            );
        } catch (error) {
            return null;
        }
    }

    function save(data) {
        try {
            localStorage.setItem(
                "carbonAwareJourney",
                JSON.stringify(data)
            );
        } catch (error) {
            // Saving is optional if browser storage is unavailable.
        }
    }

    function renderCalculator() {
        const form = $("tripForm");

        if (!form) {
            return;
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();

            const from = $("from").value.trim();
            const to = $("to").value.trim();
            const distance = +$("distance").value;
            const passengers = +$("passengers").value;
            const mode = $("mode").value;
            const speed = +$("speed").value;
            const conditions = $("conditions").value;

            if (
                !from ||
                !to ||
                distance <= 0 ||
                passengers < 1
            ) {
                alert("Please enter valid journey details.");
                return;
            }

            const estimates = Object.keys(options)
                .map(key => ({
                    key,
                    ...options[key],
                    emission: calc(
                        key,
                        distance,
                        passengers,
                        speed,
                        conditions
                    )
                }))
                .sort((a, b) => a.emission - b.emission);

            const chosen = estimates.find(item => item.key === mode);
            const lowest = estimates[0];

            const difference = Math.max(
                0,
                chosen.emission - lowest.emission
            );

            const data = {
                from,
                to,
                distance,
                passengers,
                mode,
                modeName: chosen.name,
                speed,
                conditions,
                chosenEmission: chosen.emission,
                lowestMode: lowest.key,
                lowestName: lowest.name,
                lowestEmission: lowest.emission,
                carbonSaved: difference,
                estimates
            };

            save(data);

            $("results").classList.remove("hidden");

            $("tripTitle").textContent =
                from + " → " + to + " · " + distance + " km";

            $("selectedLabel").textContent =
                "Selected: " + chosen.name;

            $("chosenEmission").textContent = fmt(chosen.emission);
            $("lowestEmission").textContent = fmt(lowest.emission);
            $("lowestName").textContent = lowest.name;
            $("saving").textContent = fmt(difference);

            $("comparison").innerHTML = estimates
                .map((item, index) => `
                    <article class="card result-card">
                        <div class="big-icon">${item.icon}</div>
                        <h3>${item.name}</h3>
                        <div class="emission">
                            ${fmt(item.emission)} kg
                        </div>
                        <small>
                            ${
                                index === 0
                                    ? "Lowest estimate"
                                    : item.key === mode
                                        ? "Your choice"
                                        : "Estimated per trip"
                            }
                        </small>
                    </article>
                `)
                .join("");

            const isPrivate =
                chosen.kind === "car" || chosen.kind === "bike";

            if (isPrivate) {
                $("driveTips").textContent =
                    `For your ${chosen.name.toLowerCase()}, keep to a safe ` +
                    "and legal speed, accelerate smoothly, avoid unnecessary " +
                    "idling, maintain tyre pressure, remove excess load and " +
                    "combine errands. The speed-adjusted figure is a simplified " +
                    "estimate—not a vehicle-specific prediction.";
            } else {
                $("driveTips").textContent =
                    `You selected ${chosen.name}. For this option, check ` +
                    "service availability and occupancy; shared public " +
                    "transport can spread vehicle emissions across passengers.";
            }

            $("routeTips").textContent =
                `For ${from} to ${to}, compare a direct practical route ` +
                "with alternatives in a navigation app. Prefer fewer " +
                "stop-start sections, avoid congestion when possible, and " +
                "do not take a much longer detour just to chase a small " +
                "estimated saving. Live road routes and traffic are not " +
                "fetched by this calculator.";

            $("results").scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    }

    function renderDashboard() {
        const empty = $("dashEmpty");
        const content = $("dashContent");

        if (!empty || !content) {
            return;
        }

        const data = getSaved();

        if (!data) {
            return;
        }

        empty.classList.add("hidden");
        content.classList.remove("hidden");

        $("dChosen").textContent = fmt(data.chosenEmission);
        $("dLowest").textContent = fmt(data.lowestEmission);
        $("dLowestName").textContent = data.lowestName;
        $("dSaving").textContent = fmt(data.carbonSaved);

        const maxEmission = Math.max(
            ...data.estimates.map(item => item.emission),
            0.01
        );

        $("dashBars").innerHTML = data.estimates
            .map(item => `
                <div class="bar-row">
                    <div class="bar-label">
                        <span>${item.icon} ${item.name}</span>
                        <span>${fmt(item.emission)} kg CO₂e</span>
                    </div>

                    <div class="bar-bg">
                        <div
                            class="bar-fill"
                            style="width: ${
                                Math.max(
                                    2,
                                    item.emission / maxEmission * 100
                                )
                            }%"
                        ></div>
                    </div>
                </div>
            `)
            .join("");
    }

    function renderRecommendations() {
        const empty = $("recEmpty");
        const content = $("recContent");

        if (!empty || !content) {
            return;
        }

        const data = getSaved();

        if (!data) {
            return;
        }

        empty.classList.add("hidden");
        content.classList.remove("hidden");

        $("recTitle").textContent =
            data.lowestName + " has the lowest prototype estimate";

        $("recSummary").textContent =
            `For ${data.from} to ${data.to} (${data.distance} km), ` +
            `your selected option (${data.modeName}) is estimated at ` +
            `${fmt(data.chosenEmission)} kg CO₂e. The lowest option in ` +
            `this comparison is ${data.lowestName} at ` +
            `${fmt(data.lowestEmission)} kg CO₂e. The estimated difference ` +
            `is ${fmt(data.carbonSaved)} kg CO₂e. These are indicative ` +
            "calculations, not verified measurements.";

        const tips = [];

        if (
            [
                "petrolCar",
                "dieselCar",
                "cngCar",
                "hybridCar",
                "electricCar"
            ].includes(data.mode)
        ) {
            tips.push(
                "If you want to travel by car, compare the available " +
                "fuel/powertrain options for the same journey."
            );

            tips.push(
                "Drive smoothly, avoid hard acceleration and unnecessary " +
                "idling, and maintain correct tyre pressure."
            );

            tips.push(
                "Choose a safe, legal, practical route and avoid heavy " +
                "stop-start traffic when possible."
            );

            if (data.mode === "electricCar") {
                tips.push(
                    "For an EV, the estimate depends on electricity " +
                    "generation mix and charging efficiency; this prototype " +
                    "uses one illustrative factor."
                );
            }
        } else {
            tips.push(
                "Check whether the lowest-emission option is available " +
                "and practical for your travel time."
            );

            tips.push(
                "If you prefer your selected mode, use the vehicle-specific " +
                "tips and compare its estimate against alternatives."
            );
        }

        tips.push(
            "Try increasing passenger occupancy for a private vehicle " +
            "only when people are genuinely sharing the same trip."
        );

        $("recTips").innerHTML = tips
            .map(tip => `<li>${tip}</li>`)
            .join("");

        $("recCaveat").textContent =
            "The emission factors are illustrative placeholders used " +
            "to demonstrate the calculator. They must be replaced with " +
            "documented, region-specific factors before making research " +
            "or real-world accuracy claims. This prototype uses rules, " +
            "not a trained AI model, and does not yet retrieve live routes, " +
            "traffic, vehicle efficiency or electricity-grid data.";
    }

    renderCalculator();
    renderDashboard();
    renderRecommendations();
})();
