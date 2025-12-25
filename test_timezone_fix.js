
const visit_check_in = "2023-10-27 11:00:00"; // Simulated backend response (UTC)

console.log("Simulated Backend Response:", visit_check_in);
console.log("System Timezone Offset:", new Date().getTimezoneOffset());

let date = "";
let time = "";

if (visit_check_in) {
    const utcString = visit_check_in.replace(" ", "T") + "Z";
    const utcDate = new Date(utcString);
    console.log("Parsed UTC Date:", utcDate.toISOString());
    
    if (!isNaN(utcDate.getTime())) {
        const localFaceValue = new Date(
        utcDate.getTime() - utcDate.getTimezoneOffset() * 60000
        );
        console.log("Local Face Value Date (ISO):", localFaceValue.toISOString());
        
        const isoLocal = localFaceValue.toISOString();
        const parts = isoLocal.split("T");
        date = parts[0];
        time = parts[1].slice(0, 8);
        
        console.log("Extracted Date:", date);
        console.log("Extracted Time:", time);
    }
}
