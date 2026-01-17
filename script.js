/* =========================================
   BLOOD SYSTEM VISUALIZATION (PRO VERSION)
   ========================================= */
const canvas = document.getElementById('bloodFlowCanvas');
const ctx = canvas.getContext('2d');
const infoPanel = document.getElementById('infoPanel');

// Canvas Dimensions
canvas.width = 800;
canvas.height = 500;

let selectedType = null;
let pulseScale = 0; // For pulsating radiation effect

// Blood Types Data & Positions
const bloodTypes = [
    { name: 'O-', x: 100, y: 100, targets: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] },
    { name: 'O+', x: 100, y: 400, targets: ['O+', 'A+', 'B+', 'AB+'] },
    { name: 'A-', x: 300, y: 100, targets: ['A-', 'A+', 'AB-', 'AB+'] },
    { name: 'A+', x: 300, y: 400, targets: ['A+', 'AB+'] },
    { name: 'B-', x: 500, y: 100, targets: ['B-', 'B+', 'AB-', 'AB+'] },
    { name: 'B+', x: 500, y: 400, targets: ['B+', 'AB+'] },
    { name: 'AB-', x: 700, y: 100, targets: ['AB-', 'AB+'] },
    { name: 'AB+', x: 700, y: 400, targets: ['AB+'] }
];

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Animation Speed Control
    pulseScale += 0.02;

    if (selectedType) {
        selectedType.targets.forEach(targetName => {
            const target = bloodTypes.find(bt => bt.name === targetName);
            if (!target) return;

            // 1. Draw "Blood Vessel" Path (The static faint background)
            ctx.beginPath();
            ctx.moveTo(selectedType.x, selectedType.y);
            ctx.lineTo(target.x, target.y);
            ctx.strokeStyle = 'rgba(138, 21, 21, 0.05)';
            ctx.lineWidth = 15;
            ctx.lineCap = 'round';
            ctx.stroke();

            // 2. Realistic Blood Flow (Gradient & Glow)
            // Creating a gradient to simulate flowing liquid
            const gradient = ctx.createLinearGradient(
                selectedType.x, selectedType.y, 
                target.x, target.y
            );
            
            // Pulsing effect using Sine Wave
            const opacity = 0.4 + Math.abs(Math.sin(pulseScale)) * 0.4;
            
            gradient.addColorStop(0, `rgba(138, 21, 21, ${opacity})`);
            gradient.addColorStop(0.5, `rgba(200, 20, 20, ${opacity + 0.2})`);
            gradient.addColorStop(1, `rgba(138, 21, 21, ${opacity})`);

            ctx.beginPath();
            ctx.moveTo(selectedType.x, selectedType.y);
            ctx.lineTo(target.x, target.y);
            
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'rgba(138, 21, 21, 0.8)';
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            ctx.stroke();
            
            // Reset Shadow
            ctx.shadowBlur = 0;
        });
    }

    // 3. Draw Blood Group Nodes (Circles)
    bloodTypes.forEach(bt => {
        const isActive = selectedType && selectedType.name === bt.name;
        
        // Glow for active node
        if (isActive) {
            ctx.shadowBlur = 30;
            ctx.shadowColor = 'rgba(138, 21, 21, 0.9)';
        } else {
            ctx.shadowBlur = 5;
            ctx.shadowColor = 'rgba(0,0,0,0.1)';
        }

        // Circle Body
        ctx.beginPath();
        ctx.arc(bt.x, bt.y, 38, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? '#8a1515' : '#ffffff';
        ctx.fill();
        
        // Border
        ctx.strokeStyle = '#8a1515';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label Text
        ctx.shadowBlur = 0;
        ctx.font = 'bold 20px "Segoe UI"';
        ctx.fillStyle = isActive ? '#ffffff' : '#8a1515';
        ctx.textAlign = 'center';
        ctx.fillText(bt.name, bt.x, bt.y + 8);
    });

    requestAnimationFrame(draw);
}

// 4. Handle Interaction (Click on Canvas Nodes)
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    bloodTypes.forEach(bt => {
        // Simple collision detection (Distance between mouse and circle center)
        const distance = Math.sqrt((mouseX - bt.x) ** 2 + (mouseY - bt.y) ** 2);
        
        if (distance < 38) {
            selectedType = bt;
            infoPanel.innerHTML = `Blood group <strong>${bt.name}</strong> can donate to: <strong>${bt.targets.join(', ')}</strong>`;
            
            // Trigger haptic feedback feel through UI update
            infoPanel.style.transform = "scale(1.05)";
            setTimeout(() => infoPanel.style.transform = "scale(1)", 100);
        }
    });
});

// Link Buttons to logic for extra accessibility
window.selectBlood = function(type) {
    const bt = bloodTypes.find(b => b.name === type);
    if (bt) {
        selectedType = bt;
        infoPanel.innerHTML = `Blood group <strong>${bt.name}</strong> can donate to: <strong>${bt.targets.join(', ')}</strong>`;
    }
};

/* =======================
   ELIGIBILITY TEST
======================= */
function checkEligibility() {
    const age = Number(document.getElementById("age").value);
    const weight = Number(document.getElementById("weight").value);
    const lastDonation = document.getElementById("lastDonation").value;
    const disease = document.getElementById("disease").value;
    const result = document.getElementById("result");

    if (!age || !weight || !lastDonation || !disease) {
        result.style.color = "orange";
        result.innerHTML = "Please fill in all fields.";
        return;
    }

    if (age < 18 || weight > 100 || lastDonation === "less3" || disease === "yes") {
        result.style.color = "red";
        result.innerHTML = "❌ You are NOT eligible to donate blood.";
    } else {
        result.style.color = "green";
        result.innerHTML = "✅ You are eligible to donate blood ❤️";
        scrollToSection("compatibility");
    }
}

// Start the Visual Engine
draw();
// 1. Function to Save Donor to LocalStorage
function saveDonor() {
    const name = document.getElementById('donorName').value;
    const type = document.getElementById('donorBlood').value;
    const phone = document.getElementById('phone').value;
    const msg = document.getElementById('saveMessage');

    if (name && phone.length === 10) {
        // Create donor object
        const newDonor = { name, type, phone };
        
        // Get existing donors from storage or empty array
        let donors = JSON.parse(localStorage.getItem('donors')) || [];
        
        // Add new donor
        donors.push(newDonor);
        
        // Save back to storage
        localStorage.setItem('donors', JSON.stringify(donors));
        
        msg.innerHTML = "✅ Registered successfully!";
        msg.style.color = "green";
        
        // Refresh table display
        displayDonors();
        
        // Clear inputs
        document.getElementById('donorName').value = "";
        document.getElementById('phone').value = "";
    } else {
        msg.innerHTML = "❌ Error: Fill all fields (Phone 10 digits).";
        msg.style.color = "red";
    }
}

// 2. Function to Display Donors in Table
function displayDonors() {
    const tableBody = document.getElementById('donorTableBody');
    let donors = JSON.parse(localStorage.getItem('donors')) || [];
    
    tableBody.innerHTML = ""; // Clear current table

    donors.forEach((donor, index) => {
        const row = `<tr>
            <td>${donor.name}</td>
            <td><strong>${donor.type}</strong></td>
            <td>${donor.phone}</td>
            <td><button onclick="deleteDonor(${index})" style="color:red; cursor:pointer; border:none; background:none;">Delete</button></td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

// 3. Function to Search/Filter by Blood Type
function searchDonors() {
    const input = document.getElementById('searchInput').value.toUpperCase();
    const table = document.getElementById('donorTable');
    const tr = table.getElementsByTagName('tr');

    for (let i = 1; i < tr.length; i++) {
        let td = tr[i].getElementsByTagName('td')[1]; // Blood Type column
        if (td) {
            let txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(input) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

// 4. Extra Functions (Delete & Clear)
function deleteDonor(index) {
    let donors = JSON.parse(localStorage.getItem('donors'));
    donors.splice(index, 1);
    localStorage.setItem('donors', JSON.stringify(donors));
    displayDonors();
}

function clearAllDonors() {
    if(confirm("Are you sure you want to delete all records?")) {
        localStorage.removeItem('donors');
        displayDonors();
    }
}

// Initial call to show data when page loads
window.onload = function() {
    displayDonors();
};

