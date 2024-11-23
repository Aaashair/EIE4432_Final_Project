function validateInputs() {
    const num1 = document.getElementById('num1').value.trim();
    const num2 = document.getElementById('num2').value.trim();
    const operator = document.getElementById('operator').value;

    // Check if either input is empty
    if (num1 === "" || num2 === "") {
        alert("Input is empty. Please fill in both numbers.");
        return false;
    }

    // Check if inputs are numeric
    if (isNaN(num1) || isNaN(num2)) {
        alert("Input must be numeric values.");
        return false;
    }

    // Check for division by zero
    if (operator === "/" && parseFloat(num2) === 0) {
        alert("Cannot divide by zero.");
        return false;
    }

    return true;
}

function calculate() {
    // Validate inputs first
    if (!validateInputs()) {
        return; // Stop further calculations
    }

    // Future processing (to be implemented later)
    alert("Calculation would happen here.");
}
