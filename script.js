// ================= CARBON AWARE TRAVEL SYSTEM =================


// ================= SELECT TRANSPORT BUTTONS =================

const transportButtons =
    document.querySelectorAll(".transport-btn");

let selectedMode = "";


// Select travel mode

transportButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        // Remove selection from all buttons

        transportButtons.forEach(function(btn) {

            btn.classList.remove("selected");

        });


        // Select clicked button

        button.classList.add("selected");


        // Store selected mode

        selectedMode =
            button.dataset.mode;

    });

});



// ================= CALCULATE CARBON =================

const calculateButton =
    document.getElementById("calculateBtn");


if (calculateButton) {

    calculateButton.addEventListener("click", function() {


        // Get user inputs

        const from =
            document
                .getElementById("from")
                .value
                .trim();


        const to =
            document
                .getElementById("to")
                .value
                .trim();


        const distance =
            parseFloat(
                document
                    .getElementById("distance")
                    .value
            );



        // ================= VALIDATION =================


        if (from === "" || to === "") {

            alert(
                "Please enter starting point and destination."
            );

            return;

        }


        if (isNaN(distance) || distance <= 0) {

            alert(
                "Please enter a valid distance."
            );

            return;

        }


        if (selectedMode === "") {

            alert(
                "Please select a travel mode."
            );

            return;

        }



        // ================= EMISSION FACTORS =================

        // Demo values for project prototype
        // kg CO2 per passenger-km

        const emissionFactors = {

            car: 0.18,

            bike: 0.08,

            bus: 0.05,

            train: 0.04

        };



        // ================= CALCULATE =================


        const carEmission =
            distance *
            emissionFactors.car;


        const bikeEmission =
            distance *
            emissionFactors.bike;


        const busEmission =
            distance *
            emissionFactors.bus;


        const trainEmission =
            distance *
            emissionFactors.train;



        // ================= DISPLAY RESULTS =================


        document
            .getElementById("carResult")
            .innerText =
            carEmission.toFixed(2)
            + " kg CO₂";


        document
            .getElementById("bikeResult")
            .innerText =
            bikeEmission.toFixed(2)
            + " kg CO₂";


        document
            .getElementById("busResult")
            .innerText =
            busEmission.toFixed(2)
            + " kg CO₂";


        document
            .getElementById("trainResult")
            .innerText =
            trainEmission.toFixed(2)
            + " kg CO₂";



        // ================= AI DECISION =================


        const emissions = {

            "Car": carEmission,

            "Bike": bikeEmission,

            "Bus": busEmission,

            "Train": trainEmission

        };


        let lowestMode = "Car";

        let lowestEmission =
            carEmission;


        for (
            const mode in emissions
        ) {

            if (
                emissions[mode] <
                lowestEmission
            ) {

                lowestEmission =
                    emissions[mode];

                lowestMode =
                    mode;

            }

        }



        // ================= CO2 SAVING =================


        const saving =
            carEmission -
            lowestEmission;



        // ================= AI MESSAGE =================


        const aiText =
            document.getElementById("aiText");


        aiText.innerText =

            "For your journey from "
            + from
            + " to "
            + to
            + ", AI recommends "
            + lowestMode
            + ". It has the lowest estimated carbon emission of "
            + lowestEmission.toFixed(2)
            + " kg CO₂. You could save approximately "
            + saving.toFixed(2)
            + " kg CO₂ compared with travelling by car.";



        // ================= SAVE DATA =================

        // Store the latest journey
        // so other pages can use it.

        const journeyData = {

            from: from,

            to: to,

            distance: distance,

            selectedMode: selectedMode,

            carEmission:
                carEmission.toFixed(2),

            bikeEmission:
                bikeEmission.toFixed(2),

            busEmission:
                busEmission.toFixed(2),

            trainEmission:
                trainEmission.toFixed(2),

            recommendedMode:
                lowestMode,

            recommendedEmission:
                lowestEmission.toFixed(2),

            carbonSaved:
                saving.toFixed(2)

        };


        localStorage.setItem(

            "carbonAwareJourney",

            JSON.stringify(journeyData)

        );


        // ================= SHOW BUTTON =================


        const viewAIButton =
            document.getElementById(
                "viewAIButton"
            );


        if (viewAIButton) {

            viewAIButton.style.display =
                "block";

        }


    });

}