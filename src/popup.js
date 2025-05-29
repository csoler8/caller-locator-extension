document.addEventListener("DOMContentLoaded", function () {
    const lookupType = document.getElementById("lookupType");
    const formatType = document.getElementById("formatType");
    const prefixInput = document.getElementById("prefixInput");
    const formatButton = document.getElementById("formatButton");

    formatType.addEventListener("change", function () {
        prefixInput.style.display = formatType.value === "customPrefix" ? "block" : "none";
    });

    formatButton.addEventListener("click", function () {
        let input = document.getElementById("phoneNumbers").value.trim();
        if (!input) {
            alert("Please enter phone numbers.");
            return;
        }

        let callerNumbers = [];
        let calleeNumbers = [];
        let timestamps = [];
        let selectedPrefix = prefixInput.value.trim();

        let lines = input.split("\n").map(line => line.trim()).filter(line => line !== "");

        lines.forEach(line => {
            let numbers = line.split(/\t+/); 
            if (numbers.length === 1) {
                numbers = line.split(/\s+/); 
            }

            if (lookupType.value === "both" && numbers.length === 3 && formatType.value === "symbio") {
                let caller = formatNumber(numbers[0], selectedPrefix);
                let callee = formatNumber(numbers[1], selectedPrefix);
                let timestamp = formatTimestamp(numbers[2]);

                callerNumbers.push(`"${caller}"`);
                calleeNumbers.push(`"${callee}"`);
                timestamps.push(`"${timestamp}"`);
            } else if (lookupType.value === "both" && numbers.length === 2) {
                let caller = formatNumber(numbers[0], selectedPrefix);
                let callee = formatNumber(numbers[1], selectedPrefix);
                callerNumbers.push(`"${caller}"`);
                calleeNumbers.push(`"${callee}"`);
            } else if (lookupType.value === "caller" && numbers.length === 1) {
                let caller = formatNumber(numbers[0], selectedPrefix);
                callerNumbers.push(`"${caller}"`);
            } else if (lookupType.value === "callee" && numbers.length === 1) {
                let callee = formatNumber(numbers[0], selectedPrefix);
                calleeNumbers.push(`"${callee}"`);
            }
        });

        let formattedString = generateQuery(callerNumbers, calleeNumbers, timestamps);
        document.getElementById("output").value = formattedString;

        navigator.clipboard.writeText(formattedString).then(() => {
            alert("Formatted string copied to clipboard!");
        }).catch(err => {
            console.error("Failed to copy: ", err);
        });
    });

    function formatNumber(number, selectedPrefix) {
        if (formatType.value === "symbio") {
            return number.startsWith("+") ? number : `+${number}`;
        } else if (formatType.value === "synch") {
            return number;
        } else if (formatType.value === "customPrefix" && selectedPrefix) {
            return number.startsWith("+") ? number : `+${selectedPrefix}${number}`;
        }
        return number;
    }

    function formatTimestamp(timestamp) {
       
        let dateObj = new Date(timestamp + "Z");
    
        if (isNaN(dateObj)) return timestamp; 
    
       
        dateObj.setUTCHours(dateObj.getUTCHours() - 11);
    
      
        return dateObj.toISOString().slice(0, 16).replace("T", "T");
    }
    

    function generateQuery(callerNumbers, calleeNumbers, timestamps) {
        let queryParts = [];
        if (callerNumbers.length > 0) {
            queryParts.push(`{"terms": {"caller": [${callerNumbers.join(", ")}]}}`);
        }
        if (calleeNumbers.length > 0) {
            queryParts.push(`{"terms": {"callee": [${calleeNumbers.join(", ")}]}}`);
        }
        if (timestamps.length > 0) {
            queryParts.push(`{"terms": {"@timestamp": [${timestamps.join(", ")}]}}`);
        }

        return `{"query": {"bool": {"must": [${queryParts.join(", ")}]}}}`;
    }
});
